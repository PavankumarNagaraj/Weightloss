import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateWeeklyPlanPDF = (plan, summary, inventoryItems, showToast) => {
  try {
    showToast?.('Generating PDF...', 'info');

    // Create PDF in portrait orientation
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPos = margin;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Title with modern styling
    doc.setFillColor(99, 102, 241); // Indigo background
    doc.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Afterburn Weekly Meal Report', pageWidth / 2, yPos + 8, { align: 'center' });
    
    // Date range in title bar
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const startDate = new Date(plan.weekStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const endDate = new Date(plan.weekEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.text(`Week ${startDate} - ${endDate}`, pageWidth / 2, yPos + 15, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos += 28;

    // Weekly Nutrition Summary as Table
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('WEEKLY NUTRITION SUMMARY', margin, yPos);
    yPos += 6;

    const tableWidth = pageWidth - 2 * margin;
    
    let summaryTableFinalY = yPos;
    autoTable(doc, {
      startY: yPos,
      head: [['Nutrient', 'Total Amount']],
      body: [
        ['Total Calories', summary.totalCalories.toFixed(0)],
        ['Protein', summary.totalProtein.toFixed(1) + ' g'],
        ['Carbohydrates', summary.totalCarbs.toFixed(1) + ' g'],
        ['Fat', summary.totalFat.toFixed(1) + ' g'],
        ['Fiber', summary.totalFiber.toFixed(1) + ' g']
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [99, 102, 241],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.6, fontStyle: 'bold' },
        1: { cellWidth: tableWidth * 0.4, halign: 'right' }
      },
      tableWidth: tableWidth,
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        summaryTableFinalY = data.cursor.y;
      }
    });

    yPos = summaryTableFinalY + 8;

    // Weekly Micronutrients Summary as Table (4 columns)
    checkPageBreak(60);
    yPos += 2;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('WEEKLY MICRONUTRIENTS', margin, yPos);
    yPos += 6;

    const vitamins = [
      { name: 'Vitamin A', value: summary.micronutrients.vitaminA, unit: 'mcg' },
      { name: 'Vitamin C', value: summary.micronutrients.vitaminC, unit: 'mg' },
      { name: 'Vitamin D', value: summary.micronutrients.vitaminD, unit: 'mcg' },
      { name: 'Vitamin E', value: summary.micronutrients.vitaminE, unit: 'mg' },
      { name: 'Vitamin K', value: summary.micronutrients.vitaminK, unit: 'mcg' },
      { name: 'Vitamin B1', value: summary.micronutrients.vitaminB1, unit: 'mg' },
      { name: 'Vitamin B2', value: summary.micronutrients.vitaminB2, unit: 'mg' },
      { name: 'Vitamin B3', value: summary.micronutrients.vitaminB3, unit: 'mg' },
      { name: 'Vitamin B6', value: summary.micronutrients.vitaminB6, unit: 'mg' },
      { name: 'Vitamin B12', value: summary.micronutrients.vitaminB12, unit: 'mcg' },
      { name: 'Folate', value: summary.micronutrients.folate, unit: 'mcg' }
    ].filter(v => v.value > 0.01);

    const minerals = [
      { name: 'Calcium', value: summary.micronutrients.calcium, unit: 'mg' },
      { name: 'Iron', value: summary.micronutrients.iron, unit: 'mg' },
      { name: 'Magnesium', value: summary.micronutrients.magnesium, unit: 'mg' },
      { name: 'Phosphorus', value: summary.micronutrients.phosphorus, unit: 'mg' },
      { name: 'Potassium', value: summary.micronutrients.potassium, unit: 'mg' },
      { name: 'Sodium', value: summary.micronutrients.sodium, unit: 'mg' },
      { name: 'Zinc', value: summary.micronutrients.zinc, unit: 'mg' },
      { name: 'Copper', value: summary.micronutrients.copper, unit: 'mg' },
      { name: 'Manganese', value: summary.micronutrients.manganese, unit: 'mg' },
      { name: 'Selenium', value: summary.micronutrients.selenium, unit: 'mcg' }
    ].filter(m => m.value > 0.01);

    // Create table rows with 4 columns (Vitamin | Amount | Mineral | Amount)
    const maxRows = Math.max(vitamins.length, minerals.length);
    const microTableBody = [];
    for (let i = 0; i < maxRows; i++) {
      const row = [];
      if (vitamins[i]) {
        row.push(vitamins[i].name);
        row.push(`${vitamins[i].value.toFixed(2)} ${vitamins[i].unit}`);
      } else {
        row.push('', '');
      }
      if (minerals[i]) {
        row.push(minerals[i].name);
        row.push(`${minerals[i].value.toFixed(2)} ${minerals[i].unit}`);
      } else {
        row.push('', '');
      }
      microTableBody.push(row);
    }

    let microTableFinalY = yPos;
    autoTable(doc, {
      startY: yPos,
      head: [['Vitamin', 'Amount', 'Mineral', 'Amount']],
      body: microTableBody,
      theme: 'grid',
      headStyles: { 
        fillColor: [99, 102, 241],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.3, fontStyle: 'bold' },
        1: { cellWidth: tableWidth * 0.2, halign: 'right' },
        2: { cellWidth: tableWidth * 0.3, fontStyle: 'bold' },
        3: { cellWidth: tableWidth * 0.2, halign: 'right' }
      },
      tableWidth: tableWidth,
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        microTableFinalY = data.cursor.y;
      }
    });

    yPos = microTableFinalY + 8;

    // Weekly Meal Schedule Table
    checkPageBreak(60);
    yPos += 2;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('WEEKLY MEAL SCHEDULE', margin, yPos);
    yPos += 6;

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

    const scheduleData = daysOfWeek.map(day => {
      const row = [day];
      
      // Add meal columns
      mealTypes.forEach(type => {
        const items = plan.meals[day]?.[type] || [];
        const itemsText = items.map(item => `${item.name} (${parseFloat(item.calories).toFixed(0)} cal)`).join('\n');
        row.push(itemsText || '-');
      });
      
      // Calculate daily total calories
      let dayTotal = 0;
      ['Breakfast', 'Lunch', 'Dinner', 'Snack'].forEach(type => {
        const items = plan.meals[day]?.[type] || [];
        items.forEach(item => {
          dayTotal += parseFloat(item.calories) || 0;
        });
      });
      row.push(dayTotal.toFixed(0));
      
      return row;
    });

    let tableFinalY = yPos;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Day', 'Breakfast', 'Lunch', 'Dinner', 'Daily Total']],
      body: scheduleData,
      theme: 'grid',
      headStyles: { 
        fillColor: [99, 102, 241], // Modern indigo
        fontSize: 9, 
        fontStyle: 'bold',
        halign: 'center',
        textColor: [255, 255, 255],
        lineWidth: 0.3,
        lineColor: [71, 85, 105]
      },
      bodyStyles: { 
        fontSize: 8,
        cellPadding: 3,
        lineWidth: 0.2,
        lineColor: [203, 213, 225]
      },
      columnStyles: {
        0: { cellWidth: tableWidth * 0.12, fontStyle: 'bold', fillColor: [243, 244, 246] },
        1: { cellWidth: tableWidth * 0.27 },
        2: { cellWidth: tableWidth * 0.27 },
        3: { cellWidth: tableWidth * 0.27 },
        4: { cellWidth: tableWidth * 0.12, fontStyle: 'bold', halign: 'center', fillColor: [254, 243, 199] }
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      tableWidth: tableWidth,
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        tableFinalY = data.cursor.y;
      }
    });

    yPos = tableFinalY + 12;

    // Detailed Nutrition Breakdown
    daysOfWeek.forEach(day => {
      const dayItems = [];
      mealTypes.forEach(type => {
        const items = plan.meals[day]?.[type] || [];
        items.forEach(item => {
          dayItems.push({ ...item, mealType: type });
        });
      });

      if (dayItems.length === 0) return;

      checkPageBreak(40);
      
      // Day header with background
      const dayCal = dayItems.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0);
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 7, 'F');
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${day}`, margin + 3, yPos);
      doc.setTextColor(99, 102, 241);
      doc.text(`${dayCal.toFixed(0)} cal`, pageWidth - margin - 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 5;

      // Items for this day
      dayItems.forEach((item, itemIdx) => {
        // Calculate micronutrients from raw materials
        const micronutrients = {
          vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
          vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0, folate: 0,
          calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0, sodium: 0,
          zinc: 0, copper: 0, manganese: 0, selenium: 0
        };
        
        if (item.raw_materials && Array.isArray(item.raw_materials) && inventoryItems) {
          item.raw_materials.forEach(material => {
            const inventoryItem = inventoryItems.find(inv => inv.name === material.name);
            if (inventoryItem) {
              const qty = parseFloat(material.quantity) || 0;
              const factor = qty / 100;
              
              micronutrients.vitaminA += (inventoryItem.vitamin_a_mcg || 0) * factor;
              micronutrients.vitaminC += (inventoryItem.vitamin_c_mg || 0) * factor;
              micronutrients.vitaminD += (inventoryItem.vitamin_d_mcg || 0) * factor;
              micronutrients.vitaminE += (inventoryItem.vitamin_e_mg || 0) * factor;
              micronutrients.vitaminK += (inventoryItem.vitamin_k_mcg || 0) * factor;
              micronutrients.vitaminB1 += (inventoryItem.vitamin_b1_mg || 0) * factor;
              micronutrients.vitaminB2 += (inventoryItem.vitamin_b2_mg || 0) * factor;
              micronutrients.vitaminB3 += (inventoryItem.vitamin_b3_mg || 0) * factor;
              micronutrients.vitaminB6 += (inventoryItem.vitamin_b6_mg || 0) * factor;
              micronutrients.vitaminB12 += (inventoryItem.vitamin_b12_mcg || 0) * factor;
              micronutrients.folate += (inventoryItem.folate_mcg || 0) * factor;
              micronutrients.calcium += (inventoryItem.calcium_mg || 0) * factor;
              micronutrients.iron += (inventoryItem.iron_mg || 0) * factor;
              micronutrients.magnesium += (inventoryItem.magnesium_mg || 0) * factor;
              micronutrients.phosphorus += (inventoryItem.phosphorus_mg || 0) * factor;
              micronutrients.potassium += (inventoryItem.potassium_mg || 0) * factor;
              micronutrients.sodium += (inventoryItem.sodium_mg || 0) * factor;
              micronutrients.zinc += (inventoryItem.zinc_mg || 0) * factor;
              micronutrients.copper += (inventoryItem.copper_mg || 0) * factor;
              micronutrients.manganese += (inventoryItem.manganese_mg || 0) * factor;
              micronutrients.selenium += (inventoryItem.selenium_mcg || 0) * factor;
            }
          });
        }
        
        // Get ALL vitamins and minerals (sorted by value)
        const vitamins = [
          { name: 'Vitamin C', value: micronutrients.vitaminC, unit: 'mg' },
          { name: 'Vitamin B3', value: micronutrients.vitaminB3, unit: 'mg' },
          { name: 'Vitamin E', value: micronutrients.vitaminE, unit: 'mg' },
          { name: 'Vitamin B6', value: micronutrients.vitaminB6, unit: 'mg' },
          { name: 'Vitamin B2', value: micronutrients.vitaminB2, unit: 'mg' },
          { name: 'Vitamin B1', value: micronutrients.vitaminB1, unit: 'mg' },
          { name: 'Folate', value: micronutrients.folate, unit: 'mcg' },
          { name: 'Vitamin A', value: micronutrients.vitaminA, unit: 'mcg' },
          { name: 'Vitamin K', value: micronutrients.vitaminK, unit: 'mcg' },
          { name: 'Vitamin D', value: micronutrients.vitaminD, unit: 'mcg' },
          { name: 'Vitamin B12', value: micronutrients.vitaminB12, unit: 'mcg' }
        ].filter(v => v.value > 0.01).sort((a, b) => b.value - a.value);
        
        const minerals = [
          { name: 'Potassium', value: micronutrients.potassium, unit: 'mg' },
          { name: 'Phosphorus', value: micronutrients.phosphorus, unit: 'mg' },
          { name: 'Magnesium', value: micronutrients.magnesium, unit: 'mg' },
          { name: 'Calcium', value: micronutrients.calcium, unit: 'mg' },
          { name: 'Sodium', value: micronutrients.sodium, unit: 'mg' },
          { name: 'Iron', value: micronutrients.iron, unit: 'mg' },
          { name: 'Zinc', value: micronutrients.zinc, unit: 'mg' },
          { name: 'Manganese', value: micronutrients.manganese, unit: 'mg' },
          { name: 'Copper', value: micronutrients.copper, unit: 'mg' },
          { name: 'Selenium', value: micronutrients.selenium, unit: 'mcg' }
        ].filter(m => m.value > 0.01).sort((a, b) => b.value - a.value);
        
        const maxRows = Math.max(vitamins.length, minerals.length);
        const itemBoxHeight = 15 + maxRows * 3.5;
        
        checkPageBreak(itemBoxHeight + 5);
        
        // Item box with border
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.rect(margin + 3, yPos, pageWidth - 2 * margin - 6, itemBoxHeight);
        
        yPos += 3;
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(`${item.name}`, margin + 5, yPos);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`(${item.mealType})`, margin + 5 + doc.getTextWidth(`${item.name} `) + 1, yPos);
        doc.setTextColor(249, 115, 22);
        doc.setFont(undefined, 'bold');
        doc.text(`${parseFloat(item.calories).toFixed(0)} cal`, pageWidth - margin - 20, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 4;

        // Macros
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Macros:', margin + 5, yPos);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Protein: ${item.protein}g  |  Carbs: ${item.carbs}g  |  Fat: ${item.fat}g  |  Fiber: ${item.fiber || 0}g`, margin + 18, yPos);
        yPos += 4;

        // Micronutrients table
        if (vitamins.length > 0 || minerals.length > 0) {
          doc.setFont(undefined, 'bold');
          doc.setTextColor(71, 85, 105);
          doc.text('Micronutrients:', margin + 5, yPos);
          yPos += 3;
          
          doc.setFontSize(6);
          doc.setFont(undefined, 'bold');
          doc.text('VITAMINS', margin + 7, yPos);
          doc.text('MINERALS', margin + 55, yPos);
          yPos += 3;
          
          doc.setFont(undefined, 'normal');
          doc.setTextColor(100, 116, 139);
          
          for (let i = 0; i < maxRows; i++) {
            if (vitamins[i]) {
              doc.text(`${vitamins[i].name}`, margin + 7, yPos);
              doc.text(`${vitamins[i].value.toFixed(2)} ${vitamins[i].unit}`, margin + 35, yPos);
            }
            if (minerals[i]) {
              doc.text(`${minerals[i].name}`, margin + 55, yPos);
              doc.text(`${minerals[i].value.toFixed(2)} ${minerals[i].unit}`, margin + 83, yPos);
            }
            yPos += 3;
          }
        }
        
        doc.setTextColor(0, 0, 0);
        yPos += 2;
      });

      yPos += 2;
    });

    // Footer
    checkPageBreak(15);
    yPos = pageHeight - 15;
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('AfterBurn Gym Cafe by Sutra Fitness', pageWidth / 2, yPos, { align: 'center' });
    doc.setFont(undefined, 'normal');
    doc.text(`Prepared on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth / 2, yPos + 4, { align: 'center' });

    // Save PDF
    const fileName = `${plan.planName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    showToast?.('PDF downloaded successfully!', 'success');
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    showToast?.('Failed to generate PDF. Please try again.', 'error');
    return false;
  }
};
