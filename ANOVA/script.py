import os
import re
import glob
import pandas as pd
from scipy import stats
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm
from statsmodels.stats.multicomp import pairwise_tukeyhsd

# -----------------------------
# CONFIG
# -----------------------------
DATA_DIR = "./metrics/uti"   # <= change this
OUTPUT_DIR = os.path.join(DATA_DIR, "anova_reports")
os.makedirs(OUTPUT_DIR, exist_ok=True)

RE_ROUND = re.compile(r"round(\d+)", re.IGNORECASE)
METRICS = ["precision", "accuracy", "loss"]

# -----------------------------
# LOAD & COMBINE
# -----------------------------
rows = []
csv_files = sorted(glob.glob(os.path.join(DATA_DIR, "*.csv")))
if not csv_files:
    raise SystemExit(f"No CSVs found in: {DATA_DIR}")

for f in csv_files:
    arch = os.path.splitext(os.path.basename(f))[0]  # filename without .csv
    df = pd.read_csv(f)
    # Expect columns: model, precision, accuracy, loss
    missing = set(["model"] + METRICS) - set(map(str.lower, df.columns))
    # Normalize column names to lower-case:
    df.columns = [c.lower() for c in df.columns]
    if missing:
        raise ValueError(f"{f} is missing required columns: {missing}")

    # Extract round from the 'model' string (e.g., '...-round3' -> 3)
    def extract_round(s):
        m = RE_ROUND.search(str(s))
        return int(m.group(1)) if m else None

    tmp = df.copy()
    tmp["architecture"] = arch
    tmp["round"] = tmp["model"].apply(extract_round)

    rows.append(tmp[["architecture", "round", "model"] + METRICS])

all_df = pd.concat(rows, ignore_index=True)

# Basic sanity checks
if all_df["round"].isna().any():
    print("⚠️ Some rows have no detectable 'round' in the model name. They will be excluded from two-way ANOVA.")
print("\n=== Combined preview ===")
print(all_df.head())

# Save combined data for reference
all_df.to_csv(os.path.join(OUTPUT_DIR, "combined_metrics.csv"), index=False)

# -----------------------------
# ONE-WAY ANOVA (by architecture) PER METRIC
# -----------------------------
oneway_rows = []
for metric in METRICS:
    groups = [g[metric].dropna().values
              for _, g in all_df.groupby("architecture", sort=True)]
    arch_names = list(all_df.groupby("architecture").groups.keys())

    if any(len(g) < 2 for g in groups):  # still valid, but warn about very small groups
        print(f"⚠️ Some architecture groups for {metric} have <2 values. ANOVA can run but power is low.")

    f_stat, p_val = stats.f_oneway(*groups)
    print(f"\n--- One-way ANOVA for {metric} (by architecture) ---")
    print(f"F = {f_stat:.4f}, p = {p_val:.6f}")
    oneway_rows.append({"metric": metric, "F": f_stat, "p": p_val})

    # Tukey HSD if significant
    if p_val < 0.05:
        tukey = pairwise_tukeyhsd(endog=all_df[metric],
                                  groups=all_df["architecture"],
                                  alpha=0.05)
        print(tukey)
        # Save Tukey table
        tukey_df = pd.DataFrame(data=tukey.summary().data[1:], columns=tukey.summary().data[0])
        tukey_df.to_csv(os.path.join(OUTPUT_DIR, f"tukey_{metric}.csv"), index=False)

pd.DataFrame(oneway_rows).to_csv(os.path.join(OUTPUT_DIR, "anova_oneway_summary.csv"), index=False)

# -----------------------------
# TWO-WAY ANOVA (Architecture + Round as block) PER METRIC
# Only runs if rounds align across architectures.
# -----------------------------
two_way_rows = []
# Check round alignment: every architecture must have the same set of rounds
rounds_by_arch = all_df.dropna(subset=["round"]).groupby("architecture")["round"].apply(lambda s: set(s.tolist()))
all_round_sets = list(rounds_by_arch)
aligned = len(all_round_sets) > 0 and all_round_sets.count(all_round_sets[0]) == len(all_round_sets)

if aligned:
    for metric in METRICS:
        # Build balanced subset
        balanced = all_df.dropna(subset=["round", metric]).copy()
        # Fit OLS with categorical factors: Architecture and Round (treated as block)
        model = ols(f"{metric} ~ C(architecture) + C(round)", data=balanced).fit()
        aov = anova_lm(model, typ=2)  # Type II ANOVA
        print(f"\n=== Two-way ANOVA (Architecture + Round) for {metric} ===")
        print(aov)
        # Save
        out = aov.reset_index().rename(columns={"index": "factor"})
        out.to_csv(os.path.join(OUTPUT_DIR, f"anova_two_way_{metric}.csv"), index=False)

        # Record architecture effect row if present
        if "C(architecture)" in aov.index:
            row = aov.loc["C(architecture)"]
            two_way_rows.append({
                "metric": metric,
                "Effect": "Architecture",
                "F": row["F"],
                "p": row["PR(>F)"]
            })
else:
    print("\nℹ️ Skipping two-way ANOVA with round blocking because the set of rounds is not aligned across all architectures.")
    print("   (All architectures must share the same round IDs, e.g., {1,2,3,4,5}.)")

if two_way_rows:
    pd.DataFrame(two_way_rows).to_csv(os.path.join(OUTPUT_DIR, "anova_two_way_architecture_effects.csv"), index=False)

print(f"\n✅ Done. Reports saved in: {OUTPUT_DIR}")

# === SUMMARY STATISTICS ===
summary = (
    all_df.groupby("architecture")[["precision", "accuracy", "loss"]]
    .agg(["mean", "std"])
    .round(3)
)

print("\n=== Average Metrics per Architecture ===")
print(summary)

# Save for reference
summary.to_csv(os.path.join(OUTPUT_DIR, "model_averages.csv"))