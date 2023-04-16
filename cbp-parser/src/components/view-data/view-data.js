import { useEffect } from 'react';
import './view-data.css';

const ViewData = (props) => {
  const { activeCurrency, activeYear, transactions } = props;

  const renderRows = () =>
    Object.keys(transactions[activeYear][activeCurrency].transactions).map((time, index) => {
      const row = transactions[activeYear][activeCurrency].transactions[time];

      return <div key={index} className={`ViewData__row  ${parseFloat(row.balance) === 0 ? 'zero' : ''}`}>
        <div className="ViewData__row-time">
          {time}
        </div>
        <div className="ViewData__row-type">
          {row.type}
        </div>
        <div className="ViewData__row-amount">
          {row.amount}
        </div>
        <div className="ViewData__row-balance">
          {row.balance}
        </div>
      </div>  
    });

  return (
    <div className="ViewData">
      {activeCurrency && renderRows()}
    </div>
  )
}

export default ViewData;