// transactions.js - Transactions tab functionality
const core = require('./core.js');

// Create transactions table
function createTransactionsTable() {
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = '';

    // Get all transactions
    const transactions = core.getTransactions();

    // Sort transactions by date (most recent first)
    const sortedTransactions = [...transactions].sort((a, b) => b.date - a.date);

    sortedTransactions.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row['Purchase Date']}</td>
            <td>${row['Category']}</td>
            <td>${row['Item']}</td>
            <td>${core.formatCurrency(row['Amount'])}</td>
            <td>${row['Payment Type']}</td>
            <td>${row['Additional Information'] || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize transactions tab
function initialize() {
    createTransactionsTable();
}

// Export module functions
module.exports = {
    initialize,
    createTransactionsTable
};