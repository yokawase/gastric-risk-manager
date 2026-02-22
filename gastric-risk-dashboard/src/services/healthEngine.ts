import { UserData, SimulationResult, EconomicValue } from '../types';
import { CONST_EX_MALE, CONST_EX_FEMALE, CONST_QX_MALE, CONST_QX_FEMALE, ANNUAL_HOURS, RETIREMENT_AGE, WAGE_STATS } from '../constants';
import { calculateStomachRisk } from './stomachCancerEngine';

interface Factor { label: string; hr: number; }

const simulate = (startAge: number, sex: 'male' | 'female', hr: number) => {
    const qx_data = sex === 'male' ? CONST_QX_MALE : CONST_QX_FEMALE;
    let lx = 1.0;
    let le = 0.0;
    const curve: number[] = [];
    const safeStartAge = Math.min(startAge, qx_data.length - 1);

    for (let t = safeStartAge; t < 115; t++) {
        let q_base = t < qx_data.length ? qx_data[t] : 1.0;
        let q_adj = 1 - Math.pow(1 - q_base, hr);
        if (q_adj > 1.0) q_adj = 1.0;
        const lx_next = lx * (1 - q_adj);
        le += (lx + lx_next) / 2.0;
        curve.push(lx);
        lx = lx_next;
        if (lx < 0.0001) break;
    }
    return { le, curve };
};

const calculateExpectedEarnings = (age: number, curve: number[]): EconomicValue => {
    let sumMean = 0, sumMin = 0, sumMax = 0;
    const yearsToWork = Math.max(0, RETIREMENT_AGE - age);

    for (let i = 0; i < yearsToWork; i++) {
        const probAlive = curve[i] || 0;
        sumMean += probAlive * WAGE_STATS.MEAN * ANNUAL_HOURS;
        sumMin += probAlive * WAGE_STATS.LOWER * ANNUAL_HOURS;
        sumMax += probAlive * WAGE_STATS.UPPER * ANNUAL_HOURS;
    }
    return { value: sumMean, min: sumMin, max: sumMax };
};

export const runHealthAnalysis = (data: UserData): SimulationResult => {
    const { age, sex, height, weight } = data;
    const ex_table = sex === 'male' ? CONST_EX_MALE : CONST_EX_FEMALE;
    const official_ex = age < ex_table.length ? ex_table[age] : 0;

    const factors: Factor[] = [];
    let hr_total = 1.0;

    // BMI
    if (height > 0 && weight > 0) {
        const bmi = weight / Math.pow(height / 100, 2);
        if (bmi < 18.5) {
            const isElderly = age >= 75;
            factors.push({ label: isElderly ? '低体重(フレイル)' : '低体重', hr: isElderly ? 1.8 : 1.6 });
        } else if (bmi >= 30) factors.push({ label: '肥満(重)', hr: 1.35 });
        else if (bmi >= 25) factors.push({ label: '肥満(軽)', hr: 1.1 });
    }

    // Alcohol
    if (data.alcohol === 'moderate') factors.push({ label: '適度飲酒(Bonus)', hr: 0.9 });
    else if (data.alcohol === 'heavy') factors.push({ label: '多量飲酒', hr: 1.55 });

    // Smoking
    if (data.smoking === 'never') factors.push({ label: '非喫煙(Bonus)', hr: 0.85 });
    else if (data.smoking === 'past') factors.push({ label: '過去喫煙', hr: 1.35 });
    else {
        const count = data.cigarettesPerDay || 20;
        let smokeHr = 1.7, label = `現在喫煙(${count}本)`;
        if (count < 10) { smokeHr = 1.3; label = `現在喫煙(軽/${count}本)`; }
        else if (count >= 20) { smokeHr = 2.2; label = `現在喫煙(重/${count}本)`; }
        factors.push({ label, hr: smokeHr });
    }

    // Exercise
    if (data.exercise === 'yes') factors.push({ label: '運動習慣(Bonus)', hr: 0.85 });
    else factors.push({ label: '運動不足', hr: 1.2 });

    // Sleep
    if (data.sleep === 'short') factors.push({ label: '睡眠不足(<6h)', hr: 1.12 });
    else if (data.sleep === 'long') factors.push({ label: '過眠(>9h)', hr: 1.25 });

    // Social
    if (data.social === 'isolated') factors.push({ label: '社会的孤立', hr: 1.3 });
    else if (data.social === 'active') factors.push({ label: '活発な交流(Bonus)', hr: 0.95 });

    // Diet
    if (data.diet === 'poor') factors.push({ label: '野菜不足', hr: 1.15 });
    else if (data.diet === 'good') factors.push({ label: '食生活良好(Bonus)', hr: 0.95 });

    // Polypharmacy
    if (data.polypharmacy === '1-4') factors.push({ label: '内服薬あり', hr: 1.1 });
    else if (data.polypharmacy === '5+') factors.push({ label: '多剤併用', hr: 1.3 });

    // Pylori
    if (data.pylori === 'negative') factors.push({ label: 'ピロリ未感染(Bonus)', hr: 0.98 });
    else if (data.pylori === 'current') factors.push({ label: 'ピロリ現感染', hr: 1.05 });

    // Medical history
    if (data.fam_cancer) factors.push({ label: 'がん家族歴', hr: 1.1 });
    if (data.parent_long) factors.push({ label: '親が長寿(Bonus)', hr: 0.85 });
    if (data.hist_cancer) factors.push({ label: 'がん既往', hr: 1.4 });
    if (data.hist_stroke) factors.push({ label: '脳卒中既往', hr: 2.0 });
    if (data.hist_heart) factors.push({ label: '心疾患既往', hr: 1.8 });
    if (data.dm) factors.push({ label: '糖尿病', hr: 1.75 });
    if (data.htn) factors.push({ label: '高血圧', hr: 1.2 });
    if (data.dl) factors.push({ label: '高脂血症', hr: 1.1 });
    if (data.inf_hep) factors.push({ label: '肝炎ウイルス', hr: 1.2 });
    if (data.inf_hpv) factors.push({ label: 'HPV', hr: 1.05 });

    factors.forEach((f) => (hr_total *= f.hr));

    if (hr_total > 1.0) hr_total = 1.0 + (hr_total - 1.0) * 0.8;
    hr_total = Math.min(Math.max(hr_total, 0.4), 2.8);

    const sim_base = simulate(age, sex, 1.0);
    const bias = official_ex - sim_base.le;
    const sim_user = simulate(age, sex, hr_total);
    const final_le = Math.max(0.1, sim_user.le + bias);
    const diff = final_le - official_ex;

    let median_age = age + final_le;
    for (let i = 0; i < sim_user.curve.length; i++) {
        if (sim_user.curve[i] <= 0.5) {
            const prev = i > 0 ? sim_user.curve[i - 1] : 1.0;
            const curr = sim_user.curve[i];
            const frac = (prev - 0.5) / (prev - curr);
            median_age = age + i - 1 + frac;
            break;
        }
    }

    let hr_ideal = 1.0;
    const immutable = ['がん家族歴', '親が長寿(Bonus)', 'がん既往', '脳卒中既往', '心疾患既往', '糖尿病', '高血圧', '高脂血症', 'アレルギー体質'];
    factors.forEach((f) => {
        if (immutable.includes(f.label) || f.label.includes('Bonus')) hr_ideal *= f.hr;
    });
    if (data.smoking !== 'never') hr_ideal *= 0.85;
    if (data.exercise !== 'yes') hr_ideal *= 0.85;
    if (data.alcohol === 'heavy') hr_ideal *= 0.9;
    if (data.sleep !== 'optimal') hr_ideal *= 0.95;
    if (data.diet === 'poor') hr_ideal *= 0.95;
    if (data.social === 'isolated') hr_ideal *= 0.9;
    if (hr_ideal > 1.0) hr_ideal = 1.0 + (hr_ideal - 1.0) * 0.8;
    hr_ideal = Math.min(Math.max(hr_ideal, 0.4), 2.5);

    const sim_ideal = simulate(age, sex, hr_ideal);
    const earningsCurrent = calculateExpectedEarnings(age, sim_user.curve);
    const earningsAvg = calculateExpectedEarnings(age, sim_base.curve);
    const earningsIdeal = calculateExpectedEarnings(age, sim_ideal.curve);

    const currentLoss = {
        value: Math.max(0, earningsAvg.value - earningsCurrent.value),
        min: Math.max(0, earningsAvg.min - earningsCurrent.min),
        max: Math.max(0, earningsAvg.max - earningsCurrent.max),
    };
    const potentialGain = {
        value: Math.max(0, earningsIdeal.value - earningsCurrent.value),
        min: Math.max(0, earningsIdeal.min - earningsCurrent.min),
        max: Math.max(0, earningsIdeal.max - earningsCurrent.max),
    };

    const chartData = sim_user.curve
        .map((prob, i) => ({ age: age + i, survival: prob, avgSurvival: sim_base.curve[i] || 0 }))
        .filter((_, i) => age + i <= 105);

    const factorImpacts = factors
        .map((f) => {
            const sim_f = simulate(age, sex, f.hr);
            return { label: f.label, hr: f.hr, impact: sim_f.le + bias - official_ex };
        })
        .sort((a, b) => b.impact - a.impact);

    const stomachRisk = calculateStomachRisk(data);

    return {
        le: parseFloat(final_le.toFixed(2)),
        lifespan: parseFloat((age + final_le).toFixed(1)),
        median: parseFloat(median_age.toFixed(1)),
        diff: parseFloat(diff.toFixed(2)),
        official: parseFloat(official_ex.toFixed(2)),
        curve: chartData,
        economic: { currentLoss, potentialGain, workYearsAvg: 0, workYearsCurrent: 0 },
        factors: factorImpacts,
        stomachRisk,
    };
};
