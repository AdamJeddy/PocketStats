// categories.js - Categories tab functionality
const core = require('./core.js');
const dashboard = require('./dashboard.js');

// Update category breakdown section
function updateCategoryBreakdown() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get the selected year from dashboard if available, otherwise use current year
    const selectedYear = window.selectedYear || currentYear;
    
    const yearTransactions = core.getTransactionsByYear(selectedYear);

    const categoryTotals = core.calculateCategoryTotals(yearTransactions);
    const categoryContainer = document.getElementById('category-breakdown');
    categoryContainer.innerHTML = '';

    // Sort categories by total amount
    Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, total]) => {
            const categoryTile = document.createElement('div');
            categoryTile.className = 'category-tile';
            categoryTile.innerHTML = `
                <div class="category-icon">
                    <span class="material-icons">${core.getCategoryIcon(category)}</span>
                </div>
                <div class="category-info">
                    <div class="category-name">${category}</div>
                    <div class="category-amount">${core.formatCurrency(total)}</div>
                </div>
            `;
            categoryContainer.appendChild(categoryTile);
        });
}

// Initialize categories tab
function initialize() {
    updateCategoryBreakdown();
    
    // Listen for year change events
    document.addEventListener('yearChanged', updateCategoryBreakdown);
}

// Export module functions
module.exports = {
    initialize,
    updateCategoryBreakdown
};