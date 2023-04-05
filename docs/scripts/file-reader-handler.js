// filereader info
// https://stackoverflow.com/a/29395276/2710227

const fileInput = document.getElementById('file-input');

const readFile = () => {
  const file = fileInput.files[0];
  const reader = new FileReader();

  // crappy file type test
  if (file.name.indexOf('.csv') === -1) {
    alert('Please make sure your file is a CSV file');
    return;
  }

  reader.onload = () => {
    const loadedCsvRows = reader.result.split('\n');

    if (loadedCsvRows[0].trim() !== 'portfolio,trade id,product,side,created at,size,size unit,price,fee,total,price/fee/total unit') {
      alert('Please make sure your CSV was generated by CBP, check DevTools console for more info');
      console.log(loadedCsvRows[0].trim(), 'vs', 'portfolio,trade id,product,side,created at,size,size unit,price,fee,total,price/fee/total unit');
      return;
    }

    loadedCsvRows.shift();
    csvRows = loadedCsvRows;
    step2.classList = "hidden";
    step3.classList = "";

    processBuySellRows(); // main.js
  };

  // start reading the file. When it is done, calls the onload event defined above.
  reader.readAsBinaryString(fileInput.files[0]);
};

fileInput.addEventListener('change', readFile);