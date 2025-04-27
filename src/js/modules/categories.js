// categories.js - Categories tab functionality
const core = require('./core.js');

// Update category breakdown section
function updateCategoryBreakdown() {
    const currentYear = new Date().getFullYear();
    const yearTransactions = core.getTransactionsByYear(currentYear);

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
}

// Export module functions
module.exports = {
    initialize,
    updateCategoryBreakdown
};