const fs = require("fs");

fs.readFile("2021-account-statement.csv", "utf-8", (err, data) => {
  console.log(data);
});