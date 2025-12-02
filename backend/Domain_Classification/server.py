from flask import Flask, jsonify, send_file
from flask_cors import CORS
import os
import pandas as pd
import joblib

from add_emotions import add_emotions_file

HERE = os.path.dirname(__file__)

# Paths
MODEL_PATH = os.path.join(HERE, "url_classifier_model_8classes.pkl")
INPUT_PATH = os.path.normpath(os.path.join(HERE, "..", "browsing-history", "output", "history.csv"))
PREDICTED_PATH = os.path.join(HERE, "predicted_history.csv")
EMOTIONS_PATH = os.path.join(HERE, "predicted_history_with_emotions.csv")

app = Flask(__name__)
CORS(app)

import logging
from flask import request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.before_request
def log_request_info():
    logger.info(f"Received request: {request.method} {request.path}")

@app.after_request
def log_response_info(response):
    logger.info(f"Responded with status: {response.status_code} for {request.method} {request.path}")
    return response

def calculate_correlation_insights(df):
    """
    Calculates correlation insights for the given dataframe.
    Correlations between features like stress, social media, education and mood are computed.
    Returns a dictionary with correlation coefficients and interpretations.
    """
    correlation_results = {}

    # Relevant columns for correlation
    # Assuming df has columns like 'stress_score', 'social_media_score', 'education_score', 'emotion_score'
    relevant_columns = ['stress_score', 'social_media_score', 'education_score', 'emotion_score']
    missing_cols = [col for col in relevant_columns if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns in data for correlation: {missing_cols}")

    corr_matrix = df[relevant_columns].corr()

    correlation_results['correlation_matrix'] = corr_matrix.to_dict()

    # Example interpretation: strong positive or negative correlations
    interpretations = {}
    for col in relevant_columns:
        correlations = corr_matrix[col].drop(col)
        for target_col, corr_value in correlations.items():
            key = f"{col}_vs_{target_col}"
            interpretations[key] = ""
            if abs(corr_value) > 0.7:
                relation = "strong positive" if corr_value > 0 else "strong negative"
                interpretations[key] = f"{relation} correlation"
            elif abs(corr_value) > 0.4:
                relation = "moderate positive" if corr_value > 0 else "moderate negative"
                interpretations[key] = f"{relation} correlation"
            else:
                interpretations[key] = "weak or no correlation"

    correlation_results['interpretations'] = interpretations

    return correlation_results

def load_model(path=MODEL_PATH):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")
    return joblib.load(path)


model = None
try:
    model = load_model()
except Exception as e:
    # Model might be missing in some dev setups; endpoints will return helpful error
    logger.warning(f"Warning: could not load model: {e}")


@app.route("/auto_classify", methods=["GET"])
def auto_classify():
    try:
        if not os.path.exists(INPUT_PATH):
            return jsonify({"error": f"Input file not found: {INPUT_PATH}"}), 404

        if model is None:
            return jsonify({"error": "Classification model not available on server."}), 500

        # Use pandas to load the CSV (auto-detect delimiter)
        df = pd.read_csv(INPUT_PATH, sep=None, engine="python")
        if 'url' not in df.columns:
            return jsonify({"error": "No 'url' column found in input CSV."}), 400

        df['predicted_category'] = model.predict(df['url'])
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
        df.to_csv(PREDICTED_PATH, index=False)

        return jsonify({
            "message": "Prediction complete",
            "input_file": INPUT_PATH,
            "output_file": PREDICTED_PATH,
            "rows": len(df)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/add_emotions", methods=["GET"])
def add_emotions():
    try:
        if not os.path.exists(PREDICTED_PATH):
            return jsonify({"error": f"Predicted file not found: {PREDICTED_PATH}"}), 404

        df = add_emotions_file(input_file=PREDICTED_PATH, output_file=EMOTIONS_PATH)

        # Return some quick metadata and a preview
        preview = df[['title', 'url_domain', 'predicted_category', 'predicted_emotion', 'emotion_score']].head(10).to_dict(orient='records')
        return jsonify({
            "message": "Emotions added successfully",
            "output_file": EMOTIONS_PATH,
            "rows": len(df),
            "preview": preview
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/files/<path:filename>', methods=['GET'])
def serve_file(filename):
    # Simple file serving helper for the two CSVs in the same folder
    allowed = ['predicted_history.csv', 'predicted_history_with_emotions.csv']
    if filename not in allowed:
        return jsonify({'error': 'File not allowed'}), 403
    fpath = os.path.join(HERE, filename)
    if not os.path.exists(fpath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(fpath, as_attachment=True)


@app.route('/correlation', methods=['GET'])
def get_correlation():
    import json
    from flask import request

    try:

        data_json = request.get_json(force=True, silent=True)
        if data_json is None:
            return jsonify({"error": "Invalid or missing JSON data in request"}), 400
        
        # Option 1: data included directly as list of dicts
        if 'data' in data_json:
            records = data_json['data']
            df = pd.DataFrame(records)
        # Option 2: path to CSV (optional)
        elif 'csv_path' in data_json:
            csv_path = data_json['csv_path']
            if not os.path.exists(csv_path):
                return jsonify({"error": f"CSV path does not exist: {csv_path}"}), 400
            df = pd.read_csv(csv_path)
        else:
            return jsonify({"error": "JSON must contain 'data' or 'csv_path' key"}), 400

        # Add emotions and scores to df using add_emotions_file logic (if needed)
        # Use add_emotions_file only if input is from csv_path to update EMOTIONS_PATH
        if 'csv_path' in data_json:
            # This will save the emotions csv but also return the df with emotions and scores
            df = add_emotions_file(input_file=data_json['csv_path'], output_file=EMOTIONS_PATH)
        else:
            # If data given directly, calculate scores if missing
            from add_emotions import STRESS_MAPPING, DOMAIN_TO_STRESS, SOCIAL_MEDIA_MAPPING, DOMAIN_TO_SOCIAL_MEDIA, EDUCATION_MAPPING, DOMAIN_TO_EDUCATION, EMOTION_MAPPING, DOMAIN_TO_EMOTION, EMOTION_SCORE

            # Calculate emotion if missing
            if 'predicted_emotion' not in df.columns:
                if 'predicted_category' in df.columns:
                    df['predicted_emotion'] = df['predicted_category'].map(EMOTION_MAPPING)
                    def get_emotion_from_domain(row):
                        if pd.notna(row['predicted_emotion']):
                            return row['predicted_emotion']
                        domain = str(row.get('url_domain', '')).lower()
                        for key, emotion in DOMAIN_TO_EMOTION.items():
                            if key in domain:
                                return emotion
                        return "Neutral"
                    df['predicted_emotion'] = df.apply(get_emotion_from_domain, axis=1)
                    df['emotion_score'] = df['predicted_emotion'].map(EMOTION_SCORE)

            # Calculate scores if missing
            if 'stress_score' not in df.columns:
                df['stress_score'] = df['predicted_category'].map(STRESS_MAPPING) if 'predicted_category' in df.columns else None
                def get_stress_from_domain(row):
                    if pd.notna(row['stress_score']):
                        return row['stress_score']
                    domain = str(row.get('url_domain', '')).lower()
                    for key, score in DOMAIN_TO_STRESS.items():
                        if key in domain:
                            return score
                    return 1
                df['stress_score'] = df.apply(get_stress_from_domain, axis=1)

            if 'social_media_score' not in df.columns:
                df['social_media_score'] = df['predicted_category'].map(SOCIAL_MEDIA_MAPPING) if 'predicted_category' in df.columns else None
                def get_social_media_from_domain(row):
                    if pd.notna(row['social_media_score']):
                        return row['social_media_score']
                    domain = str(row.get('url_domain', '')).lower()
                    for key, score in DOMAIN_TO_SOCIAL_MEDIA.items():
                        if key in domain:
                            return score
                    return 1
                df['social_media_score'] = df.apply(get_social_media_from_domain, axis=1)

            if 'education_score' not in df.columns:
                df['education_score'] = df['predicted_category'].map(EDUCATION_MAPPING) if 'predicted_category' in df.columns else None
                def get_education_from_domain(row):
                    if pd.notna(row['education_score']):
                        return row['education_score']
                    domain = str(row.get('url_domain', '')).lower()
                    for key, score in DOMAIN_TO_EDUCATION.items():
                        if key in domain:
                            return score
                    return 1
                df['education_score'] = df.apply(get_education_from_domain, axis=1)

        # Ensure relevant columns are numeric before correlation
        relevant_columns = ['stress_score', 'social_media_score', 'education_score', 'emotion_score']
        for col in relevant_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        df = df.dropna(subset=relevant_columns)

        correlation_results = calculate_correlation_insights(df)

        logger.info(f"/getCorrelationInsights processed successfully with {len(df)} records.")

        return jsonify({
            "message": "Correlation analysis complete",
            "correlation_results": correlation_results,
            "data_rows": len(df)
        })

    except Exception as e:
        logger.error(f"Error in /getCorrelationInsights: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/get_emotion_data', methods=['GET'])
def get_emotion_data():
    try:
        if not os.path.exists(EMOTIONS_PATH):
            return jsonify({"error": f"Emotions file not found: {EMOTIONS_PATH}"}), 404

        df = pd.read_csv(EMOTIONS_PATH)
        # Convert to JSON serializable format
        data = df.to_dict(orient='records')
        return jsonify({
            "message": "Emotion data retrieved successfully",
            "data": data,
            "rows": len(data)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/mood/generateMoodTrends', methods=['GET'])
def generate_mood_trends():
    try:
        period = request.args.get('period', 'monthly')

        if not os.path.exists(EMOTIONS_PATH):
            return jsonify({"error": f"Emotions file not found: {EMOTIONS_PATH}"}), 404

        df = pd.read_csv(EMOTIONS_PATH)

        # Ensure we have the required columns
        required_cols = ['emotion_score', 'stress_score', 'social_media_score', 'education_score', 'predicted_emotion']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({"error": f"Missing required columns: {missing_cols}"}), 400

        # Add visit_time if not present (for grouping)
        if 'visit_time' not in df.columns:
            # Create synthetic timestamps for demo purposes
            df['visit_time'] = pd.date_range(start='2024-01-01', periods=len(df), freq='H')

        df['visit_time'] = pd.to_datetime(df['visit_time'])

        # Group by period
        if period == 'daily':
            df['period'] = df['visit_time'].dt.date
            df['period_label'] = df['visit_time'].dt.strftime('%Y-%m-%d')
        elif period == 'weekly':
            df['period'] = df['visit_time'].dt.to_period('W').astype(str)
            df['period_label'] = df['period']
        else:  # monthly
            df['period'] = df['visit_time'].dt.to_period('M').astype(str)
            df['period_label'] = df['period']

        # Calculate mood trends
        mood_trends = df.groupby('period_label').agg({
            'emotion_score': 'mean',
            'stress_score': 'mean',
            'social_media_score': 'mean',
            'education_score': 'mean',
            'predicted_emotion': lambda x: x.mode().iloc[0] if len(x) > 0 else 'Neutral'
        }).reset_index()

        # Rename columns to match expected format
        mood_trends = mood_trends.rename(columns={
            'emotion_score': 'mood_score',
            'predicted_emotion': 'mood_label',
            'stress_score': 'avg_stress',
            'social_media_score': 'avg_social_media',
            'education_score': 'avg_education'
        })

        # Calculate emotion distribution
        emotion_dist = df.groupby('predicted_emotion').size().reset_index(name='visit_count')
        emotion_dist['total_minutes'] = emotion_dist['visit_count'] * 5  # Assuming 5 minutes per visit
        emotion_dist = emotion_dist.rename(columns={'predicted_emotion': 'emotion'})

        # Convert to expected format
        points = mood_trends.to_dict('records')
        emotion_distribution = emotion_dist.to_dict('records')

        return jsonify({
            "points": points,
            "emotion_distribution": emotion_distribution
        })

    except Exception as e:
        logger.error(f"Error in generate_mood_trends: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "Server is healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
