"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SimulationResult, UserData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { DollarSign, TrendingUp, Share2, Copy, HeartPulse, Download, Activity, Send, ThumbsUp, AlertTriangle, ChevronDown, ChevronUp, Check, X as XIcon, Twitter, MessageCircle, MoreHorizontal } from 'lucide-react';
import StomachCancerRisk from './StomachCancerRisk';

interface Props { result: SimulationResult; userData: UserData; }

const CountUp: React.FC<{ end: number; duration?: number; prefix?: string; suffix?: string; decimals?: number; useGrouping?: boolean }> = ({ end, duration = 1500, prefix = '', suffix = '', decimals = 0, useGrouping = true }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const ease = 1 - Math.pow(1 - percentage, 4);
            setCount(end * ease);
            if (progress < duration) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [end, duration]);
    return <span>{prefix}{count.toLocaleString(undefined, { useGrouping, minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};

const RiskFactorTable = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mt-4 border-t border-slate-100 pt-2">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors mx-auto py-2">
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>エビデンスに基づくリスク強度(HR)を確認する</span>
            </button>
            {isOpen && (
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-600 border-collapse">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr><th className="p-2">リスク因子</th><th className="p-2 text-center">強度(HR)</th><th className="p-2">備考</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr><td className="p-2 font-bold text-red-600">現在喫煙(重)</td><td className="p-2 text-center font-bold">2.20</td><td className="p-2">1日20本以上</td></tr>
                            <tr><td className="p-2 font-bold text-red-600">脳卒中既往</td><td className="p-2 text-center font-bold">2.00</td><td className="p-2">再発リスク大</td></tr>
                            <tr><td className="p-2 font-bold text-red-600">心疾患既往</td><td className="p-2 text-center font-bold">1.80</td><td className="p-2">心不全リスク含む</td></tr>
                            <tr><td className="p-2 font-bold text-red-600">糖尿病</td><td className="p-2 text-center font-bold">1.75</td><td className="p-2">全死亡リスクへの影響大</td></tr>
                            <tr><td className="p-2 text-amber-600">多量飲酒</td><td className="p-2 text-center font-bold">1.55</td><td className="p-2">週450g以上</td></tr>
                            <tr><td className="p-2 text-amber-600">社会的孤立</td><td className="p-2 text-center font-bold">1.30</td><td className="p-2">喫煙に匹敵するリスク</td></tr>
                        </tbody>
                    </table>
                    <div className="text-[10px] text-slate-400 mt-2 text-right">出典: JPHC Study, JACC Study, JAGES等に基づく推計</div>
                </div>
            )}
        </div>
    );
};

const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; shareText: string; groupShareText: string; appUrl: string; onCopy: (text: string) => void }> = ({ isOpen, onClose, shareText, groupShareText, appUrl, onCopy }) => {
    const [mode, setMode] = useState<'normal' | 'group'>('normal');
    const activeText = mode === 'normal' ? shareText : groupShareText;
    const encodedText = encodeURIComponent(activeText);
    const lineUrl = `https://line.me/R/msg/text/?${encodedText}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    const canUseWebShare = typeof navigator !== 'undefined' && !!navigator.share;
    const handleWebShare = async () => { try { await navigator.share({ title: 'Precision Health 診断結果', text: activeText, url: appUrl }); onClose(); } catch (err) { console.error(err); } };
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ margin: 0 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700">診断結果をシェア</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="flex border-b border-slate-100">
                    <button onClick={() => setMode('normal')} className={`flex-1 py-3 text-sm font-bold transition-all ${mode === 'normal' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500'}`}>通常シェア</button>
                    <button onClick={() => setMode('group')} className={`flex-1 py-3 text-sm font-bold transition-all ${mode === 'group' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500'}`}>グループで比較</button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-3">
                    <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-[#06c755] text-white rounded-xl hover:shadow-lg gap-2"><MessageCircle className="w-8 h-8" /><span className="font-bold text-sm">LINE</span></a>
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-black text-white rounded-xl hover:shadow-lg gap-2"><Twitter className="w-8 h-8" /><span className="font-bold text-sm">X (Twitter)</span></a>
                    <button onClick={() => { onCopy(activeText); onClose(); }} className="flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 gap-2"><Copy className="w-8 h-8 text-slate-500" /><span className="font-bold text-sm">コピー</span></button>
                    {canUseWebShare ? (
                        <button onClick={handleWebShare} className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 gap-2"><MoreHorizontal className="w-8 h-8" /><span className="font-bold text-sm">その他</span></button>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-xl gap-2 opacity-50"><MoreHorizontal className="w-8 h-8 text-slate-300" /><span className="font-bold text-xs text-slate-400">未対応</span></div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const Dashboard: React.FC<Props> = ({ result, userData }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [actionFeedback, setActionFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const currentYear = new Date().getFullYear();
    const deathYear = Math.floor(currentYear + result.le);
    const formatMoney = (val: number) => `¥${Math.floor(val).toLocaleString()}`;
    const formatRange = (min: number, max: number) => `変動範囲: ${formatMoney(min)} 〜 ${formatMoney(max)}`;
    const dSign = result.diff >= 0 ? '+' : '';
    const appUrl = 'https://gastric-risk-manager.netlify.app/';
    const shareText = `【Precision Health】診断結果\n到達予測: ${deathYear}年 (満${result.lifespan}歳)\n推定余命: あと${result.le}年\n平均との差: ${dSign}${result.diff}年\n\nあなたの余命と健康資産を可視化する「ミライ査定」\n${appUrl}\n#PrecisionHealth #ミライ査定`;
    const groupShareText = `【挑戦状】私の寿命予測は「${deathYear}年 (満${result.lifespan}歳)」でした！\n\nあなたの余命は西暦何年まで？グループのみんなでスコアを競ってみよう！\n\n診断はこちらから👇\n${appUrl}`;
    const showActionFeedback = (msg: string, type: 'success' | 'error' = 'success') => { setActionFeedback({ msg, type }); setTimeout(() => setActionFeedback(null), 3000); };
    const copyResult = async (textToCopy: string, silent = false) => {
        const success = () => !silent && showActionFeedback('クリップボードにコピーしました');
        const fail = () => !silent && showActionFeedback('コピーに失敗しました', 'error');
        if (navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(textToCopy); success(); return; } catch (e) { console.warn(e); } }
        try {
            const ta = document.createElement('textarea'); ta.value = textToCopy; ta.style.cssText = 'position:fixed;left:0;top:0;opacity:0;'; ta.setAttribute('readonly', ''); document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, 99999);
            const ok = document.execCommand('copy'); document.body.removeChild(ta); if (ok) success(); else fail();
        } catch { fail(); }
    };
    const handleDownloadReport = () => {
        const dateStr = new Date().toLocaleDateString('ja-JP');
        const bmi = (userData.weight / Math.pow(userData.height / 100, 2)).toFixed(1);
        const blob = new Blob([`Precision Health Manager Report\n${dateStr}\nBMI: ${bmi}\n\n${shareText}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `Report_${dateStr.replace(/\//g, '-')}.txt`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    };
    const handleFeedbackSubmit = () => { if (!feedbackText.trim()) return; setFeedbackSent(true); setTimeout(() => { setFeedbackSent(false); setFeedbackText(''); }, 3000); };
    useEffect(() => { document.getElementById('dashboard-root')?.scrollIntoView({ behavior: 'smooth' }); }, [result]);

    const getAiAdvice = () => {
        const riskFactors = result.factors.filter(f => f.impact < 0).sort((a, b) => a.impact - b.impact);
        if (riskFactors.length === 0) return <span>素晴らしい健康管理です！現在の生活習慣はあなたの強力な資産になっています。</span>;
        const topRisks = riskFactors.slice(0, 2).map(f => {
            const map: Record<string, string> = { '現在喫煙': '禁煙', '運動不足': '運動習慣の定着', '多量飲酒': '節酒', '肥満': '減量', '野菜不足': '毎食の野菜摂取', '睡眠不足': '睡眠時間の確保', '社会的孤立': '社会参加・交流', 'ピロリ現感染': 'ピロリ菌除菌', '糖尿病': '血糖コントロール' };
            for (const k in map) if (f.label.includes(k)) return map[k];
            return '生活習慣の改善';
        });
        const adviceList = Array.from(new Set(topRisks)).join('・');
        return result.economic.potentialGain.value > 0
            ? <span>あなたの体にはまだ<span className="font-bold text-blue-600 text-lg mx-1"><CountUp end={result.economic.potentialGain.value} prefix="¥" /></span>分の「伸びしろ」があります！特に「{adviceList}」に取り組むことで、健康資産を大きく取り戻せる可能性があります。</span>
            : <span>人生100年時代、健康こそが最大の資産です。特に「{adviceList}」の見直しをお勧めします。</span>;
    };

    return (
        <div id="dashboard-root" className="space-y-6 pb-20 md:pb-0">
            {/* AIコーチ */}
            <div className="bg-blue-50/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 flex gap-4 items-start shadow-sm">
                <div className="bg-white p-3 rounded-full shrink-0 text-blue-600 shadow-sm"><HeartPulse className="w-8 h-8" /></div>
                <div className="flex-1"><h4 className="font-bold text-blue-800 mb-1">AIヘルスコーチ</h4><div className="text-slate-800 leading-relaxed">{getAiAdvice()}</div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl border text-center bg-white/80 backdrop-blur border-blue-100 shadow-md relative overflow-hidden">
                    <div className="text-sm text-slate-500 mb-1 font-bold">到達予測 (平均寿命)</div>
                    <div className="text-5xl font-black text-slate-800 tracking-tight"><CountUp end={deathYear} useGrouping={false} /><span className="text-lg font-bold ml-1 text-slate-500">年</span></div>
                    <div className="flex justify-center gap-2 mt-2 flex-wrap">
                        <div className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded">満 {result.lifespan}歳</div>
                        <div className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">生存確率50%: {result.median}歳</div>
                    </div>
                </div>
                <MetricCard label="推定余命 (あと何年)" value={result.le} unit="年" sub={`同年代平均: ${result.official}年`} decimals={1} />
                <MetricCard label="平均との差 (健康ボーナス)" value={result.diff} unit="年" prefix={result.diff >= 0 ? '+' : ''} highlight={result.diff >= 0} sub="生活習慣の積み重ねの結果" decimals={1} />
            </div>

            {/* 因子 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="border-b border-slate-100 pb-4 mb-4 font-bold text-lg text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded"><Activity className="w-5 h-5" /></div>寿命への影響因子
                </div>
                <div className="space-y-4">
                    {result.factors.map((f, i) => {
                        const isPositive = f.impact >= 0;
                        const width = Math.min(Math.abs(f.impact) * 8, 100);
                        return (
                            <div key={i} className="flex items-center text-sm group">
                                <div className="w-32 md:w-48 font-bold text-slate-600 truncate group-hover:text-blue-600 transition-colors" title={f.label}>{f.label}</div>
                                <div className="flex-1 mx-3 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`} style={{ width: `${width}%` }} />
                                </div>
                                <div className={`w-20 text-right font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>{isPositive ? '+' : ''}{f.impact.toFixed(1)}年</div>
                            </div>
                        );
                    })}
                    {result.factors.length === 0 && <div className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded">特筆すべき影響因子はありません</div>}
                </div>
                <RiskFactorTable />
            </div>

            {userData.age >= 75 && (
                <div className="bg-amber-50/80 backdrop-blur rounded-2xl border border-amber-200 p-6">
                    <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-6 h-6 text-amber-600" /><h3 className="font-bold text-lg text-amber-800">検診に関するお知らせ</h3></div>
                    <div className="bg-white/60 p-4 rounded-xl border border-amber-100 text-sm text-slate-700">75歳以上の検診はリスクとベネフィットを慎重に判断する必要があります。主治医とよく相談してください。</div>
                </div>
            )}

            {result.stomachRisk && <StomachCancerRisk result={result.stomachRisk} />}

            {/* 経済インパクト */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="border-b border-slate-100 pb-4 mb-4 font-bold text-lg text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded"><DollarSign className="w-5 h-5" /></div>経済的インパクト (65歳定年)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-5 rounded-xl border ${result.economic.currentLoss.value === 0 ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
                        <div className={`font-bold text-sm mb-1 ${result.economic.currentLoss.value === 0 ? 'text-slate-600' : 'text-rose-700'}`}>{result.economic.currentLoss.value === 0 ? '労働価値損失なし' : '⚠️ 現在の推定損失'}</div>
                        <div className={`text-3xl font-bold font-mono ${result.economic.currentLoss.value === 0 ? 'text-slate-600' : 'text-rose-600'}`}>{result.economic.currentLoss.value === 0 ? '¥0' : <span>-<CountUp end={result.economic.currentLoss.value} /></span>}</div>
                        {result.economic.currentLoss.value > 0 && <div className="text-[10px] text-rose-500 mt-2 font-bold">{formatRange(result.economic.currentLoss.min, result.economic.currentLoss.max)}</div>}
                    </div>
                    <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
                        <div className="font-bold text-sm text-emerald-800 mb-1">💰 獲得可能な「追加ボーナス」</div>
                        <div className="text-3xl font-bold font-mono text-emerald-600">+<CountUp end={result.economic.potentialGain.value} /></div>
                        {result.economic.potentialGain.value > 0 && <div className="text-[10px] text-emerald-600 mt-2 font-bold">{formatRange(result.economic.potentialGain.min, result.economic.potentialGain.max)}</div>}
                    </div>
                </div>
            </div>

            {/* チャート */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="border-b border-slate-100 pb-4 mb-4 font-bold text-lg text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded"><TrendingUp className="w-5 h-5" /></div>ライフコース・シミュレーション
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.curve} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="age" unit="歳" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis domain={[0, 1]} tickFormatter={(val) => `${Math.round(val * 100)}%`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)' }} formatter={(value: number | undefined) => [`${((value ?? 0) * 100).toFixed(1)}%`, '生存率']} labelFormatter={(l) => `${l}歳`} />
                            <Legend />
                            <ReferenceLine y={0.5} stroke="#cbd5e1" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="survival" stroke="#2563eb" strokeWidth={3} dot={false} name="あなた" animationDuration={2000} />
                            <Line type="monotone" dataKey="avgSurvival" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="平均" animationDuration={2000} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* フィードバック & アクション */}
            <div className="bg-slate-100/80 backdrop-blur rounded-2xl p-6 border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><ThumbsUp className="w-4 h-4" /> フィードバック</h4>
                <div className="flex gap-2">
                    <input type="text" className="flex-1 p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 outline-none" placeholder="改善要望などを入力..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
                    <button onClick={handleFeedbackSubmit} disabled={feedbackSent} className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${feedbackSent ? 'bg-green-500 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>{feedbackSent ? <Send className="w-4 h-4" /> : '送信'}</button>
                </div>
                {feedbackSent && <span className="text-xs text-green-600 mt-2 block font-bold">フィードバックを送信しました。</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setIsShareModalOpen(true)} className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.01] transition-all"><Share2 className="w-5 h-5" /> 結果をシェア</button>
                <button onClick={() => copyResult(shareText)} className="flex items-center justify-center gap-2 p-4 bg-slate-700 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 hover:scale-[1.01] transition-all"><Copy className="w-5 h-5" /> 結果をコピー</button>
                <button onClick={handleDownloadReport} className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.01] transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">Pro Feature</div>
                    <Download className="w-5 h-5 relative z-10" /> <span className="relative z-10">レポート保存 (.txt)</span>
                </button>
            </div>

            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} shareText={shareText} groupShareText={groupShareText} appUrl={appUrl} onCopy={copyResult} />
            {actionFeedback && (<div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 text-sm font-bold py-3 px-6 rounded-full shadow-2xl ${actionFeedback.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{actionFeedback.type === 'success' && <Check className="w-4 h-4 inline mr-2" />}{actionFeedback.msg}</div>)}
        </div>
    );
};

const MetricCard = ({ label, value, unit, sub, prefix = '', highlight, decimals = 0 }: { label: string; value: number; unit: string; sub: string; prefix?: string; highlight?: boolean; decimals?: number }) => (
    <div className={`p-6 rounded-2xl border text-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg ${highlight ? 'bg-blue-50/80 border-blue-200' : 'bg-white/80 border-slate-100 shadow-sm'}`}>
        <div className="text-sm text-slate-500 mb-1 font-bold">{label}</div>
        <div className={`text-4xl font-black ${highlight ? 'text-blue-600' : 'text-slate-800'} tracking-tight`}>{prefix}<CountUp end={value} decimals={decimals} /><span className="text-lg font-bold ml-1 text-slate-400">{unit}</span></div>
        <div className="text-xs text-slate-400 mt-2 font-medium bg-slate-100/50 inline-block px-2 py-0.5 rounded">{sub}</div>
    </div>
);

export default Dashboard;
