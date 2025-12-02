from flask import Flask, jsonify, send_file
from flask_cors import CORS
import os
import sys
import json

# Add modules directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

from modules.db_reader import copy_chrome_history, read_chrome_history
from modules.data_cleaner import clean_data
from modules.feature_engineering import engineer_features
from modules.exporter import export_data
from modules.sender import send_history_to_server

app = Flask(__name__)
CORS(app)

def fetch_history():
    """
    Function to fetch and process browsing history.
    """
    try:
        # Step 1: Copy Chrome History DB
        print("Copying Chrome History database...")
        db_path = copy_chrome_history()

        # Step 2: Read history
        print("Reading browsing history...")
        history_list = read_chrome_history(db_path)

        # Step 3: Clean data
        print("Cleaning data...")
        df = clean_data(history_list)

        # Step 4: Engineer features
        print("Engineering features...")
        df = engineer_features(df)

        # Step 5: Export data
        output_dir = 'output'
        os.makedirs(output_dir, exist_ok=True)
        print("Exporting data...")
        export_data(df, output_dir)

        # Clean up temp DB
        os.remove(db_path)
        print("Process completed successfully.")

        return df.to_dict(orient='records')

    except Exception as e:
        print(f"Error: {e}")
        return None

@app.route('/fetch', methods=['GET'])
def get_history():
    """
    API endpoint to fetch Chrome browsing history.
    """
    data = fetch_history()
    if data is not None:
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch history"}), 500


@app.route('/files/history.csv', methods=['GET'])
def download_history():
    # Return the exported history CSV if it exists
    fp = os.path.join(os.path.dirname(__file__), 'output', 'history.csv')
    if os.path.exists(fp):
        return send_file(fp, as_attachment=True)
    return jsonify({'error': 'history.csv not found, run /fetch first'}), 404

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
