import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Coins, Banknote, Scale, ArrowRight, RefreshCw, Info, DollarSign, Briefcase, CreditCard } from 'lucide-react';

export const ZakatCalculator: React.FC = () => {
  // State for Gold/Silver Prices (Default values, can be updated by user)
  const [goldPrice, setGoldPrice] = useState<number>(65); // Approx price per gram in USD/EUR equivalent
  const [silverPrice, setSilverPrice] = useState<number>(0.85); // Approx price per gram

  // Assets State
  const [cash, setCash] = useState<number>(0);
  const [bank, setBank] = useState<number>(0);
  const [goldWeight, setGoldWeight] = useState<number>(0);
  const [silverWeight, setSilverWeight] = useState<number>(0);
  const [businessAssets, setBusinessAssets] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [otherAssets, setOtherAssets] = useState<number>(0);

  // Liabilities State
  const [debts, setDebts] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);

  // Results State
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [totalLiabilities, setTotalLiabilities] = useState<number>(0);
  const [netAssets, setNetAssets] = useState<number>(0);
  const [zakatDue, setZakatDue] = useState<number>(0);
  const [nisabGold, setNisabGold] = useState<number>(0);
  const [nisabSilver, setNisabSilver] = useState<number>(0);
  const [isEligible, setIsEligible] = useState<boolean>(false);

  // Calculate Totals
  useEffect(() => {
    const goldValue = goldWeight * goldPrice;
    const silverValue = silverWeight * silverPrice;
    
    const tAssets = cash + bank + goldValue + silverValue + businessAssets + investments + otherAssets;
    const tLiabilities = debts + expenses;
    const net = tAssets - tLiabilities;
    
    const nGold = 85 * goldPrice; // 85g Gold
    const nSilver = 595 * silverPrice; // 595g Silver
    
    // Use the lower Nisab threshold (usually Silver) to be safer, or let user choose.
    // Common practice is to use Gold for Gold-only assets, but Silver for mixed assets if it benefits the poor.
    // For simplicity, we'll display both but use Gold as the default reference for "Eligibility" in this UI, 
    // or maybe the lower of the two to be safer for the poor (Silver).
    // Let's use Silver as the safer threshold for mixed assets.
    const threshold = Math.min(nGold, nSilver);

    setTotalAssets(tAssets);
    setTotalLiabilities(tLiabilities);
    setNetAssets(net);
    setNisabGold(nGold);
    setNisabSilver(nSilver);
    
    if (net >= threshold) {
      setIsEligible(true);
      setZakatDue(net * 0.025);
    } else {
      setIsEligible(false);
      setZakatDue(0);
    }

  }, [cash, bank, goldWeight, silverWeight, businessAssets, investments, otherAssets, debts, expenses, goldPrice, silverPrice]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleReset = () => {
    setCash(0);
    setBank(0);
    setGoldWeight(0);
    setSilverWeight(0);
    setBusinessAssets(0);
    setInvestments(0);
    setOtherAssets(0);
    setDebts(0);
    setExpenses(0);
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 mb-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Calculator className="text-emerald-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">حاسبة الزكاة</h2>
            <p className="text-emerald-400/60 text-xs">احسب زكاة مالك بدقة وسهولة</p>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">إجمالي الأصول الزكوية</span>
            <span className="text-white font-mono font-bold">{formatCurrency(netAssets)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
             <span className="text-slate-400 text-sm">حد النصاب (فضة)</span>
             <span className="text-slate-400 font-mono text-xs">{formatCurrency(nisabSilver)}</span>
          </div>
          <div className="h-px bg-white/10 my-3" />
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 font-bold">الزكاة المستحقة</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(zakatDue)}</span>
          </div>
          {!isEligible && netAssets > 0 && (
             <p className="text-amber-400/80 text-[10px] mt-2 text-center">
               * لم يبلغ المال النصاب، لا تجب الزكاة بعد.
             </p>
          )}
        </div>
      </motion.div>

      <div className="space-y-4">
        {/* Settings Section */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
             <Scale size={18} />
             <h3 className="font-semibold">أسعار الذهب والفضة (للجرام)</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">سعر الذهب</label>
              <div className="relative">
                 <input 
                   type="number" 
                   value={goldPrice}
                   onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                   className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                 />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">سعر الفضة</label>
              <div className="relative">
                 <input 
                   type="number" 
                   value={silverPrice}
                   onChange={(e) => setSilverPrice(parseFloat(e.target.value) || 0)}
                   className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                 />
              </div>
            </div>
          </div>
        </div>

        {/* Cash & Bank */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
             <Banknote size={18} />
             <h3 className="font-semibold">النقد والودائع</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">نقد في اليد</label>
              <input 
                type="number" 
                value={cash || ''}
                onChange={(e) => setCash(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">رصيد البنك</label>
              <input 
                type="number" 
                value={bank || ''}
                onChange={(e) => setBank(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        {/* Gold & Silver */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
             <Coins size={18} />
             <h3 className="font-semibold">الذهب والفضة</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">وزن الذهب (جرام)</label>
              <input 
                type="number" 
                value={goldWeight || ''}
                onChange={(e) => setGoldWeight(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">وزن الفضة (جرام)</label>
              <input 
                type="number" 
                value={silverWeight || ''}
                onChange={(e) => setSilverWeight(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        {/* Business & Investments */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
             <Briefcase size={18} />
             <h3 className="font-semibold">عروض التجارة والاستثمار</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">قيمة البضائع المعدة للبيع</label>
              <input 
                type="number" 
                value={businessAssets || ''}
                onChange={(e) => setBusinessAssets(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">أسهم واستثمارات</label>
              <input 
                type="number" 
                value={investments || ''}
                onChange={(e) => setInvestments(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">أصول أخرى</label>
              <input 
                type="number" 
                value={otherAssets || ''}
                onChange={(e) => setOtherAssets(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-red-900/10 border border-red-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-red-300">
             <CreditCard size={18} />
             <h3 className="font-semibold">الخصوم والديون</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] text-red-300/60 mb-1">ديون مستحقة عليك</label>
              <input 
                type="number" 
                value={debts || ''}
                onChange={(e) => setDebts(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-red-500/20 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-red-300/60 mb-1">نفقات فورية</label>
              <input 
                type="number" 
                value={expenses || ''}
                onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-black/30 border border-red-500/20 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleReset}
          className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={16} />
          إعادة تعيين
        </button>

        <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
           <Info className="text-indigo-400 shrink-0" size={20} />
           <p className="text-xs text-indigo-200/80 leading-relaxed">
             هذه الحاسبة تقديرية. تجب الزكاة إذا حال الحول (مر عام هجري كامل) على المال وبلغ النصاب. النصاب هو ما يعادل 85 جرام ذهب أو 595 جرام فضة.
           </p>
        </div>
      </div>
    </div>
  );
};
