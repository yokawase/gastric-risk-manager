"use client";
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

const OnboardingGuide: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1);
    useEffect(() => {
        const hasSeen = localStorage.getItem('phm_onboarding_seen');
        if (!hasSeen) {
            setTimeout(() => setIsVisible(true), 0);
        }
    }, []);
    const handleClose = () => { setIsVisible(false); localStorage.setItem('phm_onboarding_seen', 'true'); };
    const handleNext = () => { if (step < 3) setStep(step + 1); else handleClose(); };
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
                <div className="p-8">
                    <div className="flex gap-2 mb-8 justify-center">
                        {[1, 2, 3].map(i => (<div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />))}
                    </div>
                    <div className="min-h-[200px] text-center">
                        {step === 1 && (<div><div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600"><TrendingUp className="w-8 h-8" /></div><h2 className="text-2xl font-bold text-slate-800 mb-3">ミライ査定へようこそ！</h2><p className="text-slate-600 leading-relaxed">あなたの<strong>「余命」</strong>と<strong>「健康資産(お金)」</strong>を可視化し、明日からの行動を変えるためのプラットフォームです。</p></div>)}
                        {step === 2 && (<div><div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"><ShieldCheck className="w-8 h-8" /></div><h2 className="text-2xl font-bold text-slate-800 mb-3">科学的根拠に基づく分析</h2><p className="text-slate-600 leading-relaxed">厚労省の統計データと最新の医学論文に基づき、あなたの生活習慣が<strong>「寿命を何年縮めているか」</strong>を精密に算出します。</p></div>)}
                        {step === 3 && (<div><div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600"><CheckCircle className="w-8 h-8" /></div><h2 className="text-2xl font-bold text-slate-800 mb-3">使い方は簡単です</h2><p className="text-slate-600 leading-relaxed">1. プロフィールと生活習慣を入力。<br />2. AIがリスクと経済的損失を分析。<br />3. 結果を保存して定期的に確認しましょう。</p></div>)}
                    </div>
                    <div className="mt-8 flex justify-center"><button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center gap-2 transition-transform active:scale-95">{step === 3 ? 'はじめる' : '次へ'} <ArrowRight className="w-4 h-4" /></button></div>
                </div>
            </div>
        </div>
    );
};
export default OnboardingGuide;
