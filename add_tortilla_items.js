import { addInventoryItem } from './src/services/cafeService.js';

// Tortilla nutritional data (per 100g)
const tortillaData = {
  name: 'Tortilla',
  currentStock: 1000, // 1kg
  minStock: 500,
  unit: 'gm',
  category: 'Dry Store',
  inventoryState: 'raw',
  // Macros
  caloriesPer100g: 237,
  proteinPer100g: 7.0,
  carbsPer100g: 42.0,
  fatPer100g: 3.5,
  fiberPer100g: 2.5,
  // Vitamins
  vitaminAMcg: 0,
  vitaminCMg: 0,
  vitaminDMcg: 0,
  vitaminEMg: 1.2,
  vitaminKMcg: 5.5,
  vitaminB1Mg: 0.3,
  vitaminB2Mg: 0.2,
  vitaminB3Mg: 3.5,
  vitaminB6Mg: 0.2,
  vitaminB12Mcg: 0,
  folateMcg: 25,
  // Minerals
  calciumMg: 150,
  ironMg: 2.5,
  magnesiumMg: 35,
  phosphorusMg: 100,
  potassiumMg: 150,
  sodiumMg: 450,
  zincMg: 1.0,
  copperMg: 0.2,
  manganeseMg: 0.6,
  seleniumMcg: 15
};

// Multi Grain Tortilla nutritional data (per 100g)
const multiGrainTortillaData = {
  name: 'Multi Grain Tortilla',
  currentStock: 1000, // 1kg
  minStock: 500,
  unit: 'gm',
  category: 'Dry Store',
  inventoryState: 'raw',
  // Macros
  caloriesPer100g: 245,
  proteinPer100g: 8.5,
  carbsPer100g: 40.0,
  fatPer100g: 4.0,
  fiberPer100g: 6.0,
  // Vitamins
  vitaminAMcg: 50,
  vitaminCMg: 2.0,
  vitaminDMcg: 0,
  vitaminEMg: 1.8,
  vitaminKMcg: 8.0,
  vitaminB1Mg: 0.4,
  vitaminB2Mg: 0.3,
  vitaminB3Mg: 4.0,
  vitaminB6Mg: 0.3,
  vitaminB12Mcg: 0,
  folateMcg: 35,
  // Minerals
  calciumMg: 180,
  ironMg: 3.2,
  magnesiumMg: 45,
  phosphorusMg: 120,
  potassiumMg: 180,
  sodiumMg: 420,
  zincMg: 1.2,
  copperMg: 0.3,
  manganeseMg: 0.8,
  seleniumMcg: 20
};

async function addTortillaItems() {
  try {
    console.log('Adding Tortilla to inventory...');
    const tortillaResult = await addInventoryItem(tortillaData);
    console.log('✅ Tortilla added successfully:', tortillaResult);

    console.log('Adding Multi Grain Tortilla to inventory...');
    const multiGrainResult = await addInventoryItem(multiGrainTortillaData);
    console.log('✅ Multi Grain Tortilla added successfully:', multiGrainResult);

    console.log('🎉 Both tortilla items added to inventory successfully!');
  } catch (error) {
    console.error('❌ Error adding tortilla items:', error);
  }
}

// Run the function
addTortillaItems();
