"""
Pixabay Media Curator for YazooBlu Editorial Engine
Filters out commercial gloss, clip art, and over-downloaded viral stock.
Anchors queries with editorial film texture.
"""

import os
import random
import json
from typing import Optional, Dict, Any, List

# Load environment variables (.env if available)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Zero-dependency manual .env parser fallback
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

PIXABAY_KEY = os.getenv("PIXABAY_API_KEY")

BANNED_TAGS = {"cartoon", "illustration", "isolated", "white background", "3d render", "concept"}

def _http_get(url: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to perform HTTP GET using requests if available, or urllib.request."""
    try:
        import requests
        res = requests.get(url, params=params, timeout=8)
        return res.json()
    except ImportError:
        import urllib.request
        import urllib.parse
        query_string = urllib.parse.urlencode({k: str(v) for k, v in params.items()})
        full_url = f"{url}?{query_string}"
        req = urllib.request.Request(full_url, headers={"User-Agent": "YazooBlu-Curator/1.0"})
        with urllib.request.urlopen(req, timeout=8) as response:
            return json.loads(response.read().decode("utf-8"))

def fetch_curated_pixabay_photo(search_query: str, orientation: str = "all") -> Optional[str]:
    """
    Fetches a vetted editorial photograph from Pixabay API.
    - Appends 'subtle film dark' texture to query
    - Excludes clip-art, 3D renders, and isolated white backgrounds
    - Avoids viral stock (downloads > 60k) while demanding quality (downloads >= 50)
    - Returns a high-res image URL or None
    """
    if not PIXABAY_KEY or PIXABAY_KEY == "your_pixabay_api_key_here":
        print("[Pixabay] PIXABAY_API_KEY not configured in environment or .env.")
        return None
    
    # 1. Anchor the search query with editorial texture to avoid commercial stock gloss
    curated_q = f"{search_query} subtle film dark"
    
    url = "https://pixabay.com/api/"
    params = {
        "key": PIXABAY_KEY,
        "q": curated_q,
        "image_type": "photo",     # Strictly photos; rejects clip art & 3D renders
        "orientation": orientation,  # "horizontal", "vertical", or "all"
        "safesearch": "true",
        "per_page": 20,              # Pull a 20-image evaluation batch
        "page": random.randint(1, 2) # Dig slightly deeper into the catalog
    }
    
    try:
        res = _http_get(url, params)
        hits = res.get("hits", [])
        if not hits:
            # Fallback to the unadorned query if the refined query was too strict
            params["q"] = search_query
            params["page"] = 1
            res = _http_get(url, params)
            hits = res.get("hits", [])
            
        qualifying_photos = []
        for photo in hits:
            tags = [t.strip().lower() for t in photo.get("tags", "").split(",")]
            downloads = photo.get("downloads", 0)
            
            # RULE 1: Reject images with cheesy or artificial tags
            if any(banned in tags for banned in BANNED_TAGS):
                continue
                
            # RULE 2: Over-saturation filter (pass up images downloaded hundreds of thousands of times)
            if downloads > 60000:
                continue
                
            # RULE 3: Quality threshold (must have reasonable community approval without being viral stock)
            if downloads < 50:
                continue
                
            qualifying_photos.append(photo)
            
        # Select from the vetted pool (not just the first one)
        if qualifying_photos:
            winner = random.choice(qualifying_photos[:8])
            return winner.get("largeImageURL") or winner.get("webformatURL")
        elif hits:
            return hits[0].get("largeImageURL")
            
    except Exception as e:
        print(f"Pixabay photo error: {e}")
        
    return None

def fetch_curated_pixabay_video(search_query: str) -> Optional[str]:
    """
    Fetches vetted b-roll stock video from Pixabay API.
    - Filters out over-downloaded generic b-roll (> 30k downloads)
    - Returns video MP4 stream URL or None
    """
    if not PIXABAY_KEY or PIXABAY_KEY == "your_pixabay_api_key_here":
        print("[Pixabay] PIXABAY_API_KEY not configured in environment or .env.")
        return None
        
    url = "https://pixabay.com/api/videos/"
    params = {
        "key": PIXABAY_KEY,
        "q": search_query,
        "safesearch": "true",
        "per_page": 10
    }
    
    try:
        res = _http_get(url, params)
        hits = res.get("hits", [])
        
        # Filter videos with extreme view counts to avoid generic b-roll
        curated_videos = [v for v in hits if v.get("downloads", 0) < 30000]
        pool = curated_videos if curated_videos else hits
        
        if pool:
            chosen = random.choice(pool[:5])
            vids = chosen.get("videos", {})
            return vids.get("medium", {}).get("url") or vids.get("large", {}).get("url")
    except Exception as e:
        print(f"Pixabay video error: {e}")
        
    return None

if __name__ == "__main__":
    import sys
    query = sys.argv[1] if len(sys.argv) > 1 else "bespoke tailoring worsted wool"
    print("=" * 60)
    print("YazooBlu Editorial Media Curator (Pixabay)")
    print(f"Active Key Status: {'Configured' if PIXABAY_KEY and PIXABAY_KEY != 'your_pixabay_api_key_here' else 'Missing/Default in .env'}")
    print(f"Query: '{query}'")
    print("=" * 60)
    photo_url = fetch_curated_pixabay_photo(query)
    print(f"Curated Photo Result: {photo_url or 'None (provide valid PIXABAY_API_KEY in .env)'}")
    
    video_url = fetch_curated_pixabay_video(query)
    print(f"Curated Video Result: {video_url or 'None (provide valid PIXABAY_API_KEY in .env)'}")
