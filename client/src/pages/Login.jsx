import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles } from 'lucide-react';
import api from '../services/api';
import { setAuth } from '../services/auth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-orange-500 to-teal-300 text-slate-950 shadow-lg shadow-orange-500/20">
            <Sparkles className="h-7 w-7" />
          </span>
          <h1 className="gradient-title mt-4 text-3xl font-black">Welcome back</h1>
          <p className="mt-2 text-slate-400">Sign in to continue to DineSmart AI</p>
        </div>

        <div className="card hover-lift">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" className="input" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Enter your password" className="input" value={form.password} onChange={handleChange} />
            </div>
            <button id="login-btn" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <LoadingSpinner size="sm" /> : <><LogIn className="h-4 w-4" />Sign In</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-orange-400 hover:text-orange-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
