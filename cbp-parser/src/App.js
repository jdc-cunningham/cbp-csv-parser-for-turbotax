import { useState, useEffect } from 'react';
import './css-reset.css';
import './App.css';
import axios from 'axios';
import Tabs from './components/tabs/tabs';

const App = () => {
  const [portfolios, setPortfolios] = useState({}); // {year: portfolios}

  useEffect(() => {
    if (Object.keys(portfolios).length) {
      console.log(portfolios);
    }
  }, [portfolios]);

  useEffect(() => {
    axios.get('http://localhost:8080/')
      .then(function (response) {
        // handle success
        if (Object.keys(response?.data)) {
          setPortfolios(portfolios => ({
            ...portfolios,
            ...response.data,
          }))
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }, []);

  return (
    <div className="App">
      <Tabs portfolios={portfolios} />
    </div>
  );
}

export default App;
