// app.js - Main application entry point
// Use absolute paths from the root of the project instead of relative paths
const core = require('./src/js/modules/core.js');
const dashboard = require('./src/js/modules/dashboard.js');
const transactions = require('./src/js/modules/transactions.js');
const categories = require('./src/js/modules/categories.js');
const analysis = require('./src/js/modules/analysis.js');

// Initialize tab navigation
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

// Initialize application
async function initialize() {
    try {
        // Load transactions data
        await core.loadTransactions();
        
        // Initialize tab navigation
        initializeTabNavigation();
        
        // Initialize module components
        dashboard.initialize();
        transactions.initialize();
        categories.initialize();
        analysis.initialize();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);