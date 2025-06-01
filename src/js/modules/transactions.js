// transactions.js - Transactions tab functionality
const core = require('./core.js');

// Store filter values
let filters = {
    category: '',
    paymentType: '',
    amountMin: null,
    amountMax: null,
    search: ''
};

// Create transactions table
function createTransactionsTable() {
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = '';

    // Get all transactions
    let transactions = core.getTransactions();
    
    // If a year is selected, filter by year
    if (window.selectedYear) {
        transactions = core.getTransactionsByYear(window.selectedYear);
        
        // Update table title to show which year we're viewing
        document.getElementById('transactions-title').textContent = `Transactions (${window.selectedYear})`;
    } else {
        document.getElementById('transactions-title').textContent = 'All Transactions';
    }

    // Apply filters if they exist
    transactions = applyFilters(transactions);

    // Sort transactions by date (most recent first)
    const sortedTransactions = [...transactions].sort((a, b) => b.date - a.date);

    // Populate the table
    sortedTransactions.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row['Purchase Date']}</td>
            <td>${row['Category']}</td>
            <td>${row['Item']}</td>
            <td>${core.formatCurrency(row['Amount'])}</td>
            <td>${row['Payment Type'] || ''}</td>
            <td>${row['Additional Information'] || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Apply filters to the transactions
function applyFilters(transactions) {
    return transactions.filter(trx => {
        // Category filter
        if (filters.category && trx.Category !== filters.category) {
            return false;
        }
        
        // Payment Type filter
        if (filters.paymentType && trx['Payment Type'] !== filters.paymentType) {
            return false;
        }
        
        // Amount Min filter
        if (filters.amountMin !== null && trx.Amount < filters.amountMin) {
            return false;
        }
        
        // Amount Max filter
        if (filters.amountMax !== null && trx.Amount > filters.amountMax) {
            return false;
        }
        
        // Search filter (search in item and additional info)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const itemMatch = trx.Item && trx.Item.toLowerCase().includes(searchLower);
            const infoMatch = trx['Additional Information'] && 
                             trx['Additional Information'].toLowerCase().includes(searchLower);
            if (!itemMatch && !infoMatch) {
                return false;
            }
        }
        
        // If all filters pass, include this transaction
        return true;
    });
}

// Set up filter event listeners
function setupFilters() {
    // Populate category dropdown
    const categoryFilter = document.getElementById('category-filter');
    const categories = [...new Set(core.getTransactions().map(trx => trx.Category))].sort();
    categories.forEach(category => {
        if (category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });

    // Populate payment type dropdown
    const paymentFilter = document.getElementById('payment-filter');
    const paymentTypes = [...new Set(core.getTransactions().map(trx => trx['Payment Type']))].sort();
    paymentTypes.forEach(paymentType => {
        if (paymentType) {
            const option = document.createElement('option');
            option.value = paymentType;
            option.textContent = paymentType;
            paymentFilter.appendChild(option);
        }
    });

    // Set up event listeners for filter changes
    categoryFilter.addEventListener('change', e => {
        filters.category = e.target.value;
        createTransactionsTable();
    });

    paymentFilter.addEventListener('change', e => {
        filters.paymentType = e.target.value;
        createTransactionsTable();
    });

    const amountMin = document.getElementById('amount-min');
    amountMin.addEventListener('change', e => {
        filters.amountMin = e.target.value ? parseFloat(e.target.value) : null;
        createTransactionsTable();
    });

    const amountMax = document.getElementById('amount-max');
    amountMax.addEventListener('change', e => {
        filters.amountMax = e.target.value ? parseFloat(e.target.value) : null;
        createTransactionsTable();
    });

    const searchFilter = document.getElementById('search-filter');
    searchFilter.addEventListener('input', e => {
        filters.search = e.target.value;
        createTransactionsTable();
    });

    // Set up clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    clearFiltersBtn.addEventListener('click', () => {
        // Reset all filter values
        filters = {
            category: '',
            paymentType: '',
            amountMin: null,
            amountMax: null,
            search: ''
        };

        // Reset form elements
        categoryFilter.value = '';
        paymentFilter.value = '';
        amountMin.value = '';
        amountMax.value = '';
        searchFilter.value = '';

        // Refresh table
        createTransactionsTable();
    });
}

// Initialize transactions tab
function initialize() {
    // Setup filters first, then create the table
    setupFilters();
    createTransactionsTable();
    
    // Listen for year change events
    document.addEventListener('yearChanged', createTransactionsTable);
}

// Export module functions
module.exports = {
    initialize,
    createTransactionsTable
};