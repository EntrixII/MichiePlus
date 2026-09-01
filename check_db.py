import os
import pymysql
import pymysql.cursors
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "michieplus")


def get_db_connection(timeout=15):
    """Create a database connection with optional timeout."""
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        connect_timeout=timeout,
        cursorclass=pymysql.cursors.DictCursor
    )
    return conn


conn = get_db_connection()
cur = conn.cursor()

cur.execute("SELECT VERSION();")
print(cur.fetchone())

cur.close()
conn.close()