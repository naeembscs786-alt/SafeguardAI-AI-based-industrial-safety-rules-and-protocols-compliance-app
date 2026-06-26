import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Testing connection to: {DATABASE_URL}")
try:
    engine = create_engine(DATABASE_URL, connect_args={'connect_timeout': 5})
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Database Connection Successful!")
except Exception as e:
    print(f"❌ Database Connection Failed: {e}")
