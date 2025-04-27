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
    // First, log the transactions for debugging
    console.log(`Calculating total for ${transactions.length} transactions`);
    
    // Use reduce with more robust parsing
    const total = transactions.reduce((sum, trx) => {
        // Handle the amount properly, removing any commas and converting to number
        const amount = typeof trx.Amount === 'string' ? 
            parseFloat(trx.Amount.replace(/,/g, '')) : trx.Amount;
        
        // Add it to the sum, defaulting to 0 if NaN
        const validAmount = isNaN(amount) ? 0 : amount;
        return sum + validAmount;
    }, 0);
    
    console.log(`Calculated total: ${total}`);
    return total;
}

// Calculate totals by category from transaction list
function calculateCategoryTotals(transactions) {
    return transactions.reduce((totals, trx) => {
        if (!totals[trx.Category]) {
            totals[trx.Category] = 0;
        }
        
        // Handle the amount properly, removing any commas
        const amount = typeof trx.Amount === 'string' ? 
            parseFloat(trx.Amount.replace(/,/g, '')) : trx.Amount;
        
        totals[trx.Category] += isNaN(amount) ? 0 : amount;
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
                    console.log(`Parsed ${results.data.length} transactions from CSV`);
                    
                    // Process dates and amounts more carefully
                    transactions = results.data.map(trx => {
                        // Handle amount parsing to ensure no comma issues
                        let amount = 0;
                        if (trx.Amount) {
                            const cleanAmount = trx.Amount.toString().replace(/,/g, '');
                            amount = parseFloat(cleanAmount);
                            if (isNaN(amount)) {
                                console.warn(`Invalid amount found: ${trx.Amount}, setting to 0`);
                                amount = 0;
                            }
                        }
                        
                        // Parse the date carefully
                        let date;
                        try {
                            // Try to parse date in format DD/MM/YYYY
                            const dateParts = trx['Purchase Date'].split('/');
                            if (dateParts.length === 3) {
                                // Adjust month as JS months are 0-based
                                date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                            } else {
                                // Otherwise fallback to standard parsing
                                date = new Date(trx['Purchase Date']);
                            }
                            
                            // Verify date is valid
                            if (isNaN(date.getTime())) {
                                console.warn(`Invalid date found: ${trx['Purchase Date']}, using current date`);
                                date = new Date();
                            }
                        } catch (e) {
                            console.error(`Error parsing date ${trx['Purchase Date']}:`, e);
                            date = new Date(); // Fallback to current date
                        }
                        
                        return {
                            ...trx,
                            Amount: amount,
                            date: date
                        };
                    });
                    
                    // Log the available years to debug
                    console.log('Parsed transactions, available years:', [...new Set(transactions.map(t => t.date.getFullYear()))]);
                    
                    resolve(transactions);
                },
                error: function(err) {
                    console.error('Error parsing CSV:', err);
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
    year = parseInt(year, 10); // Ensure year is an integer
    const filtered = transactions.filter(trx => trx.date.getFullYear() === year);
    console.log(`Filtered ${filtered.length} transactions for year ${year}`);
    return filtered;
}

// Get transactions filtered by year and month
function getTransactionsByYearAndMonth(year, month) {
    year = parseInt(year, 10); // Ensure year is an integer
    const filtered = transactions.filter(
        trx => trx.date.getFullYear() === year && trx.date.getMonth() === month
    );
    console.log(`Filtered ${filtered.length} transactions for ${year}/${month+1}`);
    return filtered;
}

// Get all unique years from transactions
function getAvailableYears() {
    const years = [...new Set(transactions.map(trx => trx.date.getFullYear()))];
    const sorted = years.sort((a, b) => b - a); // Sort descending (newest first)
    console.log('Available years:', sorted);
    return sorted;
}

// Export functions for use in other modules
module.exports = {
    loadTransactions,
    getTransactions,
    getTransactionsByYear,
    getTransactionsByYearAndMonth,
    getAvailableYears,
    formatCurrency,
    calculateTotal,
    calculateCategoryTotals,
    getCategoryIcon
};