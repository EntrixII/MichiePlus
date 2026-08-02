import psycopg2
import psycopg2.extras
from psycopg2 import pool as pg_pool

def get_db_connection(timeout=15):
    """Create a database connection with optional timeout."""
    conn = psycopg2.connect(
        DATABASE_URL,
        connect_timeout=timeout,
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn


conn = get_db_connection()
cur = conn.cursor()

cur.execute("SELECT version();")
print(cur.fetchone())

cur.close()
conn.close()