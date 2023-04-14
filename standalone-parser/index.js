const fs = require("fs");
const http = require('http');

function buildHtml(rows) {
  var header = '';
  var body = '';

  Object.keys(rows).forEach(txTime => {
    const row = rows[txTime];

    let bgColor = '';

    if (row.type === 'deposit') {
      bgColor = '#FFFF8F';
    }

    body += `<div style="background-color: ${bgColor}">${txTime}</div>`;
  });

  return '<!DOCTYPE html>'
    + '<html><head>' + header + '</head><body>' + body + '</body></html>';
};

http.createServer(function (req, res) {
  let html = "";

  const csv2021Rows = {};

  fs.readFile("2021-account-statement.csv", "utf-8", (err, data) => {
    const rows = data.split('\n');

    rows.shift(); // remove headers

    rows.forEach(row => {
      if (row.length) {
        const cols = row.split(',');
        const type = cols[1];
        const time = cols[2];

        csv2021Rows[time] = {
          cols,
          type
        }
      }
    });

    html = buildHtml(csv2021Rows);

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': html.length,
      'Expires': new Date().toUTCString()
    });

    res.end(html);
  });
}).listen(8080);
