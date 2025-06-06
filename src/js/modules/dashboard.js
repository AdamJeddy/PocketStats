// dashboard.js - Dashboard tab functionality
const core = require('./core.js');

// Current selected year
let selectedYear;

// Chart instances
let monthlyChart = null;
let categoryChart = null;

// Update dashboard stats and charts
function updateDashboard() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // If no year selected yet, default to current year
    if (!selectedYear) {
        selectedYear = currentYear;
    }
    
    console.log('Selected Year:', selectedYear);
    
    // Store selected year in window for other modules to access
    window.selectedYear = selectedYear;
    
    // Get filtered transactions
    const yearTransactions = core.getTransactionsByYear(selectedYear);
    console.log(`Found ${yearTransactions.length} transactions for year ${selectedYear}`);
    
    // For current year, only use transactions up to the current month
    let monthTransactions = [];
    if (selectedYear === currentYear) {
        monthTransactions = core.getTransactionsByYearAndMonth(currentYear, currentMonth);
        console.log(`Found ${monthTransactions.length} transactions for current month`);
    }

    // Calculate totals
    const yearTotal = core.calculateTotal(yearTransactions);
    console.log(`Year total for ${selectedYear}: ${yearTotal}`);
    const monthTotal = core.calculateTotal(monthTransactions);
    
    // Calculate monthly average
    // For current year, only account for months that have passed
    // For past years, use all 12 months
    const monthsToAverage = (selectedYear === currentYear) ? currentMonth + 1 : 12;
    const monthlyAverage = yearTotal / monthsToAverage;

    // Get top category
    const categoryTotals = core.calculateCategoryTotals(yearTransactions);
    const topCategory = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0] || ['None', 0];

    // Update dashboard stats
    document.getElementById('current-year-total').textContent = core.formatCurrency(yearTotal);
    
    if (selectedYear === currentYear) {
        document.getElementById('current-month-label').textContent = "This Month's Spend";
        document.getElementById('current-month-total').textContent = core.formatCurrency(monthTotal);
    } else {
        document.getElementById('current-month-label').textContent = "Monthly Data";
        document.getElementById('current-month-total').textContent = "N/A for past years";
    }
    
    document.getElementById('monthly-average').textContent = core.formatCurrency(monthlyAverage);
    document.getElementById('top-category').textContent = `${topCategory[0]} (${core.formatCurrency(topCategory[1])})`;
    
    // Update year selector display
    document.getElementById('year-display').textContent = selectedYear;
    
    // Update chart title
    document.getElementById('monthly-chart-title').textContent = `Monthly Spending (${selectedYear})`;

    // Create charts
    createMonthlyChart(yearTransactions, selectedYear, currentYear, currentMonth);
    createCategoryChart(yearTransactions);
    
    // Dispatch year changed event for other modules
    document.dispatchEvent(new CustomEvent('yearChanged', { detail: selectedYear }));
}

// Create monthly spending bar chart
function createMonthlyChart(transactions, year, currentYear, currentMonth) {
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
    
    // For current year, create a different background color for future months
    const backgroundColor = monthNames.map((_, i) => {
        if (year === currentYear && i > currentMonth) {
            return '#e5e7eb'; // Light gray for future months
        }
        return '#2563eb';
    });

    // Clear any previous chart
    if (monthlyChart instanceof Chart) {
        monthlyChart.destroy();
    }

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Monthly Spending',
                data: monthlyData,
                backgroundColor: backgroundColor,
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
    
    // Clear any previous chart
    if (categoryChart instanceof Chart) {
        categoryChart.destroy();
    }    categoryChart = new Chart(ctx, {
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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,  // Smaller color boxes
                        padding: 10,    // Less padding between items
                        font: {
                            size: 11    // Smaller font size
                        }
                    }
                }
            }
        }
    });
}

// Switch to previous year
function prevYear() {
    console.log("Previous year button clicked");
    const availableYears = core.getAvailableYears();
    console.log("Available years:", availableYears);
    
    const currentIndex = availableYears.indexOf(selectedYear);
    console.log("Current year index:", currentIndex);
    
    if (currentIndex < availableYears.length - 1) {
        selectedYear = availableYears[currentIndex + 1];
        console.log(`Moving to previous year: ${selectedYear}`);
        updateDashboard();
    } else {
        console.log("Already at the oldest year");
    }
}

// Switch to next year
function nextYear() {
    console.log("Next year button clicked");
    const availableYears = core.getAvailableYears();
    console.log("Available years:", availableYears);
    
    const currentIndex = availableYears.indexOf(selectedYear);
    console.log("Current year index:", currentIndex);
    
    if (currentIndex > 0) {
        selectedYear = availableYears[currentIndex - 1];
        console.log(`Moving to next year: ${selectedYear}`);
        updateDashboard();
    } else {
        console.log("Already at the most recent year");
    }
}

// Initialize dashboard
function initialize() {
    // Set up year navigation buttons with direct event handling
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    
    prevYearBtn.addEventListener('click', function(e) {
        console.log("Prev year button clicked");
        e.preventDefault();
        prevYear();
    });
    
    nextYearBtn.addEventListener('click', function(e) {
        console.log("Next year button clicked");
        e.preventDefault();
        nextYear();
    });
    
    updateDashboard();
}

// Export module functions
module.exports = {
    initialize,
    updateDashboard
};