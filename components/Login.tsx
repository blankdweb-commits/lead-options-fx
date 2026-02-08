import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'user' | 'admin', email: string) => void;
  onSwitchToSignup?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (email === 'admin@leadoptions.fx' && password === 'admin123') {
        onLogin('admin', email);
      } else if (email === 'alex.morgan@leadoptions.fx' && password === 'password') {
        onLogin('user', email);
      } else {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accentOrange/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accentGreen/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-surface border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 mb-4 shadow-inner">
            <ShieldCheck className="text-accentOrange" size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">LEAD OPTIONS FX</h1>
          <p className="text-zinc-500 text-sm">Secure Trading Platform Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:border-accentOrange focus:bg-zinc-900 transition-all sm:text-sm"
                placeholder="name@leadoptions.fx"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:border-accentOrange focus:bg-zinc-900 transition-all sm:text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-accentRed text-xs bg-accentRed/10 p-3 rounded-lg border border-accentRed/20 animate-in slide-in-from-left-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-accentOrange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="text-center space-y-4">
            {onSwitchToSignup && (
              <div>
                <p className="text-sm text-zinc-400 mb-2">New to Lead Options FX?</p>
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="w-full py-3 px-4 border border-accentGreen/30 rounded-xl text-sm font-bold text-accentGreen hover:text-white hover:bg-accentGreen/10 hover:border-accentGreen transition-all active:scale-[0.98] group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            )}

            <div className="text-xs text-zinc-500 space-y-1">
              <p>For security, use your company email address</p>
              <p>Contact support for account assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;