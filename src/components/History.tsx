import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  Gift,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
  Settings,
  X,
  Check
} from 'lucide-react';
import { RECENT_TRANSACTIONS } from '../constants';
import { Transaction } from '../types';

// Extended type for display purposes including fees
interface DisplayTransaction extends Transaction {
  serviceFee: number;
  gasFee: number;
  network: string;
  txHash: string;
}

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
      columns: {
          id: true,
          type: true,
          date: true,
          method: true,
          amount: true,
          serviceFee: true,
          gasFee: true,
          total: true,
          status: true,
          network: true,
          txHash: true
      },
      dateRange: {
          start: '',
          end: ''
      }
  });

  // Load preferences on mount
  useEffect(() => {
      const saved = localStorage.getItem('historyExportPrefs');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              // Merge with default to ensure all keys exist if schema changes
              setExportConfig(prev => ({
                  columns: { ...prev.columns, ...parsed.columns },
                  dateRange: parsed.dateRange || prev.dateRange
              }));
          } catch (e) {
              console.error("Failed to parse export prefs", e);
          }
      }
  }, []);

  // Helper to parse varied date formats
  const parseDate = (dateStr: string): Date => {
      const now = new Date();
      const lower = dateStr.toLowerCase();
      
      if (lower.includes('just now')) return now;
      
      let datePart = dateStr;
      if (lower.includes('today')) {
          datePart = dateStr.replace('Today', now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      } else if (lower.includes('yesterday')) {
          const yest = new Date(now);
          yest.setDate(now.getDate() - 1);
          datePart = dateStr.replace('Yesterday', yest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      }
      
      // Clean up time part if needed or let Date parse it
      // "Oct 15, 2023, 08:45 AM" parses fine in most browsers
      return new Date(datePart);
  };

  // Helper to generate enriched data with Fees
  const getEnrichedData = (): DisplayTransaction[] => {
    // Start with recent transactions from constants and enrich them
    const recent: DisplayTransaction[] = RECENT_TRANSACTIONS.map(tx => ({
      ...tx,
      serviceFee: tx.type === 'withdrawal' ? 5.00 : 0,
      gasFee: (tx.type === 'deposit' || tx.type === 'withdrawal') 
        ? (tx.method.includes('Bitcoin') ? 15.40 : 2.50) 
        : 0,
      network: tx.method.includes('Bitcoin') ? 'Bitcoin' : tx.method.includes('TRC20') ? 'Tron (TRC20)' : 'Internal',
      txHash: (tx.type === 'deposit' || tx.type === 'withdrawal') 
        ? `0x${Math.random().toString(16).substr(2, 12)}...` 
        : '-'
    }));

    // Add mock historical data to populate the table for better visualization
    const historical: DisplayTransaction[] = [
      {
        id: 'tx_h1', type: 'deposit', amount: 15000, status: 'completed', date: 'Oct 15, 2023, 08:45 AM', method: 'Bitcoin (BTC)',
        serviceFee: 0, gasFee: 18.20, network: 'Bitcoin', txHash: '0x7a2b9e...'
      },
      {
        id: 'tx_h2', type: 'profit', amount: 850, status: 'completed', date: 'Oct 14, 2023, 02:30 PM', method: 'Trade Profit',
        serviceFee: 0, gasFee: 0, network: 'Internal', txHash: '-'
      },
      {
        id: 'tx_h3', type: 'withdrawal', amount: 2000, status: 'completed', date: 'Oct 12, 2023, 11:15 AM', method: 'USDT (TRC20)',
        serviceFee: 5.00, gasFee: 2.10, network: 'Tron (TRC20)', txHash: '0x3c4d5e...'
      },
      {
        id: 'tx_h4', type: 'bonus', amount: 500, status: 'completed', date: 'Oct 01, 2023, 10:00 AM', method: 'Loyalty Bonus',
        serviceFee: 0, gasFee: 0, network: 'Internal', txHash: '-'
      },
      {
        id: 'tx_h5', type: 'withdrawal', amount: 5000, status: 'failed', date: 'Sep 28, 2023, 04:20 PM', method: 'Bank Transfer',
        serviceFee: 0, gasFee: 0, network: 'SWIFT', txHash: '-'
      },
      {
        id: 'tx_h6', type: 'deposit', amount: 2500, status: 'completed', date: 'Sep 25, 2023, 09:10 AM', method: 'USDT (TRC20)',
        serviceFee: 0, gasFee: 2.10, network: 'Tron (TRC20)', txHash: '0x9f8e7d...'
      },
      {
        id: 'tx_h7', type: 'profit', amount: 320, status: 'completed', date: 'Sep 24, 2023, 01:05 PM', method: 'Trade Profit',
        serviceFee: 0, gasFee: 0, network: 'Internal', txHash: '-'
      }
    ];

    return [...recent, ...historical].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  };

  const allTransactions = getEnrichedData();

  const filteredTransactions = allTransactions.filter(tx => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.network.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'processing': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'processing': return <Clock size={14} />;
      case 'failed': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'deposit': return <ArrowDownLeft size={16} className="text-green-500" />;
      case 'withdrawal': return <ArrowUpRight size={16} className="text-orange-500" />;
      case 'profit': return <TrendingUp size={16} className="text-blue-500" />;
      case 'bonus': return <Gift size={16} className="text-purple-500" />;
      default: return <FileText size={16} className="text-zinc-500" />;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleExport = () => {
        // Filter Data by Date Range
        let dataToExport = allTransactions;
        
        if (exportConfig.dateRange.start) {
            const start = new Date(exportConfig.dateRange.start).getTime();
            dataToExport = dataToExport.filter(tx => parseDate(tx.date).getTime() >= start);
        }
        if (exportConfig.dateRange.end) {
            const end = new Date(exportConfig.dateRange.end);
            end.setHours(23, 59, 59, 999);
            dataToExport = dataToExport.filter(tx => parseDate(tx.date).getTime() <= end.getTime());
        }

        // Generate CSV Header
        const colKeys = Object.keys(exportConfig.columns) as Array<keyof typeof exportConfig.columns>;
        const activeKeys = colKeys.filter(key => exportConfig.columns[key]);
        const headers = activeKeys.map(key => (key as string).toUpperCase().replace(/([A-Z])/g, ' $1').trim()).join(',');

        // Generate CSV Rows
        const rows = dataToExport.map(tx => {
            return activeKeys.map(key => {
                let val: any = '';
                switch(key) {
                    case 'id': val = tx.id; break;
                    case 'type': val = tx.type; break;
                    case 'date': val = tx.date.replace(/,/g, ''); break; 
                    case 'method': val = tx.method; break;
                    case 'amount': val = tx.amount; break;
                    case 'serviceFee': val = tx.serviceFee; break;
                    case 'gasFee': val = tx.gasFee; break;
                    case 'network': val = tx.network; break;
                    case 'total': 
                        if (tx.type === 'withdrawal') val = -(tx.amount + tx.serviceFee + tx.gasFee);
                        else val = (tx.amount - tx.gasFee);
                        break;
                    case 'status': val = tx.status; break;
                    case 'txHash': val = tx.txHash; break;
                }
                return `"${val}"`;
            }).join(',');
        }).join('\n');

        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transaction_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Save preferences
        localStorage.setItem('historyExportPrefs', JSON.stringify(exportConfig));
        setShowExportModal(false);
  };

  const toggleColumn = (key: keyof typeof exportConfig.columns) => {
      setExportConfig(prev => ({
          ...prev,
          columns: {
              ...prev.columns,
              [key]: !prev.columns[key]
          }
      }));
  };

  return (
    <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 h-full flex flex-col relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Transaction History</h2>
          <p className="text-zinc-400 text-sm mt-1">View and manage your financial activity.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search ID, method..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-zinc-900/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accentOrange transition-all"
              />
           </div>
           
           <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-sm font-medium transition-colors border border-zinc-700"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export CSV</span>
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-zinc-800/50">
         {['all', 'deposit', 'withdrawal', 'profit', 'bonus'].map((filter) => (
            <button
               key={filter}
               onClick={() => setFilterType(filter)}
               className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${
                 filterType === filter 
                   ? 'bg-zinc-800 text-white shadow-lg' 
                   : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
               }`}
            >
               {filter}
            </button>
         ))}
      </div>

      {/* Table Container */}
      <div className="bg-surface border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col min-h-[400px]">
         <div className="overflow-x-auto flex-1">
             <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 backdrop-blur sticky top-0 z-10">
                   <tr>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider">Transaction</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider text-right">Amount</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider text-right">Service Fee</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider text-right">Gas Fee</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider text-right">Total</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 font-semibold text-zinc-400 uppercase text-xs tracking-wider text-center">Receipt</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                   {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                                   {getTypeIcon(tx.type)}
                               </div>
                               <div>
                                  <div className="font-bold text-white capitalize">{tx.type}</div>
                                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                                     {tx.network} 
                                     <span className="text-zinc-700">•</span> 
                                     <span className="font-mono">{tx.id}</span>
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-zinc-300 font-medium">{tx.date.split(',')[0]}</span>
                               <span className="text-xs text-zinc-500">{tx.date.split(',')[1] || ''}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className="font-bold text-white font-mono">{formatCurrency(tx.amount)}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className="text-zinc-400 font-mono text-xs">{tx.serviceFee > 0 ? `-${formatCurrency(tx.serviceFee)}` : '—'}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className="text-zinc-400 font-mono text-xs">{tx.gasFee > 0 ? `-${formatCurrency(tx.gasFee)}` : '—'}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className={`font-bold font-mono ${
                                tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'bonus' 
                                ? 'text-green-500' 
                                : 'text-white'
                            }`}>
                                {tx.type === 'withdrawal' 
                                    ? `-${formatCurrency(tx.amount + tx.serviceFee + tx.gasFee)}`
                                    : `+${formatCurrency(tx.amount - tx.gasFee)}` 
                                }
                            </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(tx.status)}`}>
                               {getStatusIcon(tx.status)}
                               <span className="capitalize">{tx.status}</span>
                            </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            {tx.txHash !== '-' ? (
                                <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-accentOrange transition-colors" title="View on Blockchain">
                                    <ExternalLink size={16} />
                                </button>
                            ) : (
                                <span className="text-zinc-700">-</span>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
         </div>
         
         {filteredTransactions.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-500">
                <div className="p-4 bg-zinc-900 rounded-full mb-3">
                   <Search size={24} />
                </div>
                <p>No transactions found matching your criteria.</p>
            </div>
         )}

         {/* Pagination (Mock) */}
         <div className="border-t border-zinc-800 p-4 bg-zinc-900/30 flex justify-between items-center">
             <span className="text-xs text-zinc-500">Showing {filteredTransactions.length} of {allTransactions.length} records</span>
             <div className="flex gap-2">
                 <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50" disabled>Previous</button>
                 <button className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50" disabled>Next</button>
             </div>
         </div>
      </div>

      {/* Export Config Modal */}
      {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
                  onClick={() => setShowExportModal(false)}
              />
              <div className="relative bg-surface border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-800 rounded-lg text-white border border-zinc-700">
                              <Settings size={20} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-white">Export Settings</h3>
                              <p className="text-xs text-zinc-400">Customize your CSV export preferences.</p>
                          </div>
                      </div>
                      <button onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-white">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-6 space-y-6">
                      {/* Date Range Section */}
                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-3 flex items-center gap-2">
                              <Calendar size={14} /> Date Range (Optional)
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <span className="text-[10px] text-zinc-400 ml-1">From</span>
                                  <input 
                                      type="date" 
                                      value={exportConfig.dateRange.start}
                                      onChange={(e) => setExportConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accentOrange placeholder-zinc-600"
                                  />
                              </div>
                              <div className="space-y-1">
                                  <span className="text-[10px] text-zinc-400 ml-1">To</span>
                                  <input 
                                      type="date" 
                                      value={exportConfig.dateRange.end}
                                      onChange={(e) => setExportConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accentOrange placeholder-zinc-600"
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="w-full h-px bg-zinc-800"></div>

                      {/* Columns Section */}
                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-3">Include Columns</label>
                          <div className="grid grid-cols-2 gap-3">
                              {Object.keys(exportConfig.columns).map((key) => (
                                  <label 
                                      key={key} 
                                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                          exportConfig.columns[key as keyof typeof exportConfig.columns] 
                                          ? 'bg-zinc-800 border-accentOrange/50 text-white' 
                                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                                      }`}
                                  >
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                           exportConfig.columns[key as keyof typeof exportConfig.columns]
                                           ? 'bg-accentOrange border-accentOrange text-white'
                                           : 'border-zinc-600'
                                      }`}>
                                          {exportConfig.columns[key as keyof typeof exportConfig.columns] && <Check size={12} />}
                                      </div>
                                      <input 
                                          type="checkbox" 
                                          checked={exportConfig.columns[key as keyof typeof exportConfig.columns]}
                                          onChange={() => toggleColumn(key as keyof typeof exportConfig.columns)}
                                          className="hidden"
                                      />
                                      <span className="text-xs font-medium capitalize">
                                          {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-3">
                      <button 
                          onClick={() => setShowExportModal(false)}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleExport}
                          className="px-6 py-2 rounded-lg text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg"
                      >
                          <Download size={16} /> Export Data
                      </button>
                  </div>
              </div>
          </div>
      )}
    </main>
  );
};

export default History;