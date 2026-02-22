from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math

app = FastAPI(title="Precision Health API", description="gastric-risk-dashboard API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RiskData(BaseModel):
    age: int
    sex: str
    height: float
    weight: float
    hpHistory: str
    atrophy: str
    smoking: str
    annualIncome: int

class RiskResponse(BaseModel):
    finalRiskScore: int
    formattedLoss: str
    xaiData: list[dict]

@app.post("/api/calculate_risk", response_model=RiskResponse)
def calculate_risk(data: RiskData):
    # Calculate BMI
    bmi = data.weight / ((data.height / 100) ** 2)

    # 1. 動的ハザード補正エンジン (Dynamic Hazard Ratio Calculation)
    baseRisk = 20
    xai_mapping = []

    if True:
        if data.hpHistory == "除菌済":
            baseRisk += 30
            xai_mapping.append({"name": "除菌済残存", "value": 30})
        elif data.hpHistory == "現感染":
            baseRisk += 45
            xai_mapping.append({"name": "現感染", "value": 45})
            
        if data.atrophy == "高度萎縮":
            baseRisk += 25
            xai_mapping.append({"name": "高度萎縮", "value": 25})
        elif data.atrophy == "中等度萎縮":
            baseRisk += 15
            xai_mapping.append({"name": "中等度萎縮", "value": 15})
            
        if data.smoking == "あり":
            baseRisk += 10
            xai_mapping.append({"name": "喫煙", "value": 10})
            
        # 特許要件の実装: フレイルリスク
        if data.age >= 75 and bmi < 18.5:
            baseRisk += 15
            xai_mapping.append({"name": "フレイル", "value": 15})
        elif data.age > 50:
            baseRisk += 5
            xai_mapping.append({"name": "年齢", "value": 5})

    xai_mapping.append({"name": "基礎リスク", "value": 20})
    
    # 2. XAI寄与度分析 (SHAP Value Generation - モック)
    xai_mapping.sort(key=lambda x: x["value"], reverse=True)

    finalRiskScore = min(round(baseRisk), 100)

    # 3. マルコフモデル生存・経済シミュレーション (モック)
    remainingWorkYears = max(0, 65 - data.age)
    totalPotentialIncome = data.annualIncome * remainingWorkYears
    lossAmount = round(totalPotentialIncome * 0.15) 
    formattedLoss = f"{lossAmount:,}"

    return RiskResponse(
        finalRiskScore=finalRiskScore,
        formattedLoss=formattedLoss,
        xaiData=xai_mapping
    )
