# 05 — සම්පූර්ණ සාරාංශය (Full Summary)
### LifeMate ව්‍යාපෘතිය — Viva / Presentation සිංහල ලේඛනය

---

## LifeMate ව්‍යාපෘතිය යනු කුමක්ද?

**LifeMate** — ජීවිත සහකරු (life companion) ලෙස ෛනිකව ශ්‍රිත කරන AI-powered personal wellness යෙදුමකි. රාජ්‍ය සහ ෙකෝර්පරේට් ජීවිතයේ stress (ආතතිය) ගැටලූව ලෝකය පුරාම බහුල ලෙස ඇති — LifeMate ඒ ගැටලූවට ML model ශ්‍රිතය ලෙස intelligent දෛනික schedule සහ wellness guidance ලබා දෙයි.

**Tech Stack:**
- **Frontend:** React + TailwindCSS (web app)
- **Backend:** Spring Boot + MongoDB Atlas
- **ML Service:** Python FastAPI + scikit-learn

---

## දායකත්ව ක්ෂේත්‍ර 4 — Yasithzz

---

## 1. Questionnaire Module (ප්‍රශ්නාවලිය)

**කුමක්ද:** User ගේ දෛනික ජීවිත දත්ත (8 factors) ලබාගෙන ML model ශ්‍රිතයට ලෙස lifestyle questionnaire ලෙස ක්‍රියාත්මක.

**8 Lifestyle Factors:**

| Factor | සිංහල | ශ්‍රේණිය |
|---|---|---|
| Mood | හැඟීම / මනෝභාවය | 1–5 |
| Workload | වැඩ බාරය | 1–5 |
| Sleep Hours | නිදිමත් ගණන | 0–12 hrs |
| Energy Level | ශක්ති මට්ටම | 1–5 |
| Social Interaction | සමාජ ගනුදෙනු | 1–5 |
| Exercise Done | ව්‍යායාම කළාද | 0/1 |
| Screen Time | Screen කාලය | 0–14 hrs |
| Water Cups | ජල කෝප්ප | 0–16 |

**ක්‍රියාවලිය:**
1. User frontend form fill කරයි → Submit.
2. Backend API ශ්‍රිතය data validate කරයි.
3. ML Service prediction request.
4. Stress result UI ශ්‍රේෂ්ඨ ලෙස show.
5. Weekly schedule ස්වයංක්‍රීයව update.

**Key Files:**
- `frontend/src/pages/user/LifestylePage.jsx`
- `frontend/src/pages/user/WellnessPage.jsx`

---

## 2. Model Training (මාදිලි පුහුණු කිරීම)

**කුමක්ද:** `stress_dataset.csv` ලෙස stress data ශ්‍රේෂ්ඨ ලෙස RandomForestClassifier ML model ශික්ෂිත.

**ශික්ෂිත ක්‍රියාවලිය:**

```
stress_dataset.csv
  ↓ load_data() — 8 features (X) + stress_level (y)
  ↓ SMOTE — class imbalance සමතලා
  ↓ train_test_split — 80% train, 20% test
  ↓ RandomForestClassifier fit() — 200 trees, depth 5
  ↓ accuracy_score() — model නිරවද්‍යතාව
  ↓ cross_val_score() — ස්ථාවරත්වය
  ↓ stress_model.pkl save
  ↓ model_meta.json save
```

**RandomForestClassifier:**
- 200 decision trees ශ්‍රේෂ්ඨ ලෙස ඡන්ද ගළෙයි.
- සෑම ගසක් ම 8 features ශ්‍රේෂ්ඨ ලෙස "Very Low" → "Very High" ශ්‍රේණිය ගනනය.
- Majority vote → final prediction.

**SMOTE:**
- Dataset ලෙස "Very High" stress records ප්‍රමාණ ඉතා අඩු නම් — synthetic records නිර්මාණය.
- Model සාධාරණ ලෙස ඉගෙනෙයි.

**Key Files:**
- `ml-service/train.py`
- `datasets/stress_dataset.csv`
- `ml-service/model/stress_model.pkl`

---

## 3. Algorithm Testing & Optimization (ඇල්ගොරිතම පරීක්ෂා කිරීම)

**කුමක්ද:** ශික්ෂිත model FastAPI ශ්‍රිතය ලෙස API endpoints 5 ක් ශ්‍රේෂ්ඨ ලෙස serve කිරීම + live retraining.

**API Endpoints:**

| Endpoint | Method | ක්‍රිය |
|---|---|---|
| /predict | POST | Stress level prediction |
| /add-data | POST | Dataset ලෙස data append |
| /retrain | POST | Model retrain trigger |
| /health | GET | Service alive check |
| /model-info | GET | Model accuracy info |

**Prediction ක්‍රියාවලිය:**
1. Frontend 8 values → POST /predict.
2. Pydantic validation.
3. np.array matrix → RandomForestClassifier.predict().
4. predict_proba() → probabilities ගළෙයි.
5. JSON response: `{ "stress_level": 2, "stress_label": "Normal", "probabilities": {...} }`.

**Live Learning (Algorithm Optimization):**
- User data confirm → /add-data → dataset append.
- `RETRAIN_BATCH=1` → ස්වයංක්‍රීය background retrain.
- `subprocess.run(train.py)` → නව model load → API restart නොකර live update.

**Key Files:**
- `ml-service/app.py`

---

## 4. Scheduling (කාල සූත්‍රය)

**කුමක්ද:** Stress level + User profile (wake time, work hours, preferences) ශ්‍රේෂ්ඨ ලෙස Mon–Sun weekly schedule ස්වයංක්‍රීය ගොඩනැගීම.

**Schedule ශ්‍රේෂ්ඨ ලෙස personalize:**

| User Factor | Schedule Effect |
|---|---|
| Stress Very High | Work blocks 45 min, breaks 20 min, Gentle Yoga only |
| Stress High | Work blocks 75 min, breaks 15 min, Light Walk |
| Stress Normal/Low | Work blocks 90 min, breaks 10 min, Full exercise |
| Wake Time | Schedule ශ්‍රේෂ්ඨ wake time ලෙස |
| Workout Preference | Exercise slot (HIIT/Yoga/Walk) |
| Meal Preference | Plant-Based/Keto/High-Protein meals |
| Holiday/Leave | Rest Day slot (schedule skip) |
| Working Days | Custom Mon–Fri or selected days |

**Schedule ශ්‍රේෂ්ඨ ලෙස slot types:**
- **Sleep** — wake time to bedtime
- **Morning Routine** — freshen up
- **Meal** — Breakfast/Lunch/Dinner (personalized)
- **Work** — Focus blocks + breaks
- **Exercise** — stress level ශ්‍රේෂ්ඨ ලෙස selected
- **Leisure** — Evening free time (user preference)
- **Wind Down** — bedtime routine

**Key Files:**
- `backend/src/main/java/.../service/WeeklyScheduleService.java`
- `backend/src/main/java/.../repository/ScheduleRepository.java`

---

## සම්පූර්ණ System Flow — Presentation ලෙස

```
┌─────────────────────────────────────────────┐
│              USER (Browser)                  │
│  LifestylePage: Form fill + Submit           │
└───────────────────┬─────────────────────────┘
                    │ POST /api/lifestyle
                    ▼
┌─────────────────────────────────────────────┐
│         Spring Boot Backend                  │
│  1. JWT token validate                       │
│  2. Lifestyle data MongoDB save              │
│  3. POST → ML Service /predict               │
└───────────────┬─────────────────────────────┘
                │
        ┌───────▼───────────────────────┐
        │    FastAPI ML Service         │
        │  app.py                       │
        │  RandomForestClassifier       │
        │  predict() → stress_level     │
        │  predict_proba() → %          │
        └───────┬───────────────────────┘
                │ stress_level, label, proba
                ▼
┌─────────────────────────────────────────────┐
│         Spring Boot Backend                  │
│  4. Stress result Lifestyle record save      │
│  5. WeeklyScheduleService.generate()         │
│     - Monday of current week                 │
│     - Leave dates check                      │
│     - buildDay() × 7 (stress-aware)          │
│     - Schedule MongoDB save                  │
└───────────────┬─────────────────────────────┘
                │ Response: stressLevel, stressIndex
                ▼
┌─────────────────────────────────────────────┐
│              USER (Browser)                  │
│  LifestylePage: Stress result card show      │
│  SchedulePage: Weekly schedule update        │
│  WellnessPage: Personalized suggestions      │
└─────────────────────────────────────────────┘
```

---

## Viva සඳහා ප්‍රධාන Points

1. **"ML model ශ්‍රේෂ්ඨ stress predict කරන්නේ කෙසේද?"**
   → 8 daily lifestyle factors ශ්‍රේෂ්ඨ ලෙස RandomForestClassifier ශ්‍රේෂ්ඨ 200 decision trees ශ්‍රේෂ්ඨ majority vote ශ්‍රේෂ්ඨ 5-class stress level predict.

2. **"SMOTE ඇයි?"**
   → Dataset ශ්‍රේෂ්ඨ stress classes unbalanced — "Very High" records ප්‍රමාණ ඉතා අඩු. SMOTE synthetic records ශ්‍රේෂ්ඨ model සාධාරණ ලෙස ඉගෙනෙයි.

3. **"Schedule ශ්‍රේෂ්ඨ ලෙස personalize?"**
   → Stress level + user profile (wake, sleep, workout, meal, working days, leave) ශ්‍රේෂ්ඨ ලෙස WeeklyScheduleService buildDay() ශ්‍රේෂ්ඨ per-day schedule.

4. **"Live learning?"**
   → User confirm data → /add-data → dataset append → background retrain → model live update.

5. **"RandomForest ශ්‍රේෂ්ඨ GradientBoosting ලෙස?"**
   → RandomForest parallel trees (n_jobs=-1), less overfitting, faster training. GradientBoosting sequential — slower, more parameters.

---

*ලේඛනය — LifeMate ව්‍යාපෘතිය, Yasithzz, 2026*
