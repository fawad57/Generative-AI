import pandas as pd
import uuid
from datetime import datetime

def add_date_time_features(df):
    """
    Add derived date/time features to the DataFrame.
    """
    # Ensure 'time' is datetime
    if not pd.api.types.is_datetime64_any_dtype(df['time']):
        df['time'] = pd.to_datetime(df['time'], errors='coerce')

    df['hour'] = df['time'].dt.hour
    df['day_of_week'] = df['time'].dt.dayofweek  # 0=Monday, 6=Sunday
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)  # 5=Saturday, 6=Sunday
    df['day_of_month'] = df['time'].dt.day
    df['week_of_month'] = ((df['time'].dt.day - 1) // 7) + 1
    df['month_of_year'] = df['time'].dt.month

    # Total history days: difference from earliest to latest visit
    min_time = df['time'].min()
    max_time = df['time'].max()
    total_days = (max_time - min_time).days if pd.notna(min_time) and pd.notna(max_time) else 0
    df['total_history_days'] = total_days

    return df

def calculate_seconds_until_next_visit(df, group_by='url'):
    """
    Calculate seconds until next visit for each group (url, url_clean, or url_domain).
    """
    df = df.sort_values('time').reset_index(drop=True)

    # Group by the specified column and calculate time differences
    df[f'seconds_until_next_visit_{group_by.replace("url_", "")}'] = df.groupby(group_by)['time'].diff(-1).dt.total_seconds().abs()

    # Fill NaN for the last visit in each group
    df[f'seconds_until_next_visit_{group_by.replace("url_", "")}'] = df[f'seconds_until_next_visit_{group_by.replace("url_", "")}'].fillna(-1)

    return df

def add_additional_features(df):
    """
    Add page_transition, ref_id, is_local, and auto-generated fields.
    Note: Chrome's visits table has page_transition, but for simplicity, we'll assume or set defaults.
    Since we don't have visits table data, we'll set defaults or skip some.
    """
    # For now, set defaults as per requirements; in a full implementation, join with visits table
    df['page_transition'] = 'LINK'  # Default
    df['ref_id'] = None  # Not available without visits table
    df['is_local'] = 0  # Assume not local

    # Auto-generate
    df['id'] = [str(uuid.uuid4()) for _ in range(len(df))]  # New unique id
    df['client_id'] = str(uuid.uuid4())  # Same for all records
    df['updated_at'] = datetime.now().isoformat()

    return df

def engineer_features(df):
    """
    Apply all feature engineering steps.
    """
    df = add_date_time_features(df)
    df = calculate_seconds_until_next_visit(df, 'url')
    df = calculate_seconds_until_next_visit(df, 'url_clean')
    df = calculate_seconds_until_next_visit(df, 'url_domain')
    df = add_additional_features(df)

    # Ensure all required columns are present
    required_columns = [
        'url', 'title', 'visit_time', 'from_visit', 'transition', 'visit_id', 'time', 'url_clean', 'url_domain',
        'hour', 'day_of_week', 'is_weekend', 'day_of_month', 'week_of_month', 'month_of_year', 'total_history_days',
        'seconds_until_next_visit_url', 'seconds_until_next_visit_url_clean', 'seconds_until_next_visit_domain',
        'seconds_until_next_visit', 'page_transition', 'id', 'client_id', 'updated_at', 'is_local', 'ref_id'
    ]

    # Add missing columns if not present
    for col in required_columns:
        if col not in df.columns:
            df[col] = None

    # Note: 'seconds_until_next_visit' might be a duplicate; assuming it's the same as url
    df['seconds_until_next_visit'] = df['seconds_until_next_visit_url']

    # Reorder columns
    df = df[required_columns]

    return df
