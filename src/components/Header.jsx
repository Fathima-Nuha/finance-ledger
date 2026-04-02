import './Header.css';
import { RefreshCw, LogOut } from 'lucide-react';

function Header({ onReset, onLogout }) {
  return (
    <header className="header">
      <button className="header-logout-btn" onClick={onLogout} title="Switch user">
        <LogOut size={16} />
      </button>
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
