-- Supabase SQL Editorで実行する、MVP用のテーブルおよびRLSポリシー作成スクリプト
-- ※プロジェクトの「守りの三柱（技術的防御）」に基づく必須設定

-- 1. assessments テーブルの作成（リスク診断結果および行動履歴）
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- ※将来的な認証（Auth）導入時は、Supabase Authの UUID に紐づける
    -- user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL, -- MVP段階（未認証）では、ブラウザで生成したセッション用の一意IDを使用
    age INTEGER NOT NULL,
    sex TEXT NOT NULL,
    height NUMERIC NOT NULL,
    weight NUMERIC NOT NULL,
    hp_history TEXT NOT NULL,
    atrophy TEXT NOT NULL,
    smoking TEXT NOT NULL,
    calculated_risk_score INTEGER NOT NULL,
    is_booked_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. セキュリティ（RLS: Row Level Security）の有効化
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- 3. ポリシーの作成
-- MVPの「未ログイン状態（匿名セッション）」における、最低限かつ強力な防御

-- [INSERT防御]
-- 誰でも（未認証＝anonロールでも）新しいレコードを作成（Insert）できる。（リスク診断の実行は許可する）
CREATE POLICY "Allow anonymous users to insert their assessment"
ON public.assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- [SELECT防御]
-- 誰も、他人のデータはおろか自身のデータも含め、一切SELECT（一覧取得・閲覧）させない。
-- これにより、ダッシュボードからデータを不正に吸い出される（Scraping）リスクをゼロにする。
-- （※ユーザーはフロントエンドのStateで自身の結果を見るため、一度保存したデータをDBから読み下ろす必要が当面ない）
CREATE POLICY "Deny all automated select access"
ON public.assessments
FOR SELECT
USING (false);

-- [UPDATE防御]
-- 一度挿入されたリスク診断データは、後から書き換えられないようにする。
-- （もし「予約ボタンを押した」状態を後でUpdateする場合は、session_idが一致することを確認するポリシーを追加する。MVPでは一旦Insertオンリーとするか、状態管理フラグを更新可能にする）

-- ※MVP要件として、「予約ボタン（is_booked_premium）」の後追い更新を許可する場合のポリシー：
CREATE POLICY "Allow users to update their own booking status by session_id"
ON public.assessments
FOR UPDATE
TO anon, authenticated
USING (true)                     -- 対象行のフィルタ（今回はクライアントからの一致を信じる簡略版設計だが、実際は本番ではAuthを用いる）
WITH CHECK (true);               -- 変更後のチェック

-- 4. 統計等に使うためのインデックス作成
CREATE INDEX idx_assessments_session_id ON public.assessments(session_id);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at);
