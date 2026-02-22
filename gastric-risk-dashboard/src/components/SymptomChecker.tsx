"use client";
import React, { useState } from 'react';
import { Thermometer, ShieldCheck, AlertCircle } from 'lucide-react';

const SymptomChecker: React.FC = () => {
    const [activeSymptoms, setActiveSymptoms] = useState<string[]>([]);
    const toggleSymptom = (id: string) => {
        setActiveSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };
    const symptoms = [
        { id: 'fever', label: '発熱・感冒' },
        { id: 'pain', label: '疼痛 (腰・背中)' },
        { id: 'stomach', label: '消化器 (嘔吐/下痢)' },
        { id: 'injury', label: '外傷 (ケガ)' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 text-lg font-bold text-slate-800">
                    <Thermometer className="w-5 h-5 text-blue-600" /> 気になる症状・セルフケアガイド
                </div>
                <p className="text-slate-500 text-sm mb-4">現在気になる症状があればチェックしてください。</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {symptoms.map(s => (
                        <label key={s.id} className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" className="w-5 h-5 mr-3" checked={activeSymptoms.includes(s.id)} onChange={() => toggleSymptom(s.id)} />
                            <span className="font-bold text-slate-700">{s.label}</span>
                        </label>
                    ))}
                </div>
                <div className="space-y-4">
                    {activeSymptoms.includes('fever') && (<SymptomCard title="🤒 発熱・感冒" safeDesc="軽度で短期間の発熱、全身倦怠感、鼻水。水分(ORS)摂取で脱水予防が可能な場合。" safeAction="総合感冒薬による緩和、十分な睡眠と水分補給。" redDesc={["38℃以上の発熱が4日以上持続", "強い頭痛、項部硬直(首が固い・髄膜炎疑い)", "けいれん、意識障害、呼吸困難"]} />)}
                    {activeSymptoms.includes('pain') && (<SymptomCard title="⚡ 疼痛 (腰痛・背部痛)" safeDesc="軽度から中等度の筋肉痛、姿勢変化に伴う痛み。" safeAction="安静にしすぎず動ける範囲で動かす。湿布やNSAIDs(痛み止め)の使用。" redDesc={["急性の引き裂かれるような背部痛 (大動脈解離の可能性)", "原因不明の体重減少、排尿・排便障害(馬尾神経圧迫)", "安静にしていても痛む重度の夜間痛"]} />)}
                    {activeSymptoms.includes('stomach') && (<SymptomCard title="🤢 消化器症状 (嘔吐/下痢)" safeDesc="軽度な下痢・嘔吐、経口補水が可能な場合。" safeAction="絶食せず消化の良いものを少量ずつ。脱水予防(ORS)が最優先。" redDesc={["激しい腹痛の持続", "血便・吐血 (タール便含む)", "強い脱水症状 (意識レベル低下、尿量減少)"]} />)}
                    {activeSymptoms.includes('injury') && (<SymptomCard title="🩹 外傷" safeDesc="軽微な擦過傷、表皮に留まる切り傷、異物が完全に除去できた場合。" safeAction="水道水でよく洗浄し、湿潤療法(キズパワーパッド等)で保護。消毒は控える。" redDesc={["圧迫しても止血困難", "砂や異物が完全に除去できない (感染・刺青リスク)", "広範囲の熱傷、関節が動かせない"]} />)}
                </div>
            </div>
        </div>
    );
};

const SymptomCard = ({ title, safeDesc, safeAction, redDesc }: { title: string; safeDesc: string; safeAction: string; redDesc: string[] }) => (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-100 p-3 font-bold text-slate-800 border-b border-slate-200">{title}</div>
        <div className="p-4 bg-white">
            <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r">
                <div className="font-bold text-emerald-700 flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4" /> セルフケア適用</div>
                <p className="text-sm text-slate-700 mb-1">{safeDesc}</p>
                <div className="text-sm font-bold text-emerald-700">対処: {safeAction}</div>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
                <div className="font-bold text-red-700 flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4" /> 受診推奨 (Red Flag)</div>
                <ul className="text-sm text-red-800 list-disc list-inside">{redDesc.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
        </div>
    </div>
);
export default SymptomChecker;
