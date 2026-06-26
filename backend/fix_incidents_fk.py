"""
Migration: Fix incidents.worker_id FK — points to 'workers' but should point to 'users'
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Parse DATABASE_URL manually for psycopg2
url = os.getenv("DATABASE_URL")
# Format: postgresql://user:password@host:port/dbname
url = url.replace("postgresql://", "")
user_pass, rest = url.split("@")
user, password = user_pass.split(":")
host_port, dbname = rest.split("/")
host, port = host_port.split(":")

conn = psycopg2.connect(
    host=host, port=int(port), dbname=dbname, user=user, password=password
)
conn.autocommit = True
cur = conn.cursor()

print("🔍 Checking current constraints on incidents table...")
cur.execute("""
    SELECT conname, confrelid::regclass AS referenced_table
    FROM pg_constraint
    WHERE conrelid = 'incidents'::regclass AND contype = 'f';
""")
constraints = cur.fetchall()
for c in constraints:
    print(f"  → Constraint: {c[0]}  References: {c[1]}")

print("\n🔧 Dropping wrong FK constraints...")
for conname, ref_table in constraints:
    if str(ref_table) == "workers":
        print(f"  Dropping: {conname}")
        cur.execute(f'ALTER TABLE incidents DROP CONSTRAINT "{conname}";')
        print(f"  ✅ Dropped {conname}")

print("\n➕ Adding correct FK: incidents.worker_id → users.user_id ...")
try:
    cur.execute("""
        ALTER TABLE incidents
        ADD CONSTRAINT incidents_worker_id_fkey
        FOREIGN KEY (worker_id) REFERENCES users(user_id);
    """)
    print("  ✅ New FK added successfully!")
except Exception as e:
    print(f"  ⚠️  Could not add new FK (may already exist): {e}")

print("\n✅ Migration complete! Re-checking constraints...")
cur.execute("""
    SELECT conname, confrelid::regclass AS referenced_table
    FROM pg_constraint
    WHERE conrelid = 'incidents'::regclass AND contype = 'f';
""")
for c in cur.fetchall():
    print(f"  → {c[0]}  →  {c[1]}")

cur.close()
conn.close()
print("\n🎉 Done!")
