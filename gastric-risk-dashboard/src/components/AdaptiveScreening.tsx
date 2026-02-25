"use client";
import React, { useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Activity, Users, Microscope, AlertTriangle, BrainCircuit, LineChart as ChartIcon,
    MessageSquare, ShieldCheck, ArrowRight, Database
} from 'lucide-react';

// モックデータ: マクロ分析（コストと発見率の比較）
const macroData = [
    { name: '従来型(一律)', cost: 100, discovery: 40, label: '一律内視鏡' },
    { name: '層別化(ABC等)', cost: 70, discovery: 60, label: 'リスク層別' },
    { name: 'AI層別化', cost: 65, discovery: 95, label: 'AI最適化' },
];

// モックデータ: 時系列モニタリング
const monitoringData = [
    { month: '1月', hb: 13.5, pep: 50, risk: 10 },
    { month: '2月', hb: 13.4, pep: 48, risk: 12 },
    { month: '3月', hb: 13.2, pep: 45, risk: 15 },
    { month: '4月', hb: 12.8, pep: 40, risk: 25 },
    { month: '5月', hb: 12.0, pep: 30, risk: 65 }, // 急激な変化
    { month: '6月', hb: 11.5, pep: 25, risk: 85 },
];

// モックデータ: AI問診チャット履歴
const initialChat = [
    { role: 'assistant', text: 'こんにちは。AIヘルスナビゲーターです。胃の調子や体調について、気になることはありますか？' },
    { role: 'user', text: '最近、少し胃が重い気がします。あと、祖母が40代で胃がんになりました。' },
    { role: 'assistant', text: 'ご祖母様のご病気、ご心配ですね。若年での発症ということでお伺いしますが、ご親戚に乳がんを患ったかたはいらっしゃいますか？' },
    { role: 'user', text: 'はい、母の妹が乳がんを経験しています。' },
    { role: 'assistant', text: '貴重な情報をありがとうございます。一部の遺伝性腫瘍（HDGC等）の関連が疑われるパターンです。年齢基準にかかわらず、早期に専門医の診察と内視鏡検査を受けることを強くお勧めします。ファストパス（優先予約）を発行しますか？' }
];

export default function AdaptiveScreening() {
    const [activeSubTab, setActiveSubTab] = useState<'macro' | 'ai_chat' | 'monitor'>('macro');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
                    <BrainCircuit className="text-indigo-600 w-7 h-7" />
                    次世代・胃がん検診個別化ダッシュボード
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                    「マス・スクリーニングの最適化」と「若年ハイリスク者の救済」を両立するアダプティブ戦略の中枢です。
                </p>

                {/* サブタブナビゲーション */}
                <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button
                        onClick={() => setActiveSubTab('macro')}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeSubTab === 'macro' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        <ChartIcon className="w-4 h-4" /> マクロ分析 (集団最適化)
                    </button>
                    <button
                        onClick={() => setActiveSubTab('ai_chat')}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeSubTab === 'ai_chat' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> AI個別化問診 (外れ値抽出)
                    </button>
                    <button
                        onClick={() => setActiveSubTab('monitor')}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeSubTab === 'monitor' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50'}`}
                    >
                        <Activity className="w-4 h-4" /> 時系列異常検知 (モニタリング)
                    </button>
                </div>

                {/* コンテンツエリア */}
                <div className="min-h-[400px]">
                    {activeSubTab === 'macro' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-200 to-indigo-100 rounded-bl-full opacity-50"></div>
                                    <div className="text-indigo-600 font-bold text-sm mb-1 flex items-center gap-1"><Users className="w-4 h-4" /> 検診カバー率</div>
                                    <div className="text-3xl font-black text-slate-800">100<span className="text-lg text-slate-500 font-bold">%</span></div>
                                    <p className="text-xs text-slate-500 mt-2">年齢・リスクに応じた最適化されたアプローチ</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-200 to-emerald-100 rounded-bl-full opacity-50"></div>
                                    <div className="text-emerald-600 font-bold text-sm mb-1 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> 早期発見率</div>
                                    <div className="text-3xl font-black text-slate-800">95<span className="text-lg text-slate-500 font-bold">%</span></div>
                                    <p className="text-xs text-slate-500 mt-2">一律検診(40%)から大幅な向上</p>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-100 rounded-bl-full opacity-50"></div>
                                    <div className="text-amber-600 font-bold text-sm mb-1 flex items-center gap-1"><Database className="w-4 h-4" /> NNT最適化</div>
                                    <div className="text-3xl font-black text-slate-800">-35<span className="text-lg text-slate-500 font-bold">%</span></div>
                                    <p className="text-xs text-slate-500 mt-2">不必要な内視鏡検査の削減（医療費抑制）</p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-6">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <ChartIcon className="w-5 h-5 text-indigo-500" />
                                    スクリーニング戦略のコスト・効果比較
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={macroData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} />
                                            <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="cost" name="相対コスト (100=従来型)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                            <Bar yAxisId="right" dataKey="discovery" name="早期発見スコア" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
                                    <span className="font-bold text-slate-800">Insight:</span> 低リスク層への一律な胃カメラを減らし（引き算）、浮いたリソースを若年層ハイリスク者の精密検査に振り向ける（足し算）ことで、全体のコストを抑えつつ早期発見率を劇的に引き上げます。
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'ai_chat' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-4 items-start">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-indigo-900 mb-1">TCM(東洋医学) × 家族歴ディープフェノタイピング</h4>
                                    <p className="text-sm text-indigo-700/80">
                                        一律の問診票ではこぼれ落ちる「微細な兆候」や「複雑な家族歴」をAIが対話から拾い上げ、制度の死角（若年での未病）を発見します。
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-[400px] flex flex-col">
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {initialChat.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white shadow-md'}`}>
                                                {msg.role === 'user' ? <Users className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                                            </div>
                                            <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-white border border-slate-200 text-slate-700 rounded-tr-none' : 'bg-indigo-600 text-white rounded-tl-none shadow-sm'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-bold text-slate-400">シミュレーション用モック</div>
                                    <div className="flex gap-2 opacity-50 pointer-events-none">
                                        <input type="text" placeholder="症状やご家族の病歴を教えてください..." className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white" disabled />
                                        <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                                            送信 <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'monitor' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-4 items-start">
                                <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-rose-900 mb-1">AI 変化点検知 (Change Point Detection)</h4>
                                    <p className="text-sm text-rose-700/80">
                                        特定の検査値（Hbやペプシノゲン等）の「基準値内での微小な変動トレンド」をAIが監視し、人間が見逃しやすい異常の兆候を捉えます。
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-6">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-rose-500" />
                                    バイオマーカーの時系列推移とリスクスコア
                                </h3>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monitoringData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="left" orientation="left" domain={['dataMin - 1', 'dataMax + 1']} stroke="#0ea5e9" axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#f43f5e" axisLine={false} tickLine={false} />
                                            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="hb" name="血色素量(Hb)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line yAxisId="right" type="monotone" dataKey="risk" name="AI推計リスク(%)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-6 flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3">
                                        <Microscope className="w-6 h-6 text-slate-400 shrink-0" />
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">Hbの微減トレンド検知</div>
                                            <div className="text-xs text-slate-500 mt-1">基準値内（12.0等）であっても、継続的な低下傾向から出血性病変（胃がん等）のリスク上昇を示唆。</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-3">
                                        <Activity className="w-6 h-6 text-rose-500 shrink-0" />
                                        <div>
                                            <div className="text-sm font-bold text-rose-700">アクション推奨</div>
                                            <div className="text-xs text-rose-600/80 mt-1">AIリスクスコアが急騰しています（+40pt）。直ちに精密検査（胃カメラ）を受診してください。</div>
                                            <button className="mt-3 px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-md hover:bg-rose-700 transition-colors">
                                                予約枠を確認する
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
