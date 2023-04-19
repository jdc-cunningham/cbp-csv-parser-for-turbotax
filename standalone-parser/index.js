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

const groupTxsByTradeId = (txGroups) => {
  return new Promise(resolve => {
    const txs = new Map();

    txGroups.forEach(txGroup => {
      const cols = txGroup.cols;
      const tradeId = cols[7] ? cols[7].trim() : '';

      // withdrawal and deposits don't have trade ids
      if (tradeId && cols[1] !== 'fee') {
        if (!(txs.has(tradeId))) {
          txs.set(tradeId, []);
        }

        txs.set(tradeId, [
          ...txs.get(tradeId),
          cols,
        ]);
      }
    });

    resolve(txs);
  });
};

const groupTxsByEvent = (txRowsGrouped) => {
  return new Promise(resolve => {
    const buys = [];
    const sells = [];

    txRowsGrouped.forEach((trade, tradeId) => {
      const txInfo = trade;
      const currency = txInfo[0][5];
      const amount = txInfo[0][3];

      if (currency === 'USD' && parseFloat(amount) < 0) { // buy
        buys.push({
          tradeId,
          txInfo,
          size: txInfo[1][3],
          cost: amount,
          currency: txInfo[1][5],
        });
      } else {
        if (currency === 'USD' && parseFloat(amount) > 0) {
          throw Error('match, match, fee: order is wrong for group');
        }

        sells.push({
          tradeId,
          txInfo,
          size: amount,
          proceeds: txInfo[1][3],
          currency,
        });
      }
    });

    resolve({
      buys,
      sells
    });
  });
}

const groupBuys = (buys, prevYearBuys) => {
  return new Promise(resolve => {
    const groupedBuys = {...prevYearBuys};

    buys.forEach(buy => {
      const currency = buy.currency;
      const date = buy.txInfo[0][2];

      if (!(currency in groupedBuys)) {
        groupedBuys[currency] = [];
      }

      groupedBuys[currency].push({
        size: buy.size,
        originalSize: buy.size,
        cost: buy.cost,
        date
      });
    });

    // console.log(groupedBuys['ETH'][0]);

    resolve(groupedBuys);
  });
}

// returns buy cost of this fractional bit that was sold
// cross multiplication
const partialBuyCost = (buySize, buyCost, sellSize) => ((sellSize * buyCost) / buySize);

// const sellBuyMatchCost = (sellSize, sellCost, buySize) => ((buySize * sellCost) / sellSize);

// recursive function that keeps adding up fractional buys to match sale
const matchSale = (sell, buys, matchedSale) => {
  
}

const calcGainLoss = (sell, buys) => {
  return new Promise(resolve => {
    let gainLoss = 0;

    const currency = sell.currency;
    const sellSize = -1 * parseFloat(sell.size);
    const sellProceeds = parseFloat(sell.proceeds);
    const buy = buys[currency][0];
    const buyPartialSize = parseFloat(buy.size); // reduced as used up or whole row removed
    const buySize = parseFloat(buy.originalSize);
    const buyCost = -1 * parseFloat(buy.cost);

    if (buyPartialSize > sellSize) {
      const matchedSellBuyCost = partialBuyCost(buySize, buyCost, sellSize);
      buy.size = buy.size - sellSize;
      gainLoss = sellProceeds - matchedSellBuyCost;
    } else {
      let matchedSale = false;

      gainLoss = matchSale(sell, buys, matchedSale);
    }

    resolve(gainLoss);
  });
}

const processBuySellGroups = (sells, buys) => {
  return new Promise(async resolve => {
    // console.log(sells[0]);

    const gainLoss = [];

    // sells.forEach(async sell => {
    for (let i = 0; i < 2; i++) {
      const sell = sells[i];
      const date = sell.txInfo[0][2];
      const currency = sell.currency;

      // console.log(sell);

      // console.log(sell);
      gainLoss.push({
        date,
        currency,
        gain: await calcGainLoss(sell, buys) // + if gain, - if loss
      })
    // });
    }

    console.log(gainLoss);

    resolve({});
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
  // 3) group into buy/sells with determined cost basis
  // 4) group buys by currency
  // 5) loop over sales against buys, use up buy rows to equate amount of crypto sold
  //    track remainder for future sales or next year

  // 0
  // read previous year data eg. prev-year-buys.json
  const prevYearBuysPath = '../prev-year-buys.json';
  const prevYearBuys = fs.existsSync(prevYearBuysPath) ? JSON.parse(fs.readFileSync(prevYearBuysPath, 'utf8')) : {};

  // 1
  // const txRows = await parseCsv("../csv-files/CBP-2021-crop.csv");
  const txRows = await parseCsv("../csv-files/2022-account-statement.csv");

  // 2
  const txRowsGrouped = await groupTxsByTradeId(txRows);

  // 3
  const txRowsGroupedByEvent = await groupTxsByEvent(txRowsGrouped); // buy/sell

  // 4
  const groupedBuys = await groupBuys(txRowsGroupedByEvent.buys, prevYearBuys);

  // console.log('sale');
  // console.log(txRowsGroupedByEvent.sells[0], txRowsGroupedByEvent.sells[0].size, txRowsGroupedByEvent.sells[0].proceeds);
  // console.log('buy');
  // console.log(groupedBuys['ETH'][0]);
  // console.log('sale');
  // console.log(txRowsGroupedByEvent.sells[1].size, txRowsGroupedByEvent.sells[1].proceeds);
  // console.log('buy');
  // console.log(groupedBuys['ETH'][1]);

  // 5
  await processBuySellGroups(txRowsGroupedByEvent.sells, groupedBuys);

  // const jsonRes = groupedBuys;

  const jsonRes = {};

  // CORS
  // https://stackoverflow.com/a/54309023/2710227
  res.setHeader('Access-Control-Allow-Origin', '*'); /* @dev First, read about security */
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Max-Age', 2592000); // 30 days

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Expires': new Date().toUTCString()
  });

  res.end(JSON.stringify(jsonRes));
}).listen(8080);
