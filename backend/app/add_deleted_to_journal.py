import sqlite3

conn = sqlite3.connect("shecare.db")
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE journal_entries ADD COLUMN deleted BOOLEAN DEFAULT 0")
    print("Added 'deleted' column to journal_entries.")
except Exception as e:
    print(f"Error: {e}")
conn.commit()
conn.close() 