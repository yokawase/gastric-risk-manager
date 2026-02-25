export type Sex = 'male' | 'female';
export type Alcohol = 'none' | 'moderate' | 'heavy';
export type Smoking = 'never' | 'past' | 'current';
export type Exercise = 'yes' | 'no';
export type Pylori = 'unknown' | 'negative' | 'eradicated' | 'current';
export type Polypharmacy = '0' | '1-4' | '5+';
export type AtrophicGastritis = 'unknown' | 'yes' | 'no';
export type Sleep = 'optimal' | 'short' | 'long';
export type Social = 'active' | 'moderate' | 'isolated';
export type Diet = 'good' | 'average' | 'poor';
export type TempPref = 'very_hot' | 'normal' | 'cold';

export interface UserData {
    age: number;
    sex: Sex;
    height: number;
    weight: number;
    alcohol: Alcohol;
    smoking: Smoking;
    cigarettesPerDay: number;
    exercise: Exercise;
    sleep: Sleep;
    social: Social;
    diet: Diet;
    pylori: Pylori;
    atrophic_gastritis: AtrophicGastritis;
    polypharmacy: Polypharmacy;
    fam_cancer: boolean;
    parent_long: boolean;
    allergy: boolean;
    hist_cancer: boolean;
    hist_stroke: boolean;
    hist_heart: boolean;
    dm: boolean;
    htn: boolean;
    dl: boolean;
    inf_hep: boolean;
    inf_hpv: boolean;

    // AI Deep Phenotyping (Red Flags)
    sys_black_stool: boolean;
    sys_nausea: boolean;

    // AI Deep Phenotyping (Digestive)
    sys_distending_pain: boolean;
    sys_belching: boolean;
    sys_hypo_pain: boolean;
    sys_water_brash: boolean;
    sys_abd_distention: boolean;

    // AI Deep Phenotyping (TCM / Lifestyle)
    life_temp_pref: TempPref;
    life_cold_limbs: boolean;
    life_bitter_taste: boolean;
}

export interface StomachCancerResult {
    score: number;
    level: 'low' | 'medium' | 'high' | 'unknown';
    advice: string;
    contributions: { label: string; value: number; isPositive: boolean }[];
}

export interface EconomicValue {
    value: number;
    min: number;
    max: number;
}

export interface SimulationResult {
    le: number;
    lifespan: number;
    median: number;
    diff: number;
    official: number;
    curve: { age: number; survival: number; avgSurvival: number }[];
    economic: {
        currentLoss: EconomicValue;
        potentialGain: EconomicValue;
        workYearsAvg: number;
        workYearsCurrent: number;
    };
    factors: { label: string; hr: number; impact: number }[];
    stomachRisk?: StomachCancerResult;
}
