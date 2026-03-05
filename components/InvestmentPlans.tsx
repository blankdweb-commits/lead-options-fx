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
  return (
    <section className="py-6">
      <div className="flex flex-col mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Investment Plans</h2>
        <p className="text-zinc-400 text-sm mt-1">Choose a bot tier to automate your trading and maximize returns.</p>
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
