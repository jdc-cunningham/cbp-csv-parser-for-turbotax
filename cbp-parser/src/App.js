import { useState, useEffect } from 'react';
import './css-reset.css';
import './App.css';
import axios from 'axios';
import Tabs from './components/tabs/tabs';
import ViewData from './components/view-data/view-data';

const App = () => {
  const [transactions, setTransactions] = useState({});
  const [activeYear, setActiveYear] = useState((new Date().getFullYear()) - 1);
  const [activeCurrency, setActiveCurrency] = useState('');

  useEffect(() => {
    if (Object.keys(transactions).length) {
      console.log(transactions);
    }
  }, [transactions]);

  useEffect(() => {
    axios.get('http://localhost:8080/')
      .then(function (response) {
        // handle success
        console.log(response);
        if (Object.keys(response?.data)) {
          setActiveYear(response.data.year);
          setTransactions(prevState => ({
            ...prevState,
            ...response.data,
          }));
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
      <Tabs
        transactions={transactions}
        activeYear={activeYear}
        setActiveYear={setActiveYear}
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
      />
      <ViewData
        activeCurrency={activeCurrency}
        activeYear={activeYear}
        transactions={transactions}
      />
    </div>
  );
}

export default App;
