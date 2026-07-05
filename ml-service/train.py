"""
LifeMate Stress-Level Model Trainer
=====================================
Trains a RandomForestClassifier on stress_dataset.csv.
Run: python train.py

Saves model/stress_model.pkl and model/model_meta.json.
"""
import os, json, joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
from imblearn.over_sampling import SMOTE

BASE   = os.path.dirname(__file__)
DATA   = os.path.join(BASE, "..", "datasets", "stress_dataset.csv")
MODEL_DIR = os.path.join(BASE, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURES = ["mood","workload","sleep_hours","energy_level",
            "social_interaction","exercise_done","screen_time_hours","water_cups"]
TARGET   = "stress_level"
LABELS   = ["Very Low","Low","Normal","High","Very High"]


def load_data(path=DATA):
    df = pd.read_csv(path)
    X  = df[FEATURES]
    y  = df[TARGET]
    
    return X, y


MIN_SAMPLES_FOR_SMOTE = 30   # need at least 6 samples per class for SMOTE (k_neighbors=5)
MIN_SAMPLES_FOR_SPLIT = 10   # need enough for a meaningful train/test split


def train(X, y):
    n_total = len(X)
    class_counts = dict(zip(*np.unique(y, return_counts=True)))
    min_class = min(class_counts.values())

    # Apply SMOTE only when each class has enough samples
    if n_total >= MIN_SAMPLES_FOR_SMOTE and min_class >= 6:
        smote = SMOTE(random_state=42)
        X_res, y_res = smote.fit_resample(X, y)
        print(f"After SMOTE — samples: {len(X_res)}, class counts: {dict(zip(*np.unique(y_res, return_counts=True)))}")
    else:
        X_res, y_res = X.values, y.values
        print(f"SMOTE skipped (only {n_total} samples). Training on raw data.")

    if n_total >= MIN_SAMPLES_FOR_SPLIT:
        X_train, X_test, y_train, y_test = train_test_split(
            X_res, y_res, test_size=0.2, random_state=42, stratify=y_res)
        clf = RandomForestClassifier(
            n_estimators=200, max_depth=5, random_state=42, n_jobs=-1)
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        acc    = accuracy_score(y_test, y_pred)
        print(f"\nTest accuracy: {acc:.4f}")
        print(classification_report(y_test, y_pred, target_names=LABELS, zero_division=0))
        cv_folds = min(5, min_class) if min_class >= 2 else 0
        if cv_folds >= 2:
            cv = cross_val_score(clf, X_res, y_res, cv=cv_folds, scoring="accuracy")
            print(f"{cv_folds}-fold CV: {cv.mean():.4f} ± {cv.std():.4f}")
    else:
        # Too few samples for split — train on everything
        clf = RandomForestClassifier(
            n_estimators=100, max_depth=3, random_state=42, n_jobs=-1)
        clf.fit(X_res, y_res)
        acc = accuracy_score(y_res, clf.predict(X_res))
        print(f"Trained on all {n_total} samples (train=test). Accuracy: {acc:.4f}")

    return clf, acc


def save(clf, acc):
    model_path = os.path.join(MODEL_DIR, "stress_model.pkl")
    meta_path  = os.path.join(MODEL_DIR, "model_meta.json")
    joblib.dump(clf, model_path)
    with open(meta_path, "w") as f:
        json.dump({"features": FEATURES, "labels": LABELS,
                   "accuracy": round(acc, 4)}, f, indent=2)
    print(f"\nModel saved to {model_path}")
    print(f"Meta  saved to {meta_path}")


if __name__ == "__main__":
    print("Loading dataset …")
    X, y = load_data()
    print(f"Dataset shape: {X.shape}, label distribution: {dict(zip(*np.unique(y, return_counts=True)))}")
    print("\nTraining model …")
    clf, acc = train(X, y)
    save(clf, acc)
    print("\nDone.")
