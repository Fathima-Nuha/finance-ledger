import './App.css';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import Onboarding from './components/Onboarding';
import { defaultCategories } from './data/categories';
import { Home, Smile, DollarSign, Plus } from 'lucide-react';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import CategoryCard from './components/CategoryCard';
import TransactionItem from './components/TransactionItem';
import { supabase } from './supabaseClient';



const USER_ID = 1;

function getTransactionDisplay(categoryName) {
  if (categoryName === 'Needs') return { icon: <Home size={16} />, iconBg: 'icon-bg-blue', iconColor: 'icon-text-blue' };
  if (categoryName === 'Wants') return { icon: <Smile size={16} />, iconBg: 'icon-bg-orange', iconColor: 'icon-text-orange' };
  return { icon: <DollarSign size={16} />, iconBg: 'icon-bg-emerald', iconColor: 'icon-text-emerald' };
}

function getRelativeDate(createdAt) {
  const txDate = new Date(createdAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (txDate.toDateString() === today.toDateString()) return 'Today';
  if (txDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return txDate.toLocaleDateString();
}

function ResetConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">Clear this month's data?</h3>
        <p className="modal-body">Your screenshot has been saved. This will delete all transactions and reset category balances.</p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn modal-btn-ok" onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('fl_seen'));
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);

  const totalSpent = categories.reduce((acc, cat) => acc + (cat.limit - cat.balance), 0);

  useEffect(() => {
    async function loadData() {
      const [{ data: user }, { data: cats }, { data: txs }] = await Promise.all([
        supabase.from('users').select('salary').eq('id', USER_ID).maybeSingle(),
        supabase.from('categories').select('*').eq('user_id', USER_ID).order('created_at'),
        supabase.from('transactions').select('*, categories(name)').order('created_at', { ascending: false }),
      ]);

      console.log("user",user);
      console.log("cats", cats);
      console.log("txs", txs);
      
      if (cats && cats.length > 0) {
        setCategories(cats.map(c => ({ ...c, color: 'cat-green' })));
      } else {
        const seed = { user_id: USER_ID, name: defaultCategories[0].name, description: defaultCategories[0].description, limit: 0, balance: 0 };
        const { data: inserted } = await supabase.from('categories').insert(seed).select().single();
        if (inserted) setCategories([{ ...inserted, color: 'cat-green' }]);
      }
      if (user) {
        setMonthlySalary(user.salary);
        const spent = (cats ?? []).reduce((acc, c) => acc + (c.limit - c.balance), 0);
        setTotalBalance(user.salary - spent);
      }
      if (txs) {
        setTransactions(txs.map(tx => ({
          ...tx,
          category: tx.categories?.name ?? '',
          time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: getRelativeDate(tx.created_at),
          ...getTransactionDisplay(tx.categories?.name ?? ''),
        })));
      }
    }
    loadData();
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('fl_seen', '1');
    setShowOnboarding(false);
  };

  const handleSalaryChange = async (newSalary) => {
    setMonthlySalary(newSalary);
    if (totalSpent === 0) setTotalBalance(newSalary);
    await supabase.from('users').update({ salary: newSalary }).eq('id', USER_ID);
  };

  const createCategory = async () => {
    const newCategory = {
      user_id: USER_ID,
      name: `Category ${categories.length + 1}`,
      description: 'New category description',
      limit: 0,
      balance: 0,
    };
    const { data } = await supabase.from('categories').insert(newCategory).select().single();
    if (data) setCategories(prev => [...prev, { ...data, color: 'cat-green' }]);
  };

  const handleUpdateCategory = async (categoryId, updates) => {
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

    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    const dbUpdates = { ...updates };
    if (updates.limit !== undefined) {
      const delta = updates.limit - category.limit;
      dbUpdates.balance = Math.max(0, category.balance + delta);
    }
    await supabase.from('categories').update(dbUpdates).eq('id', categoryId);
  };

  const handleSpend = async (categoryId, amount) => {
    const category = categories.find(c => c.id === categoryId);
    const newBalance = category ? category.balance - amount : 0;
    setTotalBalance(prev => prev - amount);
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, balance: newBalance } : cat
    ));

    const { data: tx } = await supabase
      .from('transactions')
      .insert({ category_id: categoryId, amount: -amount, description: 'Quick Spend' })
      .select('*, categories(name)')
      .single();

    await supabase.from('categories').update({ balance: newBalance }).eq('id', categoryId);

    if (tx) {
      setTransactions(prev => [{
        ...tx,
        category: tx.categories?.name ?? (category?.name ?? ''),
        time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        ...getTransactionDisplay(tx.categories?.name ?? (category?.name ?? '')),
      }, ...prev]);
    }
  };

  const handleMonthlyReset = async () => {
    // 1. Screenshot immediately on button press
    const canvas = await html2canvas(document.body, { useCORS: true });
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const fileName = `finance-ledger-${month}.png`;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');

    // 2. Show custom modal asking to clear data
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    setShowResetModal(false);

    // Delete all transactions for this user's categories
    const categoryIds = categories.map(c => c.id);
    if (categoryIds.length > 0) {
      await supabase.from('transactions').delete().in('category_id', categoryIds);
    }

    // Reset each category balance back to its limit
    await Promise.all(
      categories.map(c =>
        supabase.from('categories').update({ balance: c.limit }).eq('id', c.id)
      )
    );

    // Update local state
    setTransactions([]);
    setCategories(prev => prev.map(c => ({ ...c, balance: c.limit })));
    setTotalBalance(monthlySalary);
  };

  return (
    <div className="app">
      {showOnboarding && <Onboarding onDismiss={dismissOnboarding} />}
      {showResetModal && <ResetConfirmModal onConfirm={confirmReset} onCancel={() => setShowResetModal(false)} />}
      <Header onReset={handleMonthlyReset} />

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
            {transactions.length !== 0 && [...new Set(transactions.map(t => t.date))].map((date) => {
              const dateTransactions = transactions.filter(t => t.date === date);
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
