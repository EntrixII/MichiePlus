import os
import pymysql


def create_database():
    host = os.environ.get("MYSQL_HOST", "localhost")
    port = int(os.environ.get("MYSQL_PORT", "3306"))
    user = os.environ.get("MYSQL_USER", "root")
    password = os.environ.get("MYSQL_PASSWORD", "")
    database = os.environ.get("MYSQL_DATABASE", "bizspark")

    conn = pymysql.connect(host=host, port=port, user=user, password=password,
                           charset="utf8mb4", autocommit=True)
    with conn.cursor() as cursor:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    conn.select_db(database)
    try:
        with open(os.path.join(os.path.dirname(__file__), "database_mysql.sql"), encoding="utf-8") as f:
            schema=f.read()
        with conn.cursor() as cursor:
            for statement in schema.split(";"):
                statement=statement.strip()
                if statement:
                    cursor.execute(statement)
        print("✅ MySQL database created successfully")
    finally:
        conn.close()


if __name__ == "__main__":
    create_database()
