// dashboard.js - Dashboard tab functionality
const core = require('./core.js');

// Update dashboard stats and charts
function updateDashboard() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Get filtered transactions
    const currentYearTransactions = core.getTransactionsByYear(currentYear);
    const currentMonthTransactions = core.getTransactionsByYearAndMonth(currentYear, currentMonth);

    // Calculate totals
    const yearTotal = core.calculateTotal(currentYearTransactions);
    const monthTotal = core.calculateTotal(currentMonthTransactions);
    
    // Calculate monthly average (only accounting for months that have passed)
    const monthlyAverage = yearTotal / (currentMonth + 1);

    // Get top category
    const categoryTotals = core.calculateCategoryTotals(currentYearTransactions);
    const topCategory = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0];

    // Update dashboard stats
    document.getElementById('current-year-total').textContent = core.formatCurrency(yearTotal);
    document.getElementById('current-month-total').textContent = core.formatCurrency(monthTotal);
    document.getElementById('monthly-average').textContent = core.formatCurrency(monthlyAverage);
    document.getElementById('top-category').textContent = `${topCategory[0]} (${core.formatCurrency(topCategory[1])})`;

    // Create charts
    createMonthlyChart(currentYearTransactions);
    createCategoryChart(currentYearTransactions);
}

// Create monthly spending bar chart
function createMonthlyChart(transactions) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const monthlyData = new Array(12).fill(0);
    
    transactions.forEach(trx => {
        const month = trx.date.getMonth();
        monthlyData[month] += trx.Amount;
    });

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Monthly Spending',
                data: monthlyData,
                backgroundColor: '#2563eb',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    }
                }
            }
        }
    });
}

// Create category distribution chart
function createCategoryChart(transactions) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categoryTotals = core.calculateCategoryTotals(transactions);

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const backgroundColors = labels.map((_, i) => 
        `hsl(${(i * 360 / labels.length) + 200}, 70%, 60%)`
    );

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Initialize dashboard
function initialize() {
    updateDashboard();
}

// Export module functions
module.exports = {
    initialize,
    updateDashboard
};