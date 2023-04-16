### Status: Incomplete

### About

This is a web-based CSV parser to transform an exported account CSV file (Portfolio All, Account All) from Coinbase Pro for import into Turbotax.

This is using a FIFO cost-basis method to generate the buy-sell rows. The application is visual in nature so that you can verify the values.

### Try it
Click on this <a href="https://jdc-cunningham.github.io/cbp-turbotax-csv-parser/">link</a> to go to the github hosted site. The source code for the GH pages is in the [docs folder](https://github.com/jdc-cunningham/cbp-turbotax-csv-parser/tree/master/docs).

### Things to consider for accuracy
* if you have an existing balance from a prior year, that CSV file has to be imported
  * eg. currency bought in 2021 sold in 2022
* not addressed:
  * if you transferred in crypto that you didn't buy in CBP
  * if you withdrew crypto from your wallet but did not sell it

Also I will note the buys are batched with regard to the cost basis/proceeds rows for Turbotax. So if you bought some currency at 04/01/2021 and 04/02/2021, both of those total the amount sold on 04/03/2021, then there would be 1 row, the buy date being 04/01/2021(earliest) and sale date of 04/03/2021. You could instead have two rows with the sales separated/matching each buy row. The gains calculated in the end is the same but less rows in the Turbotax CSV.

### Privacy
This does not upload your CSV file somewhere, your CSV file is read in browser using the `FileReader` API that can load a file in the browser and use it.

### Disclaimer
This is free software, no guarantees. I am not a tax expert or anything. The primary causes of errors include the things to consider list above and rounding/dealing with decimal places eg. 0.00000001 left over (used `currency.js` to try and address that).

Use at your own risk.

Be sure to double check if the values generated make sense.
