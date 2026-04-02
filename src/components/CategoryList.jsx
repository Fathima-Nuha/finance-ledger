import './CategoryList.css';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

function EditableField({ value, onSave, className, type = 'text', prefix = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const start = () => { setDraft(value.toString()); setEditing(true); };
  const confirm = () => { onSave(draft); setEditing(false); };
  const cancel = () => setEditing(false);
  const onKey = (e) => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel(); };

  if (editing) {
    return (
      <div className="editable-input-wrapper">
        {prefix && <span className="editable-prefix">{prefix}</span>}
        <input
          autoFocus
          type={type}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={confirm}
          onKeyDown={onKey}
          className={`editable-input ${className}`}
        />
      </div>
    );
  }

  return (
    <span className={`editable-field ${className}`} onClick={start}>
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
      <Pencil size={10} className="editable-pencil" />
    </span>
  );
}

function CategoryRow({ category, onSpend, onUpdate, onDelete, salarySet }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    const amount = parseFloat(inputValue);
    if (!isNaN(amount) && amount > 0) {
      onSpend(category.id, amount);
      setInputValue('');
    }
  };

  return (
    <div className="category-row-wrapper">
      <div className="category-row">
        <div className="category-name-group">
          <EditableField
            value={category.name}
            onSave={v => onUpdate(category.id, { name: v })}
            className="editable-name"
          />
          <EditableField
            value={category.description}
            onSave={v => onUpdate(category.id, { description: v })}
            className="editable-description"
          />
        </div>
        <div className="category-stat">
          <p className="category-stat-label">Limit</p>
          <EditableField
            value={category.limit}
            onSave={v => { const n = parseFloat(v); if (!isNaN(n)) onUpdate(category.id, { limit: n }); }}
            className="editable-limit"
            type="number"
            prefix="$"
          />
        </div>
        <div className="category-stat">
          <p className="category-stat-label">Bal</p>
          <EditableField
            value={category.balance}
            onSave={v => { const n = parseFloat(v); if (!isNaN(n)) onUpdate(category.id, { balance: n }); }}
            className={`editable-balance ${category.color}`}
            type="number"
            prefix="$"
          />
        </div>
        <div className="category-spend-group">
          <div className="spend-input-wrapper">
            <span className="spend-currency-prefix">$</span>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={salarySet ? '0.00' : 'Set salary first'}
              className="spend-input"
              disabled={!salarySet}
            />
          </div>
          <button onClick={handleSubmit} className="spend-submit-btn" disabled={!salarySet} title={salarySet ? '' : 'Set your salary first'}>
            Submit
          </button>
        </div>
      </div>
      <button className="category-delete-btn" onClick={() => onDelete(category.id)} title="Delete category">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function CategoryList({ categories = [], onSpend, onUpdate, onDelete, salarySet }) {
  return (
    <>
      {categories.map((cat) => (
        <CategoryRow key={cat.id} category={cat} onSpend={onSpend} onUpdate={onUpdate} onDelete={onDelete} salarySet={salarySet} />
      ))}
    </>
  );
}

export default CategoryList;