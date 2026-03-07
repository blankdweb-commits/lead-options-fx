import React from 'react';
import { Shield, Zap, Crown, CheckCircle2, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter Bot',
    minDeposit: 500,
    roi: '10-15%',
    duration: '7 Days',
    features: ['Daily Market Analysis', 'Basic Trading Signals', '24/7 Support'],
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20'
  },
  {
    name: 'Pro Trader Bot',
    minDeposit: 2500,
    roi: '25-40%',
    duration: '14 Days',
    features: ['Advanced AI Strategies', 'Priority Trade Execution', 'Dedicated Account Manager', 'Personalized Portfolio'],
    icon: Zap,
    color: 'text-accentOrange',
    bgColor: 'bg-accentOrange/10',
    borderColor: 'border-accentOrange/20',
    popular: true
  },
  {
    name: 'Executive Bot',
    minDeposit: 10000,
    roi: '60-85%',
    duration: '30 Days',
    features: ['Institutional Grade AI', 'Zero Fee Trading', 'Private Signal Group', 'VIP Event Access', 'Custom Risk Management'],
    icon: Crown,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20'
  }
];

const InvestmentPlans: React.FC = () => {
  const [calcAmount, setCalcAmount] = React.useState<number>(1000);
  const [selectedPlan, setSelectedPlan] = React.useState(PLANS[1]);

  const estimatedProfit = React.useMemo(() => {
    const [min, max] = selectedPlan.roi.replace('%', '').split('-').map(Number);
    const avgRoi = (min + max) / 2;
    return (calcAmount * avgRoi) / 100;
  }, [calcAmount, selectedPlan]);

  return (
    <section className="py-6 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Investment Plans</h2>
          <p className="text-zinc-400 text-sm mt-1">Choose a bot tier to automate your trading and maximize returns.</p>
        </div>

        {/* Quick ROI Calculator */}
        <div className="bg-surface border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
           <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Investment Amount</label>
              <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                 <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg pl-7 pr-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-accentOrange w-32"
                 />
              </div>
           </div>
           <div className="hidden sm:block w-px h-10 bg-zinc-800"></div>
           <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Selected Plan</label>
              <select
                value={selectedPlan.name}
                onChange={(e) => setSelectedPlan(PLANS.find(p => p.name === e.target.value) || PLANS[1])}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-accentOrange"
              >
                {PLANS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
           </div>
           <div className="hidden sm:block w-px h-10 bg-zinc-800"></div>
           <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-accentGreen uppercase tracking-wider">Est. Profit</label>
              <span className="text-lg font-black text-accentGreen">${estimatedProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-surface border rounded-2xl p-6 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
              plan.popular ? 'border-accentOrange ring-1 ring-accentOrange/50' : 'border-zinc-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accentOrange text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className={`w-12 h-12 rounded-xl ${plan.bgColor} flex items-center justify-center mb-6`}>
              <plan.icon className={plan.color} size={24} />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-black text-white">{plan.roi}</span>
              <span className="text-zinc-500 text-sm">ROI</span>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex justify-between text-sm border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500">Min Deposit</span>
                <span className="text-white font-bold">${plan.minDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500">Duration</span>
                <span className="text-white font-bold">{plan.duration}</span>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Key Features</p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle2 size={16} className="text-accentGreen shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              plan.popular
                ? 'bg-accentOrange hover:bg-orange-600 text-white shadow-lg shadow-orange-900/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}>
              Select Plan
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InvestmentPlans;
