"""
gemini_curator.py
Yazooblu Autonomous Social Media Content Creator Engine - Gemini Client
Generates editorial briefs, long-form copy, and multi-platform social media campaigns
for Bes Outkast Society Magazine using Google Gemini API.
"""

import os
import json
from typing import Dict, Any, Optional
from google import genai
from google.genai import types
from bes_outkast_columns import BOS_COLUMNS


class GeminiCurator:
    """Core generator for Yazooblu Autonomous Social Media Content Creator Engine."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Gemini API key not found. Please provide GEMINI_API_KEY via "
                "Streamlit secrets or environment variables."
            )
        self.client = genai.Client(api_key=self.api_key)
        self.model = model

    def generate_social_media_suite(
        self,
        column_name: str,
        topic_angle: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates full social media campaigns for a specific BOS column desk.
        Returns structured JSON tailored for multi-platform distribution.
        """
        col_meta = BOS_COLUMNS.get(column_name)
        if not col_meta:
            raise ValueError(f"Column '{column_name}' not registered in BOS_COLUMNS.")

        author = col_meta.get("author", "Editorial Desk")
        focus = col_meta.get("focus", "")
        recommended = ", ".join(col_meta.get("recommended_channels", []))
        topic = topic_angle or col_meta["sample_topics"][0]

        prompt = f"""
You are the primary engine powering the Yazooblu Autonomous Social Media Content Creator Engine.
Brand: Bes Outkast Society Magazine (Motto: "For the Love of the Dare")

Assigned Desk:
- Column: "{column_name}"
- Author/Voice: {author}
- Focus Area: {focus}
- Recommended Primary Channels: {recommended}
- Topic: "{topic}"

Generate an authoritative social distribution package. Deliver output strictly as JSON matching this schema:
{{
    "campaign_headline": "Punchy, sovereign headline capturing the angle",
    "editorial_thesis": "One-paragraph executive summary (60-90 words)",
    "platforms": {{
        "linkedin": {{
            "post_copy": "High-level thought-leadership breakdown with line breaks and strategic framing",
            "hashtags": ["#BesOutkastSociety", "#ExecutiveLeadership", "#Strategy"]
        }},
        "instagram": {{
            "caption": "Visually evocative editorial caption emphasizing tone and aesthetic command",
            "image_brief": "Art direction for photography/visual asset (lighting, chiaroscuro, subject)",
            "hashtags": ["#BesOutkastSociety", "#ForTheLoveOfTheDare", "#EditorialStyle"]
        }},
        "x_and_threads": {{
            "hook_post": "Direct contrarian statement under 250 characters",
            "follow_up_post": "Key takeaway expanding the hook"
        }},
        "tiktok_youtube_shorts": {{
            "hook_script": "First 3 seconds spoken audio hook",
            "visual_direction": "Framing notes and on-screen kinetic typography",
            "voiceover_copy": "60-second voiceover narration script"
        }}
    }},
    "pixabay_search_query": "Recommended 2-3 word search query for PixabayCurator asset lookup"
}}
"""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json",
            ),
        )
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            return {"raw_output": response.text}

    def generate_full_article(
        self,
        column_name: str,
        topic: str,
        word_count: int = 800
    ) -> str:
        """Generates full publication-ready long-form copy for website and newsletter dispatches."""
        col_meta = BOS_COLUMNS.get(column_name, {})
        author = col_meta.get("author", "Editorial Desk")
        focus = col_meta.get("focus", "")

        prompt = f"""
Yazooblu Autonomous Social Media Content Creator Engine - Long-Form Generator
Publication: Bes Outkast Society Magazine ("For the Love of the Dare")
Column: "{column_name}"
Author: {author}
Desk Focus: {focus}
Topic: "{topic}"

Write an uncompromising, high-impact feature article (~{word_count} words).
Tone: Decisive, intellectually sharp, culturally refined.
Avoid generic summaries or repetitive conclusions.
"""
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.75,
                max_output_tokens=2500,
            ),
        )
        return response.text
