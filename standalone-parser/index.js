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

      Object.keys(transactionGroups).forEach((transactionTime, index) => {
        // const txEvents = transactionGroups[transactionTime];
        // const firstRow = txEvents[0];
        // const firstRowCols = firstRow.split(',');
        // const firstRowType = firstRowCols[1];

        // if (firstRowType === 'match') { // start of tx group
        //   match = true;

        //   let costBasis = 0; // this will be a source of error, but spreadsheet is source of truth (USD balance)
        //   let eventType = '';

        //   // loop over this group
        //   // the match, match, fee is set by what changes first
        //   // sold: BTC down, USD up
        //   // bought: USD down, BTC up
        //   const eventRow = txEvents[0];
        //   const cols = eventRow.split(',');
        //   const amount = cols[3];
        //   const eventRowUnit = cols[5];
        //   const eventRow2 = txEvents[1];
        //   const eventRow2Cols = eventRow2.split(',');
        //   const eventRow2Unit = eventRow2Cols[5];

        //   let currency = '';

        //   console.log(transactionTime, eventRowUnit, eventRow2Unit);

        //   if (eventRowUnit === 'USD') { // bought
        //     costBasis = amount;
        //     eventType = 'buy';
        //     currency = eventRow2Unit;
        //   } else {
        //     costBasis = eventRow2Cols[3];
        //     eventType = 'sell';
        //     currency = eventRowUnit;
        //   }

        //   if (!(currency in transactions) && currency !== 'USD') {
        //     transactions[currency] = {};
        //   }

        //   transactions[currency][transactionTime] = {
        //     type: eventType,
        //     amount,
        //     costBasis
        //   }
        // }
      });
  
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

  // await parseCsv("../csv-files/2021-account-statement.csv");

  // const portfolios = {};

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
