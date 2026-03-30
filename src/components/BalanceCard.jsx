import './BalanceCard.css';
import { DollarSign, Pencil, Check } from 'lucide-react';
import { useState } from 'react';

function BalanceCard({ balance, salary, spent, onBalanceChange, onSalaryChange,  }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');

  const startEdit = () => { setInputValue(balance.toString()); setIsEditing(true); };
  const confirmEdit = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed >= 0) onBalanceChange(parsed);
    setIsEditing(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') confirmEdit();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const startSalaryEdit = () => { setSalaryInput(salary.toString()); setIsEditingSalary(true); };
  const confirmSalaryEdit = () => {
    const parsed = parseFloat(salaryInput);
    if (!isNaN(parsed) && parsed >= 0) onSalaryChange(parsed);
    setIsEditingSalary(false);
  };
  const handleSalaryKeyDown = (e) => {
    if (e.key === 'Enter') confirmSalaryEdit();
    if (e.key === 'Escape') setIsEditingSalary(false);
  };

  return (
    <div className="balance-card">
      <div className="balance-card-top">
        <div>
          <p className="balance-label">Total Balance</p>
          {isEditing ? (
            <div className="balance-edit-row">
              <span className="balance-currency">$</span>
              <input
                autoFocus
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={confirmEdit}
                onKeyDown={handleKeyDown}
                className="balance-input"
              />
              <button onClick={confirmEdit} className="balance-confirm-btn">
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div className="balance-display-row">
              <h2 className="balance-amount">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <button onClick={startEdit} className="balance-edit-btn">
                <Pencil size={15} />
              </button>
            </div>
          )}
        </div>
        <div className="balance-icon-wrapper">
          <DollarSign size={24} />
        </div>
      </div>

      <div className="balance-divider" />

      <div className="balance-stats-grid">
        <div>
          <p className="balance-stat-label">Monthly Salary</p>
          {isEditingSalary ? (
            <div className="salary-edit-row">
              <span className="salary-currency">$</span>
              <input
                autoFocus
                type="number"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                onBlur={confirmSalaryEdit}
                onKeyDown={handleSalaryKeyDown}
                className="salary-input"
              />
              <button onClick={confirmSalaryEdit} className="salary-confirm-btn">
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="salary-display-row">
              <p className="salary-amount">${salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <button onClick={startSalaryEdit} className="salary-edit-btn">
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
        <div className="balance-spent">
          <p className="balance-stat-label">Spent</p>
          <p className="spent-amount">${spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    </div>
  );
}

export default BalanceCard;