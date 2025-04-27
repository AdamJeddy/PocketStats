const fs = require('fs');
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
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
        const transactions = results.data;
        const monthlyCategory = {};

        transactions.forEach(trx => {
          const date = new Date(trx.Date);
          const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          const category = trx.Category;
          const amount = parseFloat(trx.Amount);

          if (!monthlyCategory[month]) {
            monthlyCategory[month] = {};
          }
          if (!monthlyCategory[month][category]) {
            monthlyCategory[month][category] = 0;
          }
          monthlyCategory[month][category] += amount;
        });

        // Create table
        createTable(transactions);

        // Create charts
        createMonthlyChart(monthlyCategory);
        createCategoryChart(transactions);
      }
    });
  });
});

function createTable(data) {
  const table = document.getElementById('dataTable');
  const columns = Object.keys(data[0]).map(key => ({ title: key, data: key }));

  $(table).DataTable({
    data: data,
    columns: columns
  });
}

function createMonthlyChart(monthlyData) {
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  const months = Object.keys(monthlyData);
  const categories = new Set();
  months.forEach(m => Object.keys(monthlyData[m]).forEach(c => categories.add(c)));

  const datasets = Array.from(categories).map(cat => ({
    label: cat,
    data: months.map(m => monthlyData[m][cat] || 0),
    fill: false,
    borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
    tension: 0.1
  }));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: datasets
    }
  });
}

function createCategoryChart(transactions) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  const categorySums = {};

  transactions.forEach(trx => {
    const cat = trx.Category;
    const amount = parseFloat(trx.Amount);

    if (!categorySums[cat]) {
      categorySums[cat] = 0;
    }
    categorySums[cat] += amount;
  });

  const labels = Object.keys(categorySums);
  const data = Object.values(categorySums);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Spend by Category',
        data: data,
        backgroundColor: labels.map(() => '#' + Math.floor(Math.random()*16777215).toString(16))
      }]
    }
  });
}
