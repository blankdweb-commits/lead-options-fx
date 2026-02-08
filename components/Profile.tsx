import React, { useRef, useState } from 'react';
import { User, Shield, Key, Save, Smartphone, Mail, Camera, AlertCircle } from 'lucide-react';

interface ProfileProps {
  userImage: string;
  onUpdateImage: (newImage: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ userImage, onUpdateImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@leadoptions.fx',
    phone: '+1 (555) 000-0000'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        return value.trim().length < 2 ? 'First name must be at least 2 characters' : '';
      case 'lastName':
        return value.trim().length < 2 ? 'Last name must be at least 2 characters' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email address' : '';
      case 'phone':
        // Simple regex allowing +, spaces, dashes, parens and digits, min length 10
        return !/^\+?[\d\s\-()]{10,}$/.test(value) ? 'Please enter a valid phone number (min 10 digits)' : '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
            onUpdateImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const hasErrors = Object.values(errors).some(err => err !== '');
  const isFormValid = !hasErrors && Object.values(formData).every(val => val !== '');

  return (
    <main className="p-4 lg:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Account Settings</h2>
           <p className="text-zinc-400 text-sm mt-1">Manage your personal information and security preferences.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs text-zinc-500">Last login: Today, 09:41 AM</span>
        </div>
      </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Col: User Card & Status (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-zinc-800 to-transparent opacity-50"></div>
                  
                  {/* Profile Image Container */}
                  <div className="relative w-28 h-28 mb-4 group cursor-pointer" onClick={triggerFileInput}>
                     <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface shadow-2xl relative z-10 bg-zinc-800">
                         <img 
                            src={userImage} 
                            alt="User" 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                         />
                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Camera size={24} className="text-white drop-shadow-md" />
                         </div>
                     </div>
                     <div className="absolute bottom-1 right-1 bg-accentGreen w-6 h-6 rounded-full border-4 border-surface z-20"></div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                     />
                  </div>

                  <h3 className="text-xl font-bold text-white relative z-10">{formData.firstName} {formData.lastName}</h3>
                  <p className="text-zinc-400 text-sm mb-4 relative z-10">Premium Trader</p>
                  
                  <div className="w-full grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6 mt-2 relative z-10">
                      <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                          <span className="inline-flex items-center gap-1 text-accentGreen font-bold text-sm">
                             <Shield size={12} /> Verified
                          </span>
                      </div>
                      <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">ID</p>
                          <span className="text-white font-mono text-sm">#883492</span>
                      </div>
                  </div>
              </div>
              
              {/* Account Stats Widget */}
               <div className="bg-surface border border-zinc-800 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Smartphone size={16} className="text-accentOrange" />
                      Device Activity
                  </h4>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                                  <span className="text-xs font-bold text-zinc-400">Mac</span>
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-white font-medium">MacBook Pro</span>
                                  <span className="text-xs text-zinc-500">San Francisco, US</span>
                              </div>
                          </div>
                          <span className="text-accentGreen text-xs font-bold">Current</span>
                      </div>
                      
                       <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                                  <span className="text-xs font-bold text-zinc-400">iOS</span>
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-zinc-300 font-medium">iPhone 14</span>
                                  <span className="text-xs text-zinc-500">Yesterday, 10:23 PM</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Col: Forms (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
              {/* Personal Info */}
              <div className="bg-surface border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-accentOrange">
                             <User size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Personal Information</h3>
                      </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">First Name</label>
                          <input 
                            type="text" 
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-background border rounded-lg px-4 py-2.5 text-white outline-none transition-all placeholder:text-zinc-600 ${
                              errors.firstName 
                                ? 'border-accentRed focus:border-accentRed' 
                                : 'border-zinc-700 focus:border-accentOrange'
                            }`}
                          />
                          {errors.firstName && (
                             <div className="flex items-center gap-1 text-accentRed text-xs mt-1 animate-in slide-in-from-left-2">
                                <AlertCircle size={12} />
                                {errors.firstName}
                             </div>
                          )}
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Last Name</label>
                          <input 
                            type="text" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-background border rounded-lg px-4 py-2.5 text-white outline-none transition-all placeholder:text-zinc-600 ${
                              errors.lastName 
                                ? 'border-accentRed focus:border-accentRed' 
                                : 'border-zinc-700 focus:border-accentOrange'
                            }`}
                          />
                          {errors.lastName && (
                             <div className="flex items-center gap-1 text-accentRed text-xs mt-1 animate-in slide-in-from-left-2">
                                <AlertCircle size={12} />
                                {errors.lastName}
                             </div>
                          )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Email Address</label>
                          <div className="relative">
                            <Mail className={`absolute left-3 top-2.5 ${errors.email ? 'text-accentRed' : 'text-zinc-500'}`} size={18} />
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full bg-background border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none transition-all placeholder:text-zinc-600 ${
                                  errors.email 
                                    ? 'border-accentRed focus:border-accentRed' 
                                    : 'border-zinc-700 focus:border-accentOrange'
                                }`}
                            />
                          </div>
                          {errors.email && (
                             <div className="flex items-center gap-1 text-accentRed text-xs mt-1 animate-in slide-in-from-left-2">
                                <AlertCircle size={12} />
                                {errors.email}
                             </div>
                          )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Phone Number</label>
                          <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full bg-background border rounded-lg px-4 py-2.5 text-white outline-none transition-all placeholder:text-zinc-600 ${
                              errors.phone 
                                ? 'border-accentRed focus:border-accentRed' 
                                : 'border-zinc-700 focus:border-accentOrange'
                            }`}
                          />
                           {errors.phone && (
                             <div className="flex items-center gap-1 text-accentRed text-xs mt-1 animate-in slide-in-from-left-2">
                                <AlertCircle size={12} />
                                {errors.phone}
                             </div>
                          )}
                      </div>
                  </div>
              </div>
              
              {/* Security & Preferences */}
               <div className="bg-surface border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-accentOrange">
                             <Key size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Security & Settings</h3>
                      </div>
                  </div>

                  <div className="p-6 space-y-6">
                      {/* Toggle Item 2FA */}
                      <div className="flex items-center justify-between">
                          <div className="space-y-1">
                              <p className="text-sm font-bold text-white flex items-center gap-2">
                                Two-Factor Authentication (2FA)
                                {is2FAEnabled && (
                                    <span className="text-[10px] bg-accentGreen/10 text-accentGreen px-2 py-0.5 rounded border border-accentGreen/20">RECOMMENDED</span>
                                )}
                              </p>
                              <p className="text-xs text-zinc-500 max-w-sm">Secure your account by requiring an additional code when logging in from a new device.</p>
                          </div>
                          <div 
                            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                            className={`h-6 w-11 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${is2FAEnabled ? 'bg-accentGreen' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                          >
                              <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${is2FAEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                      </div>
                      
                      <div className="w-full h-px bg-zinc-800"></div>

                      {/* Toggle Item Notifications */}
                      <div className="flex items-center justify-between">
                          <div className="space-y-1">
                              <p className="text-sm font-bold text-white">Trading Notifications</p>
                              <p className="text-xs text-zinc-500">Receive real-time alerts for market shifts and order execution.</p>
                          </div>
                          <div 
                             onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                             className={`h-6 w-11 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${isNotificationsEnabled ? 'bg-accentGreen' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                          >
                              <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                      </div>

                       <div className="w-full h-px bg-zinc-800"></div>

                      <div className="flex items-center justify-between">
                          <div className="space-y-1">
                              <p className="text-sm font-bold text-white">Password</p>
                              <p className="text-xs text-zinc-500">Last changed 3 months ago</p>
                          </div>
                          <button className="text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-lg transition-colors">
                              Change Password
                          </button>
                      </div>
                  </div>
                  
                  <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
                      <button 
                        disabled={!isFormValid}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                            isFormValid 
                            ? 'bg-accentOrange hover:bg-orange-600 text-white shadow-orange-900/20' 
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                          <Save size={18} />
                          Save Changes
                      </button>
                  </div>
               </div>
          </div>
       </div>
    </main>
  );
};

export default Profile;