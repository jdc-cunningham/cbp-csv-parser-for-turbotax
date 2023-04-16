const fs = require("fs");
const http = require('http');
const currencyFn = require('currency.js');
const { prototype } = require("events");

function buildHtml(rows) {
  var header = '';
  var body = '';

  Object.keys(rows).forEach((txTime, index) => {
    const row = rows[txTime];

    if (index === 0) {
      console.log(row);
    }

    let bgColor = '';

    if (row.type === 'deposit') {
      bgColor = '#FFFF8F';
    }

    body += `<div style="background-color: ${bgColor}">${row.cols[5]}, ${row.cols[3]}</div>`;
  });

  return '<!DOCTYPE html>'
    + '<html><head>' + header + '</head><body>' + body + '</body></html>';
};


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

const parseCsv = (csvPath) => {
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

const makeRows = (portfolios) =>
  Object.keys(portfolios).map(portfolio => (
    `<div>${portfolio}</div>`
  )).join('');

http.createServer(async (req, res) => {
  if (req.url !== "/") { // prevent double calls eg. favicon
    return;
  }

  // let html = "";

  // html = buildHtml(csv2021Rows);

  const portfolios = await parseCsv("2021-account-statement.csv");

  const html = '<!DOCTYPE html>'
    + `<html><head></head><body>${makeRows(portfolios)}</body></html>`;

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Expires': new Date().toUTCString()
  });

  res.end(html);
}).listen(8080);
