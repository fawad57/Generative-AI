import requests
import os
from typing import Dict, List, Any
from dotenv import load_dotenv

load_dotenv()

class DataFetcher:
    """Fetches user data from various PsyPlex services for RAG context."""

    def __init__(self):
        self.api_base = os.getenv("API_BASE_URL", "http://localhost:3000/api")
        self.domain_api_base = os.getenv("DOMAIN_API_BASE_URL", "http://localhost:8000")
        self.token = None

    def set_token(self, token: str):
        """Set JWT token for authenticated requests."""
        self.token = token

    def _get_headers(self) -> Dict[str, str]:
        """Get headers with authorization if token is set."""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def fetch_user_profile(self) -> Dict[str, Any]:
        """Fetch user profile data."""
        try:
            response = requests.get(
                f"{self.api_base}/user/profile",
                headers=self._get_headers(),
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to fetch profile: {response.status_code}")
                return {}
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return {}

    def fetch_browsing_history(self) -> List[Dict[str, Any]]:
        """Fetch user's browsing history."""
        try:
            response = requests.get(
                f"{self.api_base}/chrome-history/fetch",
                headers=self._get_headers(),
                timeout=30
            )
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to fetch browsing history: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error fetching browsing history: {e}")
            return []

    def fetch_mood_tracks(self, range: str = "weekly") -> List[Dict[str, Any]]:
        """Fetch user's mood tracking data."""
        try:
            response = requests.get(
                f"{self.api_base}/mood/tracks?range={range}",
                headers=self._get_headers(),
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to fetch mood tracks: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error fetching mood tracks: {e}")
            return []

    def fetch_emotion_data(self) -> List[Dict[str, Any]]:
        """Fetch emotion data from domain classification service."""
        try:
            response = requests.get(
                f"{self.domain_api_base}/get_emotion_data",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to fetch emotion data: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error fetching emotion data: {e}")
            return []

    def fetch_all_user_data(self) -> Dict[str, Any]:
        """Fetch all relevant user data for RAG context."""
        return {
            "profile": self.fetch_user_profile(),
            "browsing_history": self.fetch_browsing_history(),
            "mood_tracks": self.fetch_mood_tracks(),
            "emotion_data": self.fetch_emotion_data()
        }
