# Vendor Price Comparison System

This system automatically tracks prices from multiple vendors and recommends the lowest cost option for each inventory item.

---

## 🎯 Features

### **1. Automatic Vendor Tracking**
- Analyzes all purchase history
- Tracks prices from each vendor per item
- Calculates average and last purchase prices
- Monitors price trends over time

### **2. Lowest Cost Recommendations**
- Automatically identifies cheapest vendor for each item
- Shows potential savings by switching vendors
- Compares all available vendor options
- Displays price history and averages

### **3. Email Report Integration**
- Daily emails show lowest cost vendor for each low stock item
- Highlights potential savings
- Lists alternative vendor options
- Shows total savings opportunity

---

## 📊 How It Works

### **Data Collection**

Every purchase automatically records:
```javascript
{
  item: "Tomatoes",
  vendor: "Vendor A",
  pricePerUnit: 50,
  quantity: 10,
  date: "2024-01-15"
}
```

### **Price Analysis**

System calculates for each item:
- **Average price per vendor** - Mean of all purchases
- **Last price** - Most recent purchase price
- **Purchase count** - Number of times bought from vendor
- **Total quantity** - Total amount purchased

### **Vendor Ranking**

Vendors sorted by:
1. **Lowest average price** (primary)
2. Purchase frequency
3. Recency of last purchase

---

## 📧 Email Report Format

### **Items to Buy Section**

```
🛒 Items to Buy (Lowest Cost Vendors)

Item        | Current | Need  | 💰 Best Vendor      | Price      | Est. Cost
------------|---------|-------|---------------------|------------|----------
Tomatoes    | 5 kg    | 10 kg | Vendor A            | ₹45/kg     | ₹450
            |         |       | 3 vendors available |            |
            |         |       | 💡 Save ₹50         |            |
            
Other vendors: Vendor B (₹48), Vendor C (₹50)

Onions      | 2 kg    | 8 kg  | Vendor B            | ₹30/kg     | ₹240
            |         |       | 2 vendors available |            |
            |         |       | 💡 Save ₹16         |            |

Total Estimated Cost (Best Prices): ₹690
💰 Potential Savings vs Highest Price: ₹66
```

---

## 💡 Example Scenarios

### **Scenario 1: Multiple Vendors**

**Purchase History:**
```
Tomatoes from Vendor A: ₹45/kg (3 times)
Tomatoes from Vendor B: ₹48/kg (2 times)
Tomatoes from Vendor C: ₹50/kg (1 time)
```

**Email Shows:**
- **Best Vendor:** Vendor A (₹45/kg)
- **Savings:** ₹50 (vs Vendor C at ₹50/kg for 10kg)
- **Other Options:** Vendor B (₹48), Vendor C (₹50)

### **Scenario 2: Single Vendor**

**Purchase History:**
```
Onions from Vendor A: ₹30/kg (5 times)
```

**Email Shows:**
- **Best Vendor:** Vendor A (₹30/kg)
- **Savings:** ₹0 (no alternatives)
- **Other Options:** None

### **Scenario 3: No Purchase History**

**Purchase History:**
```
(None for this item)
```

**Email Shows:**
- **Best Vendor:** No vendor history
- **Price:** -
- **Cost:** -

---

## 🔧 API Functions

### **Get Vendor Prices for Item**

```javascript
import { getVendorPricesForItem } from './services/vendorPriceService';

const vendors = await getVendorPricesForItem('Tomatoes');
// Returns array sorted by lowest price first
```

**Response:**
```javascript
[
  {
    vendorName: "Vendor A",
    avgPricePerUnit: 45,
    lastPrice: 45,
    lastPurchaseDate: "2024-01-15",
    totalQuantityBought: 30,
    purchaseCount: 3,
    unit: "kg"
  },
  {
    vendorName: "Vendor B",
    avgPricePerUnit: 48,
    lastPrice: 48,
    lastPurchaseDate: "2024-01-10",
    totalQuantityBought: 20,
    purchaseCount: 2,
    unit: "kg"
  }
]
```

### **Get Lowest Cost Vendor**

```javascript
import { getLowestCostVendor } from './services/vendorPriceService';

const bestVendor = await getLowestCostVendor('Tomatoes');
// Returns the cheapest vendor
```

### **Calculate Potential Savings**

```javascript
import { calculatePotentialSavings } from './services/vendorPriceService';

const items = [
  { name: 'Tomatoes', quantity: 10, currentVendor: 'Vendor B' },
  { name: 'Onions', quantity: 8, currentVendor: 'Vendor A' }
];

const savings = await calculatePotentialSavings(items);
```

**Response:**
```javascript
{
  totalCurrentCost: 720,
  totalLowestCost: 690,
  totalSavings: 30,
  savingsPercent: "4.2",
  recommendations: [...]
}
```

### **Get Vendor Performance Summary**

```javascript
import { getVendorPerformanceSummary } from './services/vendorPriceService';

const performance = await getVendorPerformanceSummary();
// Returns all vendors sorted by total spent
```

**Response:**
```javascript
[
  {
    vendorName: "Vendor A",
    totalPurchases: 15,
    totalSpent: 12500,
    itemsSupplied: 8,
    lastPurchaseDate: "2024-01-15",
    avgOrderValue: 833.33
  }
]
```

---

## 📈 Benefits

### **Cost Savings**
- **Automatic identification** of cheapest vendors
- **Potential savings** calculated for every purchase
- **Price comparison** across all vendors
- **Historical tracking** of price trends

### **Better Decisions**
- **Data-driven** vendor selection
- **Price history** for negotiation
- **Vendor performance** metrics
- **Alternative options** always visible

### **Time Savings**
- **No manual comparison** needed
- **Automatic recommendations** in email
- **One-click** vendor selection
- **Historical data** always available

---

## 🎯 Use Cases

### **1. Daily Purchasing**
- Check email for low stock items
- See recommended vendor for each item
- Note potential savings
- Purchase from lowest cost vendor

### **2. Vendor Negotiation**
- Review vendor performance summary
- Compare prices across vendors
- Use data to negotiate better rates
- Track price changes over time

### **3. Cost Optimization**
- Identify items with high price variance
- Switch to lower cost vendors
- Monitor savings over time
- Optimize purchasing strategy

---

## 📊 Metrics Tracked

### **Per Item:**
- Lowest cost vendor
- Average price per vendor
- Last purchase price
- Price trend over time
- Number of vendor options

### **Per Vendor:**
- Total purchases made
- Total amount spent
- Number of items supplied
- Average order value
- Last purchase date

### **Overall:**
- Total potential savings
- Average savings percentage
- Most cost-effective vendors
- Price variance by item

---

## ✅ Best Practices

1. **Always buy from recommended vendor** unless quality issues
2. **Track savings** to measure impact
3. **Review vendor performance** monthly
4. **Negotiate prices** using historical data
5. **Add new vendors** to increase competition
6. **Monitor price trends** for seasonal items
7. **Document quality issues** per vendor

---

## 🚀 Future Enhancements

- **Quality ratings** per vendor
- **Delivery time** tracking
- **Minimum order quantities**
- **Bulk discount** calculations
- **Seasonal price** predictions
- **Automatic reordering** from best vendor
- **Vendor reliability** scores

---

## 📝 Summary

**The vendor price comparison system:**
- ✅ Automatically tracks all vendor prices
- ✅ Recommends lowest cost vendor for each item
- ✅ Shows potential savings in daily emails
- ✅ Provides complete price history
- ✅ Enables data-driven purchasing decisions
- ✅ Helps optimize costs without manual work

**Result: Significant cost savings with zero extra effort!** 💰
