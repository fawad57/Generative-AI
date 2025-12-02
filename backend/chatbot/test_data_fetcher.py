#!/usr/bin/env python3
"""Test script for data fetching functionality."""

import os
import sys
sys.path.append(os.path.dirname(__file__))

from data_fetcher import DataFetcher

def test_data_fetcher():
    """Test the data fetcher with mock or real endpoints."""
    fetcher = DataFetcher()

    print("Testing Data Fetcher...")

    # Test profile fetch (will likely fail without auth, but test structure)
    try:
        profile = fetcher.fetch_user_profile()
        print(f"Profile fetch result: {type(profile)}")
    except Exception as e:
        print(f"Profile fetch error (expected without auth): {e}")

    # Test browsing history
    try:
        history = fetcher.fetch_browsing_history()
        print(f"Browsing history fetch result: {len(history) if isinstance(history, list) else 'Not a list'}")
    except Exception as e:
        print(f"Browsing history fetch error: {e}")

    # Test mood tracks
    try:
        moods = fetcher.fetch_mood_tracks()
        print(f"Mood tracks fetch result: {len(moods) if isinstance(moods, list) else 'Not a list'}")
    except Exception as e:
        print(f"Mood tracks fetch error: {e}")

    # Test emotion data
    try:
        emotions = fetcher.fetch_emotion_data()
        print(f"Emotion data fetch result: {len(emotions) if isinstance(emotions, list) else 'Not a list'}")
    except Exception as e:
        print(f"Emotion data fetch error: {e}")

    print("Data fetcher test completed.")

if __name__ == "__main__":
    test_data_fetcher()
