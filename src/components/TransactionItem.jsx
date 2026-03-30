import './TransactionItem.css';

function TransactionItem({ transaction }) {
  return (
    <div className="transaction-item">
      <div className="transaction-left">
        <div className={`transaction-icon ${transaction.iconBg} ${transaction.iconColor}`}>
          {transaction.icon}
        </div>
        <div>
          <h4 className="transaction-category">{transaction.category}</h4>
          <p className="transaction-description">{transaction.description}</p>
        </div>
      </div>
      <div className="transaction-right">
        <p className={`transaction-amount ${transaction.amount < 0 ? 'transaction-amount--debit' : 'transaction-amount--credit'}`}>
          {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
        </p>
        <p className="transaction-time">{transaction.time}</p>
      </div>
    </div>
  );
}

export default TransactionItem;
