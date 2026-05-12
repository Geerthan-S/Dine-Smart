import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, Building2, CalendarClock, Edit3, Plus, Shield, Star, Table2, Trash2, UserCog, Users, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const PRICE_RANGES = ['budget', 'mid-range', 'premium', 'luxury'];

export default function AdminPanel() {
  const [tab, setTab] = useState('restaurants');
  const [rForm, setRForm] = useState({ name: '', location: '', cuisine: '', priceRange: 'mid-range', description: '', rating: 4 });
  const [rLoading, setRLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [rListLoading, setRListLoading] = useState(true);
  const [tForm, setTForm] = useState({ restaurantId: '', tableNumber: '', capacity: 4 });
  const [tLoading, setTLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bLoading, setBLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [adminAction, setAdminAction] = useState(null);
  // Owners tab state
  const [users, setUsers] = useState([]);
  const [uLoading, setULoading] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', restaurantId: '' });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => { fetchRestaurants(); fetchBookings(); fetchAnalytics(); }, []);

  const fetchRestaurants = async () => {
    setRListLoading(true);
    try { const { data } = await api.get('/restaurants'); setRestaurants(data); }
    catch (e) { console.error(e); }
    finally { setRListLoading(false); }
  };

  const fetchBookings = async () => {
    setBLoading(true);
    try { const { data } = await api.get('/bookings/all'); setBookings(data); }
    catch (e) { console.error(e); }
    finally { setBLoading(false); }
  };

  const fetchAnalytics = async () => {
    try { const { data } = await api.get('/restaurants/admin/analytics'); setAnalytics(data); }
    catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    setULoading(true);
    try { const { data } = await api.get('/owner/users'); setUsers(data); }
    catch (e) { console.error(e); }
    finally { setULoading(false); }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    if (!rForm.name || !rForm.location || !rForm.cuisine) {
      toast.error('Name, location, and cuisine are required');
      return;
    }
    setRLoading(true);
    try {
      await api.post('/restaurants', rForm);
      toast.success('Restaurant added successfully');
      setRForm({ name: '', location: '', cuisine: '', priceRange: 'mid-range', description: '', rating: 4 });
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add restaurant');
    } finally {
      setRLoading(false);
    }
  };

  const handleDeleteRestaurant = async (id) => {
    try {
      await api.delete(`/restaurants/${id}`);
      toast.success('Restaurant deleted');
      setRestaurants((prev) => prev.filter((r) => r._id !== id));
      setAdminAction(null);
    } catch {
      toast.error('Delete failed');
    }
  };

  const patchRestaurant = async (id, patch) => {
    try {
      const { data } = await api.patch(`/restaurants/${id}`, patch);
      setRestaurants((prev) => prev.map((item) => (item._id === id ? data : item)));
      toast.success('Restaurant updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!tForm.restaurantId || !tForm.tableNumber) {
      toast.error('Restaurant and table number required');
      return;
    }
    setTLoading(true);
    try {
      await api.post('/tables', tForm);
      toast.success('Table added');
      setTForm({ restaurantId: '', tableNumber: '', capacity: 4 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add table');
    } finally {
      setTLoading(false);
    }
  };

  const tabs = [
    ['analytics', 'Analytics', BarChart3],
    ['restaurants', 'Restaurants', Building2],
    ['tables', 'Tables', Table2],
    ['bookings', 'Bookings', CalendarClock],
    ['owners', 'Owners', UserCog],
  ];

  const handleTabChange = (id) => {
    setTab(id);
    if (id === 'owners' && users.length === 0) fetchUsers();
  };

  const openAdminAction = (type, restaurant) => {
    setAdminAction({
      type,
      restaurant,
      image: restaurant.image || '',
      menuName: '',
      menuPrice: '300',
    });
  };

  const submitAdminAction = async (event) => {
    event.preventDefault();
    if (!adminAction?.restaurant) return;
    const restaurant = adminAction.restaurant;

    if (adminAction.type === 'delete') {
      await handleDeleteRestaurant(restaurant._id);
      return;
    }

    if (adminAction.type === 'image') {
      await patchRestaurant(restaurant._id, { image: adminAction.image });
      setAdminAction(null);
      return;
    }

    if (adminAction.type === 'menu') {
      if (!adminAction.menuName.trim()) {
        toast.error('Menu item name is required');
        return;
      }
      const menu = [
        ...(restaurant.menu || []),
        { name: adminAction.menuName.trim(), price: Number(adminAction.menuPrice || 0), category: 'Main Course', isVeg: false },
      ];
      await patchRestaurant(restaurant._id, { menu });
      setAdminAction(null);
    }
  };

  return (
    <div className="page-shell">
      <div className="mb-8">
        <span className="eyebrow mb-4"><Shield className="h-4 w-4" />Admin workspace</span>
        <h1 className="gradient-title text-4xl font-black sm:text-5xl">Operations panel</h1>
        <p className="mt-3 text-slate-400">Manage restaurants, tables, and reservation visibility from a calmer command surface.</p>
      </div>

      <div className="mb-8">
        <div className="segmented">
          {tabs.map(([id, label, Icon]) => (
            <button key={id} onClick={() => handleTabChange(id)} className={`segmented-btn ${tab === id ? 'segmented-btn-active' : ''}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'analytics' && (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Restaurants', analytics?.restaurantCount || 0],
              ['Bookings', analytics?.bookingCount || 0],
              ['Confirmed', analytics?.confirmedCount || 0],
              ['Users', analytics?.userCount || 0],
              ['Revenue proxy', `Rs. ${analytics?.revenueProxy || 0}`],
            ].map(([label, value]) => (
              <div key={label} className="card">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 className="mb-4 text-xl font-black text-white">Top booked restaurants</h2>
            <div className="space-y-3">
              {(analytics?.topRestaurants || []).map((item) => (
                <div key={item._id} className="surface-muted flex justify-between p-4">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="text-[rgb(var(--accent))]">{item.bookings} bookings</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'restaurants' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card hover-lift">
            <h2 className="mb-5 text-xl font-black text-white">Add restaurant</h2>
            <form onSubmit={handleAddRestaurant} className="space-y-4">
              <div>
                <label className="label">Restaurant Name *</label>
                <input className="input" placeholder="e.g. Spice Garden" value={rForm.name} onChange={(e) => setRForm({ ...rForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Location *</label>
                <input className="input" placeholder="e.g. Chennai, Tamil Nadu" value={rForm.location} onChange={(e) => setRForm({ ...rForm, location: e.target.value })} />
              </div>
              <div>
                <label className="label">Cuisine *</label>
                <input className="input" placeholder="e.g. South Indian, Italian" value={rForm.cuisine} onChange={(e) => setRForm({ ...rForm, cuisine: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Price Range</label>
                  <select className="input" value={rForm.priceRange} onChange={(e) => setRForm({ ...rForm, priceRange: e.target.value })}>
                    {PRICE_RANGES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Rating (1-5)</label>
                  <input className="input" type="number" min="1" max="5" step="0.1" value={rForm.rating} onChange={(e) => setRForm({ ...rForm, rating: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} placeholder="Short description..." value={rForm.description} onChange={(e) => setRForm({ ...rForm, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" placeholder="https://..." value={rForm.image || ''} onChange={(e) => setRForm({ ...rForm, image: e.target.value })} />
              </div>
              <button id="add-restaurant-btn" type="submit" disabled={rLoading} className="btn-primary w-full">
                {rLoading ? <LoadingSpinner size="sm" /> : <><Plus className="h-4 w-4" />Add Restaurant</>}
              </button>
            </form>
          </div>

          <div>
            <h2 className="mb-5 text-xl font-black text-white">All restaurants ({restaurants.length})</h2>
            {rListLoading ? (
              <div className="flex justify-center py-10"><LoadingSpinner /></div>
            ) : (
              <div className="scroll-fade max-h-[640px] space-y-3 overflow-y-auto pr-1">
                {restaurants.map((r) => (
                  <div key={r._id} className="surface-muted flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-white">{r.name}</p>
                      <p className="text-sm text-slate-500">{r.location} - {Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine} - {r.priceRange}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => patchRestaurant(r._id, { featured: !r.featured })} className="btn-secondary px-4">
                        <Star className="h-4 w-4" />{r.featured ? 'Featured' : 'Feature'}
                      </button>
                      <button onClick={() => patchRestaurant(r._id, { trending: !r.trending })} className="btn-secondary px-4">
                        <Edit3 className="h-4 w-4" />{r.trending ? 'Trending' : 'Trend'}
                      </button>
                      <button onClick={() => openAdminAction('image', r)} className="btn-secondary px-4">Image</button>
                      <button onClick={() => openAdminAction('menu', r)} className="btn-secondary px-4">Menu</button>
                      <button onClick={() => openAdminAction('delete', r)} className="btn-danger shrink-0 px-4">
                        <Trash2 className="h-4 w-4" />Delete
                      </button>
                    </div>
                  </div>
                ))}
                {restaurants.length === 0 && <p className="py-10 text-center text-slate-500">No restaurants yet. Add one to begin.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'tables' && (
        <div className="max-w-xl">
          <div className="card hover-lift">
            <h2 className="mb-5 text-xl font-black text-white">Add table</h2>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="label">Restaurant</label>
                <select className="input" value={tForm.restaurantId} onChange={(e) => setTForm({ ...tForm, restaurantId: e.target.value })}>
                  <option value="">Select restaurant...</option>
                  {restaurants.map((r) => <option key={r._id} value={r._id}>{r.name} - {r.location}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Table Number</label>
                  <input className="input" type="number" min="1" placeholder="e.g. 1" value={tForm.tableNumber} onChange={(e) => setTForm({ ...tForm, tableNumber: e.target.value })} />
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input className="input" type="number" min="1" max="20" value={tForm.capacity} onChange={(e) => setTForm({ ...tForm, capacity: e.target.value })} />
                </div>
              </div>
              <button id="add-table-btn" type="submit" disabled={tLoading} className="btn-primary w-full">
                {tLoading ? <LoadingSpinner size="sm" /> : <><Plus className="h-4 w-4" />Add Table</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          <h2 className="mb-5 text-xl font-black text-white">All bookings ({bookings.length})</h2>
          {bLoading ? (
            <div className="flex justify-center py-10"><LoadingSpinner text="Loading bookings..." /></div>
          ) : bookings.length === 0 ? (
            <div className="card py-12 text-center text-slate-500">No bookings yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Restaurant</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>People</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <p className="font-bold text-white">{b.userId?.name}</p>
                        <p className="text-xs text-slate-500">{b.userId?.email}</p>
                      </td>
                      <td className="text-slate-300">{b.restaurantId?.name}</td>
                      <td className="text-slate-300">{b.date}</td>
                      <td className="text-slate-300">{b.time}</td>
                      <td className="text-slate-300">{b.numberOfPeople}</td>
                      <td>
                        <span className={`badge text-xs ${
                          b.status === 'confirmed' ? 'bg-emerald-500/12 text-emerald-200'
                          : b.status === 'cancelled' ? 'bg-red-500/12 text-red-200'
                          : 'bg-sky-500/12 text-sky-200'
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'owners' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* Assign owner form */}
          <div className="card hover-lift">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: 'rgba(var(--accent),0.12)', color: 'rgb(var(--accent))' }}>
                <UserCog className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-white">Assign restaurant owner</h2>
                <p className="mt-0.5 text-xs text-slate-500">Grant a user the owner role and link them to a restaurant.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Select user *</label>
                <select
                  className="input"
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.email} [{u.role}]
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Select restaurant *</label>
                <select
                  className="input"
                  value={assignForm.restaurantId}
                  onChange={(e) => setAssignForm({ ...assignForm, restaurantId: e.target.value })}
                >
                  <option value="">Choose a restaurant...</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>{r.name} — {r.area || r.location}</option>
                  ))}
                </select>
              </div>
              <button
                id="assign-owner-btn"
                type="button"
                disabled={assigning || !assignForm.userId || !assignForm.restaurantId}
                className="btn-primary-3d w-full"
                onClick={async () => {
                  setAssigning(true);
                  try {
                    await api.post('/owner/assign', assignForm);
                    toast.success('Owner assigned successfully!');
                    setAssignForm({ userId: '', restaurantId: '' });
                    fetchUsers();
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Assignment failed');
                  } finally {
                    setAssigning(false);
                  }
                }}
              >
                <UserCog className="h-4 w-4" />
                {assigning ? 'Assigning...' : 'Assign as Owner'}
              </button>
            </div>
          </div>

          {/* All users list */}
          <div>
            <h2 className="mb-4 text-xl font-black text-white">
              User Management ({users.length})
            </h2>
            {uLoading ? (
              <div className="flex justify-center py-10"><LoadingSpinner /></div>
            ) : (
              <div className="scroll-fade max-h-[540px] space-y-3 overflow-y-auto pr-1">
                {users.map((u) => (
                  <div key={u._id} className="surface-muted flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(var(--accent),0.10)', color: 'rgb(var(--accent))' }}>
                        <Users className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-black text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${u.role === 'admin' ? 'bg-rose-500/12 text-rose-300' : u.role === 'owner' ? 'bg-amber-500/12 text-amber-300' : 'bg-slate-500/12 text-slate-300'}`}>
                            {u.role}
                          </span>
                          {(u.ownedRestaurants || []).length > 0 && (
                            <span className="rounded-full bg-sky-500/12 px-2 py-0.5 text-[10px] font-black text-sky-300">
                              {u.ownedRestaurants.length} restaurant{u.ownedRestaurants.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className="input !h-8 !py-1 !text-xs"
                        value={u.role}
                        onChange={async (e) => {
                          const newRole = e.target.value;
                          try {
                            await api.patch(`/owner/users/${u._id}/role`, { role: newRole });
                            toast.success(`Role changed to ${newRole}`);
                            fetchUsers();
                          } catch (err) {
                            toast.error('Failed to update role');
                          }
                        }}
                      >
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        type="button"
                        className="icon-btn h-8 w-8 text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10"
                        onClick={async () => {
                          if (!window.confirm(`Are you sure you want to delete ${u.name}?`)) return;
                          try {
                            await api.delete(`/owner/users/${u._id}`);
                            toast.success('User deleted');
                            fetchUsers();
                          } catch (err) {
                            toast.error('Failed to delete user');
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {(u.ownedRestaurants || []).map((rid) => {
                        const ridStr = typeof rid === 'string' ? rid : rid?._id || rid;
                        return (
                          <a
                            key={ridStr}
                            href={`/owner/dashboard/${ridStr}`}
                            className="btn-secondary px-3 py-1.5 text-xs"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Building2 className="h-3.5 w-3.5" />
                            Dash
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="card py-10 text-center text-slate-500">
                    No users found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {adminAction && (
        <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-action-title">
          <form onSubmit={submitAdminAction} className="premium-dialog p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className={`mb-3 grid h-11 w-11 place-items-center rounded-2xl ${adminAction.type === 'delete' ? 'bg-red-500/12 text-red-200' : 'bg-[rgba(var(--accent),0.12)] text-[rgb(var(--accent))]'}`}>
                  {adminAction.type === 'delete' ? <AlertTriangle className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                </span>
                <h2 id="admin-action-title" className="text-xl font-black text-white">
                  {adminAction.type === 'delete' ? 'Delete restaurant' : adminAction.type === 'image' ? 'Update image' : 'Add menu item'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{adminAction.restaurant.name}</p>
              </div>
              <button type="button" className="icon-btn h-10 w-10" onClick={() => setAdminAction(null)} aria-label="Close dialog">
                <X className="h-4 w-4" />
              </button>
            </div>

            {adminAction.type === 'delete' && (
              <p className="mb-5 text-sm leading-6 text-slate-400">This removes the restaurant from the catalog. Existing related data may still depend on backend rules.</p>
            )}

            {adminAction.type === 'image' && (
              <div className="mb-5">
                <label className="label" htmlFor="admin-image">Image URL</label>
                <input id="admin-image" className="input" value={adminAction.image} onChange={(e) => setAdminAction({ ...adminAction, image: e.target.value })} placeholder="https://..." />
              </div>
            )}

            {adminAction.type === 'menu' && (
              <div className="mb-5 grid gap-4 sm:grid-cols-[1fr_8rem]">
                <div>
                  <label className="label" htmlFor="admin-menu-name">Menu item</label>
                  <input id="admin-menu-name" className="input" value={adminAction.menuName} onChange={(e) => setAdminAction({ ...adminAction, menuName: e.target.value })} placeholder="Dish name" />
                </div>
                <div>
                  <label className="label" htmlFor="admin-menu-price">Price</label>
                  <input id="admin-menu-price" className="input" type="number" min="0" value={adminAction.menuPrice} onChange={(e) => setAdminAction({ ...adminAction, menuPrice: e.target.value })} />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary" onClick={() => setAdminAction(null)}>Cancel</button>
              <button type="submit" className={adminAction.type === 'delete' ? 'btn-danger' : 'btn-primary'}>
                {adminAction.type === 'delete' ? 'Delete' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
