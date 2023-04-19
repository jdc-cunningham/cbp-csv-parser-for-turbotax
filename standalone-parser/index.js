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
const buySellMatchCost = (buySize, buyCost, sellSize) => ((sellSize * buyCost) / buySize);

const sellBuyMatchCost = (sellSize, sellCost, buySize) => ((buySize * sellCost) / sellSize);

// recursive function that keeps taking fractions or whole buys until the current sale is met
const sumUpBuys = (saleMatched, partialSells, currency, sale, buys, resolver) => {
  const amountSold = parseFloat(sale.size);

  if (saleMatched !== amountSold) {
    // const buy = buys[currency][0];
    // const buySize = buy.size;
    // const sellBuyMatchCost = buySellMatchCost(buy.originalSize, buyCost, -1 * buySize);
    // const partialSellProceeds = sellBuyMatchCost(buySize, sale.proceeds, -1 * amountSold);

    // partialSells.push({
    //   size: buySize,
    //   gainLoss: partialSellProceeds + sellBuyMatchCost
    // });

    // saleMatched += buySize;

  } else {
    resolver({});
  }
}

// this takes in the "buckets" of crypto purchased at different dates/prices
// sorted in ascending order (by purchase date eg. first is oldest)
// modifies this to reduce as the sale is processed against it
// keeps reducing until sale is met if necessary (need more than one buy to fullfill sale)
const matchSale = async (sale, buys) => {
  return new Promise(resolve => {
    const currency = sale.currency;
    const amountSold = parseFloat(sale.size);
    const sellProceeds = parseFloat(sale.proceeds);
    const buy = buys[currency][0];
    const buySize = parseFloat(buy.size);
    const buyCost = buy.cost;

    console.log('buy size', buySize, amountSold);
  
    if (buySize > (-1 * amountSold)) {
      // console.log(buySize, buyCost, amountSold);
      const sellBuyMatchCost = buySellMatchCost(buySize, buyCost, -1 * amountSold);
  
      // reduce bucket
      console.log('pre', buy.size);
      buy.size = buySize + amountSold;
      console.log('post', buy.size);
  
      // console.log(sellProceeds, sellBuyMatchCost);
  
      resolve(sellProceeds + sellBuyMatchCost);
    } else {
      console.log('else');
      // combine multiple buys to match needed sell size
      // console.log('else');
  
      // use remaining buy
  
      // reduce sell
  
      // do this loop

      let saleMatched = 0;
      const partialSells = [];
  
      sumUpBuys(saleMatched, partialSells, currency, sale, buys, resolve);
    }
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
      gainLoss.push({
        date,
        currency,
        gain: await matchSale(sell, buys) // + if gain, - if loss
      })
    // });
    }

    // console.log(gainLoss);

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

  console.log('sale');
  console.log(txRowsGroupedByEvent.sells[0].size, txRowsGroupedByEvent.sells[0].proceeds);
  console.log('buy');
  console.log(groupedBuys['ETH'][0]);
  console.log('sale');
  console.log(txRowsGroupedByEvent.sells[1].size, txRowsGroupedByEvent.sells[1].proceeds);
  console.log('buy');
  console.log(groupedBuys['ETH'][1]);

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
