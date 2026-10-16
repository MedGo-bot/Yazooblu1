"""
app.py
Yazooblu Autonomous Social Media Content Creator Engine
Interactive Streamlit Dashboard for Bes Outkast Society Magazine
"""

import streamlit as st
from bes_outkast_columns import BOS_COLUMNS, BOS_COLUMN_NAMES
from gemini_curator import GeminiCurator

try:
    import graphics
    HAS_GRAPHICS = True
except ImportError:
    HAS_GRAPHICS = False

st.set_page_config(
    page_title="Yazooblu Engine | Bes Outkast Society",
    page_icon="⚡",
    layout="wide"
)

# Header & Identity
st.title("⚡ Yazooblu Autonomous Social Media Content Creator Engine")
st.caption("Bes Outkast Society Magazine — *'For the Love of the Dare'*")
st.divider()

# Load API Credentials
gemini_key = st.secrets.get("GEMINI_API_KEY")

if not gemini_key:
    st.error("Missing `GEMINI_API_KEY`. Please add it to your Streamlit secrets or local `.env`.")
    st.stop()

curator = GeminiCurator(api_key=gemini_key)

# Sidebar: Column Selection
with st.sidebar:
    st.header("Editorial Desk Selection")
    selected_column = st.selectbox(
        "Select Editorial Column",
        options=BOS_COLUMN_NAMES,
        index=0
    )
    
    col_data = BOS_COLUMNS[selected_column]
    st.markdown(f"**Lead Author / Byline:** {col_data.get('author', 'Editorial Desk')}")
    st.markdown(f"**Desk Focus:** {col_data.get('focus', '')}")
    st.markdown(f"**Primary Channels:** {', '.join(col_data.get('recommended_channels', []))}")
    st.divider()
    
    selected_topic = st.selectbox(
        "Choose Focus Angle",
        options=col_data.get("sample_topics", ["Custom Angle"])
    )
    
    custom_angle = st.text_input("Or enter a custom angle / breaking headline:")
    active_angle = custom_angle.strip() if custom_angle.strip() else selected_topic

# Main Canvas
st.subheader(f"Active Desk: {selected_column}")
st.write(f"**Assigned Topic:** {active_angle}")

if st.button("🚀 Generate Multi-Platform Content Suite", type="primary", use_container_width=True):
    with st.spinner(f"Orchestrating campaign for '{selected_column}' via Gemini..."):
        suite = curator.generate_social_media_suite(selected_column, active_angle)
        
        st.success("Campaign Package Generated Successfully!")
        st.subheader(suite.get("campaign_headline", selected_column))
        st.info(f"**Executive Thesis:** {suite.get('editorial_thesis', '')}")
        
        tab_li, tab_ig, tab_xt, tab_video, tab_visuals = st.tabs([
            "💼 LinkedIn", 
            "📸 Instagram", 
            "🧵 X / Threads", 
            "🎬 Shorts / TikTok", 
            "🎨 Visual Direction"
        ])
        
        platforms = suite.get("platforms", {})
        
        with tab_li:
            li_data = platforms.get("linkedin", {})
            st.text_area("LinkedIn Post Copy", li_data.get("post_copy", ""), height=220)
            st.caption("Hashtags: " + " ".join(li_data.get("hashtags", [])))
            
        with tab_ig:
            ig_data = platforms.get("instagram", {})
            st.text_area("Instagram Caption", ig_data.get("caption", ""), height=180)
            st.markdown(f"**Visual Direction:** {ig_data.get('image_brief', '')}")
            st.caption("Hashtags: " + " ".join(ig_data.get("hashtags", [])))
            
        with tab_xt:
            xt_data = platforms.get("x_and_threads", {})
            st.text_input("Hook Post (Under 280 chars)", xt_data.get("hook_post", ""))
            st.text_area("Follow-Up / Thread Context", xt_data.get("follow_up_post", ""), height=120)
            
        with tab_video:
            video_data = platforms.get("tiktok_youtube_shorts", {})
            st.markdown(f"**Spoken 3s Hook:** `{video_data.get('hook_script', '')}`")
            st.markdown(f"**Visual / Framing Notes:** {video_data.get('visual_direction', '')}")
            st.text_area("60s Voiceover Script", video_data.get("voiceover_copy", ""), height=160)
            
        with tab_visuals:
            pixabay_query = suite.get("pixabay_search_query", "editorial portrait")
            st.markdown(f"**Generated Image Query:** `{pixabay_query}`")
            if HAS_GRAPHICS:
                st.caption("`graphics.py` is detected and ready for asset pipeline execution.")
