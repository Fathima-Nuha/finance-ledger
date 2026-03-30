import './BottomNav.css';
import { Home, BarChart2, Plus, Clock, Settings } from 'lucide-react';

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`nav-button ${active ? 'nav-button--active' : 'nav-button--inactive'}`}
    >
      {icon}
      <span className="nav-button-label">{label}</span>
      {active && <div className="nav-button-dot" />}
    </button>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      <NavButton icon={<Home size={24} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
      <NavButton icon={<BarChart2 size={24} />} label="Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />

      <div className="nav-center-wrapper">
        <button className="nav-center-btn">
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      <NavButton icon={<Clock size={24} />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
      <NavButton icon={<Settings size={24} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
    </nav>
  );
}

export default BottomNav;