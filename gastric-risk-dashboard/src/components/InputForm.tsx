"use client";
import React from 'react';
import { UserData, Sleep, Social, Diet, Pylori, AtrophicGastritis, Polypharmacy } from '../types';
import { User, Activity, FileText, Calculator, HelpCircle, Cigarette, Check } from 'lucide-react';

interface Props {
    data: UserData;
    onChange: (data: UserData) => void;
    onAnalyze: () => void;
}

const TooltipLabel: React.FC<{ label: string; tooltip: string; color?: string }> = ({ label, tooltip, color = 'text-slate-600' }) => (
    <div className="flex items-center gap-2 mb-2 group relative w-fit">
        <label className={`block text-sm font-bold ${color}`}>{label}</label>
        <HelpCircle className="w-4 h-4 text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 bg-slate-800/95 text-white text-xs p-3 rounded-lg shadow-xl z-20 leading-relaxed border border-slate-700">
            {tooltip}
        </div>
    </div>
);

const SelectionCard: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; subLabel?: string; risk?: boolean }> = ({ checked, onChange, label, subLabel, risk }) => (
    <div onClick={() => onChange(!checked)} className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-3 ${checked ? (risk ? 'bg-red-50 border-red-500 shadow-md' : 'bg-blue-50 border-blue-500 shadow-md') : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'}`}>
        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? (risk ? 'bg-red-500 border-red-500' : 'bg-blue-500 border-blue-500') : 'bg-white border-slate-300'}`}>
            {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
        </div>
        <div className="flex-1">
            <div className={`text-sm font-bold transition-colors ${checked ? 'text-slate-800' : 'text-slate-600'}`}>{label}</div>
            {subLabel && <div className="text-xs text-slate-400 mt-0.5">{subLabel}</div>}
        </div>
    </div>
);

const InputForm: React.FC<Props> = ({ data, onChange, onAnalyze }) => {
    const handleChange = <K extends keyof UserData>(key: K, value: UserData[K]) => onChange({ ...data, [key]: value });

    const getBMI = () => {
        if (data.height > 0 && data.weight > 0) return (data.weight / Math.pow(data.height / 100, 2)).toFixed(1);
        return '--';
    };
    const bmi = parseFloat(getBMI());
    let bmiLabel = '(標準)', bmiColor = 'text-emerald-600', bmiBg = 'bg-emerald-100';
    if (bmi < 18.5) { bmiLabel = '(低体重)'; bmiColor = 'text-red-500'; bmiBg = 'bg-red-100'; }
    else if (bmi >= 25 && bmi < 30) { bmiLabel = '(肥満 1度)'; bmiColor = 'text-amber-500'; bmiBg = 'bg-amber-100'; }
    else if (bmi >= 30) { bmiLabel = '(肥満 2度以上)'; bmiColor = 'text-red-600'; bmiBg = 'bg-red-100'; }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* 基本プロフィール */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100 text-lg font-bold text-slate-800">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div>基本プロフィール
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">年齢</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer" value={data.age} onChange={(e) => handleChange('age', parseInt(e.target.value))}>
                            {Array.from({ length: 81 }, (_, i) => i + 20).map(age => <option key={age} value={age}>{age} 歳</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">性別</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button onClick={() => handleChange('sex', 'male')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${data.sex === 'male' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>男性</button>
                            <button onClick={() => handleChange('sex', 'female')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${data.sex === 'female' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>女性</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">身長 (cm)</label>
                        <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" value={data.height || ''} onChange={(e) => handleChange('height', e.target.value === '' ? 0 : parseFloat(e.target.value))} placeholder="170" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">体重 (kg)</label>
                        <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" value={data.weight || ''} onChange={(e) => handleChange('weight', e.target.value === '' ? 0 : parseFloat(e.target.value))} placeholder="65" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${bmiBg} transition-colors`}>
                        <span className="text-xs font-bold text-slate-600 uppercase">BMI</span>
                        <span className="text-xl font-black text-slate-800 font-mono tracking-tighter">{getBMI()}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 bg-white/50 rounded ${bmiColor}`}>{bmiLabel}</span>
                    </div>
                </div>
            </div>

            {/* 生活習慣 */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100 text-lg font-bold text-slate-800">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity className="w-5 h-5" /></div>生活習慣・社会的因子
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">飲酒習慣</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" value={data.alcohol} onChange={(e) => handleChange('alcohol', e.target.value as 'none' | 'moderate' | 'heavy')}>
                            <option value="none">飲まない</option><option value="moderate">適度 (1日1合程度)</option><option value="heavy">多量 (週450g以上)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">喫煙歴</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" value={data.smoking} onChange={(e) => handleChange('smoking', e.target.value as "never" | "past" | "current")}>
                            <option value="never">吸わない (生涯非喫煙)</option><option value="past">過去に吸っていた</option><option value="current">吸っている</option>
                        </select>
                        {data.smoking === 'current' && (
                            <div className="mt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600"><Cigarette className="w-3.5 h-3.5" /> 1日の喫煙本数</div>
                                    <span className="text-blue-600 font-mono font-bold text-lg">{data.cigarettesPerDay}<span className="text-xs ml-0.5">本</span></span>
                                </div>
                                <input type="range" min="1" max="60" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" value={data.cigarettesPerDay} onChange={(e) => handleChange('cigarettesPerDay', parseInt(e.target.value))} />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono"><span>1</span><span>30</span><span>60+</span></div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">運動習慣 <span className="text-xs font-normal text-slate-400">(週2回以上)</span></label>
                        <div className="flex gap-2">
                            {['yes', 'no'].map(opt => (
                                <button key={opt} onClick={() => handleChange('exercise', opt as "yes" | "no")} className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${data.exercise === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>{opt === 'yes' ? 'あり' : 'なし'}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div><TooltipLabel label="睡眠時間" tooltip="平均的な睡眠時間です。6時間未満や9時間以上は健康リスクを高める可能性があります。" /><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" value={data.sleep} onChange={(e) => handleChange('sleep', e.target.value as Sleep)}><option value="optimal">6〜8時間 (最適)</option><option value="short">6時間未満 (不足)</option><option value="long">9時間以上 (過多)</option></select></div>
                    <div><TooltipLabel label="社会的つながり" tooltip="家族や友人との交流頻度や、孤独感の有無です。社会的孤立は喫煙と同等のリスクがあるとされています。" /><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" value={data.social} onChange={(e) => handleChange('social', e.target.value as Social)}><option value="active">活発 (毎日交流あり)</option><option value="moderate">普通 (週数回程度)</option><option value="isolated">孤立気味 (ほとんどない)</option></select></div>
                    <div><TooltipLabel label="野菜摂取" tooltip="バランスの良い食事の指標です。1日350g以上の野菜摂取が推奨されています。" /><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" value={data.diet} onChange={(e) => handleChange('diet', e.target.value as Diet)}><option value="good">十分 (1日350g以上)</option><option value="average">普通</option><option value="poor">不足 (野菜をあまり食べない)</option></select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectionCard checked={data.fam_cancer} onChange={(c) => handleChange('fam_cancer', c)} label="がん家族歴" subLabel="両親・兄弟姉妹" />
                    <SelectionCard checked={data.parent_long} onChange={(c) => handleChange('parent_long', c)} label="親が長寿" subLabel="90歳以上" />
                    <SelectionCard checked={data.allergy} onChange={(c) => handleChange('allergy', c)} label="アレルギー体質" />
                </div>
            </div>

            {/* 既往歴 */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100 text-lg font-bold text-slate-800">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>既往歴・感染症・内服
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div><TooltipLabel label="ピロリ菌検査" tooltip="胃がんの最大のリスク要因です。未検査の場合は「不明」を選択してください。" color="text-rose-600" /><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-rose-500" value={data.pylori} onChange={(e) => handleChange('pylori', e.target.value as Pylori)}><option value="unknown">検査未実施 / 不明</option><option value="negative">陰性 (未感染)</option><option value="eradicated">除菌済み</option><option value="current">陽性 (現感染)</option></select></div>
                    <div><TooltipLabel label="萎縮性胃炎 (胃カメラ)" tooltip="胃粘膜が薄くなる現象で、胃がん発生の母地となります。胃カメラ検査で指摘されたことがありますか？" color="text-rose-600" /><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-rose-500" value={data.atrophic_gastritis} onChange={(e) => handleChange('atrophic_gastritis', e.target.value as AtrophicGastritis)}><option value="unknown">検査未実施 / 不明</option><option value="yes">あり (要経過観察)</option><option value="no">なし</option></select></div>
                    <div><TooltipLabel label="内服薬 (ポリファーマシー)" tooltip="5種類以上の薬を服用している状態（多剤併用）は、副作用や転倒のリスクを高める可能性があります。" /><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500" value={data.polypharmacy} onChange={(e) => handleChange('polypharmacy', e.target.value as Polypharmacy)}><option value="0">なし</option><option value="1-4">1〜4種類</option><option value="5+">5種類以上 (多剤併用)</option></select></div>
                </div>
                <label className="block font-bold text-slate-600 mb-3 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> 既往歴・感染症 <span className="text-xs font-normal text-slate-400 ml-1">(該当する項目をタップ)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <SelectionCard checked={data.hist_cancer} onChange={(c) => handleChange('hist_cancer', c)} label="がん既往" risk />
                    <SelectionCard checked={data.hist_stroke} onChange={(c) => handleChange('hist_stroke', c)} label="脳卒中" risk />
                    <SelectionCard checked={data.hist_heart} onChange={(c) => handleChange('hist_heart', c)} label="心疾患" risk />
                    <SelectionCard checked={data.dm} onChange={(c) => handleChange('dm', c)} label="糖尿病" risk />
                    <SelectionCard checked={data.htn} onChange={(c) => handleChange('htn', c)} label="高血圧" />
                    <SelectionCard checked={data.dl} onChange={(c) => handleChange('dl', c)} label="高脂血症" />
                    <SelectionCard checked={data.inf_hep} onChange={(c) => handleChange('inf_hep', c)} label="肝炎(B/C)" />
                    <SelectionCard checked={data.inf_hpv} onChange={(c) => handleChange('inf_hpv', c)} label="HPV感染" />
                </div>
            </div>

            <button onClick={onAnalyze} className="group relative w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] transition-all duration-300 overflow-hidden active:scale-[0.99]">
                <div className="relative flex items-center justify-center gap-3">
                    <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span>健康資産と余命を分析する</span>
                </div>
            </button>
        </div>
    );
};
export default InputForm;
