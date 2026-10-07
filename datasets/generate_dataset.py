"""
LifeMate Stress-Level Dataset Generator
========================================
Generates a synthetic training dataset for the 5-class stress predictor.

Features:
  mood              (1-5)   — 1=very stressed, 5=great
  workload          (1-5)   — 1=very light, 5=very heavy
  sleep_hours       (4-12)  — hours slept last night
  energy_level      (1-5)   — 1=exhausted, 5=very energized
  social_interaction(1-5)   — 1=none, 5=highly social
  exercise_done     (0/1)   — exercised today
  screen_time_hours (0-10)  — hours of screen time
  water_cups        (0-12)  — cups of water consumed

Target:
  stress_level  0=Very Low, 1=Low, 2=Normal, 3=High, 4=Very High
"""
import random
import math
import csv
import os

random.seed(42)
N = 12000
# Target class balance: realistic real-world distribution
# Very Low ~12%, Low ~23%, Normal ~30%, High ~23%, Very High ~12%
TARGET = {0: 0.12, 1: 0.23, 2: 0.30, 3: 0.23, 4: 0.12}
OUTFILE = os.path.join(os.path.dirname(__file__), "stress_dataset.csv")


def noise(scale=0.06):
    return random.gauss(0, scale)


def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(hi, v))


def compute_stress_score(mood, workload, sleep_hours, energy,
                          social, exercise, screen_time, water):
    """Returns a stress score in [0, 1] where 1 = maximum stress."""
    # Primary drivers (weighted 85 %)
    mood_contrib       = (5 - mood) / 4 * 0.25           # bad mood → stress
    workload_contrib   = (workload - 1) / 4 * 0.22       # heavy load → stress
    sleep_deficit      = clamp((7.5 - sleep_hours) / 7.5) * 0.20  # sleep debt → stress
    energy_contrib     = (5 - energy) / 4 * 0.18         # low energy → stress

    # Secondary drivers (weighted 15 %)
    social_contrib     = (3 - social) / 4 * 0.06         # isolation → slight stress
    exercise_contrib   = (1 - exercise) * 0.05           # no exercise → slight stress
    screen_contrib     = clamp(screen_time / 10) * 0.04  # excess screen → slight stress
    hydration_contrib  = clamp((5 - water) / 8) * 0.04  # dehydration → slight stress (capped early)

    base = (mood_contrib + workload_contrib + sleep_deficit + energy_contrib
            + social_contrib + exercise_contrib + screen_contrib + hydration_contrib)

    # Non-linear amplification at extremes
    if base > 0.75:
        base = 0.75 + (base - 0.75) * 1.4
    if base < 0.15:
        base = base * 0.8

    return clamp(base + noise(0.05))


def score_to_label(score):
    if score < 0.18:  return 0   # Very Low
    if score < 0.36:  return 1   # Low
    if score < 0.58:  return 2   # Normal
    if score < 0.76:  return 3   # High
    return 4                      # Very High


def gen_row_for_class(target_class):
    """Generate a row biased towards the target stress class."""
    # Feature ranges per class
    profiles = {
        0: dict(mood=(4,5), work=(1,2), sleep=(7.5,10), energy=(4,5), social=(4,5), ex=0.85, screen=(1,4),  water=(7,12)),  # Very Low
        1: dict(mood=(3,5), work=(1,3), sleep=(7,9.5),  energy=(3,5), social=(3,5), ex=0.70, screen=(2,5),  water=(5,10)),  # Low
        2: dict(mood=(2,4), work=(2,4), sleep=(6,8.5),  energy=(2,4), social=(2,4), ex=0.55, screen=(3,6),  water=(4,8)),   # Normal
        3: dict(mood=(1,3), work=(3,5), sleep=(5,7),    energy=(1,3), social=(1,3), ex=0.30, screen=(5,9),  water=(2,6)),   # High
        4: dict(mood=(1,2), work=(4,5), sleep=(4,6),    energy=(1,2), social=(1,2), ex=0.15, screen=(7,10), water=(1,4)),   # Very High
    }
    p = profiles[target_class]
    mood        = random.randint(*p['mood'])
    workload    = random.randint(*p['work'])
    sleep_hours = round(random.uniform(*p['sleep']), 1)
    energy      = random.randint(*p['energy'])
    social      = random.randint(*p['social'])
    exercise    = 1 if random.random() < p['ex'] else 0
    screen_time = round(random.uniform(*p['screen']), 1)
    water       = round(random.uniform(*p['water']), 1)

    # Small feature perturbations to prevent perfect separability
    if random.random() < 0.15:
        mood     = clamp(mood + random.choice([-1,1]), 1, 5)
    if random.random() < 0.12:
        workload = clamp(workload + random.choice([-1,1]), 1, 5)

    score = compute_stress_score(mood, workload, sleep_hours, energy,
                                  social, exercise, screen_time, water)
    # Use the actual computed label (may differ slightly from target_class, giving soft boundaries)
    label = score_to_label(score)
    return [int(mood), int(workload), sleep_hours, int(energy), int(social),
            exercise, screen_time, water, label]


COLS = ["mood","workload","sleep_hours","energy_level","social_interaction",
        "exercise_done","screen_time_hours","water_cups","stress_level"]

rows = []
for cls, frac in TARGET.items():
    count = int(N * frac)
    rows.extend(gen_row_for_class(cls) for _ in range(count))
# Top up to exactly N
while len(rows) < N:
    rows.append(gen_row_for_class(random.choice([0,1,2,3,4])))
random.shuffle(rows)

# Verify distribution
counts = [0]*5
for r in rows:
    counts[r[-1]] += 1
labels = ["Very Low","Low","Normal","High","Very High"]
print("Class distribution:")
for i,c in enumerate(counts):
    print(f"  {labels[i]:10s}: {c:4d} ({c/N*100:.1f}%)")

with open(OUTFILE, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(COLS)
    writer.writerows(rows)

print(f"\nDataset written to: {OUTFILE}")
print(f"Total samples: {N}")
