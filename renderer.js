const fs = require('fs');
const path = require('path');

let globalTransactions = [];

window.addEventListener('DOMContentLoaded', () => {
    initializeTabNavigation();
    loadTransactionData();
});

function initializeTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and its content
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function loadTransactionData() {
    const csvFile = path.join(__dirname, 'transactions.csv');

    fs.readFile(csvFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to load CSV:', err);
            return;
        }

        Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                globalTransactions = results.data.map(trx => ({
                    ...trx,
                    Amount: parseFloat(trx.Amount) || 0,
                    date: new Date(trx['Purchase Date'])
                }));

                updateDashboard();
                createTransactionsTable();
                updateCategoryBreakdown();
                createAnalysisTrends();
            }
        });
    });
}

function updateDashboard() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Filter transactions for current year
    const currentYearTransactions = globalTransactions.filter(
        trx => trx.date.getFullYear() === currentYear
    );

    // Filter transactions for current month
    const currentMonthTransactions = currentYearTransactions.filter(
        trx => trx.date.getMonth() === currentMonth
    );

    // Calculate totals
    const yearTotal = calculateTotal(currentYearTransactions);
    const monthTotal = calculateTotal(currentMonthTransactions);
    const monthlyAverage = yearTotal / (currentMonth + 1);

    // Get top category
    const categoryTotals = calculateCategoryTotals(currentYearTransactions);
    const topCategory = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0];

    // Update dashboard stats
    document.getElementById('current-year-total').textContent = formatCurrency(yearTotal);
    document.getElementById('current-month-total').textContent = formatCurrency(monthTotal);
    document.getElementById('monthly-average').textContent = formatCurrency(monthlyAverage);
    document.getElementById('top-category').textContent = `${topCategory[0]} (${formatCurrency(topCategory[1])})`;

    // Create charts
    createMonthlyChart(currentYearTransactions);
    createCategoryChart(currentYearTransactions);
}

function createTransactionsTable() {
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = '';

    // Sort transactions by date (most recent first)
    const sortedTransactions = [...globalTransactions]
        .sort((a, b) => b.date - a.date);

    sortedTransactions.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row['Purchase Date']}</td>
            <td>${row['Category']}</td>
            <td>${row['Item']}</td>
            <td>${formatCurrency(row['Amount'])}</td>
            <td>${row['Payment Type']}</td>
            <td>${row['Additional Information'] || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateCategoryBreakdown() {
    const currentYear = new Date().getFullYear();
    const yearTransactions = globalTransactions.filter(
        trx => trx.date.getFullYear() === currentYear
    );

    const categoryTotals = calculateCategoryTotals(yearTransactions);
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
                    <span class="material-icons">${getCategoryIcon(category)}</span>
                </div>
                <div class="category-info">
                    <div class="category-name">${category}</div>
                    <div class="category-amount">${formatCurrency(total)}</div>
                </div>
            `;
            categoryContainer.appendChild(categoryTile);
        });
}

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

function createCategoryChart(transactions) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categoryTotals = calculateCategoryTotals(transactions);

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

function createAnalysisTrends() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const currentYear = new Date().getFullYear();
    
    // Get main categories
    const categories = [...new Set(globalTransactions.map(t => t.Category))];
    const monthlyTotals = {};

    globalTransactions.forEach(trx => {
        if (trx.date.getFullYear() === currentYear) {
            const month = trx.date.getMonth();
            const category = trx.Category;
            
            if (!monthlyTotals[category]) {
                monthlyTotals[category] = new Array(12).fill(0);
            }
            
            monthlyTotals[category][month] += trx.Amount;
        }
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

// Utility functions
function calculateTotal(transactions) {
    return transactions.reduce((sum, trx) => sum + (trx.Amount || 0), 0);
}

function calculateCategoryTotals(transactions) {
    return transactions.reduce((totals, trx) => {
        if (!totals[trx.Category]) {
            totals[trx.Category] = 0;
        }
        totals[trx.Category] += trx.Amount || 0;
        return totals;
    }, {});
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED'
    }).format(amount);
}

function getCategoryIcon(category) {
    const icons = {
        'Food': 'restaurant',
        'Investment': 'trending_up',
        'Shopping': 'shopping_cart',
        'Entertainment': 'movie',
        'Travel fare': 'directions_car',
        'Phone': 'phone',
        'Snacks': 'local_cafe',
        'Other': 'more_horiz',
        'Charity': 'favorite',
    };
    return icons[category] || 'label';
}
