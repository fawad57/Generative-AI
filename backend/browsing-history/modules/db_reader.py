import os
import shutil
import sqlite3
import platform
from datetime import datetime, timedelta

def get_chrome_history_path():
    """
    Get the path to Chrome's History database based on the operating system.
    """
    system = platform.system()
    if system == "Windows":
        # Windows path
        username = os.getenv('USERNAME')
        path = f"C:\\Users\\{username}\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\History"
    elif system == "Darwin":  # macOS
        username = os.getenv('USER')
        path = f"/Users/{username}/Library/Application Support/Google/Chrome/Default/History"
    elif system == "Linux":
        username = os.getenv('USER')
        path = f"/home/{username}/.config/google-chrome/Default/History"
    else:
        raise ValueError("Unsupported operating system")
    return path

def copy_chrome_history():
    """
    Make a safe copy of the Chrome History database to avoid locking issues.
    Returns the path to the copied database.
    """
    original_path = get_chrome_history_path()
    if not os.path.exists(original_path):
        raise FileNotFoundError("Chrome History database not found. Ensure Chrome is installed and has browsing history.")

    # Create a temporary copy
    temp_path = original_path + "_temp"
    shutil.copy2(original_path, temp_path)
    return temp_path

def read_chrome_history(db_path):
    """
    Read browsing history from the copied Chrome History database.
    Returns a list of dictionaries with raw data.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Query the urls and visits tables for history records
    cursor.execute("""
        SELECT u.url, u.title, v.visit_time, v.from_visit, v.transition, v.id as visit_id
        FROM urls u
        JOIN visits v ON u.id = v.url
        ORDER BY v.visit_time DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            'url': row[0],
            'title': row[1] or '',  # Handle None titles
            'visit_time': row[2],  # Chrome timestamp
            'from_visit': row[3],
            'transition': row[4],
            'visit_id': row[5]
        })

    return history

def chrome_timestamp_to_datetime(chrome_time):
    """
    Convert Chrome's internal timestamp (microseconds since 1601-01-01) to datetime.
    """
    if chrome_time is None:
        return None
    # Chrome epoch: 1601-01-01 00:00:00 UTC
    chrome_epoch = datetime(1601, 1, 1)
    # Convert microseconds to seconds
    seconds = chrome_time / 1_000_000
    return chrome_epoch + timedelta(seconds=seconds)
