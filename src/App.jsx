import './App.css';
import { useState } from 'react';
import Onboarding from './components/Onboarding';
import { Home, Smile, DollarSign, Plus } from 'lucide-react';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import CategoryCard from './components/CategoryCard';
import TransactionItem from './components/TransactionItem';

const INITIAL_CATEGORIES = [
  { id: '1', name: 'Category 1', description: 'New category description', limit: 0, balance: 0, color: 'cat-green' },
];

const INITIAL_TRANSACTIONS = [
  {
    id: 't1', category: 'Needs', description: 'Grocery Store',
    amount: -42.50, time: '10:45 AM', date: 'Today',
    icon: <Home size={16} />, iconBg: 'icon-bg-blue', iconColor: 'icon-text-blue'
  },
  {
    id: 't2', category: 'Wants', description: 'Coffee House',
    amount: -5.20, time: '08:12 AM', date: 'Today',
    icon: <Smile size={16} />, iconBg: 'icon-bg-orange', iconColor: 'icon-text-orange'
  },
  {
    id: 't3', category: 'Savings', description: 'Investment Transfer',
    amount: -500.00, time: '04:30 PM', date: 'Yesterday',
    icon: <DollarSign size={16} />, iconBg: 'icon-bg-emerald', iconColor: 'icon-text-emerald'
  },
];

function App() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('fl_seen'));

  const dismissOnboarding = () => {
    localStorage.setItem('fl_seen', '1');
    setShowOnboarding(false);
  };

  const totalSpent = categories.reduce((acc, cat) => acc + (cat.limit - cat.balance), 0);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  const handleSalaryChange = (newSalary) => {
    setMonthlySalary(newSalary);
    if (totalSpent === 0) {
      setTotalBalance(newSalary);
    }
  };

  const createCategory = () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: `Category ${categories.length + 1}`,
      description: 'New category description',
      limit: 0,
      balance: 0,
      color: 'cat-green',
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (categoryId, updates) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat;
      const updated = { ...cat, ...updates };
      // Apply the limit delta to balance so spent amount is preserved
      if (updates.limit !== undefined) {
        const delta = updates.limit - cat.limit;
        updated.balance = Math.max(0, cat.balance + delta);
      }
      return updated;
    }));
  };

  const handleSpend = (categoryId, amount) => {
    setTotalBalance(prev => prev - amount);
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, balance: Math.max(0, cat.balance - amount) } : cat
    ));
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      const newTransaction = {
        id: `t-${Date.now()}`,
        category: category.name,
        description: 'Quick Spend',
        amount: -amount,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        icon: category.name === 'Needs' ? <Home size={16} /> : category.name === 'Wants' ? <Smile size={16} /> : <DollarSign size={16} />,
        iconBg: category.name === 'Needs' ? 'icon-bg-blue' : category.name === 'Wants' ? 'icon-bg-orange' : 'icon-bg-emerald',
        iconColor: category.name === 'Needs' ? 'icon-text-blue' : category.name === 'Wants' ? 'icon-text-orange' : 'icon-text-emerald'
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  return (
    <div className="app">
      {showOnboarding && <Onboarding onDismiss={dismissOnboarding} />}
      <Header />

      <main className="app-main">
        <BalanceCard balance={totalBalance} salary={monthlySalary} spent={totalSpent} onBalanceChange={setTotalBalance} onSalaryChange={handleSalaryChange} />

        <CategoryCard categories={categories} onSpend={handleSpend} onUpdate={handleUpdateCategory} salarySet={monthlySalary > 0} />

        {/* Add Category Button */}
        <div className="add-category-wrapper">
          <button className="add-category-btn" onClick={createCategory}>
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {/* Recent Activity */}
        <section className="recent-activity-section">
          <div className="recent-activity-header">
            <h3 className="recent-activity-title">Recent Activity</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activity-groups">
            {transactions.length === 0 && (
              <p className="no-transactions">No transactions yet</p>
            )}
            {transactions.length !== 0 && ['Today', 'Yesterday'].map((date) => {
              const dateTransactions = transactions.filter(t => t.date === date);
              // if (dateTransactions.length === 0) return null;
              return (
                <div key={date}>
                  <p className="activity-date-label">{date}</p>
                  <div className="activity-group-list">
                    {dateTransactions.map(t => <TransactionItem key={t.id} transaction={t} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
