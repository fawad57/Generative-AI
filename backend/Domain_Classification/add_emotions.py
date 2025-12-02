# add_emotions_to_csv.py
import pandas as pd
from datetime import datetime

# ================= CONFIGURATION =================
INPUT_FILE = "predicted_history.csv"      # <-- Apni file ka naam yahan likho agar alag hai
OUTPUT_FILE = "predicted_history_with_emotions.csv"  # Final file with emotions

# Emotion Mapping (Research + Psychology Based)
EMOTION_MAPPING = {
    # Your current predicted categories
    "Entertainment": "Joy",
    "News & Media": "Fear",           # Negative news = Fear/Anger
    "Technology": "Curiosity",
    "Business & Finance": "Stress",
    
    # Extra common ones (jo aapke data mein aa sakte hain)
    "Social Media": "Anxiety",
    "Shopping": "Excitement",
    "Games": "Excitement",
    "Adult": "Guilt",
    "Education": "Pride",
    "Health": "Calm",
    "Sports": "Excitement",
    "Music": "Joy",
    "Travel": "Excitement",
    
    # Local development (localhost)
    "Development": "Focused",
}

# Domain-based fallback (agar category missing ho)
DOMAIN_TO_EMOTION = {
    "youtube.com": "Joy",           # Gaming, music, entertainment
    "instagram.com": "Anxiety",     # FOMO, comparison
    "tiktok.com": "Joy",
    "facebook.com": "Anxiety",
    "twitter.com": "Anger",
    "x.com": "Anger",
    "reddit.com": "Mixed",
    "localhost": "Focused",         # Your React/Vite app
    "google.com": "Curiosity",
    "docs.google.com": "Focused",
    "gmail.com": "Stress",
    "news": "Fear",
    "pornhub.com": "Guilt",         # Just in case
    "xvideos.com": "Guilt",
}

# Score Mappings for correlation analysis
STRESS_MAPPING = {
    "Entertainment": 1,
    "News & Media": 3,           # Negative news = high stress
    "Technology": 2,
    "Business & Finance": 4,     # High stress
    "Social Media": 3,
    "Shopping": 2,
    "Games": 1,
    "Adult": 2,
    "Education": 2,
    "Health": 2,
    "Sports": 1,
    "Music": 1,
    "Travel": 2,
    "Development": 3,            # Coding can be stressful
}

DOMAIN_TO_STRESS = {
    "youtube.com": 1,
    "instagram.com": 3,
    "tiktok.com": 2,
    "facebook.com": 3,
    "twitter.com": 3,
    "x.com": 3,
    "reddit.com": 2,
    "localhost": 2,
    "google.com": 1,
    "docs.google.com": 2,
    "gmail.com": 3,
    "news": 4,
    "pornhub.com": 2,
    "xvideos.com": 2,
}

SOCIAL_MEDIA_MAPPING = {
    "Entertainment": 2,
    "News & Media": 1,
    "Technology": 1,
    "Business & Finance": 1,
    "Social Media": 5,           # High social media usage
    "Shopping": 2,
    "Games": 3,
    "Adult": 1,
    "Education": 1,
    "Health": 1,
    "Sports": 2,
    "Music": 2,
    "Travel": 2,
    "Development": 1,
}

DOMAIN_TO_SOCIAL_MEDIA = {
    "youtube.com": 3,
    "instagram.com": 5,
    "tiktok.com": 5,
    "facebook.com": 5,
    "twitter.com": 4,
    "x.com": 4,
    "reddit.com": 4,
    "localhost": 1,
    "google.com": 1,
    "docs.google.com": 1,
    "gmail.com": 2,
    "news": 1,
    "pornhub.com": 1,
    "xvideos.com": 1,
}

EDUCATION_MAPPING = {
    "Entertainment": 1,
    "News & Media": 2,
    "Technology": 3,
    "Business & Finance": 3,
    "Social Media": 1,
    "Shopping": 1,
    "Games": 1,
    "Adult": 1,
    "Education": 5,             # High education value
    "Health": 2,
    "Sports": 1,
    "Music": 1,
    "Travel": 2,
    "Development": 4,           # Coding/learning
}

DOMAIN_TO_EDUCATION = {
    "youtube.com": 2,
    "instagram.com": 1,
    "tiktok.com": 1,
    "facebook.com": 1,
    "twitter.com": 1,
    "x.com": 1,
    "reddit.com": 2,
    "localhost": 4,
    "google.com": 3,
    "docs.google.com": 5,
    "gmail.com": 1,
    "news": 2,
    "pornhub.com": 1,
    "xvideos.com": 1,
}

def add_emotions_file(input_file=INPUT_FILE, output_file=OUTPUT_FILE):
    """Read CSV at input_file, add emotion mappings and scores, save to output_file and return dataframe.
    This function encapsulates the original script behavior so it can be used as an API.
    """

    print("Loading your browsing history with predictions...")
    df = pd.read_csv(input_file)

    print(f"Total visits loaded: {len(df)}")

    # Step 1: Clean category names (remove extra spaces, lowercase for safety)
    if 'predicted_category' in df.columns:
        df['predicted_category'] = df['predicted_category'].astype(str).str.strip()
    else:
        print("ERROR: 'predicted_category' column not found!")
        print("Available columns:", list(df.columns))
        raise ValueError("predicted_category column missing")

    # Step 2: Map category → emotion
    df['predicted_emotion'] = df['predicted_category'].map(EMOTION_MAPPING)

    # Step 3: Fallback using domain (bohat powerful!)
    def get_emotion_from_domain(row):
        if pd.notna(row['predicted_emotion']):
            return row['predicted_emotion']

        domain = str(row.get('url_domain', '')).lower()
        for key, emotion in DOMAIN_TO_EMOTION.items():
            if key in domain:
                return emotion
        return "Neutral"  # Final fallback

    df['predicted_emotion'] = df.apply(get_emotion_from_domain, axis=1)

    # Step 4: Add emotion intensity score (-3 to +3)
    EMOTION_SCORE = {
    "Joy": 3,
    "Excitement": 2,
    "Pride": 2,
    "Curiosity": 2,
    "Calm": 1,
    "Focused": 1,
    "Neutral": 0,
    "Mixed": 0,
    "Stress": -1,
    "Anxiety": -2,
    "Fear": -3,
    "Anger": -3,
    "Sadness": -3,
    "Guilt": -3,
}

    df['emotion_score'] = df['predicted_emotion'].map(EMOTION_SCORE)

    # Step 5: Add stress, social media, and education scores
    df['stress_score'] = df['predicted_category'].map(STRESS_MAPPING)
    def get_stress_from_domain(row):
        if pd.notna(row['stress_score']):
            return row['stress_score']
        domain = str(row.get('url_domain', '')).lower()
        for key, score in DOMAIN_TO_STRESS.items():
            if key in domain:
                return score
        return 1  # Default
    df['stress_score'] = df.apply(get_stress_from_domain, axis=1)

    df['social_media_score'] = df['predicted_category'].map(SOCIAL_MEDIA_MAPPING)
    def get_social_media_from_domain(row):
        if pd.notna(row['social_media_score']):
            return row['social_media_score']
        domain = str(row.get('url_domain', '')).lower()
        for key, score in DOMAIN_TO_SOCIAL_MEDIA.items():
            if key in domain:
                return score
        return 1  # Default
    df['social_media_score'] = df.apply(get_social_media_from_domain, axis=1)

    df['education_score'] = df['predicted_category'].map(EDUCATION_MAPPING)
    def get_education_from_domain(row):
        if pd.notna(row['education_score']):
            return row['education_score']
        domain = str(row.get('url_domain', '')).lower()
        for key, score in DOMAIN_TO_EDUCATION.items():
            if key in domain:
                return score
        return 1  # Default
    df['education_score'] = df.apply(get_education_from_domain, axis=1)

    # Step 6: Save the final file
    df.to_csv(output_file, index=False)

    print("\nSUCCESS! Emotions added successfully!")
    print(f"Output saved: {output_file}")
    print("\nSample of your new data:")
    print(df[['title', 'url_domain', 'predicted_category', 'predicted_emotion', 'emotion_score']].head(10))

    # Bonus: Quick stats
    print("\nYour Emotional Summary (Today):")
    today = datetime.now().date()
    try:
        today_data = df[pd.to_datetime(df['time']).dt.date == today]
    except Exception:
        today_data = pd.DataFrame()

    if not today_data.empty:
        dominant = today_data['predicted_emotion'].mode()[0]
        avg_score = today_data['emotion_score'].mean()
        print(f"   Dominant Emotion: {dominant}")
        print(f"   Average Mood Score: {avg_score:+.2f} {'Positive' if avg_score > 0 else 'Negative'}")
    else:
        print("   No activity today yet!")

    return df


if __name__ == "__main__":
    # Run the CLI behavior (keep compatibility with original script)
    add_emotions_file()