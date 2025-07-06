import pandas as pd
from datetime import datetime, timedelta
import os
import csv

def parse_custom_csv(filepath, student_id, session_date_str):
    session_date = datetime.strptime(session_date_str, "%Y-%m-%d")

    with open(filepath, 'r', encoding='utf-8') as f:
        reader = list(csv.reader(f))

    sessions = []
    current_start_dt = None
    headers = []
    data_lines = []
    data_started = False

    for idx, row in enumerate(reader):
        if not row or all(cell.strip() == '' for cell in row):
            continue  # skip empty

        # Detect session start
        if row[0].startswith("Session start time"):
            if len(row) > 1:
                try:
                    current_start_dt = datetime.strptime(f"{session_date_str} {row[1].strip()}", "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    print(f"⚠️ Invalid session start time at line {idx+1}: {row[1]}")
                    current_start_dt = None
                data_lines = []
                data_started = False

        # Detect headers
        elif row[0].startswith("Markdown"):
            headers = row[1:]  # skip "Markdown"
            data_started = True

        # Detect data rows
        elif data_started and (row[0].startswith("IAPF") or row[0].startswith("Baseline")):
            values = row[1:]
            # Pad or truncate to header length
            if len(values) < len(headers):
                values += [None] * (len(headers) - len(values))
            elif len(values) > len(headers):
                values = values[:len(headers)]
            data_lines.append(values)

        # At next session or end
        if (row[0].startswith("Session start time") or idx == len(reader) - 1) and data_lines and headers and current_start_dt:
            session_df = pd.DataFrame(data_lines, columns=headers)
            session_df = session_df.replace('', pd.NA)

            try:
                session_df['timestamp'] = session_df.apply(
                    lambda row: current_start_dt +
                                timedelta(minutes=int(float(row.get('Time, min', 0))),
                                          seconds=int(float(row.get('Time, sec', 0)))), axis=1
                )
            except Exception as e:
                print(f"❌ Timestamp error: {e}")
                continue

            cleaned_df = pd.DataFrame({
                "student_id": student_id,
                "HeartRate": pd.to_numeric(session_df.get('Heart Rate'), errors='coerce'),
                "EEG": pd.to_numeric(session_df.get('Alpha Peak frequency'), errors='coerce'),
                "SkinConductance": None,
                "timestamp": session_df['timestamp']
            })

            sessions.append(cleaned_df)
            data_started = False

    if sessions:
        return pd.concat(sessions, ignore_index=True)
    else:
        print("⚠️ No valid session data found.")
        return pd.DataFrame(columns=["student_id", "HeartRate", "EEG", "SkinConductance", "timestamp"])


# -------------------------
# 👇 DEVELOPER SETTINGS
# -------------------------
file_path = r"pre-dataset\metrics3.csv"
student_id = "Stu02"
session_date = "2025-06-26"
# -------------------------

final_df = parse_custom_csv(file_path, student_id, session_date)

if not final_df.empty:
    output_dir = os.path.join("cleaneddata", student_id)
    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(output_dir, f"cleaned_focus_data_{student_id}_{session_date}.csv")
    final_df.to_csv(output_file, index=False)

    print(f"✅ Cleaned data saved to {output_file}")
    print(final_df.head())
else:
    print("❌ No data to save.")
