const fs = require("fs");
const http = require('http');

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

http.createServer(function (req, res) {
  if (req.url !== "/") { // prevent double calls eg. favicon
    return;
  }

  let html = "";

  const csv2021Rows = {};
  const currencies = [];
  const balances = {};

  fs.readFile("2021-account-statement.csv", "utf-8", (err, data) => {
    const rows = data.split('\n');

    rows.shift(); // remove headers

    rows.forEach(row => {
      if (row.length) {
        const cols = row.split(',');
        const type = cols[1];
        const time = cols[2];
        const amount = cols[3];
        const balance = cols[4];
        const currency = cols[5];

        if (currency !== 'ADA') {
          return;
        }

        if (currencies.indexOf(currency) === -1) {
          currencies.push(currency);
        }

        if (!(currency in balances)) {
          balances[currency] = parseFloat(amount);
        } else {
          balances[currency] += parseFloat(amount);
        }

        csv2021Rows[time] = {
          cols,
          type
        }
      }
    });

    console.log(currencies);
    console.log(balances);

    html = buildHtml(csv2021Rows);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': html.length,
      'Expires': new Date().toUTCString()
    });

    res.end(html);
  });
}).listen(8080);
