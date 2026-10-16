"""
Updated creative-first palette architecture for graphics.py
YazooBlu Media Matrix — 7 Sovereign Brand Personas
"""

BRAND_PALETTES = {
    # 1. BH&W PR: Monolithic charcoal with sharp sovereign gold
    "bhw_pr": {
        "bg": (14, 17, 23),
        "accent": (224, 159, 62),    # Antique Gold
        "secondary": (70, 80, 95),
        "text": (244, 241, 234)      # Newsprint bone
    },
    
    # 2. Bes Outkast Society: Editorial burgundy & warm tailored amber
    "bes_outkast": {
        "bg": (26, 11, 16),          # Obsidian Wine
        "accent": (198, 40, 68),     # Vivid Sartorial Crimson
        "secondary": (218, 165, 32), # Antique Gold
        "text": (248, 244, 240)
    },
    
    # 3. Nuecofab: Rugged industrial graphite with electric kinetic green
    "nuecofab": {
        "bg": (18, 22, 20),
        "accent": (0, 230, 118),     # Kinetic Clean-Tech Green
        "secondary": (44, 62, 80),
        "text": (240, 245, 240)
    },
    
    # 4. Creatives Consortium: Deep space violet with electric acid volt
    "creatives": {
        "bg": (15, 12, 25),          # Deep Studio Violet
        "accent": (212, 255, 0),     # Electric Lime Volt (High-Impact Creative)
        "secondary": (155, 89, 182),
        "text": (255, 255, 255)
    },
    
    # 5. Porch MD: Clinical restorative slate with biophilic eucalyptus teal
    "porch_md": {
        "bg": (16, 24, 28),
        "accent": (46, 204, 180),    # Restorative Bio-Teal
        "secondary": (52, 73, 94),
        "text": (240, 248, 250)
    },
    
    # 6. Fyrrion Cybersecurity: Terminal void with stark phosphor cyan
    "fyrrion": {
        "bg": (8, 11, 16),           # Terminal Void
        "accent": (0, 255, 200),     # Telemetry Phosphor Cyan
        "secondary": (20, 35, 45),
        "text": (230, 245, 250)
    },
    
    # 7. Hilton Head Summit: Stately executive navy with brushed champagne bronze
    "hilton_head": {
        "bg": (16, 20, 30),
        "accent": (212, 175, 55),    # Brushed Champagne Bronze
        "secondary": (80, 90, 110),
        "text": (245, 245, 240)
    }
}

def rgb_to_hex(rgb_tuple):
    """Convert RGB tuple (r, g, b) to hex string #rrggbb."""
    return f"#{rgb_tuple[0]:02x}{rgb_tuple[1]:02x}{rgb_tuple[2]:02x}"

def get_palette_hex(brand_key):
    """Retrieve brand palette converted to hex format."""
    palette = BRAND_PALETTES.get(brand_key)
    if not palette:
        raise ValueError(f"Unknown brand key: {brand_key}")
    return {k: rgb_to_hex(v) for k, v in palette.items()}

if __name__ == "__main__":
    print("YazooBlu Creative-First Palette Architecture Loaded:")
    for brand, colors in BRAND_PALETTES.items():
        print(f"  [{brand}]: accent={colors['accent']} -> {rgb_to_hex(colors['accent'])}, bg={colors['bg']}")
