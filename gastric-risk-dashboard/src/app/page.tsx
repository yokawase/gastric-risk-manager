"use client";
import React, { useState } from 'react';
import { UserData, SimulationResult } from '../types';
import { runHealthAnalysis } from '../services/healthEngine';
import InputForm from '../components/InputForm';
import Dashboard from '../components/Dashboard';
import SymptomChecker from '../components/SymptomChecker';
import OnboardingGuide from '../components/OnboardingGuide';
import { HeartPulse, Edit3, Stethoscope, BarChart2, Building2, Menu, X } from 'lucide-react';

const NavButton = ({ active, onClick, icon, label, highlight }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; highlight?: boolean }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left group relative overflow-hidden ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {highlight && !active && <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>}
    <div className={`w-6 flex justify-center transition-transform group-hover:scale-110 ${active ? 'text-white' : ''}`}>{icon}</div>
    <span className="font-bold text-sm tracking-wide">{label}</span>
    {active && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>}
  </button>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<'input' | 'symptom'>('input');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    age: 40, sex: 'male', height: 170, weight: 65, alcohol: 'none', smoking: 'never', cigarettesPerDay: 20, exercise: 'no',
    sleep: 'optimal', social: 'moderate', diet: 'average',
    pylori: 'unknown', atrophic_gastritis: 'unknown', polypharmacy: '0',
    fam_cancer: false, parent_long: false, allergy: false, hist_cancer: false, hist_stroke: false, hist_heart: false,
    dm: false, htn: false, dl: false, inf_hep: false, inf_hpv: false,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleAnalyze = () => {
    const res = runHealthAnalysis(userData);
    setResult(res);
    setMobileMenuOpen(false);
  };

  const switchTab = (tab: 'input' | 'symptom') => { setActiveTab(tab); setMobileMenuOpen(false); };
  const scrollToDashboard = () => { setActiveTab('input'); setMobileMenuOpen(false); setTimeout(() => document.getElementById('dashboard-root')?.scrollIntoView({ behavior: 'smooth' }), 100); };

  return (
    <div className="flex min-h-screen font-sans bg-slate-50">
      <OnboardingGuide />

      {/* モバイルヘッダー */}
      <div className="md:hidden fixed top-0 w-full z-40 bg-white/90 backdrop-blur border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-800"><HeartPulse className="text-blue-600" /> Precision Health</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">{mobileMenuOpen ? <X /> : <Menu />}</button>
      </div>

      {/* サイドバー */}
      <aside className={`fixed md:sticky top-0 h-screen w-[280px] bg-slate-900 text-slate-300 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl md:h-auto`}>
        <div className="p-6">
          <div className="flex items-center gap-3 text-xl font-bold text-white mb-10">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/50"><HeartPulse className="w-6 h-6" /></div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">Precision Health</span>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
          <nav className="space-y-2">
            <NavButton active={activeTab === 'input' && !result} onClick={() => switchTab('input')} icon={<Edit3 className="w-5 h-5" />} label="問診・入力" />
            <NavButton active={activeTab === 'symptom'} onClick={() => switchTab('symptom')} icon={<Stethoscope className="w-5 h-5" />} label="症状チェック" />
            {result && <NavButton active={activeTab === 'input' && !!result} onClick={scrollToDashboard} icon={<BarChart2 className="w-5 h-5" />} label="予測ダッシュボード" highlight />}
          </nav>
        </div>
        <div className="mt-auto p-6 bg-slate-800/50 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">GU</div>
            <div><div className="text-sm font-bold text-white">Guest User</div><div className="text-xs text-slate-500">Free Plan</div></div>
          </div>
          <button className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold transition-all">Upgrade to Pro</button>
        </div>
      </aside>

      {/* モバイルオーバーレイ */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}

      <main className="flex-1 p-4 md:p-10 w-full pt-20 md:pt-10 overflow-x-hidden">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">Precision Health Manager</span>
            </h1>
            <p className="text-slate-500 font-medium">行動変容を科学する、あなただけの健康管理SaaS</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/80 backdrop-blur px-5 py-2.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <Building2 className="w-4 h-4 text-slate-400" />
              <div className="text-sm"><div className="text-[10px] text-slate-400 uppercase font-bold">Tenant</div><div className="font-bold text-slate-700">Demo Corp</div></div>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-500">System Online</span>
            </div>
          </div>
        </header>

        <div>
          {activeTab === 'input' ? (
            <div className="space-y-8">
              <InputForm data={userData} onChange={setUserData} onAnalyze={handleAnalyze} />
              {result && <div className="pt-8 border-t border-slate-200/50"><Dashboard result={result} userData={userData} /></div>}
            </div>
          ) : (
            <SymptomChecker />
          )}
        </div>
      </main>
    </div>
  );
}
