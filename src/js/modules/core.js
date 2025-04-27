// core.js - Core application functionality
const fs = require('fs');
const path = require('path');

// Global data store
let transactions = [];

// Format currency in AED
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED'
    }).format(amount);
}

// Calculate total from transaction list
function calculateTotal(transactions) {
    return transactions.reduce((sum, trx) => sum + (trx.Amount || 0), 0);
}

// Calculate totals by category from transaction list
function calculateCategoryTotals(transactions) {
    return transactions.reduce((totals, trx) => {
        if (!totals[trx.Category]) {
            totals[trx.Category] = 0;
        }
        totals[trx.Category] += trx.Amount || 0;
        return totals;
    }, {});
}

// Get icon for a category
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

// Load transaction data from CSV file
function loadTransactions() {
    return new Promise((resolve, reject) => {
        // Updated path to use absolute path from project root
        const csvFile = path.join(process.cwd(), 'transactions.csv');

        fs.readFile(csvFile, 'utf8', (err, data) => {
            if (err) {
                console.error('Failed to load CSV:', err);
                reject(err);
                return;
            }

            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    // Process dates and amounts
                    transactions = results.data.map(trx => ({
                        ...trx,
                        Amount: parseFloat(trx.Amount) || 0,
                        date: new Date(trx['Purchase Date'])
                    }));
                    resolve(transactions);
                },
                error: function(err) {
                    reject(err);
                }
            });
        });
    });
}

// Get all transactions
function getTransactions() {
    return transactions;
}

// Get transactions filtered by year
function getTransactionsByYear(year) {
    return transactions.filter(trx => trx.date.getFullYear() === year);
}

// Get transactions filtered by year and month
function getTransactionsByYearAndMonth(year, month) {
    return transactions.filter(
        trx => trx.date.getFullYear() === year && trx.date.getMonth() === month
    );
}

// Export functions for use in other modules
module.exports = {
    loadTransactions,
    getTransactions,
    getTransactionsByYear,
    getTransactionsByYearAndMonth,
    formatCurrency,
    calculateTotal,
    calculateCategoryTotals,
    getCategoryIcon
};