"""
LifeMate ML Service — FastAPI
================================
Endpoints:
  POST /predict          — predict stress level from lifestyle data
  POST /add-data         — append a labelled row to the dataset (live learning)
  POST /retrain          — retrain model from updated dataset
  GET  /health           — liveness probe
  GET  /model-info       — returns current model accuracy + feature list
"""
import os, json, csv, threading
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Optional

BASE      = os.path.dirname(__file__)
MODEL_PKL = os.path.join(BASE, "model", "stress_model.pkl")
MODEL_META= os.path.join(BASE, "model", "model_meta.json")
DATASET   = os.path.join(BASE, "..", "datasets", "stress_dataset.csv")

FEATURES = ["mood","workload","sleep_hours","energy_level",
            "social_interaction","exercise_done","screen_time_hours","water_cups"]
LABELS   = ["Very Low","Low","Normal","High","Very High"]

RETRAIN_BATCH = 1    # retrain after every new confirmed sample
_new_samples_count = 0
_model_lock = threading.Lock()

app = FastAPI(title="LifeMate ML Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


def load_model():
    if not os.path.exists(MODEL_PKL):
        raise RuntimeError("Model not found — run train.py first")
    return joblib.load(MODEL_PKL)


_clf = None

def get_clf():
    global _clf
    if _clf is None:
        _clf = load_model()
    return _clf


# ── Request/Response schemas ─────────────────────────────────────

class LifestyleInput(BaseModel):
    mood: int               = Field(..., ge=1, le=5)
    workload: int           = Field(..., ge=1, le=5)
    sleep_hours: float      = Field(..., ge=0, le=12)
    energy_level: int       = Field(..., ge=1, le=5)
    social_interaction: int = Field(3, ge=1, le=5)
    exercise_done: int      = Field(0, ge=0, le=1)
    screen_time_hours: float= Field(4.0, ge=0, le=14)
    water_cups: float       = Field(6.0, ge=0, le=16)


class AddDataRequest(LifestyleInput):
    stress_level: int = Field(..., ge=0, le=4)   # 0–4 as predicted/confirmed


class PredictResponse(BaseModel):
    stress_level: int
    stress_label: str
    probabilities: dict


# ── Endpoints ───────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": os.path.exists(MODEL_PKL)}


@app.get("/model-info")
def model_info():
    if not os.path.exists(MODEL_META):
        raise HTTPException(404, "Model metadata not found — run train.py first")
    with open(MODEL_META) as f:
        return json.load(f)


@app.post("/predict", response_model=PredictResponse)
def predict(data: LifestyleInput):
    clf = get_clf()
    X = np.array([[
        data.mood, data.workload, data.sleep_hours, data.energy_level,
        data.social_interaction, data.exercise_done,
        data.screen_time_hours, data.water_cups,
    ]])
    with _model_lock:
        pred  = int(clf.predict(X)[0])
        proba = clf.predict_proba(X)[0]

    return PredictResponse(
        stress_level=pred,
        stress_label=LABELS[pred],
        probabilities={LABELS[i]: round(float(p), 4) for i, p in enumerate(proba)},
    )


@app.post("/add-data")
def add_data(data: AddDataRequest, background_tasks: BackgroundTasks):
    """Append a confirmed/predicted data-point to the dataset for future retraining."""
    global _new_samples_count
    row = [data.mood, data.workload, data.sleep_hours, data.energy_level,
           data.social_interaction, data.exercise_done,
           data.screen_time_hours, data.water_cups, data.stress_level]
    file_exists = os.path.exists(DATASET)
    with open(DATASET, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(FEATURES + ["stress_level"])
        writer.writerow(row)
    _new_samples_count += 1
    if _new_samples_count >= RETRAIN_BATCH:
        _new_samples_count = 0
        background_tasks.add_task(_do_retrain)
        return {"status": "appended", "auto_retrain": True}
    return {"status": "appended", "samples_until_retrain": RETRAIN_BATCH - _new_samples_count}


@app.post("/retrain")
def retrain_endpoint(background_tasks: BackgroundTasks):
    """Force retrain from current dataset."""
    background_tasks.add_task(_do_retrain)
    return {"status": "retraining started in background"}


def _do_retrain():
    """Background task: retrain model from dataset."""
    global _clf
    try:
        if not os.path.exists(DATASET):
            print("[ML] Retrain skipped — dataset file not found.")
            return
        with open(DATASET) as f:
            row_count = sum(1 for _ in f) - 1  # subtract header
        if row_count < 2:
            print(f"[ML] Retrain skipped — only {row_count} sample(s) in dataset.")
            return

        import subprocess, sys
        print(f"[ML] Retraining on {row_count} samples…")
        result = subprocess.run(
            [sys.executable, os.path.join(BASE, "train.py")],
            capture_output=True, text=True, cwd=BASE)
        if result.returncode == 0:
            with _model_lock:
                _clf = load_model()
            print("[ML] Model retrained and reloaded successfully.")
        else:
            print(f"[ML] Retrain failed:\n{result.stderr}")
    except Exception as e:
        print(f"[ML] Retrain error: {e}")


if __name__ == "__main__":
    import uvicorn
    print("Starting LifeMate ML Service on http://localhost:5001")
    uvicorn.run("app:app", host="0.0.0.0", port=5001, reload=False)
