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

      rows.forEach((row, index) => {
        const cols = row.split(',');
        const time = cols[2];

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

const groupTxsByOrderId = (txGroups) => {
  return new Promise(resolve => {
    const txs = {};

    txGroups.forEach(txGroup => {
      const cols = txGroup.cols;
      const orderId = cols[8].trim();

      // withdrawal and deposits don't have order ids
      if (orderId && cols[1] !== 'fee') {
        if (!(orderId in txs)) {
          txs[orderId] = [];
        }

        txs[orderId].push(cols);
      }
    });

    resolve(txs);
  });
};

const groupTxsByFiat = (txRowsGrouped) => {
  return new Promise(resolve => {
    const txs = {};

    Object.keys(txRowsGrouped).forEach(orderId => {
      const txInfo = txRowsGrouped[orderId];

      const row1Fiat = (txInfo[0][5] === 'USD');
      const row2Fiat = (txInfo[1][5] === 'USD');

      txs[orderId] = [];

      if (row1Fiat) {
        txs[orderId] = txInfo;
      } else {
        console.log('flipped', orderId);
        txs[orderId] = [
          txInfo[1],
          txInfo[2]
        ];
      }
    });

    resolve(txs);
  });
}

const groupTxsByEvent = (txRowsGrouped) => {
  return new Promise(resolve => {
    const buys = {};
    const sells = {};

    Object.keys(txRowsGrouped).forEach(orderId => {
      // const txInfo = txRowsGrouped[orderId];
      // const txInfoRow1Cols = txInfo[0];
      // const txInfoRow2Cols = txInfo[1]; // due to order possibly being switched

      // const isBuy1 = (txInfoRow1Cols[5] === 'USD' && txInfoRow1Cols[3] < 0);
      // const isBuy2 = (txInfoRow2Cols[5] === 'USD' && txInfoRow2Cols[3] < 0);

      // if (
      //   isBuy1 ||
      //   isBuy2
      // ) {
      //   let currency
      //   if (isBuy1) {
          
      //   } else {
        
      //   }
      // } else {
      //   sells.push(txInfo);
      // }
    });

    resolve({
      buys,
      sells
    });
  });
}

http.createServer(async (req, res) => {
  if (req.url !== "/") { // prevent double calls eg. favicon
    return;
  }

  // process
  // 1) store in arr of objects with iso date key
  //    sort by iso date key
  // 2) group by order id
  // 3) order by crypto first
  // 4) group into buy/sells with determined cost basis

  // 1
  const txRows = await parseCsv("../csv-files/CBP-2021-crop.csv");
  // const txRows = await parseCsv("../csv-files/2022-account-statement.csv");

  // 2
  const txRowsGrouped = await groupTxsByOrderId(txRows);

  // 3
  const txRowsOrderByFiat = await groupTxsByFiat(txRowsGrouped);

  // 4
  // const txGroupByEvent = await groupTxsByEvent(txRowsGrouped); // buy/sell

  // console.log(txGroupByEvent.buys[0]);

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
