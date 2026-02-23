import { UserData, StomachCancerResult } from '../types';

const COEFFICIENTS = {
    intercept: -5.0,                         // [UPDATE] より実態に近いスケールへ引き上げ
    birth_year_cat: { 1990: 0, 1980: 0.2, 1970: 0.5, 1960: 0.9, 1950: 1.4, 1940: 2.0 },
    sex_M: 0.6,
    pylori_infected: 3.0,                    // [UPDATE] 現感染リスクを強化
    pylori_eradicated: 1.5,                  // [UPDATE] 除菌後の残存リスクを正当に評価
    atrophy_yes: 2.0,                        // [UPDATE] 粘膜リスクを最重要視
    family_history_yes: 0.5,
    diabetes_yes: 0.2,
    smoking_current: 0.8,
    smoking_past: 0.3,
    drinking_heavy: 0.6,
    drinking_moderate: 0.2,
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

    const rawProb = 1 / (1 + Math.exp(-logit));
    const normalizedScore = Math.round(rawProb * 98) + 1;

    let level: StomachCancerResult['level'] = 'low';
    let advice = '';

    if (rawProb < THRESHOLDS.medium) {
        level = 'low';
        advice = data.age < 50
            ? '現在のリスクは低い状態です。良好な生活習慣を維持し、50歳になったら国の指針に従って市区町村の定期的な胃がん検診を開始しましょう。'
            : '現在のリスクは低い状態です。国の推奨通り、2年に1回の定期的な胃がん検診を確実に受診し、健康維持に努めましょう。';
    } else if (rawProb < THRESHOLDS.high) {
        level = 'medium';
        advice = data.age < 50
            ? '50歳未満のため国の定期検診対象外ですが、リスク因子が認められます。将来の健康のため、今のうちから専門医へ相談し、内視鏡検査の必要性を検討しましょう。'
            : '国の検診推奨年齢です。2年に1回の定期受診に加え、現在のリスク因子に応じた最適なフォローアップ内容を専門医と調整してください。';
    } else {
        level = 'high';
        advice = data.age < 50
            ? '50歳未満で国の検診対象外ですが、リスク因子があるため制度を待たずに専門医の受診を強く推奨します（医学的死角への対応）。速やかに相談してください。'
            : '国の検診対象年齢であり、かつ高リスクな状態です。隔年ではなく年1回程度の精密な経過観察について、消化器内科の専門医と詳しく相談してください。';
    }

    const sortedContributions = contributions
        .filter((c) => c.value !== 0)
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .map((c) => ({ label: c.label, value: c.value, isPositive: c.value > 0 }));

    return { score: normalizedScore, level, advice, contributions: sortedContributions };
};
