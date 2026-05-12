import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, Leaf, Beef } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Starter', 'Main Course', 'Dessert', 'Beverage'];

const emptyItem = { name: '', price: '', category: 'Main Course', isVeg: false, description: '', imageUrl: '' };

export default function MenuCMSPanel({ menu = [], onSave, saving }) {
  const [items, setItems] = useState(menu.map((m, i) => ({ ...m, _key: m._id || String(i) })));
  const [editingKey, setEditingKey] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [newItem, setNewItem] = useState({ ...emptyItem });
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...CATEGORIES];
  const visible = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);

  const startEdit = (item) => {
    setEditingKey(item._key);
    setEditDraft({ ...item });
  };

  const saveEdit = () => {
    if (!editDraft.name.trim()) return toast.error('Item name is required');
    if (!editDraft.price || Number(editDraft.price) < 0) return toast.error('Valid price required');
    setItems((prev) => prev.map((i) => (i._key === editingKey ? { ...editDraft } : i)));
    setEditingKey(null);
    setEditDraft(null);
  };

  const cancelEdit = () => { setEditingKey(null); setEditDraft(null); };

  const deleteItem = (key) => {
    setItems((prev) => prev.filter((i) => i._key !== key));
  };

  const addItem = () => {
    if (!newItem.name.trim()) return toast.error('Item name is required');
    if (!newItem.price || Number(newItem.price) < 0) return toast.error('Valid price required');
    const key = Date.now().toString();
    setItems((prev) => [...prev, { ...newItem, price: Number(newItem.price), _key: key }]);
    setNewItem({ ...emptyItem });
    setShowAddForm(false);
    toast.success('Item added — save menu to apply');
  };

  const handleSave = () => {
    const clean = items.map(({ _key, ...rest }) => ({ ...rest, price: Number(rest.price) }));
    onSave(clean);
  };

  const VegBadge = ({ isVeg }) => (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isVeg ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'}`}>
      {isVeg ? <Leaf className="h-2.5 w-2.5" /> : <Beef className="h-2.5 w-2.5" />}
      {isVeg ? 'Veg' : 'Non-veg'}
    </span>
  );

  return (
    <div>
      {/* Category filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${activeCategory === c ? 'text-[#0F1115]' : 'text-[rgb(var(--faint))] hover:text-[rgb(var(--text))]'}`}
            style={activeCategory === c ? { background: 'rgb(255,181,71)' } : { background: 'rgba(var(--surface),0.6)', border: '1px solid rgba(var(--line),0.1)' }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {visible.length === 0 && (
          <div className="rounded-2xl py-10 text-center text-sm" style={{ color: 'rgb(var(--faint))', background: 'rgba(var(--surface),0.4)' }}>
            No items in this category yet.
          </div>
        )}
        {visible.map((item) => (
          <div
            key={item._key}
            className="surface-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
          >
            {editingKey === item._key && editDraft ? (
              /* Inline edit form */
              <div className="flex w-full flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="col-span-2">
                    <label className="label">Name *</label>
                    <input className="input" value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} placeholder="Dish name" />
                  </div>
                  <div>
                    <label className="label">Price (₹) *</label>
                    <input className="input" type="number" min="0" value={editDraft.price} onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={editDraft.category} onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="label">Description</label>
                    <input className="input" value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} placeholder="Short description..." />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Image URL</label>
                    <input className="input" value={editDraft.imageUrl} onChange={(e) => setEditDraft({ ...editDraft, imageUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-bold" style={{ color: 'rgb(var(--text))' }}>
                    <div
                      onClick={() => setEditDraft({ ...editDraft, isVeg: !editDraft.isVeg })}
                      className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${editDraft.isVeg ? 'bg-emerald-500' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${editDraft.isVeg ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    {editDraft.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
                  </label>
                  <div className="ml-auto flex gap-2">
                    <button type="button" onClick={cancelEdit} className="btn-secondary px-3 py-1.5 text-xs"><X className="h-3.5 w-3.5" />Cancel</button>
                    <button type="button" onClick={saveEdit} className="btn-primary px-3 py-1.5 text-xs"><Check className="h-3.5 w-3.5" />Save</button>
                  </div>
                </div>
              </div>
            ) : (
              /* Read view */
              <>
                <div className="flex flex-1 items-start gap-3">
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-12 w-12 flex-shrink-0 rounded-xl object-cover" onError={(e) => e.target.style.display = 'none'} />}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black" style={{ color: 'rgb(var(--text))' }}>{item.name}</span>
                      <VegBadge isVeg={item.isVeg} />
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(var(--surface-raised),0.7)', color: 'rgb(var(--faint))' }}>{item.category}</span>
                    </div>
                    {item.description && <p className="mt-0.5 truncate text-xs" style={{ color: 'rgb(var(--faint))' }}>{item.description}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-black" style={{ color: 'rgb(var(--accent))' }}>₹{Number(item.price).toLocaleString()}</span>
                  <button type="button" onClick={() => startEdit(item)} className="icon-btn h-8 w-8" aria-label="Edit item"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => deleteItem(item._key)} className="icon-btn h-8 w-8" style={{ color: '#f87171' }} aria-label="Delete item"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new item */}
      {showAddForm ? (
        <div className="mt-4 surface-muted p-4">
          <h4 className="mb-3 font-black" style={{ color: 'rgb(var(--text))' }}>New menu item</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input className="input" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Paneer Tikka" />
            </div>
            <div>
              <label className="label">Price (₹) *</label>
              <input className="input" type="number" min="0" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <input className="input" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Short description..." />
            </div>
            <div className="col-span-2">
              <label className="label">Image URL</label>
              <input className="input" value={newItem.imageUrl} onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold" style={{ color: 'rgb(var(--text))' }}>
              <div onClick={() => setNewItem({ ...newItem, isVeg: !newItem.isVeg })} className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${newItem.isVeg ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${newItem.isVeg ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              {newItem.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
            </label>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary px-3 py-1.5 text-xs"><X className="h-3.5 w-3.5" />Cancel</button>
              <button type="button" onClick={addItem} className="btn-primary px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" />Add</button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowAddForm(true)} className="btn-secondary mt-4 w-full">
          <Plus className="h-4 w-4" />Add menu item
        </button>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-primary-3d mt-6 w-full"
      >
        {saving ? 'Saving menu...' : `Save menu (${items.length} items)`}
      </button>
    </div>
  );
}
