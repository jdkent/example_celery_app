simport psycopg2
import os

def terminate_connections_and_drop_tables():
    dbname = os.getenv("POSTGRES_DB", "postgres")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")

    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)
    conn.autocommit = True
    cur = conn.cursor()

    # Terminate all connections except this one
    cur.execute("""
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE pid <> pg_backend_pid()
          AND datname = %s;
    """, (dbname,))

    # Drop all tables
    cur.execute("""
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public';
    """)
    tables = cur.fetchall()
    for table in tables:
        cur.execute(f'DROP TABLE IF EXISTS "{table[0]}" CASCADE;')
        print(f'Dropped table: {table[0]}')

    cur.close()
    conn.close()

if __name__ == "__main__":
    terminate_connections_and_drop_tables()
