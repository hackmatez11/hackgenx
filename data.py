import random
import pandas as pd
from datetime import datetime, timedelta

random.seed(42)

NUM_PATIENTS = 1500
START_DATE = datetime(2026, 1, 1)

records = []

for i in range(1, NUM_PATIENTS + 1):
    patient_id = f"P{i:04d}"

    # Severity distribution
    severity = random.choices(
        ["Low", "Medium", "High", "Critical"],
        weights=[0.2, 0.4, 0.25, 0.15]
    )[0]

    # Emergency probability
    if severity in ["High", "Critical"]:
        is_emergency = random.choices([0, 1], weights=[0.6, 0.4])[0]
    else:
        is_emergency = random.choices([0, 1], weights=[0.85, 0.15])[0]

    # Predicted stay duration
    if severity == "Low":
        stay_days = random.randint(1, 3)
    elif severity == "Medium":
        stay_days = random.randint(2, 5)
    elif severity == "High":
        stay_days = random.randint(4, 8)
    else:
        stay_days = random.randint(7, 14)

    # Equipment requirements
    ventilator_needed = int(severity in ["High", "Critical"] and random.random() < 0.7)
    dialysis_needed = int(severity == "Critical" and random.random() < 0.4)

    # Arrival time (within 60 days)
    arrival_time = START_DATE + timedelta(
        days=random.randint(0, 59),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )

    records.append([
        patient_id,
        severity,
        is_emergency,
        stay_days,
        ventilator_needed,
        dialysis_needed,
        arrival_time.strftime("%Y-%m-%d %H:%M:%S")
    ])

columns = [
    "patient_id",
    "severity",
    "is_emergency",
    "predicted_stay_days",
    "ventilator_needed",
    "dialysis_needed",
    "arrival_time"
]

df = pd.DataFrame(records, columns=columns)

df.to_csv("synthetic_icu_dataset_1500.csv", index=False)

print("Dataset generated successfully.")
print("Total records:", len(df))