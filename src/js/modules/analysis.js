// analysis.js - Analysis tab functionality
const core = require('./core.js');

// Chart instance
let trendChart = null;

// Create analysis trends chart
function createAnalysisTrends() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Use selected year from dashboard if available
    const selectedYear = window.selectedYear || currentYear;
    
    // Get all transactions for the selected year
    const transactions = core.getTransactionsByYear(selectedYear);
    
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

    const datasets = Object.entries(monthlyTotals).map(([category, data], index) => {
        // For the current year, only show data up to the current month
        let adjustedData = [...data];
        if (selectedYear === currentYear) {
            // Set future months to null to avoid them being plotted
            for (let i = currentMonth + 1; i < 12; i++) {
                adjustedData[i] = null;
            }
        }
        
        return {
            label: category,
            data: adjustedData,
            borderColor: `hsl(${(index * 360 / categories.length) + 200}, 70%, 60%)`,
            fill: false
        };
    });

    // Clear any previous chart
    if (trendChart instanceof Chart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
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
            },
            plugins: {
                title: {
                    display: true,
                    text: `Spending Trends (${selectedYear})`,
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Initialize analysis tab
function initialize() {
    createAnalysisTrends();
    
    // Listen for year change events
    document.addEventListener('yearChanged', createAnalysisTrends);
}

// Export module functions
module.exports = {
    initialize,
    createAnalysisTrends
};