import { getPurchases } from './cafeService';

/**
 * Vendor Price Comparison Service
 * Analyzes purchase history to recommend lowest cost vendors
 */

// Cache for purchases to avoid multiple fetches
let purchasesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Get purchases with caching
 */
const getCachedPurchases = async () => {
  const now = Date.now();
  if (purchasesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return purchasesCache;
  }
  
  purchasesCache = await getPurchases();
  cacheTimestamp = now;
  return purchasesCache;
};

/**
 * Clear the purchases cache
 */
export const clearPurchasesCache = () => {
  purchasesCache = null;
  cacheTimestamp = null;
};

/**
 * Get all vendors who have supplied a specific item
 * @param {string} itemName - Name of the inventory item
 * @param {Array} purchases - Optional pre-fetched purchases array
 * @returns {Array} Array of vendor price data
 */
export const getVendorPricesForItem = async (itemName, purchases = null) => {
  try {
    if (!purchases) {
      purchases = await getCachedPurchases();
    }
    const vendorPrices = {};

    // Analyze all purchases for this item
    purchases.forEach(purchase => {
      const supplierName = purchase.supplier_name || purchase.supplierName;
      if (!supplierName) return;

      const items = purchase.items || [];
      items.forEach(item => {
        const materialName = item.materialName || item.name;
        if (materialName?.toLowerCase() === itemName.toLowerCase()) {
          const pricePerUnit = parseFloat(item.pricePerUnit || item.price_per_unit || 0);
          const quantity = parseFloat(item.quantity || 0);
          const unit = item.unit;
          const purchaseDate = purchase.date || purchase.created_at;

          // Use lowercase vendor name as key for case-insensitive grouping
          const vendorKey = supplierName.toLowerCase();
          
          if (!vendorPrices[vendorKey]) {
            vendorPrices[vendorKey] = {
              vendorName: supplierName, // Keep original case for display
              purchases: [],
              avgPricePerUnit: 0,
              lastPrice: 0,
              lastPurchaseDate: null,
              totalQuantityBought: 0,
              purchaseCount: 0,
              unit: unit,
            };
          } else {
            // Update vendor name to most recent capitalization
            vendorPrices[vendorKey].vendorName = supplierName;
          }

          vendorPrices[vendorKey].purchases.push({
            pricePerUnit,
            quantity,
            date: purchaseDate,
            total: pricePerUnit * quantity,
          });

          vendorPrices[vendorKey].totalQuantityBought += quantity;
          vendorPrices[vendorKey].purchaseCount += 1;

          // Update last purchase info
          if (!vendorPrices[vendorKey].lastPurchaseDate || 
              new Date(purchaseDate) > new Date(vendorPrices[vendorKey].lastPurchaseDate)) {
            vendorPrices[vendorKey].lastPrice = pricePerUnit;
            vendorPrices[vendorKey].lastPurchaseDate = purchaseDate;
          }
        }
      });
    });

    // Calculate averages
    Object.keys(vendorPrices).forEach(vendor => {
      const data = vendorPrices[vendor];
      const totalPrice = data.purchases.reduce((sum, p) => sum + p.pricePerUnit, 0);
      data.avgPricePerUnit = totalPrice / data.purchases.length;
    });

    // Convert to array and sort by average price (lowest first)
    return Object.values(vendorPrices).sort((a, b) => a.avgPricePerUnit - b.avgPricePerUnit);
  } catch (error) {
    console.error('Error getting vendor prices:', error);
    return [];
  }
};

/**
 * Get the lowest cost vendor for a specific item
 * @param {string} itemName - Name of the inventory item
 * @returns {Object|null} Lowest cost vendor data
 */
export const getLowestCostVendor = async (itemName) => {
  const vendors = await getVendorPricesForItem(itemName);
  return vendors.length > 0 ? vendors[0] : null;
};

/**
 * Get vendor comparison for multiple items
 * @param {Array} itemNames - Array of item names
 * @returns {Object} Map of item names to vendor recommendations
 */
export const getVendorComparisonsForItems = async (itemNames) => {
  const comparisons = {};
  
  for (const itemName of itemNames) {
    const vendors = await getVendorPricesForItem(itemName);
    comparisons[itemName] = {
      lowestCostVendor: vendors[0] || null,
      allVendors: vendors,
      savingsVsHighest: vendors.length > 1 
        ? ((vendors[vendors.length - 1].avgPricePerUnit - vendors[0].avgPricePerUnit) / vendors[vendors.length - 1].avgPricePerUnit * 100).toFixed(1)
        : 0,
    };
  }
  
  return comparisons;
};

/**
 * Calculate potential savings by switching to lowest cost vendors
 * @param {Array} items - Array of items with quantities needed
 * @returns {Object} Savings analysis
 */
export const calculatePotentialSavings = async (items) => {
  let totalCurrentCost = 0;
  let totalLowestCost = 0;
  const recommendations = [];

  for (const item of items) {
    const vendors = await getVendorPricesForItem(item.name);
    
    if (vendors.length === 0) continue;

    const lowestVendor = vendors[0];
    const currentVendor = vendors.find(v => v.vendorName === item.currentVendor) || vendors[0];
    
    const quantityNeeded = item.quantity || 0;
    const currentCost = currentVendor.lastPrice * quantityNeeded;
    const lowestCost = lowestVendor.lastPrice * quantityNeeded;
    const savings = currentCost - lowestCost;

    totalCurrentCost += currentCost;
    totalLowestCost += lowestCost;

    recommendations.push({
      itemName: item.name,
      quantityNeeded,
      currentVendor: currentVendor.vendorName,
      currentPrice: currentVendor.lastPrice,
      currentCost,
      recommendedVendor: lowestVendor.vendorName,
      recommendedPrice: lowestVendor.lastPrice,
      recommendedCost: lowestCost,
      savings,
      savingsPercent: currentCost > 0 ? ((savings / currentCost) * 100).toFixed(1) : 0,
      allVendors: vendors,
    });
  }

  return {
    totalCurrentCost,
    totalLowestCost,
    totalSavings: totalCurrentCost - totalLowestCost,
    savingsPercent: totalCurrentCost > 0 
      ? ((totalCurrentCost - totalLowestCost) / totalCurrentCost * 100).toFixed(1)
      : 0,
    recommendations,
  };
};

/**
 * Get vendor performance summary
 * @returns {Array} Vendor performance data
 */
export const getVendorPerformanceSummary = async () => {
  try {
    const purchases = await getPurchases();
    const vendorStats = {};

    purchases.forEach(purchase => {
      const supplierName = purchase.supplier_name || purchase.supplierName;
      if (!supplierName) return;

      // Use lowercase vendor name as key for case-insensitive grouping
      const vendorKey = supplierName.toLowerCase();

      if (!vendorStats[vendorKey]) {
        vendorStats[vendorKey] = {
          vendorName: supplierName, // Keep original case for display
          totalPurchases: 0,
          totalSpent: 0,
          itemsSupplied: new Set(),
          lastPurchaseDate: null,
          avgOrderValue: 0,
        };
      } else {
        // Update vendor name to most recent capitalization
        vendorStats[vendorKey].vendorName = supplierName;
      }

      const totalAmount = parseFloat(purchase.total_amount || purchase.totalAmount || 0);
      vendorStats[vendorKey].totalPurchases += 1;
      vendorStats[vendorKey].totalSpent += totalAmount;

      const items = purchase.items || [];
      items.forEach(item => {
        const materialName = item.materialName || item.name;
        if (materialName) {
          vendorStats[vendorKey].itemsSupplied.add(materialName);
        }
      });

      const purchaseDate = purchase.date || purchase.created_at;
      if (!vendorStats[vendorKey].lastPurchaseDate || 
          new Date(purchaseDate) > new Date(vendorStats[vendorKey].lastPurchaseDate)) {
        vendorStats[vendorKey].lastPurchaseDate = purchaseDate;
      }
    });

    // Calculate averages and convert Set to count
    const vendorArray = Object.values(vendorStats).map(vendor => ({
      ...vendor,
      itemsSupplied: vendor.itemsSupplied.size,
      avgOrderValue: vendor.totalSpent / vendor.totalPurchases,
    }));

    // Sort by total spent (descending)
    return vendorArray.sort((a, b) => b.totalSpent - a.totalSpent);
  } catch (error) {
    console.error('Error getting vendor performance:', error);
    return [];
  }
};

/**
 * Get all unique vendor names for autocomplete
 * @returns {Array} Array of unique vendor names
 */
export const getAllVendorNames = async () => {
  try {
    const purchases = await getPurchases();
    const vendorNames = new Set();

    purchases.forEach(purchase => {
      const supplierName = purchase.supplier_name || purchase.supplierName;
      if (supplierName) {
        // Store in lowercase for comparison, but keep original for display
        const vendorKey = supplierName.toLowerCase();
        // Find if we already have this vendor (case-insensitive)
        let found = false;
        for (const existing of vendorNames) {
          if (existing.toLowerCase() === vendorKey) {
            found = true;
            break;
          }
        }
        if (!found) {
          vendorNames.add(supplierName);
        }
      }
    });

    // Convert to array and sort alphabetically
    return Array.from(vendorNames).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  } catch (error) {
    console.error('Error getting vendor names:', error);
    return [];
  }
};

/**
 * Get price trend for an item from a specific vendor
 * @param {string} itemName - Name of the item
 * @param {string} vendorName - Name of the vendor
 * @returns {Array} Price history
 */
export const getItemPriceTrend = async (itemName, vendorName) => {
  try {
    const purchases = await getPurchases();
    const priceHistory = [];

    purchases.forEach(purchase => {
      const supplierName = purchase.supplier_name || purchase.supplierName;
      if (supplierName?.toLowerCase() !== vendorName.toLowerCase()) return;

      const items = purchase.items || [];
      items.forEach(item => {
        const materialName = item.materialName || item.name;
        if (materialName?.toLowerCase() === itemName.toLowerCase()) {
          priceHistory.push({
            date: purchase.date || purchase.created_at,
            pricePerUnit: parseFloat(item.pricePerUnit || item.price_per_unit || 0),
            quantity: parseFloat(item.quantity || 0),
            total: parseFloat(item.total || item.totalPrice || 0),
          });
        }
      });
    });

    // Sort by date
    return priceHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error getting price trend:', error);
    return [];
  }
};
