
import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulated Login
    setTimeout(() => {
      if (email && password.length >= 6) {
        onLoginSuccess();
      } else {
        setError('Invalid credentials. (Try any email and password > 6 chars)');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-100">
            <i className="fa-solid fa-graduation-cap text-white text-4xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome to Exam Paglu</h1>
          <p className="text-slate-500">Master your exams with AI guidance</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center border border-red-100">
            <i className="fas fa-exclamation-circle mr-3"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10"></i>
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10"></i>
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center text-lg active:scale-[0.98]"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin mr-3"></i>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Study Persistence</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your study patterns and progress are saved locally. Exam Paglu keeps your data ready whenever you return.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
