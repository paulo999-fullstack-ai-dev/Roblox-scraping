import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

USER='postgres.hkgastbktxpqqxbpokmy' 
PASSWORD='Roblox500$' 
HOST='aws-0-us-east-1.pooler.supabase.com'
PORT='6543'
DBNAME='postgres'
# Connect to the database
try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("Connection successful!")
    
    # Create a cursor to execute SQL queries
    cursor = connection.cursor()
    
    # Example query
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    print("Current Time:", result)

    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("Connection closed.")

except Exception as e:
    print(f"Failed to connect: {e}")