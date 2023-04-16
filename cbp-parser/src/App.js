import { useState, useEffect } from 'react';
import './css-reset.css';
import './App.css';
import { parseCbpCsv } from './parser/parser';

const App = () => {
  useEffect(() => {
    const cbp2021 = parseCbpCsv('../../csv-files/2021-account-statement.csv');
    console.log(cbp2021);
  }, []);

  return (
    <div className="App">
      
    </div>
  );
}

export default App;
