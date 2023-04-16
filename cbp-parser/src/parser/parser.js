const fs = require("fs");
const http = require('http');
const currencyFn = require('currency.js');

const parseCsvOld = (csvPath) => {

  fs.readFile("2021-account-statement.csv", "utf-8", (err, data) => {
    const csv2021Rows = {};
    const currencies = [];
    const balances = {};
    const portfolios = {};  
    const rows = data.split('\n');

    rows.shift(); // remove headers

    rows.forEach(row => {
      if (row.length) {
        const cols = row.split(',');
        const portfolio = cols[0];
        const type = cols[1];
        const time = cols[2];
        const amount = cols[3];
        const balance = cols[4];
        const currency = cols[5];

        // if (currency !== 'ADA') {
        //   return;
        // }

        if (currencies.indexOf(currency) === -1) {
          currencies.push(currency);
        }

        if (!(portfolio in portfolios)) {
          portfolios[portfolio] = {};
        }

        if (!(currency in portfolios[portfolio])) {
          portfolios[portfolio][currency] = {
            balance: currencyFn(amount),
          };
        } else {
          portfolios[portfolio][currency].balance = portfolios[portfolio][currency].balance.add(amount);
        }

        // if (!(currency in balances)) {
        //   // balances[currency] = parseFloat(amount);
        //   balances[currency] = currencyFn(amount);
        // } else {
        //   // balances[currency] += parseFloat(amount);
        //   balances[currency] = balances[currency].add(amount);
        // }

        csv2021Rows[time] = {
          cols,
          type
        }
      }
    });

    Object.keys(portfolios).forEach(portfolio => {
      console.log(portfolio);
      console.log(portfolios[portfolio])
    });

    // console.log(currencies);
    // console.log(balances);
  });
}

export const parseCbpCsv = (csvPath) => {
  return new Promise(resolve => {
    fs.readFile(csvPath, "utf-8", (err, data) => {
      const portfolios = {};
      const currencies = [];
      const rows = data.split('\n');
  
      rows.shift(); // remove headers
  
      rows.forEach(row => {
        if (row.length) {
          const cols = row.split(',');
          const portfolio = cols[0];
          const type = cols[1];
          const time = cols[2];
          const amount = cols[3];
          const balance = cols[4];
          const currency = cols[5];
  
          if (!(portfolio in portfolios)) {
            portfolios[portfolio] = {}
          }
  
          if (!(currency in portfolios[portfolio])) {
            portfolios[portfolio][currency] = {
              balance: 0,
              transactions: {}
            };
          }

          if (currencies.indexOf(currency) === -1) {
            currencies.push(currency);
          }
  
          portfolios[portfolio][currency].transactions[time] = {
            type,
            amount,
            balance
          };
        }
      });

      console.log(currencies);
  
      resolve(portfolios);
    });
  });
}