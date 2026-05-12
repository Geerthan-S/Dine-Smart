import { useState } from 'react';
import { Plus, Trash2, Zap, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const DAY_PATTERNS = [
  { value: 'everyday', label: 'Every day' },
  { value: 'weekday', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekend', label: 'Weekends (Sat–Sun)' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const emptyRule = { label: '', dayPattern: 'weekday', timeStart: '12:00', timeEnd: '15:00', type: 'discount', percent: 15, active: true };

export default function DynamicPricingPanel({ rules = [], basePrice = 0, onSave, saving }) {
  const [items, setItems] = useState(rules.map((r, i) => ({ ...r, _key: r._id || String(i) })));
  const [draft, setDraft] = useState({ ...emptyRule });
  const [showForm, setShowForm] = useState(false);

  const addRule = () => {
    if (!draft.label.trim()) return toast.error('Rule label is required');
    setItems((prev) => [...prev, { ...draft, percent: Number(draft.percent), _key: Date.now().toString() }]);
    setDraft({ ...emptyRule });
    setShowForm(false);
    toast.success('Rule added — save to apply');
  };

  const removeRule = (key) => setItems((prev) => prev.filter((r) => r._key !== key));

  const toggleActive = (key) => setItems((prev) => prev.map((r) => r._key === key ? { ...r, active: !r.active } : r));

  const handleSave = () => {
    const clean = items.map(({ _key, ...rest }) => rest);
    onSave(clean);
  };

  const previewPrice = (rule) => {
    if (!basePrice) return null;
    const adjusted = rule.type === 'discount'
      ? basePrice * (1 - rule.percent / 100)
      : basePrice * (1 + rule.percent / 100);
    return Math.round(adjusted);
  };

  return (
    <div>
      {/* Existing rules */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl py-10 text-center text-sm" style={{ color: 'rgb(var(--faint))', background: 'rgba(var(--surface),0.4)' }}>
            No pricing rules yet. Add one to offer discounts or apply surcharges.
          </div>
        )}
        {items.map((rule) => (
          <div
            key={rule._key}
            className="surface-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ opacity: rule.active ? 1 : 0.5 }}
          >
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl ${rule.type === 'discount' ? 'bg-emerald-500/12 text-emerald-300' : 'bg-amber-500/12 text-amber-300'}`}>
                {rule.type === 'discount' ? <TrendingDown className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              </span>
              <div>
                <p className="font-black" style={{ color: 'rgb(var(--text))' }}>{rule.label}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                  {DAY_PATTERNS.find((d) => d.value === rule.dayPattern)?.label} · {rule.timeStart}–{rule.timeEnd}
                </p>
                {basePrice > 0 && (
                  <p className="mt-1 text-xs font-bold" style={{ color: rule.type === 'discount' ? '#6ee7b7' : 'rgb(var(--accent))' }}>
                    {rule.type === 'discount' ? `-${rule.percent}% → ₹${previewPrice(rule)}` : `+${rule.percent}% → ₹${previewPrice(rule)}`}
                    <span style={{ color: 'rgb(var(--faint))' }}> (base: ₹{basePrice})</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleActive(rule._key)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${rule.active ? 'bg-emerald-500/12 text-emerald-300' : 'text-slate-500'}`}
                style={rule.active ? {} : { background: 'rgba(var(--surface-raised),0.5)' }}
              >
                {rule.active ? 'Active' : 'Disabled'}
              </button>
              <button type="button" onClick={() => removeRule(rule._key)} className="icon-btn h-8 w-8" style={{ color: '#f87171' }}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add rule form */}
      {showForm ? (
        <div className="mt-4 surface-muted p-4">
          <h4 className="mb-3 font-black" style={{ color: 'rgb(var(--text))' }}>New pricing rule</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Rule name *</label>
              <input className="input" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder='e.g. "Lunch discount", "Weekend surcharge"' />
            </div>
            <div>
              <label className="label">Day pattern</label>
              <select className="input" value={draft.dayPattern} onChange={(e) => setDraft({ ...draft, dayPattern: e.target.value })}>
                {DAY_PATTERNS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                <option value="discount">Discount (reduce price)</option>
                <option value="surcharge">Surcharge (increase price)</option>
              </select>
            </div>
            <div>
              <label className="label">Start time</label>
              <input className="input" type="time" value={draft.timeStart} onChange={(e) => setDraft({ ...draft, timeStart: e.target.value })} />
            </div>
            <div>
              <label className="label">End time</label>
              <input className="input" type="time" value={draft.timeEnd} onChange={(e) => setDraft({ ...draft, timeEnd: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Percentage ({draft.percent}%)</label>
              <input className="input" type="range" min="1" max="60" value={draft.percent} onChange={(e) => setDraft({ ...draft, percent: Number(e.target.value) })} />
              {basePrice > 0 && (
                <p className="mt-1 text-xs" style={{ color: 'rgb(var(--faint))' }}>
                  Preview: ₹{basePrice} → <b style={{ color: draft.type === 'discount' ? '#6ee7b7' : 'rgb(var(--accent))' }}>₹{Math.round(basePrice * (1 + (draft.type === 'discount' ? -draft.percent : draft.percent) / 100))}</b>
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="button" onClick={addRule} className="btn-primary flex-1"><Plus className="h-4 w-4" />Add rule</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowForm(true)} className="btn-secondary mt-4 w-full">
          <Plus className="h-4 w-4" />Add pricing rule
        </button>
      )}

      <button type="button" onClick={handleSave} disabled={saving} className="btn-primary-3d mt-6 w-full">
        {saving ? 'Saving...' : `Save pricing rules (${items.length})`}
      </button>
    </div>
  );
}
