import './Header.css';
import { RefreshCw } from 'lucide-react';

function Header({ onReset }) {
  return (
    <header className="header">
      <div className="header-spacer" />
      <div className="header-title-group">
        <h1 className="header-title">FinanceFlow</h1>
        <p className="header-subtitle">October 2023</p>
      </div>
      <button className="header-reset-btn" onClick={onReset} title="Monthly Reset">
        <RefreshCw size={18} />
      </button>
    </header>
  );
}

export default Header;
