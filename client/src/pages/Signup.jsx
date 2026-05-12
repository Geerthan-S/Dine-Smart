import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus } from 'lucide-react';
import api from '../services/api';
import { setAuth } from '../services/auth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      setAuth(data);
      toast.success(`Welcome to DineSmart, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-500 text-slate-950 shadow-lg shadow-sky-500/20">
            <Sparkles className="h-7 w-7" />
          </span>
          <h1 className="gradient-title mt-4 text-3xl font-black">Create account</h1>
          <p className="mt-2 text-slate-400">Join DineSmart AI today. It is free.</p>
        </div>

        <div className="card hover-lift">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" placeholder="Jane Doe" className="input" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" className="input" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Minimum 6 characters" className="input" value={form.password} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="role">Account Type</label>
              <select id="role" name="role" className="input" value={form.role} onChange={handleChange}>
                <option value="user">User (book tables)</option>
                <option value="admin">Admin (manage restaurants)</option>
              </select>
            </div>
            <button id="signup-btn" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <LoadingSpinner size="sm" /> : <><UserPlus className="h-4 w-4" />Create Account</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-sky-400 hover:text-sky-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
