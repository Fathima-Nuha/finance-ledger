import './Login.css';
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Phone } from 'lucide-react';

function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleaned = phone.trim();
    if (!cleaned) { setError('Please enter your phone number.'); return; }

    setLoading(true);
    setError('');

    // Look up existing user by phone
    const { data: existing, error: fetchErr } = await supabase
      .from('users')
      .select('id')
      .eq('phone_no', cleaned)
      .maybeSingle();

    if (fetchErr) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    if (existing) {
      onLogin(existing.id);
    } else {
      // First time — create user row
      const { data: created, error: insertErr } = await supabase
        .from('users')
        .insert({ phone_no: cleaned, salary: 0 })
        .select('id')
        .single();

      if (insertErr || !created) {
        setError('Could not create account. Please try again.');
        setLoading(false);
        return;
      }
      onLogin(created.id);
    }

    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon-wrap">
          <Phone size={28} strokeWidth={2} />
        </div>
        <h1 className="login-title">Finance Ledger</h1>
        <p className="login-subtitle">Enter your phone number to continue</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 234 567 8900"
            className="login-input"
            autoFocus
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Loading…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
