import pandas as pd
import random

random.seed(42)

TOTAL_BEDS = 60
records = []

for i in range(1, TOTAL_BEDS + 1):
    bed_id = f"B{i:03d}"

    # Bed type distribution
    bed_type = random.choices(
        ["General", "Advanced", "Critical"], weights=[0.5, 0.3, 0.2]
    )[0]

    # Equipment assignment logic
    if bed_type == "General":
        ventilator_available = 0
        dialysis_available = 0

    elif bed_type == "Advanced":
        ventilator_available = 1 if random.random() < 0.6 else 0
        dialysis_available = 0

    else:  # Critical
        ventilator_available = 1
        dialysis_available = 1 if random.random() < 0.7 else 0

    records.append(
        [
            bed_id,
            bed_type,
            ventilator_available,
            dialysis_available,
            1,  # Initially available
        ]
    )

columns = [
    "bed_id",
    "bed_type",
    "ventilator_available",
    "dialysis_available",
    "is_available",
]

df = pd.DataFrame(records, columns=columns)

df.to_csv("icu_infrastructure_dataset_60beds.csv", index=False)

print("ICU Infrastructure Dataset Generated")
print("Total Beds:", len(df))
