import pandas as pd
from urllib.parse import urlparse
import tldextract

def clean_url(url):
    """
    Clean the URL by removing query parameters.
    """
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

def extract_domain(url):
    """
    Extract the base domain from the URL using tldextract.
    """
    extracted = tldextract.extract(url)
    return f"{extracted.domain}.{extracted.suffix}"

def clean_data(history_list):
    """
    Clean the raw history data: convert timestamps, clean URLs, extract domains.
    Returns a pandas DataFrame.
    """
    df = pd.DataFrame(history_list)

    # Convert Chrome timestamps to datetime
    from modules.db_reader import chrome_timestamp_to_datetime
    df['time'] = df['visit_time'].apply(chrome_timestamp_to_datetime)

    # Clean URLs
    df['url_clean'] = df['url'].apply(clean_url)

    # Extract domains
    df['url_domain'] = df['url'].apply(extract_domain)

    # Keep all columns as per new sequence
    return df
