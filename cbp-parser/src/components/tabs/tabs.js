import { useEffect } from 'react';
import './tabs.css';

const Tabs = (props) => {
  const { transactions, activeYear, setActiveYear, activeCurrency, setActiveCurrency } = props;
  const years = Object.keys(transactions);
  const currencies = (transactions[activeYear] && Object.keys(transactions[activeYear]).filter(currency => currency !== 'year' && currency !== 'USD')) || [];

  console.log(currencies, activeCurrency);

  useEffect(() => {
    if (Object.keys(transactions).length) {
      if (!activeYear) {
        setActiveYear(years.sort()[0]);
      }

      if (!activeCurrency && currencies.length) {
        setActiveCurrency(currencies[0]);
      }
    }
  }, [transactions]);

  return (
    <div className="Tabs">
      <div className="Tabs__currencies">
        {currencies.map((currency, index) => (
          <div
            key={index}
            className={`Tabs__currency ${(activeCurrency === currency) ? 'active' : ''}`}
            onClick={() => setActiveCurrency(currency)}
          >
            {currency}
          </div>
        ))}
      </div>
      <div className="Tabs__years">
        {years.map((year, index) => (
          <div key={index} className={`Tabs__year ${(activeYear === year) ? 'active' : ''}`}>
            {year}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tabs;