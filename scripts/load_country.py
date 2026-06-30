"""One-time loader: upload one country's rows from the local parquet file
into the Supabase `postal_codes` table via the REST API.

Usage:  python scripts/load_country.py IN
Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local.
Requires the temporary "temp load insert" RLS policy (see supabase_setup.sql).
"""
import json
import math
import sys
import time
import urllib.request
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
PARQUET = ROOT / "global_postal_codes.parquet"
BATCH = 1000

# Parquet column -> postal_codes table column
COLUMN_MAP = {
    "country_code": "country_code",
    "postal_code": "postal_code",
    "place_name": "place_name",
    "state": "admin_name1",
    "district": "admin_name2",
    "neighborhood": "admin_name3",
    "lat": "lat",
    "lng": "lng",
}


def read_env():
    env = {}
    for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def main():
    country = sys.argv[1].upper() if len(sys.argv) > 1 else "IN"
    env = read_env()
    url = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/") + "/rest/v1/postal_codes"
    key = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    df = pd.read_parquet(PARQUET, columns=list(COLUMN_MAP))
    df = df[df["country_code"] == country].rename(columns=COLUMN_MAP)
    df = df.astype(object).where(pd.notna(df), None)  # NaN -> null for JSON
    rows = df.to_dict(orient="records")
    if not rows:
        sys.exit(f"No rows found for country {country!r} in {PARQUET.name}")

    total_batches = math.ceil(len(rows) / BATCH)
    print(f"Uploading {len(rows)} rows for {country} in {total_batches} batches...")

    for i in range(total_batches):
        chunk = rows[i * BATCH : (i + 1) * BATCH]
        body = json.dumps(chunk).encode()
        req = urllib.request.Request(
            url,
            data=body,
            method="POST",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
        )
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=120) as resp:
                    resp.read()
                break
            except Exception as e:
                if attempt == 2:
                    raise
                print(f"  batch {i + 1} attempt {attempt + 1} failed ({e}); retrying...")
                time.sleep(2 * (attempt + 1))
        if (i + 1) % 10 == 0 or i + 1 == total_batches:
            print(f"  {i + 1}/{total_batches} batches done")

    print("Upload complete.")


if __name__ == "__main__":
    main()
