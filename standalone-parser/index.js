const fs = require("fs");
const http = require('http');
const currencyFn = require('currency.js');

const parseCsv = (csvPath) => {
  return new Promise(resolve => {
    fs.readFile(csvPath, "utf-8", (err, data) => {
      const rows = data.split('\n');

      rows.shift(); // remove headers

      // store rows for sort by date key
      const txs = [];
      const currencyZero = {};

      rows.forEach((row, index) => {
        const cols = row.split(',');
        const time = cols[2];

        if (parseFloat(cols[4]) === 0) {
          const currency = cols[5];
          currencyZero[currency] = index + 2;
        }

        if (cols[1] === 'deposit' && cols[5] !== 'USD') {
          console.log('deposit', cols);
        }

        txs.push({
          date: time,
          cols,
        });
      });
      // sort rows by date
      // https://stackoverflow.com/a/12192544/2710227
      txs.sort(function(a, b) {
        return (a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0);
      });

      resolve(txs);
    });
  });
};

const groupTxsByPortfolio = (txGroups) => {
  return new Promise(resolve => {
    txGroups.forEach(txGroup => {
      const cols = txGroup;
      const portfolio = cols[0];
      const type = cols[1];
      const time = cols[2];
      const amount = cols[3];
      const balance = cols[4];
      const unit = cols[5];
    });
  });
};

http.createServer(async (req, res) => {
  if (req.url !== "/") { // prevent double calls eg. favicon
    return;
  }

  // process
  // 1) store in arr of iso date keyed objects
  // 2) sort by iso date key
  // 3) (NO)sort by portfolio(NO)
  // 4) sort by order of events
  //   - this means in the given iso group
  //     if USD is negative, means used to buy
  // 5) group into buy/sells ordered by time with determined cost basis

  // 1
  // const txRows = await parseCsv("../csv-files/CBP-2021-crop.csv");
  const txRows = await parseCsv("../csv-files/2022-account-statement.csv");
  
  // for (let i = 0; i < 10; i++) {
  //   console.log(txRows[i]);
  // }

  // 2
  // const txGroupsOrder = await groupTxsByPortfolio(txGroups);

  // 3
  // const txGroupsOrder = await groupTxsByPortfolio(txGroups);

  // 4


  // 5

  const portfolios = {};

  // const portfolios = await parseCsv("../csv-files/2021-account-statement.csv");

  // CORS
  // https://stackoverflow.com/a/54309023/2710227
  res.setHeader('Access-Control-Allow-Origin', '*'); /* @dev First, read about security */
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Max-Age', 2592000); // 30 days

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Expires': new Date().toUTCString()
  });

  res.end(JSON.stringify(portfolios));
}).listen(8080);
