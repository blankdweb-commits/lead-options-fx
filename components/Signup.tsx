import React, { useState } from 'react';
import { UserPlus, Lock, Mail, User, ArrowRight, AlertCircle, ShieldCheck, Building } from 'lucide-react';

interface SignupProps {
  onSignup: (email: string, name: string, role: 'user' | 'admin') => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'user' as 'user' | 'admin',
    company: 'LEAD OPTIONS FX'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Email domain validation
    const allowedDomains = ['leadoptions.fx', 'leadoptionstrading.com', 'leadoptionsfx.com'];
    const emailDomain = formData.email.split('@')[1];
    
    if (!emailDomain || !allowedDomains.includes(emailDomain.toLowerCase())) {
      setError('Please use a valid Lead Options FX email address');
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Check if email already exists (in real app, this would be API call)
      const existingUsers = [
        'admin@leadoptions.fx',
        'alex.morgan@leadoptions.fx'
      ];
      
      if (existingUsers.includes(formData.email.toLowerCase())) {
        setError('Email already registered. Please use a different email or login.');
        setIsLoading(false);
        return;
      }

      // Generate a unique ID for the new user
      const userId = Math.random().toString(36).substring(2, 10);
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // Simulate successful signup
      console.log('New user created:', {
        id: userId,
        ...formData,
        name: fullName,
        createdAt: new Date().toISOString()
      });

      // Call the signup callback
      onSignup(formData.email, fullName, formData.accountType);
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accentOrange/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accentGreen/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-surface border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 mb-4 shadow-inner">
            <UserPlus className="text-accentGreen" size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">CREATE ACCOUNT</h1>
          <p className="text-zinc-500 text-sm">Join Lead Options FX Trading Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide ml-1">First Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2.5 border border-zinc-700 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:border-accentGreen focus:bg-zinc-900 transition-all sm:text-sm"
                  placeholder="John"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide ml-1">Last Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2.5 border border-zinc-700 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:border-accentGreen focus:bg-zinc-900 transition-all sm:text-sm"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide ml-1">Account Type</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
              </div>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2.5 border border-zinc-700 rounded-xl leading-5 bg-zinc-900/50 text-white focus:outline-none focus:border-accentGreen focus:bg-zinc-900 transition-all sm:text-sm appearance-none"
                required
              >
                <option value="user">Standard Trader</option>
                <option value="admin">Administrator</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide ml-1">Company Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:border-accentGreen focus:bg-zinc-900 transition-all sm:text-sm"
                placeholder="name@leadoptions.fx"
                required
              />
            </div>
            <p className="text-[10px] text-zinc-500 ml-1">Use your company email address</p>
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:border-accentGreen focus:bg-zinc-900 transition-all sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl leading-5 bg-zinc-900/50 text-white placeholder-zinc-600 focus:outline-none focus:border-accentGreen focus:bg-zinc-900 transition-all sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-accentRed text-xs bg-accentRed/10 p-3 rounded-lg border border-accentRed/20 animate-in slide-in-from-left-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-accentGreen hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ArrowRight size={16} />}
            </button>

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full py-2.5 px-4 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-900/50 transition-all active:scale-[0.98]"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="text-center">
            <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-surface text-zinc-500 text-xs">Account Information</span>
                </div>
            </div>
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-accentGreen" />
                <span>Secure & Encrypted Registration</span>
              </p>
              <p>All accounts require company email verification</p>
              <p>Admin accounts require additional authorization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;