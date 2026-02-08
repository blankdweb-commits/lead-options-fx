import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Bitcoin, 
  Copy, 
  History, 
  DollarSign,
  Check,
  AlertCircle,
  X,
  AlertTriangle,
  Lock,
  Gift,
  TrendingUp,
  Info,
  Download
} from 'lucide-react';
import { RECENT_TRANSACTIONS } from '../constants';
import { Transaction } from '../types';
import { SystemSettings } from '../App';

interface WalletProps {
    systemSettings: SystemSettings;
    globalBalance: number;
    setGlobalBalance: (val: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ systemSettings, globalBalance, setGlobalBalance }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('btc');
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Dynamic State
  const [transactions, setTransactions] = useState<Transaction[]>(RECENT_TRANSACTIONS);
  const [lockedBonus] = useState<number>(2500.00);

  // Limits State
  const [dailyLimit] = useState(50000);
  const [monthlyLimit] = useState(500000);
  const [usedDaily, setUsedDaily] = useState(1250); 
  const [usedMonthly, setUsedMonthly] = useState(45200); 

  // Withdraw specific state
  const [withdrawMethod, setWithdrawMethod] = useState('Bitcoin Wallet');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Computed
  const availableBalance = Math.max(0, globalBalance - lockedBonus);
  const remainingDaily = dailyLimit - usedDaily;
  const remainingMonthly = monthlyLimit - usedMonthly;

  // Deposit Configuration
  const DEPOSIT_DETAILS: Record<string, { network: string, address: string, label: string, color: string, instructions: string[] }> = {
    btc: {
      network: 'Bitcoin (BTC)',
      address: systemSettings.btcWallet,
      label: 'Bitcoin',
      color: 'text-accentOrange',
      instructions: [
          "Send only Bitcoin (BTC) to this address.",
          "Ensure you are using the Bitcoin network.",
          "Sending any other coin may result in permanent loss.",
          "1 network confirmation is required for credit."
      ]
    },
    usdt: {
      network: 'Tron (TRC20)',
      address: systemSettings.usdtWallet, 
      label: 'USDT',
      color: 'text-accentGreen',
      instructions: [
          "Send only USDT via the Tron (TRC20) network.",
          "Do not send via ERC20 or BSC, your funds will be lost.",
          "Transfers typically arrive within 2-5 minutes.",
          "Ensure the destination address starts with 'T'."
      ]
    }
  };

  const currentDeposit = DEPOSIT_DETAILS[selectedMethod] || DEPOSIT_DETAILS['btc'];

  const handleCopy = () => {
    if (currentDeposit.address) {
        navigator.clipboard.writeText(currentDeposit.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentDeposit.address}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentDeposit.label.toLowerCase()}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    // Simulate instant deposit with fee deduction
    const fee = systemSettings.depositFeeType === 'percentage' 
        ? (val * systemSettings.depositFee) / 100 
        : systemSettings.depositFee;
    
    const net = Math.max(0, val - fee);

    setGlobalBalance(globalBalance + net);
    
    const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        type: 'deposit',
        amount: net,
        status: 'completed',
        date: 'Just now',
        method: selectedMethod === 'btc' ? 'Bitcoin' : 'USDT'
    };

    setTransactions(prev => [newTx, ...prev]);
    setAmount('');

    setSuccessMsg(`Successfully deposited ${formatCurrency(val)}`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const validateAddress = (method: string, addr: string): string => {
    const cleanAddr = addr.trim();
    if (!cleanAddr) return "Destination address is required";
    
    if (method === 'Bitcoin Wallet') {
         const btcRegex = /^(1|3|bc1)[a-zA-Z0-9]{25,90}$/;
         if (!btcRegex.test(cleanAddr)) {
             return "Invalid Bitcoin address. Ensure it starts with 1, 3, or bc1.";
         }
    }
    
    if (method === 'USDT (TRC20)') {
        const trc20Regex = /^T[a-zA-Z0-9]{33}$/;
        if (!trc20Regex.test(cleanAddr)) {
            return "Invalid TRC20 address. Must start with 'T' and be 34 characters.";
        }
    }
    
    return "";
  };

  const handleAddressBlur = () => {
    if (withdrawAddress) {
        const error = validateAddress(withdrawMethod, withdrawAddress);
        setAddressError(error);
    }
  };

  const handleWithdrawClick = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
        return;
    }
    if (val > availableBalance) {
        alert("Insufficient funds"); 
        return;
    }
    if (val > remainingDaily) {
        alert(`Amount exceeds daily withdrawal limit. Remaining today: ${formatCurrency(remainingDaily)}`);
        return;
    }
    
    const error = validateAddress(withdrawMethod, withdrawAddress);
    if (error) {
        setAddressError(error);
        return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmWithdraw = () => {
      const val = parseFloat(amount);
      
      // Update limits
      setUsedDaily(prev => prev + val);
      setUsedMonthly(prev => prev + val);

      // Deduct from balance
      setGlobalBalance(globalBalance - val);
      
      const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          type: 'withdrawal',
          amount: val,
          status: 'processing',
          date: 'Just now',
          method: withdrawMethod
      };

      setTransactions(prev => [newTx, ...prev]);
      setShowConfirmModal(false);
      setAmount('');
      setWithdrawAddress('');
  };

  const getTransactionStyle = (type: string) => {
    switch (type) {
      case 'deposit':
        return {
          icon: ArrowDownLeft,
          bg: 'bg-accentGreen/10',
          color: 'text-accentGreen',
          amountColor: 'text-accentGreen',
          sign: '+'
        };
      case 'withdrawal':
        return {
          icon: ArrowUpRight,
          bg: 'bg-zinc-800',
          color: 'text-zinc-400',
          amountColor: 'text-white',
          sign: '-'
        };
      case 'profit':
        return {
          icon: TrendingUp,
          bg: 'bg-blue-500/10',
          color: 'text-blue-500',
          amountColor: 'text-blue-500',
          sign: '+'
        };
      case 'bonus':
        return {
          icon: Gift,
          bg: 'bg-purple-500/10',
          color: 'text-purple-500',
          amountColor: 'text-purple-500',
          sign: '+'
        };
      default:
        return {
          icon: DollarSign,
          bg: 'bg-zinc-800',
          color: 'text-zinc-400',
          amountColor: 'text-white',
          sign: ''
        };
    }
  };
  
  // Calculate fee for display
  const currentWithdrawAmount = parseFloat(amount) || 0;
  
  const withdrawalFee = systemSettings.withdrawalFeeType === 'percentage' 
    ? (currentWithdrawAmount * systemSettings.withdrawalFee) / 100 
    : systemSettings.withdrawalFee;

  const netWithdrawAmount = Math.max(0, currentWithdrawAmount - withdrawalFee);

  // Calculate deposit fee
  const currentDepositAmount = parseFloat(amount) || 0;
  const depositFee = systemSettings.depositFeeType === 'percentage'
    ? (currentDepositAmount * systemSettings.depositFee) / 100
    : systemSettings.depositFee;
  
  const netDepositAmount = Math.max(0, currentDepositAmount - depositFee);

  return (
    <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Balance */}
        <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-900 border border-zinc-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden shadow-2xl transition-all duration-500">
           <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-10 -translate-y-10">
              <WalletIcon size={200} />
           </div>
           
           <div className="relative z-10">
              <span className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Total Balance</span>
              <div className="flex items-baseline gap-2 mt-1">
                 <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums animate-in fade-in duration-300">
                    {formatCurrency(globalBalance)}
                 </h2>
                 <span className={`text-accentGreen font-bold text-sm bg-accentGreen/10 px-2 py-1 rounded ${globalBalance > 1000 ? 'animate-pulse' : ''}`}>
                    {globalBalance > 1000 ? '+2.4%' : '-99.9%'}
                 </span>
              </div>
              
              <div className="mt-8 flex gap-8">
                  <div>
                      <span className="text-zinc-500 text-xs uppercase block mb-1">Available to Withdraw</span>
                      <span className="text-xl font-bold text-white tabular-nums">{formatCurrency(availableBalance)}</span>
                  </div>
                  <div>
                      <span className="text-zinc-500 text-xs uppercase block mb-1">Locked (Bonus)</span>
                      <span className="text-xl font-bold text-zinc-400 tabular-nums">{formatCurrency(lockedBonus)}</span>
                  </div>
              </div>
           </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
           <div>
               <h3 className="text-lg font-bold text-white mb-2">Estimated PnL</h3>
               <p className="text-sm text-zinc-400">Your total profit and loss for this month.</p>
           </div>
           
           <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                 <span className={`text-3xl font-bold ${globalBalance < 1000 ? 'text-accentRed' : 'text-accentGreen'}`}>
                    {globalBalance < 1000 ? '-$45,200' : '+$15,230'}
                 </span>
                 <ArrowUpRight className={globalBalance < 1000 ? 'text-accentRed rotate-90' : 'text-accentGreen'} size={24} />
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className={`${globalBalance < 1000 ? 'bg-accentRed' : 'bg-accentGreen'} w-[75%] h-full rounded-full transition-colors duration-500`}></div>
              </div>
           </div>
           
           <button className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
               <History size={16} /> View Full Report
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Transfer Hub (Deposit/Withdraw) */}
        <div className="lg:col-span-7 bg-surface border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
            {/* Tab Navigation */}
            <div className="flex p-2 gap-2 border-b border-zinc-800 bg-zinc-900/30">
                <button 
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${
                    activeTab === 'deposit' 
                    ? 'bg-zinc-800 text-accentGreen shadow-lg shadow-black/20 ring-1 ring-zinc-700/50' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                    <ArrowDownLeft size={18} /> 
                    <span>Deposit Funds</span>
                    {activeTab === 'deposit' && (
                        <div className="absolute inset-0 bg-accentGreen/5 pointer-events-none" />
                    )}
                </button>
                <button 
                   onClick={() => setActiveTab('withdraw')}
                   className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${
                    activeTab === 'withdraw' 
                    ? 'bg-zinc-800 text-accentOrange shadow-lg shadow-black/20 ring-1 ring-zinc-700/50' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                   }`}
                >
                    <ArrowUpRight size={18} /> 
                    <span>Withdraw</span>
                    {activeTab === 'withdraw' && (
                        <div className="absolute inset-0 bg-accentOrange/5 pointer-events-none" />
                    )}
                </button>
            </div>

            <div className="p-6 lg:p-8 flex-1 flex flex-col relative min-h-[400px]">
               {/* Content Area */}
               {activeTab === 'deposit' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">1. Select Payment Method</label>
                            <span className="text-[10px] text-accentGreen bg-accentGreen/10 px-2 py-0.5 rounded border border-accentGreen/20">INSTANT CREDIT</span>
                        </div>
                        {/* Strictly Bitcoin and USDT options only */}
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setSelectedMethod('btc')}
                                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${selectedMethod === 'btc' ? 'bg-zinc-800 border-accentOrange text-white shadow-lg shadow-orange-900/10' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'}`}
                            >
                                <Bitcoin size={24} className={selectedMethod === 'btc' ? 'text-accentOrange' : 'text-zinc-500'} />
                                <span className="text-xs font-bold">Bitcoin</span>
                            </button>
                            <button 
                                onClick={() => setSelectedMethod('usdt')}
                                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${selectedMethod === 'usdt' ? 'bg-zinc-800 border-accentGreen text-white shadow-lg shadow-green-900/10' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'}`}
                            >
                                <DollarSign size={24} className={selectedMethod === 'usdt' ? 'text-accentGreen' : 'text-zinc-500'} />
                                <span className="text-xs font-bold">USDT</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2 block">2. Enter Amount (USD)</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold group-focus-within:text-white transition-colors">$</span>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl py-4 pl-10 pr-4 text-xl font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-accentGreen focus:bg-zinc-900 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                            {['100', '500', '1000', '2500', '5000'].map(val => (
                                <button 
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700/50"
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Instructions and QR Code with Animation Key */}
                    <div key={selectedMethod} className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 flex flex-col sm:flex-row items-start gap-4 transition-all duration-300">
                            <div className="flex flex-col items-center gap-3 shrink-0 mx-auto sm:mx-0">
                                <div className="bg-white p-2 rounded-lg shadow-lg">
                                    <img 
                                        key={currentDeposit.address} 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentDeposit.address}`} 
                                        alt={`${currentDeposit.label} QR`}
                                        className="w-[120px] h-[120px] object-contain"
                                    />
                                </div>
                                <button 
                                    onClick={handleDownloadQR}
                                    className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-all border border-zinc-700"
                                >
                                    <Download size={14} /> Download QR
                                </button>
                            </div>
                            <div className="flex-1 min-w-0 w-full space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-zinc-300 mb-1 text-center sm:text-left">
                                        Send only <span className={`font-bold ${currentDeposit.color}`}>{currentDeposit.label}</span> ({currentDeposit.network}) to this address
                                    </p>
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between group cursor-pointer hover:border-zinc-600 transition-colors" onClick={handleCopy}>
                                        <code className="text-xs text-zinc-400 font-mono truncate mr-2">{currentDeposit.address}</code>
                                        <button 
                                            className="text-zinc-500 hover:text-white transition-colors shrink-0"
                                        >
                                            {copied ? <Check size={16} className="text-accentGreen" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    {copied && <span className="text-[10px] text-accentGreen animate-in fade-in block mt-1 text-right">Copied to clipboard!</span>}
                                </div>
                                
                                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
                                    <h5 className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1 mb-2">
                                        <Info size={10} /> Instructions
                                    </h5>
                                    <ul className="space-y-1">
                                        {currentDeposit.instructions.map((inst, idx) => (
                                            <li key={idx} className="text-[10px] text-zinc-500 flex items-start gap-2">
                                                <span className="bg-zinc-700 rounded-full w-1 h-1 mt-1 shrink-0"></span>
                                                {inst}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                         <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-2">
                             <div className="flex justify-between text-xs">
                                 <span className="text-zinc-400">Deposit Amount</span>
                                 <span className="text-white font-mono">{formatCurrency(parseFloat(amount))}</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                 <span className="text-zinc-400">Deposit Fee {systemSettings.depositFeeType === 'percentage' && `(${systemSettings.depositFee}%)`}</span>
                                 <span className="text-accentRed font-mono">-{formatCurrency(depositFee)}</span>
                             </div>
                             <div className="border-t border-zinc-800 my-1"></div>
                             <div className="flex justify-between text-sm font-bold">
                                 <span className="text-zinc-300">Credited Balance</span>
                                 <span className="text-accentGreen font-mono">{formatCurrency(netDepositAmount)}</span>
                             </div>
                         </div>
                     )}

                    <button 
                        onClick={handleDeposit}
                        disabled={!amount}
                        className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all mt-auto active:scale-[0.99] transform flex items-center justify-center gap-2
                        ${!amount ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-accentGreen hover:bg-green-600 text-white shadow-green-900/20'}`}
                    >
                        Proceed to Payment
                    </button>
                 </div>
               )}
               
               {activeTab === 'withdraw' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3">
                        <AlertCircle className="text-accentOrange shrink-0" size={20} />
                        <div>
                            <h4 className="text-orange-400 font-bold text-sm mb-1">Withdrawal Info</h4>
                            <p className="text-xs text-orange-200/70 leading-relaxed">Withdrawals are processed within 24 hours. Ensure your destination wallet address matches the selected network.</p>
                        </div>
                     </div>

                     {/* Limits Section */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1"><Lock size={10} /> Daily Limit</span>
                                <span className="text-xs font-mono font-bold text-white">{formatCurrency(remainingDaily)} Left</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-accentOrange h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min((usedDaily / dailyLimit) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-1.5">
                                <span className="text-[10px] text-zinc-500">{formatCurrency(usedDaily)} used</span>
                                <span className="text-[10px] text-zinc-500">Max {formatCurrency(dailyLimit)}</span>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1"><Lock size={10} /> Monthly Limit</span>
                                <span className="text-xs font-mono font-bold text-white">{formatCurrency(remainingMonthly)} Left</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min((usedMonthly / monthlyLimit) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-1.5">
                                <span className="text-[10px] text-zinc-500">{formatCurrency(usedMonthly)} used</span>
                                <span className="text-[10px] text-zinc-500">Max {formatCurrency(monthlyLimit)}</span>
                            </div>
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2 block">Withdrawal Method</label>
                        <div className="relative">
                            <select 
                                value={withdrawMethod}
                                onChange={(e) => {
                                    setWithdrawMethod(e.target.value);
                                    setAddressError('');
                                }}
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accentOrange appearance-none"
                            >
                                <option value="Bitcoin Wallet">Bitcoin Wallet</option>
                                <option value="USDT (TRC20)">USDT (TRC20)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                     </div>

                     <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Amount to Withdraw</label>
                             <span className="text-xs text-zinc-500">Available: <span className="text-white font-mono">{formatCurrency(availableBalance)}</span></span>
                        </div>
                         <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold group-focus-within:text-white transition-colors">$</span>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl py-4 pl-10 pr-4 text-xl font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-accentOrange focus:bg-zinc-900 transition-colors"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-zinc-800 text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors uppercase">
                                Max
                            </button>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-zinc-500">
                            <span>Min: $50.00</span>
                            <span className={`${currentWithdrawAmount > remainingDaily ? 'text-accentRed' : ''}`}>
                                {currentWithdrawAmount > remainingDaily ? 'Exceeds Daily Limit' : `Max limit: $50,000.00`}
                            </span>
                        </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2 block">Destination Address</label>
                        <input 
                            type="text" 
                            value={withdrawAddress}
                            onChange={(e) => {
                                setWithdrawAddress(e.target.value);
                                if (addressError) setAddressError('');
                            }}
                            onBlur={handleAddressBlur}
                            placeholder="Paste your wallet address here"
                            className={`w-full bg-zinc-900/50 border rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:bg-zinc-900 transition-colors font-mono text-sm ${addressError ? 'border-accentRed focus:border-accentRed' : 'border-zinc-700 focus:border-accentOrange'}`}
                        />
                         {addressError && (
                            <div className="flex items-center gap-1 text-accentRed text-xs mt-1.5 animate-in slide-in-from-left-2">
                                <AlertCircle size={12} />
                                {addressError}
                            </div>
                        )}
                     </div>

                     {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                         <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-2">
                             <div className="flex justify-between text-xs">
                                 <span className="text-zinc-400">Requested Amount</span>
                                 <span className="text-white font-mono">{formatCurrency(parseFloat(amount))}</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                 <span className="text-zinc-400">Processing Fee {systemSettings.withdrawalFeeType === 'percentage' && `(${systemSettings.withdrawalFee}%)`}</span>
                                 <span className="text-accentRed font-mono">-{formatCurrency(withdrawalFee)}</span>
                             </div>
                             <div className="border-t border-zinc-800 my-1"></div>
                             <div className="flex justify-between text-sm font-bold">
                                 <span className="text-zinc-300">You Receive</span>
                                 <span className="text-accentOrange font-mono">{formatCurrency(netWithdrawAmount)}</span>
                             </div>
                         </div>
                     )}

                     <button 
                        onClick={handleWithdrawClick}
                        disabled={!amount || !withdrawAddress || currentWithdrawAmount > remainingDaily}
                        className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all mt-auto active:scale-[0.99] transform
                        ${(!amount || !withdrawAddress || currentWithdrawAmount > remainingDaily) 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none' 
                            : 'bg-accentOrange hover:bg-orange-600 text-white shadow-orange-900/20'}`}
                     >
                        Request Withdrawal
                    </button>
                 </div>
               )}
            </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-white">Recent Transactions</h3>
                    <button className="text-xs text-accentOrange hover:text-white transition-colors flex items-center gap-1">
                        View All <ArrowUpRight size={12} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[600px] p-4 space-y-3 custom-scrollbar">
                    {transactions.map((tx) => {
                        const style = getTransactionStyle(tx.type);
                        const Icon = style.icon;
                        
                        return (
                        <div key={tx.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors group cursor-default animate-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${style.bg} ${style.color} group-hover:bg-opacity-20`}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white capitalize">{tx.type}</p>
                                    <p className="text-xs text-zinc-500">{tx.method}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-mono font-bold ${style.amountColor}`}>
                                    {style.sign}${tx.amount.toLocaleString()}
                                </p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        tx.status === 'completed' ? 'bg-green-500' :
                                        tx.status === 'processing' ? 'bg-orange-500' :
                                        'bg-red-500'
                                    }`}></span>
                                    <span className="text-[10px] text-zinc-500 capitalize">{tx.date}</span>
                                </div>
                            </div>
                        </div>
                    )})}
                    
                    <div className="text-center p-4 border-t border-zinc-800/50 mt-2">
                        <p className="text-xs text-zinc-600">Showing last {transactions.length} transactions</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative bg-surface border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">Confirm Withdrawal</h3>
            
            <div className="space-y-4 mb-8">
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Withdraw Amount</span>
                        <span className="text-white font-mono font-bold">{formatCurrency(currentWithdrawAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Network Fee {systemSettings.withdrawalFeeType === 'percentage' && `(${systemSettings.withdrawalFee}%)`}</span>
                        <span className="text-white font-mono font-bold">{formatCurrency(withdrawalFee)}</span>
                    </div>
                    <div className="border-t border-zinc-800 my-2"></div>
                    <div className="flex justify-between text-base">
                        <span className="text-zinc-300 font-medium">You Receive</span>
                        <span className="text-accentOrange font-mono font-bold text-lg">
                            {formatCurrency(netWithdrawAmount)}
                        </span>
                    </div>
                </div>
                
                <div className="space-y-3">
                     <div>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Method</span>
                        <div className="flex items-center gap-2 text-sm text-white font-medium">
                            <WalletIcon size={16} className="text-zinc-400" />
                            {withdrawMethod}
                        </div>
                     </div>
                     <div>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">Destination Address</span>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                             <code className="text-xs text-zinc-300 break-all font-mono">{withdrawAddress}</code>
                        </div>
                     </div>
                </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                 <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                 <p className="text-xs text-red-200/80 leading-relaxed">
                    Please verify the address carefully. Transactions on the blockchain are irreversible.
                 </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-3 rounded-xl font-bold text-sm bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleConfirmWithdraw}
                    className="px-4 py-3 rounded-xl font-bold text-sm bg-accentOrange text-white hover:bg-orange-600 shadow-lg shadow-orange-900/20 transition-all"
                >
                    Confirm & Withdraw
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
           <div className="bg-zinc-900 border border-accentGreen/50 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
              <div className="bg-accentGreen/20 p-2 rounded-full text-accentGreen">
                  <Check size={20} />
              </div>
              <div>
                  <h4 className="font-bold text-sm text-accentGreen">Deposit Successful</h4>
                  <p className="text-xs text-zinc-300">{successMsg}</p>
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-zinc-500 hover:text-white ml-2">
                  <X size={16} />
              </button>
           </div>
        </div>
      )}
    </main>
  );
};

export default Wallet;