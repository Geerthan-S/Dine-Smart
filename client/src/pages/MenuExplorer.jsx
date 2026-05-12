import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Utensils } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MenuExplorer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.get('/restaurants/menu/search', { params: { q: query } });
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <span className="eyebrow mb-4"><Utensils className="h-4 w-4" />Dish intelligence</span>
      <h1 className="gradient-title text-4xl font-black sm:text-5xl">Search dishes across Chennai</h1>
      <p className="mt-3 max-w-2xl text-slate-400">Find restaurants by actual menu items, price, rating, and area instead of only cuisine labels.</p>

      <form onSubmit={search} className="card my-8 flex flex-col gap-3 sm:flex-row">
        <input className="input flex-1" placeholder="Try biryani, lobster, dosa, coffee..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn-primary"><Search className="h-4 w-4" />Search menu</button>
      </form>

      {loading ? <LoadingSpinner text="Searching menus..." /> : results.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-lg font-black text-white">No dishes loaded yet</p>
          <p className="mt-2 text-slate-400">Search a dish to see matching restaurants and prices.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map(({ restaurant, item }) => (
            <Link key={`${restaurant._id}-${item.name}-${item.price}`} to={`/restaurants/${restaurant._id}`} className="card hover-lift block">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--accent))]">{item.category}</p>
              <h2 className="mt-2 text-xl font-black text-white">{item.name}</h2>
              <p className="mt-1 text-slate-400">{restaurant.name} - {restaurant.area}</p>
              <div className="mt-4 flex items-center justify-between">
                <b className="text-[rgb(var(--accent))]">Rs. {item.price}</b>
                <span className="text-sm text-slate-400">{Number(restaurant.rating || 0).toFixed(1)} rating</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
