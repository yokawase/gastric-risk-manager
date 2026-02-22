"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingDown, Stethoscope, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

type FormState = {
  age: number;
  sex: string;
  height: number;
  weight: number;
  hpHistory: string;
  atrophy: string;
  smoking: string;
  annualIncome: number;
};

type RiskResponse = {
  finalRiskScore: number;
  formattedLoss: string;
  xaiData: Array<{ name: string; value: number }>;
};

export default function App() {
  const [step, setStep] = useState<"form" | "failsafe" | "dashboard">("form");
  const [agreed, setAgreed] = useState(false);
  const [apiResult, setApiResult] = useState<RiskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 匿名セッション維持のためのState
  const [sessionId] = useState(() => uuidv4());

  const [formData, setFormData] = useState<FormState>({
    age: 45,
    sex: "男性",
    height: 170,
    weight: 65,
    hpHistory: "不明",
    atrophy: "不明",
    smoking: "なし",
    annualIncome: 5000000,
  });

  const bmi = formData.weight / Math.pow(formData.height / 100, 2);

  const handleCalculate = async () => {
    // === フェイルセーフ判定 ===
    if (formData.hpHistory === "不明" || formData.atrophy === "不明") {
      setStep("failsafe");
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/calculate_risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: RiskResponse = await response.json();
      setApiResult(data);
      setStep("dashboard");

      // === Supabase Data Persistance ===
      try {
        const { error } = await supabase.from('assessments').insert([{
          session_id: sessionId,
          age: formData.age,
          sex: formData.sex,
          height: formData.height,
          weight: formData.weight,
          hp_history: formData.hpHistory,
          atrophy: formData.atrophy,
          smoking: formData.smoking,
          calculated_risk_score: data.finalRiskScore,
          is_booked_premium: false
        }]);
        if (error) console.error("Supabase insert error:", error);
      } catch (dbError) {
        console.error("DB connection error:", dbError);
      }

    } catch (error) {
      console.error("API error:", error);
      alert("計算サーバーへの接続に失敗しました。サーバーが起動しているか確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async () => {
    try {
      // 予約ボタン押下時にフラグを更新（MVP要件: 行動変容の測定）
      const { error } = await supabase
        .from('assessments')
        .update({ is_booked_premium: true })
        .eq('session_id', sessionId);

      if (error) console.error("Supabase update error:", error);
    } catch (dbError) {
      console.error("DB connection error:", dbError);
    }
    alert("優先枠の予約手配へ進みます！（※デモ用モック）");
  };

  const handleReset = () => {
    setStep("form");
    setAgreed(false);
  };

  // === Views ===
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="text-blue-600" />
            Precision Health
          </div>
          {step !== "form" && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
              戻る
            </Button>
          )}
        </h1>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6 mt-2 relative overflow-hidden">
        <AnimatePresence mode="wait">

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <Card className="shadow-lg border-t-4 border-t-blue-500">
                <CardHeader>
                  <CardTitle>リスク評価情報の入力</CardTitle>
                  <CardDescription>より正確なAIハザードスコアを算出するため、現在の状態を教えてください。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* 年齢と性別 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>年齢 (歳)</Label>
                      <Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>性別</Label>
                      <Select value={formData.sex} onValueChange={(val) => setFormData({ ...formData, sex: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="男性">男性</SelectItem>
                          <SelectItem value="女性">女性</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 身長体重・BMI */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>身長 (cm)</Label>
                      <Input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>体重 (kg)</Label>
                      <Input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-md text-sm text-center text-slate-600 font-medium flex items-center justify-center gap-2">
                    <Activity size={16} /> リアルタイムBMI: {bmi.toFixed(1)}
                  </div>

                  {/* 病歴と喫煙 */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-red-500 font-bold">ピロリ菌感染歴 <span className="text-xs font-normal text-slate-500">*必須</span></Label>
                    <Select value={formData.hpHistory} onValueChange={(val) => setFormData({ ...formData, hpHistory: val })}>
                      <SelectTrigger className="border-red-200 focus:ring-red-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="未感染">未感染（一度も感染していない）</SelectItem>
                        <SelectItem value="除菌済">除菌済（過去に感染していた）</SelectItem>
                        <SelectItem value="現感染">現感染（現在感染している）</SelectItem>
                        <SelectItem value="不明">不明（調べたことがない）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-red-500 font-bold">萎縮性胃炎の程度 <span className="text-xs font-normal text-slate-500">*必須</span></Label>
                    <Select value={formData.atrophy} onValueChange={(val) => setFormData({ ...formData, atrophy: val })}>
                      <SelectTrigger className="border-red-200 focus:ring-red-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="なし">なし</SelectItem>
                        <SelectItem value="軽度萎縮">軽度萎縮</SelectItem>
                        <SelectItem value="中等度萎縮">中等度萎縮</SelectItem>
                        <SelectItem value="高度萎縮">高度萎縮</SelectItem>
                        <SelectItem value="不明">不明（胃カメラをしたことがない等）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label>喫煙歴</Label>
                    <Select value={formData.smoking} onValueChange={(val) => setFormData({ ...formData, smoking: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="あり">あり</SelectItem>
                        <SelectItem value="なし">なし</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>概算年収 (円) <span className="text-xs text-slate-400">※経済的損失シミュレーション用</span></Label>
                    <Select value={formData.annualIncome.toString()} onValueChange={(val) => setFormData({ ...formData, annualIncome: Number(val) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3000000">300万円 〜</SelectItem>
                        <SelectItem value="5000000">500万円 〜</SelectItem>
                        <SelectItem value="7000000">700万円 〜</SelectItem>
                        <SelectItem value="10000000">1000万円 〜</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-md" onClick={handleCalculate} disabled={isLoading}>
                    {isLoading ? "解析中..." : "AIスコアを解析する"} <ChevronRight className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "failsafe" && (
            <motion.div
              key="failsafe"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <Card className="border-t-4 border-t-orange-500 bg-orange-50 pb-4 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-orange-700 flex items-center justify-center gap-2 text-xl">
                    <AlertTriangle size={28} />
                    正確な解析ができません
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700 space-y-4 text-sm px-6">
                  <p>
                    「ピロリ菌感染歴」または「萎縮性胃炎の程度」が<strong>不明</strong>なため、AIによるハザードスコアの算出を一時中断しました。
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-2">なぜ中断されたのか？</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      不確かな情報に基づくスコアは、<strong>あなたに誤った安心感を与えてしまう危険性</strong>があるためです（医療倫理における『無害の原則』）。<br /><br />
                      胃がんリスクを正確に測るためには、年齢だけでなく「今の胃の状態」を知ることが不可欠です。
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="font-bold text-center mb-4">まずは現状を知る一歩を。</p>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 font-bold shadow mb-3">
                      まずはピロリ菌感染診断をしましょう
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* User Info Bar */}
              <div className="flex justify-between items-center text-sm text-slate-500 px-1 border-b pb-2">
                <span>{formData.age}歳 {formData.sex}</span>
                <span>BMI: {bmi.toFixed(1)}</span>
              </div>

              {/* AI Risk Score Card */}
              <Card className="border-t-4 border-t-red-500 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">あなたのAI胃がんリスク</CardTitle>
                  <CardDescription>入力データに基づく解析結果</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-6xl font-extrabold text-red-600 mb-2">
                    {apiResult?.finalRiskScore || 0}
                    <span className="text-2xl text-slate-500 font-normal">/100</span>
                  </div>
                  <Progress value={apiResult?.finalRiskScore || 0} className="h-3 w-full bg-slate-100" />
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {formData.atrophy === "高度萎縮" && <Badge variant="destructive" className="bg-red-100 text-red-700">高度萎縮リスク</Badge>}
                    {formData.hpHistory === "除菌済" && <Badge variant="secondary" className="bg-orange-100 text-orange-700">ピロリ除菌後</Badge>}
                    {formData.hpHistory === "現感染" && <Badge variant="destructive" className="bg-red-200 text-red-800">ピロリ現感染</Badge>}
                  </div>
                </CardContent>
              </Card>

              {/* XAI Tornado Chart */}
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    リスクの押し上げ要因（XAI）
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={apiResult?.xaiData || []} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {(apiResult?.xaiData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-500 mt-2">
                    国が定める年齢基準よりも、あなたの「感染・萎縮スコア」がより強い影響を与えています。
                  </p>
                </CardContent>
              </Card>

              {/* Loss Aversion Nudge */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <AlertTriangle size={20} />
                    経済的シミュレーション
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-4">
                    もし現在の画一的検診基準（2年に1回）に従った場合、重度発見による休職・退職で以下の生涯労働価値を失うリスクがあります。
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-sm text-red-400 mb-1">想定機会損失額</span>
                    <span className="text-3xl font-bold text-red-500 tracking-tight">-{apiResult?.formattedLoss || "0"}</span>
                    <span className="text-sm text-slate-300 mb-1">円</span>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 flex flex-col gap-4">
                <h3 className="font-bold text-lg text-center text-slate-800">
                  あなたに最適な選択肢
                </h3>

                <button className="w-full relative group overflow-hidden rounded-lg bg-white border-2 border-slate-200 p-4 text-left transition-all hover:border-slate-300">
                  <div className="flex justify-between items-center opacity-60">
                    <div>
                      <div className="font-medium text-slate-600">国の基準に従う</div>
                      <div className="text-xs text-slate-400 mt-1">リスク許容（50歳まで待機）</div>
                    </div>
                    <TrendingDown className="text-slate-400" />
                  </div>
                </button>

                <button
                  onClick={() => setAgreed(true)}
                  className={`w-full relative group overflow-hidden rounded-lg p-4 text-left transition-all shadow-md ${agreed ? 'bg-blue-600 border-2 border-blue-600' : 'bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-transparent'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-lg">個別化内視鏡プラン</div>
                      <div className="text-xs text-blue-100 mt-1">あなた専用の優先枠を確保し、早期発見へ</div>
                    </div>
                    {agreed ? <CheckCircle2 className="text-white" size={28} /> : <div className="h-7 w-7 rounded-full border-2 border-blue-200" />}
                  </div>
                </button>

                <Button
                  disabled={!agreed}
                  size="lg"
                  className={`w-full mt-2 font-bold shadow-lg transition-all ${agreed ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                  onClick={handleBook}
                >
                  優先枠を予約する
                </Button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="bg-slate-100 text-slate-500 text-xs py-6 mt-12 border-t border-slate-200">
        <div className="max-w-md mx-auto px-4 flex flex-col items-center gap-2">
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-800 transition-colors">利用規約</a>
            <a href="#" className="hover:text-slate-800 transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-slate-800 transition-colors">特定商取引法に基づく表記</a>
          </div>
          <p className="mt-2 text-slate-400">
            &copy; {new Date().getFullYear()} Precision Health Manager.
          </p>
        </div>
      </footer>
    </div>
  );
}
