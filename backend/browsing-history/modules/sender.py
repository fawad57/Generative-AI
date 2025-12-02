import requests
import json

def send_history_to_server(api_url, data):
    """
    Send the history data to the server via POST request.
    data should be a list of dicts (JSON serializable).
    """
    try:
        response = requests.post(api_url, json=data)
        response.raise_for_status()  # Raise error for bad status codes
        print(f"Successfully sent data to {api_url}")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending data to server: {e}")
        return None
