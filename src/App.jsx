import './App.css';
import { useState, useEffect, useRef } from 'react';
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

function NewMonthCountdownModal({ countdown }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box new-month-alert-box">
        <h3 className="modal-title new-month-alert-title">It's a New Month!</h3>
        <p className="modal-body">
          Your previous month's data is being saved to your files and will be cleared automatically.
        </p>
        <div className="countdown-ring">
          <span className="countdown-number">{countdown}</span>
        </div>
      </div>
    </div>
  );
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
  const [showNewMonthAlert, setShowNewMonthAlert] = useState(false);
  const [newMonthCountdown, setNewMonthCountdown] = useState(10);
  const [screenshotError, setScreenshotError] = useState(false);
  const pendingClearRef = useRef(null);
  const autoResetFired = useRef(false);
  const triggerTime = useRef((() => { const t = new Date(); t.setMinutes(t.getMinutes() + 2); return t; })());

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
      
      // Auto-clear if any transaction belongs to a previous month
      const now = new Date();
      const hasPreviousMonthData = (txs ?? []).length > 0 && (txs ?? []).some(tx => {
        const d = new Date(tx.created_at);
        return d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth();
      });

      if (hasPreviousMonthData) {
        // Load old data into state so user can see it during the countdown
        setCategories((cats ?? []).map(c => ({ ...c, color: 'cat-green' })));
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
        pendingClearRef.current = { cats: cats ?? [], user };
        setNewMonthCountdown(10);
        setShowNewMonthAlert(true);
        return;
      }

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

  // New-month countdown: tick every second, execute clear at 0
  useEffect(() => {
    if (!showNewMonthAlert) return;
    if (newMonthCountdown === 0) {
      const { cats, user } = pendingClearRef.current ?? { cats: [], user: null };
      (async () => {
        // Screenshot — must succeed before any data is touched
        let downloadTriggered = false;
        try {
          const canvas = await html2canvas(document.body, { useCORS: true });
          const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
          await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (!blob) { reject(new Error('Blob creation failed')); return; }
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `finance-ledger-${month}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              resolve();
            }, 'image/png');
          });
          downloadTriggered = true;
        } catch {
          // Screenshot failed — abort clear, show error
          setScreenshotError(true);
          setShowNewMonthAlert(false);
          return;
        }
        if (!downloadTriggered) return;
        // Clear DB only after download is confirmed triggered
        const catIds = cats.map(c => c.id);
        if (catIds.length > 0) {
          await supabase.from('transactions').delete().in('category_id', catIds);
        }
        await Promise.all(
          cats.map(c => supabase.from('categories').update({ balance: c.limit }).eq('id', c.id))
        );
        // Reset state
        setTransactions([]);
        setCategories(cats.map(c => ({ ...c, balance: c.limit, color: 'cat-green' })));
        if (user) {
          setMonthlySalary(user.salary);
          setTotalBalance(user.salary);
        }
        setShowNewMonthAlert(false);
      })();
      return;
    }
    const timer = setTimeout(() => setNewMonthCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewMonthAlert, newMonthCountdown]);

  // AUTO-RESET TEST: triggers today (April 1) at 17:22 — revert after testing
  useEffect(() => {
    if (autoResetFired.current || categories.length === 0) return;
    const today = new Date();
    const isTestDay = today.getDate() === 1 && (today.getMonth() + 1) === 4;
    const isTestTime = today.getHours() === 17 && today.getMinutes() >= 30;
    const currentMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
    const lastReset = localStorage.getItem('fl_last_auto_reset');
    if (isTestDay && isTestTime && lastReset !== currentMonth) {
      autoResetFired.current = true;
      handleMonthlyReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

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
    // 1. Capture and directly download to Downloads folder
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

    // Save this month so auto-reset doesn't fire again
    const today = new Date();
    localStorage.setItem('fl_last_auto_reset', `${today.getFullYear()}-${today.getMonth() + 1}`);

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
      {showNewMonthAlert && <NewMonthCountdownModal countdown={newMonthCountdown} />}
      {screenshotError && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title" style={{ color: '#ef4444' }}>Screenshot Failed</h3>
            <p className="modal-body">Your data could not be saved as an image. Your previous month's data has <strong>not</strong> been cleared. Please take a manual screenshot before resetting.</p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-ok" onClick={() => setScreenshotError(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
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
