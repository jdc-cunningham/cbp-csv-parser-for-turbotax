### About

This parses the full account statements with all portfolios from Coinbase Pro. It produces an importable CSV of buy/sells (FIFO method) for Turbotax.

If you have crypto from the previous year that was sold in the current year, those will have to get factored in (import previous year and current year).

There is no API, this all done in the browser.

### Development

You can run a basic node server (standalone-parser) instead of using the drag-drop feature.

The node-server would just parse/host the file on a `GET` request, so you don't have to keep dragging/dropping the file.

### Disclaimer

This only honors/supports 2 years, since as of this time, the generated CSV from CBP was blank for 2020.

**Made With Create React App**