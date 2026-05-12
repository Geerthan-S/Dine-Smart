import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import RestaurantCard from '../components/RestaurantCard';
import MapView from '../components/MapView';

const SUGGESTIONS = [
  'Romantic Chettinad dinner in Anna Nagar under Rs. 1200',
  'Best filter coffee and dosa near T Nagar for breakfast',
  'Family friendly biryani place for 6 people in Velachery',
  'Premium seafood dinner in ECR with a relaxed vibe',
];

const labelFor = (key) => ({
  cuisine: 'Cuisine',
  dishes: 'Dishes',
  budget: 'Budget',
  location: 'Area',
  diningType: 'Mood',
  suggestedTime: 'Time',
  isVeg: 'Food type',
  partySize: 'Guests',
  tags: 'Tags',
}[key] || key);

const displayValue = (value) => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Vegetarian' : 'Non-vegetarian';
  return value;
};

export default function AiChat() {
  const [query, setQuery] = useState('');
  const [intake, setIntake] = useState({ occasion: '', budget: '', area: '', guests: '', vibe: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profile = Object.entries(intake)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    const q = [query.trim(), profile && `Context: ${profile}`].filter(Boolean).join('. ');
    if (!q) {
      toast.error('Please enter a query');
      return;
    }

    setLoading(true);
    setResult(null);
    setSelectedRestaurant(null);

    try {
      const { data } = await api.post('/ai/recommend', { query: q });
      setResult(data);
      if (data.recommendations.length === 0) {
        toast('No matching restaurants found. Try adding an area, dish, or budget.', { icon: 'i' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cinematic-page max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10 reveal-up">
        <p className="hero-kicker mb-4 mx-auto">Personal dining adviser</p>
        <h1 className="gradient-title text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
          Tell me what kind of meal you want
        </h1>
        <p className="copy max-w-2xl mx-auto leading-relaxed">
          I will read your mood, budget, cuisine, area, dishes, and group size, then match it against the Chennai restaurant catalog.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-5 sm:p-6 mb-8 reveal-up hover-lift" style={{ '--delay': '120ms' }}>
        <div className="mb-5 grid gap-3 md:grid-cols-5">
          {[
            ['occasion', 'Occasion'],
            ['budget', 'Budget'],
            ['area', 'Area'],
            ['guests', 'Guests'],
            ['vibe', 'Vibe'],
          ].map(([key, label]) => (
            <input
              key={key}
              className="input"
              aria-label={label}
              placeholder={label}
              value={intake[key]}
              onChange={(e) => setIntake({ ...intake, [key]: e.target.value })}
            />
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            id="ai-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. romantic dinner in Alwarpet, seafood, under Rs. 2000..."
            aria-label="Dining request"
            className="input flex-1 text-base"
          />
          <button id="ai-search-btn" type="submit" disabled={loading} className="btn-primary shrink-0 flex items-center justify-center gap-2">
            {loading ? <LoadingSpinner size="sm" /> : 'Find My Match'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              style={{ '--delay': `${220 + index * 70}ms` }}
              className="match-chip reveal-up rounded-full px-3 py-1.5 text-xs transition-all duration-300 hover:-translate-y-0.5"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="glass-panel rounded-3xl flex flex-col items-center justify-center py-16 reveal-up">
          <div className="typing-dots mb-5" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <LoadingSpinner size="lg" text="Matching your request with the Chennai catalog..." />
        </div>
      )}

      {result && !loading && (
        <div className="reveal-up">
          <div className="glass-panel rounded-3xl p-5 sm:p-6 mb-6 hover-lift">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div>
                <p className="hero-kicker mb-3">Adviser note</p>
                <h2 className="text-2xl font-semibold text-white mb-3 leading-snug">{result.advisorMessage}</h2>
                <p className="microcopy text-xs">Model: {result.model}{result.usedFallback ? ' - fallback parser used' : ''}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:max-w-xl">
                {Object.entries(result.preferences || {})
                  .filter(([, value]) => value !== null && value !== undefined && (!Array.isArray(value) || value.length > 0))
                  .map(([key, value], index) => (
                    <div key={key} style={{ '--delay': `${index * 60}ms` }} className="surface-muted reveal-up px-3 py-2">
                      <p className="microcopy text-xs">{labelFor(key)}</p>
                      <p className="text-white text-sm font-medium">{displayValue(value)}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white mb-4 reveal-up" style={{ '--delay': '90ms' }}>
            Recommended Restaurants ({result.recommendations.length})
          </h2>

          {result.recommendations.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="scroll-fade flex-1 space-y-5 max-h-[720px] overflow-y-auto pr-2">
                {result.recommendations.map((restaurant, index) => (
                  <div key={restaurant._id} className="reveal-up" style={{ '--delay': `${120 + index * 85}ms` }}>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {(result.matchReasons?.[restaurant._id] || []).map((reason) => (
                        <span key={reason} className="match-chip text-xs rounded-full px-2.5 py-1">
                          {reason}
                        </span>
                      ))}
                    </div>
                    <RestaurantCard restaurant={restaurant} onViewMap={(selected) => setSelectedRestaurant(selected)} />
                  </div>
                ))}
              </div>

              <div className="h-[520px] flex-1 reveal-up lg:h-[720px]" style={{ '--delay': '220ms' }}>
                <MapView
                  restaurants={result.recommendations}
                  selectedRestaurant={selectedRestaurant}
                  setSelectedRestaurant={setSelectedRestaurant}
                />
              </div>
            </div>
          ) : (
            <div className="card text-center py-10 reveal-up">
              <p className="copy">No restaurants matched your criteria.</p>
              <Link to="/restaurants" className="btn-primary mt-4 inline-block">Browse All Restaurants</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
