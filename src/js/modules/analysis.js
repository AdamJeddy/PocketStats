// analysis.js - Analysis tab functionality
const core = require('./core.js');

// Create analysis trends chart
function createAnalysisTrends() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const currentYear = new Date().getFullYear();
    
    // Get all transactions
    const transactions = core.getTransactionsByYear(currentYear);
    
    // Get main categories
    const categories = [...new Set(transactions.map(t => t.Category))];
    const monthlyTotals = {};

    transactions.forEach(trx => {
        const month = trx.date.getMonth();
        const category = trx.Category;
        
        if (!monthlyTotals[category]) {
            monthlyTotals[category] = new Array(12).fill(0);
        }
        
        monthlyTotals[category][month] += trx.Amount;
    });

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const datasets = Object.entries(monthlyTotals).map(([category, data], index) => ({
        label: category,
        data: data,
        borderColor: `hsl(${(index * 360 / categories.length) + 200}, 70%, 60%)`,
        fill: false
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthNames,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize analysis tab
function initialize() {
    createAnalysisTrends();
}

// Export module functions
module.exports = {
    initialize,
    createAnalysisTrends
};