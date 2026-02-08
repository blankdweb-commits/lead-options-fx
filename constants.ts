import { StatData, ChartDataPoint, NavItem, Transaction } from './types';

export const STATS_DATA: StatData[] = [
  { id: '1', label: 'Capital', value: '$500.00', iconName: 'DollarSign', accentColor: 'default' },
  { id: '2', label: 'Profit', value: '$250,000.00', iconName: 'TrendingUp', accentColor: 'green' },
  { id: '3', label: 'Balance', value: '$250,500.00', iconName: 'Wallet', accentColor: 'default' },
  { id: '4', label: 'Trades', value: 17, iconName: 'Activity', accentColor: 'default' },
  { id: '5', label: 'Total Won', value: 30, iconName: 'CheckCircle', accentColor: 'green' },
  { id: '6', label: 'Total Loss', value: 2, iconName: 'XCircle', accentColor: 'red' },
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', iconName: 'LayoutDashboard', active: true },
  { label: 'Wallet', iconName: 'Wallet' },
  { label: 'History', iconName: 'History' },
  { label: 'Profile', iconName: 'User' },
];

// Generate some realistic looking random candlestick data
const generateData = (count: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let basePrice = 1.0850;
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timeDate = new Date(now.getTime() - (count - i) * 60000 * 30); // 30 min intervals
    const vol = (Math.random() * 0.0020);
    const change = (Math.random() - 0.5) * vol;
    
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * 0.0005;
    const low = Math.min(open, close) - Math.random() * 0.0005;
    
    basePrice = close;

    data.push({
      time: timeDate.getHours().toString().padStart(2, '0') + ':' + timeDate.getMinutes().toString().padStart(2, '0'),
      open,
      high,
      low,
      close,
    });
  }
  return data;
};

export const MOCK_CHART_DATA = generateData(40);

export const ASSETS = [
  { symbol: 'EURUSD', income: 92 },
  { symbol: 'GBPUSD', income: 88 },
  { symbol: 'USDJPY', income: 85 },
  { symbol: 'BTCUSD', income: 80 },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: 'tx_1', type: 'deposit', amount: 5000, status: 'completed', date: 'Today, 10:23 AM', method: 'Bitcoin (BTC)' },
  { id: 'tx_2', type: 'profit', amount: 450, status: 'completed', date: 'Yesterday, 4:15 PM', method: 'Trade Profit' },
  { id: 'tx_3', type: 'withdrawal', amount: 1200, status: 'processing', date: 'Oct 24, 2023', method: 'USDT (TRC20)' },
  { id: 'tx_5', type: 'bonus', amount: 250, status: 'completed', date: 'Oct 20, 2023', method: 'Welcome Bonus' },
];