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

const parseCsv = (csvPath) => {
  return new Promise(resolve => {
    fs.readFile(csvPath, "utf-8", (err, data) => {
      const rows = data.split('\n');

      rows.shift(); // remove headers

      const transactionGroups = {};

      let year = '';

      rows.forEach((row, index) => {
        if (row.length) {
          const cols = row.split(',');
          const time = cols[2];

          if (!year) {
            year = time.split('-')[0];
          }

          if (!(time in transactionGroups)) {
            transactionGroups[time] = [
              row,
            ];
          } else {
            transactionGroups[time].push(row)
          }
        }
      });

      const transactions = {
        year,
      };

      // const currencies = [];

      Object.keys(transactionGroups).forEach((transactionGroup, index) => {
      //   if (row.length) {
      //     const cols = row.split(',');
      //     const portfolio = cols[0];
      //     const type = cols[1];
      //     const time = cols[2];
      //     const amount = cols[3];
      //     const balance = cols[4];
      //     const currency = cols[5];
  
      //     if (!(currency in transactions)) {
      //       transactions[currency] = {
      //         balance: 0,
      //         transactions: {}
      //       };
      //     }

      //     if (currencies.indexOf(currency) === -1) {
      //       currencies.push(currency);
      //     }
  
      //     transactions[currency].transactions[time] = {
      //       type,
      //       amount,
      //       balance
      //     };
      //   }
      });

      // console.log(currencies);
  
      resolve(transactions);
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

  const portfolios = await parseCsv("../csv-files/2021-account-statement.csv");

  // CORS
  // https://stackoverflow.com/a/54309023/2710227
  res.setHeader('Access-Control-Allow-Origin', '*'); /* @dev First, read about security */
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Max-Age', 2592000); // 30 days

  res.writeHead(200, {
    // 'Content-Type': 'text/html',
    'Content-Type': 'application/json',
    'Expires': new Date().toUTCString()
  });

  res.end(JSON.stringify(portfolios));
}).listen(8080);
