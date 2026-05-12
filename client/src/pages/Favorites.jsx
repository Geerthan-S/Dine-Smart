import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import api from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Favorites() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/restaurants/favorites/my')
      .then(({ data }) => setRestaurants(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <span className="eyebrow mb-4"><Heart className="h-4 w-4" />Saved dining list</span>
      <h1 className="gradient-title mb-8 text-4xl font-black sm:text-5xl">Your saved restaurants</h1>
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading saved restaurants..." /></div>
      ) : restaurants.length === 0 ? (
        <div className="card py-16 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-[rgb(var(--accent))]" />
          <p className="text-lg font-black text-white">No saved restaurants yet</p>
          <p className="mt-2 text-slate-400">Save restaurants from discovery or detail pages to build your shortlist.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => <RestaurantCard key={restaurant._id} restaurant={restaurant} />)}
        </div>
      )}
    </div>
  );
}
