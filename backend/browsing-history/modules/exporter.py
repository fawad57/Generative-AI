import pandas as pd
import os

def export_to_csv(df, output_dir='output'):
    """
    Export the DataFrame to CSV.
    """
    path = os.path.join(output_dir, 'history.csv')
    df.to_csv(path, index=False)
    print(f"Exported to {path}")

def export_to_json(df, output_dir='output'):
    """
    Export the DataFrame to JSON.
    """
    path = os.path.join(output_dir, 'history.json')
    df.to_json(path, orient='records', date_format='iso')
    print(f"Exported to {path}")

def export_data(df, output_dir='output'):
    """
    Export the dataset to both CSV and JSON formats.
    """
    export_to_csv(df, output_dir)
    export_to_json(df, output_dir)
