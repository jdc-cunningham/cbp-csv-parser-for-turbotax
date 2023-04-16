import { useEffect } from 'react';
import './view-data.css';

const ViewData = (props) => {
  const { activeCurrency, activeYear, transactions } = props;

  const renderRows = () => {
    const rows = {
      'time': {
        type: 'type',
        amount: 'amount',
        balance: 'balance',
      },
      ...transactions[activeYear][activeCurrency].transactions // should just build separately
    };

    return Object.keys(rows).map((time, index) => {
      const row = rows[time];

      return <div key={index} className={`ViewData__row  ${parseFloat(row.balance) === 0 ? 'zero' : ''}`}>
        <div className="ViewData__row-time">
          {time}
        </div>
        <div className="ViewData__row-type">
          {row.amount > 0 ? 'buy' : 'sell'}
        </div>
        <div className="ViewData__row-amount">
          {row.amount}
        </div>
        <div className="ViewData__row-balance">
          {row.balance}
        </div>
      </div>  
    });
  }

  return (
    <div className="ViewData">
      {activeCurrency && renderRows()}
    </div>
  )
}

export default ViewData;