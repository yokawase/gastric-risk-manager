import { UserData, StomachCancerResult } from '../types';

const COEFFICIENTS = {
    intercept: -5.0,
    birth_year_cat: { 1990: 0, 1980: 0.2, 1970: 0.5, 1960: 0.9, 1950: 1.4, 1940: 2.0 },
    sex_M: 0.6,
    pylori_infected: 3.0,
    pylori_eradicated: 1.5,
    atrophy_yes: 2.0,
    family_history_yes: 0.8,                 // SHAP重要度高: ベースライン
    diabetes_yes: 0.2,
    smoking_current: 0.8,
    smoking_past: 0.3,
    drinking_heavy: 0.6,
    drinking_moderate: 0.2,

    // AI Deep Phenotyping - Red Flags (SHAP上位)
    sys_black_stool: 2.5,
    sys_nausea: 1.2,

    // AI Deep Phenotyping - Digestive (SHAP上位)
    sys_distending_pain: 1.1,
    sys_belching: 1.3,
    sys_hypo_pain: 0.9,
    sys_water_brash: 1.0,
    sys_abd_distention: 1.2,

    // AI Deep Phenotyping - TCM / Lifestyle (SHAP上位・未病)
    life_temp_pref_hot: 0.8,
    life_temp_pref_cold: 0.5,
    life_cold_limbs: 0.7,
    life_bitter_taste: 1.1,
};

const THRESHOLDS = { medium: 0.15, high: 0.35 }; // [UPDATE] 新しいスケールに合わせて閾値を調整

export const calculateStomachRisk = (data: UserData): StomachCancerResult => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - data.age;
    let birthDecadeKey: keyof typeof COEFFICIENTS.birth_year_cat = 1990;
    if (birthYear >= 1990) birthDecadeKey = 1990;
    else if (birthYear >= 1980) birthDecadeKey = 1980;
    else if (birthYear >= 1970) birthDecadeKey = 1970;
    else if (birthYear >= 1960) birthDecadeKey = 1960;
    else if (birthYear >= 1950) birthDecadeKey = 1950;
    else birthDecadeKey = 1940;

    if (data.pylori === 'unknown' || data.atrophic_gastritis === 'unknown') {
        return {
            score: 0,
            level: 'unknown',
            advice: '正確なリスクを判定するには、ピロリ菌検査と萎縮性胃炎(胃カメラ等)の情報が重要です。まずはかかりつけ医にご相談ください。',
            contributions: [],
        };
    }

    let logit = COEFFICIENTS.intercept;
    const contributions: { label: string; value: number }[] = [];

    const birthVal = COEFFICIENTS.birth_year_cat[birthDecadeKey];
    logit += birthVal;
    contributions.push({ label: '年代', value: birthVal });

    const sexVal = data.sex === 'male' ? COEFFICIENTS.sex_M : 0;
    logit += sexVal;
    contributions.push({ label: '性別', value: sexVal });

    let pyloriVal = 0;
    if (data.pylori === 'current') pyloriVal = COEFFICIENTS.pylori_infected;
    else if (data.pylori === 'eradicated') pyloriVal = COEFFICIENTS.pylori_eradicated;
    logit += pyloriVal;
    contributions.push({ label: 'ピロリ菌', value: pyloriVal });

    const atrophyVal = data.atrophic_gastritis === 'yes' ? COEFFICIENTS.atrophy_yes : 0;
    logit += atrophyVal;
    contributions.push({ label: '萎縮性胃炎', value: atrophyVal });

    const famVal = data.fam_cancer ? COEFFICIENTS.family_history_yes : 0;
    logit += famVal;
    contributions.push({ label: '家族歴', value: famVal });

    const dmVal = data.dm ? COEFFICIENTS.diabetes_yes : 0;
    logit += dmVal;
    contributions.push({ label: '糖尿病', value: dmVal });

    let smokeVal = 0;
    if (data.smoking === 'current') smokeVal = COEFFICIENTS.smoking_current;
    else if (data.smoking === 'past') smokeVal = COEFFICIENTS.smoking_past;
    logit += smokeVal;
    contributions.push({ label: '喫煙', value: smokeVal });

    let drinkVal = 0;
    if (data.alcohol === 'heavy') drinkVal = COEFFICIENTS.drinking_heavy;
    else if (data.alcohol === 'moderate') drinkVal = COEFFICIENTS.drinking_moderate;
    logit += drinkVal;
    contributions.push({ label: '飲酒', value: drinkVal });

    // --- AI Deep Phenotyping ---
    if (data.sys_black_stool) { logit += COEFFICIENTS.sys_black_stool; contributions.push({ label: '黒色便', value: COEFFICIENTS.sys_black_stool }); }
    if (data.sys_nausea) { logit += COEFFICIENTS.sys_nausea; contributions.push({ label: '吐き気', value: COEFFICIENTS.sys_nausea }); }

    if (data.sys_distending_pain) { logit += COEFFICIENTS.sys_distending_pain; contributions.push({ label: '膨満痛', value: COEFFICIENTS.sys_distending_pain }); }
    if (data.sys_belching) { logit += COEFFICIENTS.sys_belching; contributions.push({ label: 'げっぷ', value: COEFFICIENTS.sys_belching }); }
    if (data.sys_hypo_pain) { logit += COEFFICIENTS.sys_hypo_pain; contributions.push({ label: '季肋部痛', value: COEFFICIENTS.sys_hypo_pain }); }
    if (data.sys_water_brash) { logit += COEFFICIENTS.sys_water_brash; contributions.push({ label: '呑酸', value: COEFFICIENTS.sys_water_brash }); }
    if (data.sys_abd_distention) { logit += COEFFICIENTS.sys_abd_distention; contributions.push({ label: '腹部膨満', value: COEFFICIENTS.sys_abd_distention }); }

    if (data.life_temp_pref === 'very_hot') { logit += COEFFICIENTS.life_temp_pref_hot; contributions.push({ label: '熱い食事の嗜好', value: COEFFICIENTS.life_temp_pref_hot }); }
    else if (data.life_temp_pref === 'cold') { logit += COEFFICIENTS.life_temp_pref_cold; contributions.push({ label: '冷たい食事の嗜好', value: COEFFICIENTS.life_temp_pref_cold }); }

    if (data.life_cold_limbs) { logit += COEFFICIENTS.life_cold_limbs; contributions.push({ label: '四肢の冷え', value: COEFFICIENTS.life_cold_limbs }); }
    if (data.life_bitter_taste) { logit += COEFFICIENTS.life_bitter_taste; contributions.push({ label: '口の苦味', value: COEFFICIENTS.life_bitter_taste }); }

    const rawProb = 1 / (1 + Math.exp(-logit));
    const normalizedScore = Math.round(rawProb * 98) + 1;

    let level: StomachCancerResult['level'] = 'low';
    let advice = '';

    // XAIに基づいたパーソナライズドアドバイスの生成
    const riskSymptoms = contributions.filter(c =>
        ['黒色便', '吐き気', 'げっぷ', '口の苦味', '熱い食事の嗜好', '膨満痛', '腹部膨満'].includes(c.label)
    ).map(c => c.label);

    if (rawProb < THRESHOLDS.medium) {
        level = 'low';
        advice = data.age < 50
            ? '現在のリスクは低い状態です。良好な生活習慣を維持し、50歳になったら国の指針に従って市区町村の定期検診を開始しましょう。'
            : '現在のリスクは低い状態です。国の推奨通り、2年に1回の内視鏡検診を確実に受診し、健康維持に努めましょう。';
        if (riskSymptoms.length > 0) {
            advice += ` ただし、アプリのAIは「${riskSymptoms.join('・')}」といった未病サインを検知しています。症状が続く場合は念のため医療機関へご相談ください。`;
        }
    } else if (rawProb < THRESHOLDS.high) {
        level = 'medium';
        advice = data.age < 50
            ? '50歳未満のため国の定期検診対象外ですが、リスク因子が認められます。'
            : '国の検診推奨年齢です。2年に1回の定期受診に加え、現在のリスク因子に応じたフォローアップが必要です。';

        if (riskSymptoms.length > 0) {
            advice += ` AIの分析（SHAP）により、「${riskSymptoms.join('・')}」といった自覚症状が前がん病変（萎縮性胃炎など）のリスクとして抽出されました。将来の健康価値を守るため、早期に消化器内科で内視鏡検査を受診することを推奨します。`;
        } else {
            advice += ' 専門医へ相談し、内視鏡検査の必要性について検討しましょう。';
        }
    } else {
        level = 'high';
        advice = data.age < 50
            ? '50歳未満で国の検診対象外ですが、極めて高いリスクスコアが算出されました。'
            : '国の検診対象年齢かつAI高リスク群です。';

        if (riskSymptoms.length > 0) {
            advice += ` AIは過去の背景リスクに加え、「${riskSymptoms.join('・')}」といった危険なアラート（Red Flags）を検知しました。制度を待たずに、医学的死角への早急な対応として専門医（内視鏡）を至急受診してください。`;
        } else {
            advice += ' 隔年ではなく年1回程度の精密な経過観察について、消化器内科の専門医と詳しく相談してください。';
        }
    }

    const sortedContributions = contributions
        .filter((c) => c.value !== 0)
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .map((c) => ({ label: c.label, value: c.value, isPositive: c.value > 0 }));

    return { score: normalizedScore, level, advice, contributions: sortedContributions };
};
