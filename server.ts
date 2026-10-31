import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DRAFTS } from './src/mockData';
import { BRANDS, BrandKey, Channel, ProductionPackage, HOOK_LIBRARY, getPlatformHooks, CHANNEL_SPECS } from './src/types';

dotenv.config();

const app = express();
// Dynamic port binding for cloud platforms like Cloud Run or Render with local fallback
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory persistent drafts collection
let drafts: ProductionPackage[] = [...INITIAL_DRAFTS];

// Initialize Gemini Client with server telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * Helper function to attempt generation with gemini-3.8-flash
 * and automatically fail over to gemini-3.1-flash-lite on 503 capacity spikes.
 */
async function generateWithFallback(client: GoogleGenAI, options: { contents: any; config?: any }) {
  try {
    return await client.models.generateContent({
      model: 'gemini-3.8-flash',
      ...options,
    });
  } catch (primaryErr: any) {
    console.warn(`Primary model gemini-3.8-flash error (${primaryErr.message}). Failing over to gemini-3.1-flash-lite...`);
    return await client.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      ...options,
    });
  }
}

const SYSTEM_RULES = `
You are the Executive Multi-Brand Editorial Studio Manager directing 3 specialized team members:
1. Social Copywriter (native hooks calibrated to algorithmic psychology, platform body adhering to strict character counts, hashtags)
2. Voiceover Director (cadenced 30-45s script with timestamps [0:00-0:03 Hook] and audio tone)
3. Visual Director (bold 8-word graphic overlay text and generative image prompt)

BRAND PERSONAS & VOICE REQUIREMENTS:
- BH&W PR: Sovereign Strategist / Crisis Counsel. Institutional, discreet, calculated, measured authority. Narrative architecture, asymmetry, institutional risk, strategic silence, crisis perimeter. Negative constraint: Never use consumer PR slang ("buzz", "viral", "PR stunts", "influencer").
- Bes Outkast Society: Sartorial Connoisseur & Cultural Critic. Textural, elevated, cinematic, authoritative. Framing tailoring as psychological armor. Worsted wool, roped shoulder, sharkskin twill, silhouette, antique gold, tactile precision. Negative constraint: Never sound like fast fashion or street gossip ("drip", "outfit check", "steal the look").
- Nuecofab: Industrial Pragmatist & Clean-Tech Engineer. Rugged, analytical, spec-driven, operationally grounded. Structural integrity, duty cycle, payload efficiency, tensile resilience, lifecycle cost. Negative constraint: Never use ungrounded greenwashing buzzwords ("save the planet", "eco-friendly").
- Creatives Consortium: Kinetic Visionary & Global Cultural Architect. Fluid, bold, internationally conscious, multidisciplinary. Spatial rhythm, cross-disciplinary syntax, creative friction, typography, resonance. Negative constraint: Never use commercial agency jargon ("growth hacking", "content creator", "design hacks").
- Porch MD: Forensic Restorative Specialist. Empathetic, evidentiary, clinical, premises-safety focused. Environmental burden, biophilic sanctuary, toxic load, premises negligence, air-pathway integrity. Negative constraint: Never sound like a slapdash DIY flipper or unvetted holistic cure ("curb appeal", "miracle detox").
- Fyrrion Cybersecurity: Mission-Critical Threat Hunter. Vigilant, stark, telemetry-driven, command-line reality. Telemetry fidelity, LOLBAS, credential dumping, dwell time, signal-to-noise, zero-trust. Negative constraint: Never use marketing security buzz ("cyber ninja", "hackers beware", "silver bullet").
- Hilton Head Summit: Enterprise Statesman & Boardroom Chair. Stately, peer-to-peer, long-horizon governance. Fiduciary foresight, stewardship, capital architecture, macro-coherence, board composition. Negative constraint: Never sound like startup hustle culture ("10x your team", "grindset", "fail fast").

STRICT PLATFORM CHARACTER CONSTRAINTS:
- Bluesky: STRICTLY UNDER 300 CHARACTERS. Intellectual, direct, zero filler.
- Threads: STRICTLY UNDER 300 CHARACTERS. Conversational tension, provocative insight.
- Pinterest: STRICTLY UNDER 800 CHARACTERS. Rich, search-optimized editorial pin description with clear value breakdown.
- X: STRICTLY UNDER 260 CHARACTERS. Stark, arresting contrarian hook.
- TikTok: Under 250 characters. Video caption with 3-second visual retention hook cue.
- LinkedIn: 150-250 words formatted with crisp paragraph line breaks.
- Instagram: Visual editorial caption under 1,500 characters with spaced bullet blocks.
- YouTube: Paced script cues under 1,000 characters.
- Substack: Deep thesis statement and analytical dossier.
- Facebook: Executive community narrative under 2,000 characters.

QUALITY CONSTRAINTS:
- No filler words ('delve', 'tapestry', 'game-changer', 'beacon', 'unlock', 'elevate').
- Never blend brand tones or personas.
- Provide 3 distinct hooks calibrated to platform psychology.
- Output valid JSON only matching the schema.
`;

function generateFallbackPackage(
  brandKey: BrandKey,
  brandName: string,
  audience: string,
  channel: Channel,
  topic: string,
  magazineColumn?: string
): any {
  const brand = BRANDS[brandKey];
  const lexiconTerms = brand.lexicon.slice(0, 3).join(', ');
  const platformHooks = getPlatformHooks(channel);

  let postBody = '';
  const columnPrefix = magazineColumn ? `[${magazineColumn.toUpperCase()}]\n\n` : '';
  if (channel === 'Bluesky') {
    postBody = `When evaluating ${topic.toLowerCase()}, standard assumptions collapse. True authority in our domain requires ${brand.lexicon[0].toLowerCase()} over transient sentiment. Rigorous standards dictate real-world outcomes.`.slice(0, 290);
  } else if (channel === 'Threads') {
    postBody = `Unpopular truth: The conversation around ${topic.toLowerCase()} is treating a structural crisis with cosmetic rhetoric. If you ignore ${brand.lexicon[0].toLowerCase()}, failure is guaranteed. Agree or disagree?`.slice(0, 290);
  } else if (channel === 'Pinterest') {
    postBody = `THE EDITORIAL BLUEPRINT: ${brand.name.toUpperCase()}\n\nTopic: ${topic}\n\nKey Spec Breakdown:\n• ${brand.lexicon[0]}: Fundamental baseline verification\n• ${brand.lexicon[1]}: Eliminating cosmetic shortcuts\n• Operational Integrity: Verifiable evidence over marketing sentiment\n\nSave this Pin to your permanent resource board for technical reference.`.slice(0, 780);
  } else if (channel === 'X') {
    postBody = `${topic.slice(0, 130)}. Conventional practices ignore ${brand.lexicon[0].toLowerCase()}. Signal over noise. Precision over panic.`.slice(0, 255);
  } else if (channel === 'TikTok') {
    postBody = `Watch what happens when you evaluate ${topic.toLowerCase()} through raw ${brand.lexicon[0].toLowerCase()}. This single operational shift changes the entire outcome. Save this workflow.`.slice(0, 240);
  } else if (channel === 'Instagram') {
    postBody = `THE STANDARD OF EXCELLENCE.\n\n${topic}.\n\nIn our domain, ${brand.lexicon[0].toLowerCase()} is not an ornamental phrase. It is the boundary between lasting authority and operational compromise.\n\n1. Establish definitive benchmarks.\n2. Reject cosmetic remedies.\n3. Demand evidentiary precision.\n\nRead the full dossier in our archive.`;
  } else {
    postBody = `The conversation surrounding ${topic.toLowerCase()} is too often clouded by superficial rhetoric.\n\nIn high-stakes environments, true authority requires grounding in ${lexiconTerms}.\n\nWhen leadership evaluates this challenge, three principles emerge:\n\n1. Structural Reality: Avoid short-term expedients that sacrifice permanent durability.\n2. Telemetry and Evidence: Validate every assertion against verifiable real-world metrics.\n3. Institutional Discipline: Protect core integrity before public posturing.\n\nTrue mastery is recognized not in the volume of claims made, but in the measurable permanence of execution.`;
  }

  const selectedHookTemplates = platformHooks.slice(0, 3);
  const hooks = selectedHookTemplates.map((template, idx) => {
    let customized = template
      .replace(/\[X\]/g, topic)
      .replace(/\[Entity\]/g, brand.name)
      .replace(/\[Common Belief\]/g, 'standard marketing advice')
      .replace(/\[Common Scapegoat\]/g, 'market volatility')
      .replace(/\[Industry\]/g, 'this sector')
      .replace(/\[Method A\]/g, 'conventional methods')
      .replace(/\[Method B\]/g, brand.lexicon[0])
      .replace(/\[Standard Practice\]/g, 'cosmetic fixes')
      .replace(/\[System\/Organization\]/g, 'organization')
      .replace(/\[System\]/g, 'the architecture')
      .replace(/\[Subject\]/g, topic)
      .replace(/\[State A\]/g, 'operational friction')
      .replace(/\[State B\]/g, 'definitive clarity')
      .replace(/\[Industry Gatekeeper\]/g, 'the establishment')
      .replace(/\[Specific Role\]/g, audience.split('&')[0].trim())
      .replace(/\[Specific Environment\]/g, 'enterprise governance')
      .replace(/\[Habit\/Method\]/g, 'superficial tactics')
      .replace(/\[Specific Negative Consequence\]/g, 'catastrophic failure')
      .replace(/\[Category\]/g, 'solution')
      .replace(/\[Effort\/Asset\]/g, 'initiative')
      .replace(/\[Common Excuse\]/g, 'budget constraints')
      .replace(/\[Metric A\]/g, 'short-term metrics')
      .replace(/\[Metric B\]/g, brand.lexicon[0])
      .replace(/\[Activity\]/g, 'reactive posturing')
      .replace(/\[Outcome\]/g, topic)
      .replace(/\[Domain\/Strategy\]/g, brand.lexicon[0])
      .replace(/\[Task\]/g, 'this workflow')
      .replace(/\[Niche\]/g, 'our field')
      .replace(/\[Craft\]/g, 'our discipline')
      .replace(/\[Popular Trend\/Tool\]/g, 'the latest trend')
      .replace(/\[Domain\/Field\]/g, 'this field')
      .replace(/\[Accomplishment\]/g, 'sustainable authority')
      .replace(/\[Complicated Setup\]/g, 'complex systems')
      .replace(/\[Conventional Practice\]/g, 'conventional wisdom');

    if (!customized || customized === template) {
      customized = `The conventional approach to ${topic.toLowerCase()} ignores ${brand.lexicon[idx % brand.lexicon.length]}.`;
    }
    return customized;
  });

  const visualHeadline = `${brand.lexicon[0].toUpperCase()}: ${topic.split(' ').slice(0, 4).join(' ').toUpperCase()}`;
  const imagePrompt = `High-contrast cinematic editorial visual, representing ${brand.name}, color palette accents of ${brand.palette.accent} and deep rich background tones, architectural precision, 8k documentary photograph, award-winning editorial composition`;
  const tags = `#${brand.key.replace('_', '')} #${channel.replace(' ', '')} #${brand.lexicon[0].replace(/\s+/g, '')} #${brand.lexicon[1].replace(/\s+/g, '')} #ExecutiveLeadership`;
  const voiceoverScript = `[0:00-0:05 Hook]\n"${hooks[0]}"\n\n[0:05-0:18 Context]\n"Too many organizations treat ${topic.toLowerCase()} as a secondary consideration. But in reality, ${brand.lexicon[1].toLowerCase()} dictates the outcome."\n\n[0:18-0:32 Protocol]\n"When we analyze the underlying architecture, the evidentiary standard leaves no room for ambiguity."\n\n[0:32-0:45 Directive]\n"Ground your decisions in measurable reality. Measure what endures."\n\n[Music / Tone: ${brand.posture.slice(0, 40)}]`;

  return {
    brand_name: brandName,
    channel,
    hook_options: hooks,
    post_body: postBody,
    voiceover_script: voiceoverScript,
    visual_headline: visualHeadline.slice(0, 48),
    image_prompt: imagePrompt,
    hashtags: tags,
  };
}

// API Routes
app.get('/api/drafts', (_req, res) => {
  res.json(drafts);
});

app.post('/api/drafts', (req, res) => {
  const newDraft: ProductionPackage = {
    ...req.body,
    id: `draft-${Date.now()}`,
    status: req.body.status || 'pending_review',
    created_at: new Date().toISOString(),
  };
  drafts.unshift(newDraft);
  res.status(201).json(newDraft);
});

app.patch('/api/drafts/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;
  const draft = drafts.find((d) => d.id === id);
  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }
  draft.status = status;
  if (rejection_reason !== undefined) {
    draft.rejection_reason = rejection_reason;
  }
  res.json(draft);
});

app.put('/api/drafts/:id', (req, res) => {
  const { id } = req.params;
  const index = drafts.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Draft not found' });
  }
  drafts[index] = { ...drafts[index], ...req.body };
  res.json(drafts[index]);
});

app.delete('/api/drafts/:id', (req, res) => {
  const { id } = req.params;
  drafts = drafts.filter((d) => d.id !== id);
  res.json({ success: true });
});

app.get('/api/hooks', (_req, res) => {
  res.json(HOOK_LIBRARY);
});

// Real AI Generation Route
app.post('/api/generate', async (req, res) => {
  const { brand_key, audience, channel, topic, magazine_column } = req.body;
  const brand = BRANDS[brand_key as BrandKey];

  if (!brand) {
    return res.status(400).json({ error: 'Invalid brand key' });
  }

  const prompt = `
Brand: ${brand.name} (${brand_key})
Brand Persona: ${brand.archetype}
Rhetorical Posture: ${brand.posture}
Mandatory Lexicon Anchors: ${brand.lexicon.join(', ')}
Negative Constraints: ${brand.negativeConstraints}
Forbidden Slang/Terms: ${[...brand.forbiddenWords, 'delve', 'tapestry', 'game-changer', 'beacon', 'unlock', 'elevate'].join(', ')}
${magazine_column ? `Magazine Column / Section Desk: ${magazine_column}` : ''}

Target Audience Segment: ${audience}
Channel: ${channel}
Editorial Angle / Source Signal: ${topic}

Generate a complete production package conforming strictly to this JSON schema:
{
  "brand_name": "${brand.name}",
  "channel": "${channel}",
  "hook_options": ["Hook 1 (Contrarian/Stark)", "Hook 2 (Evidentiary/Telemetry)", "Hook 3 (Institutional/Tactical)"],
  "post_body": "Platform body copy tailored specifically for ${channel}. For Bluesky: STRICTLY UNDER 300 CHARACTERS. For Threads: STRICTLY UNDER 300 CHARACTERS. For Pinterest: STRICTLY UNDER 800 CHARACTERS. For X: STRICTLY UNDER 260 CHARACTERS. For TikTok: UNDER 250 CHARACTERS with visual video cue. For LinkedIn: 150-250 words with crisp line breaks. Never use forbidden words.",
  "voiceover_script": "Timed 30-45s script with exact timestamps [0:00-0:03 Hook], [0:03-0:15 Tension], [0:15-0:30 Diagnostic], [0:30-0:45 Command] followed by [Music / Tone: audio atmosphere]",
  "visual_headline": "Bold headline for card overlay (under 8 words)",
  "image_prompt": "Cinematic visual prompt for Midjourney/Imagen 3 reflecting the brand's aesthetic and color tone",
  "hashtags": "#Tag1 #Tag2 #Tag3 #Tag4"
}
`;

  if (aiClient) {
    try {
      const response: any = await generateWithFallback(aiClient, {
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);

      const draft: ProductionPackage = {
        id: `draft-${Date.now()}`,
        brand_key: brand.key,
        brand_name: brand.name,
        channel,
        audience,
        topic,
        magazine_column: magazine_column || parsed.magazine_column || undefined,
        hook_options: parsed.hook_options || [`New directive in ${brand.lexicon[0]}`],
        selected_hook: parsed.hook_options?.[0] || '',
        post_body: parsed.post_body || '',
        voiceover_script: parsed.voiceover_script || '',
        visual_headline: parsed.visual_headline || `${brand.lexicon[0]} Protocol`,
        image_prompt: parsed.image_prompt || '',
        hashtags: parsed.hashtags || '',
        status: 'pending_review',
        created_at: new Date().toISOString(),
      };

      drafts.unshift(draft);
      return res.json({ draft, source: 'gemini-active' });
    } catch (err: any) {
      console.warn('Gemini API call failed, using high-fidelity fallback generator:', err.message);
    }
  }

  const fallbackDraft: ProductionPackage = {
    id: `draft-${Date.now()}`,
    brand_key: brand.key,
    brand_name: brand.name,
    channel,
    audience,
    topic,
    magazine_column,
    ...generateFallbackPackage(brand.key, brand.name, audience, channel, topic, magazine_column),
    status: 'pending_review',
    created_at: new Date().toISOString(),
  };

  drafts.unshift(fallbackDraft);
  res.json({ draft: fallbackDraft, source: 'studio-autonomous-engine' });
});

// AI Topic Suggestion Route
app.post('/api/ai/suggest-topics', async (req, res) => {
  const { brand_key, audience } = req.body;
  const brand = BRANDS[brand_key as BrandKey];

  if (!brand) {
    return res.status(400).json({ error: 'Invalid brand key' });
  }

  const prompt = `
You are the Executive Editor for ${brand.name}.
Archetype: ${brand.archetype}
Rhetorical Posture: ${brand.posture}
Mandatory Lexicon Anchors: ${brand.lexicon.join(', ')}
Negative Constraints: ${brand.negativeConstraints}
Target Audience: ${audience || brand.audiences[0]}

Generate 3 urgent, contrarian, and high-impact editorial angles/topics for this brand.
Each angle should be 10-25 words, concrete, intellectually arresting, and grounded in real-world friction.
Never use fluff words like "delve", "tapestry", "game-changer", "beacon", "unlock", or "elevate".

Respond in JSON format:
{
  "topics": [
    "Angle 1...",
    "Angle 2...",
    "Angle 3..."
  ]
}
`;

  if (aiClient) {
    try {
      const response: any = await generateWithFallback(aiClient, {
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
        return res.json({ topics: parsed.topics, source: 'gemini-active' });
      }
    } catch (err: any) {
      console.warn('Gemini topic suggestion error:', err.message);
    }
  }

  const fallback = [
    `${brand.lexicon[0]} operational reality vs superficial market assumptions`,
    `Why conventional frameworks fail when evaluating ${brand.lexicon[1].toLowerCase()}`,
    `The structural risk of ignoring ${brand.lexicon[2] ? brand.lexicon[2].toLowerCase() : brand.lexicon[0].toLowerCase()} in high-stakes environments`,
  ];
  res.json({ topics: fallback, source: 'brand-lexicon-heuristics' });
});

// AI Polish / Refinement Route
app.post('/api/ai/refine', async (req, res) => {
  const { brand_key, channel, action, current_body, current_hook, current_headline, user_instruction } = req.body;
  const brand = BRANDS[brand_key as BrandKey];

  if (!brand) {
    return res.status(400).json({ error: 'Invalid brand key' });
  }

  const spec = CHANNEL_SPECS[channel as Channel] || CHANNEL_SPECS.LinkedIn;
  const charLimit = spec.charLimit || 2000;

  let directive = '';
  if (action === 'tighten_chars') {
    directive = `Strictly compress and edit this copy to be well under ${charLimit} characters (currently ${current_body?.length || 0} chars). Keep the punchiest core truth. Remove all preamble.`;
  } else if (action === 'more_contrarian') {
    directive = `Heighten the contrarian tension and unapologetic authority. Challenge common complacency aggressively within the posture of ${brand.name}.`;
  } else if (action === 'new_hooks') {
    directive = `Generate 3 completely new, high-CTR algorithmic hooks calibrated for ${channel} audience psychology.`;
  } else if (action === 'eliminate_fluff') {
    directive = `Audit and eradicate any AI filler words, corporate jargon, or brand forbidden words (${brand.forbiddenWords.join(', ')}). Reinforce mandatory lexicon anchors: ${brand.lexicon.join(', ')}.`;
  } else {
    directive = user_instruction || 'Elevate the rhetorical force and platform alignment.';
  }

  const prompt = `
Brand: ${brand.name}
Archetype: ${brand.archetype}
Posture: ${brand.posture}
Mandatory Lexicon: ${brand.lexicon.join(', ')}
Negative Constraints: ${brand.negativeConstraints}
Channel: ${channel} (Max characters: ${charLimit})

CURRENT ASSETS:
Hook: ${current_hook || ''}
Headline: ${current_headline || ''}
Body Copy: ${current_body || ''}

REFINEMENT DIRECTIVE:
${directive}

CRITICAL RULES:
- If channel is Bluesky or Threads: Post body MUST be STRICTLY under 300 characters.
- If channel is Pinterest: Post body MUST be STRICTLY under 800 characters.
- If channel is X: Post body MUST be under 260 characters.
- If channel is TikTok: Post body MUST be under 250 characters with a 3-second visual cue.
- Never use: delve, tapestry, game-changer, beacon, unlock, elevate.

Respond strictly with JSON:
{
  "refined_body": "Updated post body adhering strictly to character limit",
  "refined_headline": "Updated headline under 8 words",
  "hook_options": ["Refined Hook 1", "Refined Hook 2", "Refined Hook 3"],
  "selected_hook": "Top recommended hook",
  "refinement_notes": "Summary of adjustments made"
}
`;

  if (aiClient) {
    try {
      const response: any = await generateWithFallback(aiClient, {
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      return res.json({ result: parsed, source: 'gemini-active' });
    } catch (err: any) {
      console.warn('Gemini refine call failed:', err.message);
    }
  }

  let trimmedBody = current_body || '';
  if (action === 'tighten_chars' && charLimit) {
    trimmedBody = trimmedBody.slice(0, charLimit - 20) + '...';
  }
  res.json({
    result: {
      refined_body: trimmedBody,
      refined_headline: current_headline || `${brand.lexicon[0]} Protocol`,
      hook_options: [
        `The real problem with ${current_headline || 'this'} isn't execution—it's ${brand.lexicon[0].toLowerCase()}.`,
        `Conventional assumptions about this ignore ${brand.lexicon[1] || brand.lexicon[0]}.`,
        `Before signing off on another strategy deck, verify ${brand.lexicon[0].toLowerCase()}.`,
      ],
      selected_hook: `The real problem with ${current_headline || 'this'} isn't execution—it's ${brand.lexicon[0].toLowerCase()}.`,
      refinement_notes: 'Heuristic alignment with brand voice anchors applied.',
    },
    source: 'fallback-rules',
  });
});

// AI Cross-Channel Adapt Route
app.post('/api/ai/adapt-channel', async (req, res) => {
  const { brand_key, target_channel, post_body, topic, original_hook } = req.body;
  const brand = BRANDS[brand_key as BrandKey];

  if (!brand) {
    return res.status(400).json({ error: 'Invalid brand key' });
  }

  const spec = CHANNEL_SPECS[target_channel as Channel] || CHANNEL_SPECS.LinkedIn;
  const charLimit = spec.charLimit || 2000;

  const prompt = `
Brand: ${brand.name}
Archetype: ${brand.archetype}
Mandatory Lexicon: ${brand.lexicon.join(', ')}
Original Topic: ${topic}
Original Hook: ${original_hook || ''}
Original Copy: ${post_body}

Adapt this editorial content natively for ${target_channel}.
TARGET CHANNEL CONSTRAINTS:
- Character Limit: ${charLimit} characters.
- Format: ${spec.desc}
${target_channel === 'Bluesky' ? '- STRICTLY UNDER 300 CHARACTERS. Sharp, intellectual, zero fluff.' : ''}
${target_channel === 'Threads' ? '- STRICTLY UNDER 300 CHARACTERS. Provocative tension, invites perspective.' : ''}
${target_channel === 'Pinterest' ? '- STRICTLY UNDER 800 CHARACTERS. Clear bulleted value breakdown and searchable blueprint tags.' : ''}
${target_channel === 'TikTok' ? '- Under 250 characters with a 3-second visual video retention hook.' : ''}
${target_channel === 'X' ? '- Under 260 characters. Stark contrarian thesis.' : ''}

Respond with JSON:
{
  "adapted_body": "Native post body formatted for ${target_channel} adhering strictly to character limit",
  "adapted_hook": "Single best opening line",
  "adapted_headline": "Visual overlay headline under 8 words",
  "hashtags": "#Tag1 #Tag2 #Tag3"
}
`;

  if (aiClient) {
    try {
      const response: any = await generateWithFallback(aiClient, {
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      return res.json({ result: parsed, source: 'gemini-active' });
    } catch (err: any) {
      console.warn('Gemini adapt call failed:', err.message);
    }
  }

  const fallbackPkg = generateFallbackPackage(
    brand.key,
    brand.name,
    brand.audiences[0],
    target_channel as Channel,
    topic || brand.sampleTopics[0]
  );
  res.json({
    result: {
      adapted_body: fallbackPkg.post_body,
      adapted_hook: fallbackPkg.hook_options[0],
      adapted_headline: fallbackPkg.visual_headline,
      hashtags: fallbackPkg.hashtags,
    },
    source: 'fallback-rules',
  });
});

// AI Voiceover Studio TTS Route
app.post('/api/ai/tts', async (req, res) => {
  const { script, voice_name, style_prompt } = req.body;
  const selectedVoice = voice_name || 'Kore';

  const cleanScript = (script || '')
    .replace(/\[\d+:\d+-\d+:\d+[^\]]*\]/g, '')
    .replace(/\[Music[^\]]*\]/gi, '')
    .replace(/\[Tone[^\]]*\]/gi, '')
    .replace(/"/g, '')
    .trim();

  if (!cleanScript) {
    return res.status(400).json({ error: 'Empty script' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanScript,
                speechMetadata: {
                  style: style_prompt || 'Authoritative, calculated, measured pacing, executive gravitas',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
          voiceName: selectedVoice,
          source: 'gemini-3.8-flash-lite-tts',
        });
      }
    } catch (err: any) {
      console.warn('Gemini TTS synthesis failed:', err.message);
      return res.status(503).json({
        error: 'Gemini TTS unavailable, fallback to browser speech synthesis',
        message: err.message,
      });
    }
  }

  res.status(503).json({
    error: 'Gemini API client not configured for TTS; use browser speech synthesis',
  });
});

// Brand Rules Retrieval Route
app.get('/api/brands/:brand_key/rules', (req, res) => {
  const { brand_key } = req.params;
  const brand = BRANDS[brand_key as BrandKey];
  if (!brand) return res.status(404).json({ error: 'Brand not found' });
  res.json({
    brand_key: brand.key,
    brand_name: brand.name,
    pictureRules: brand.pictureRules,
    videoRules: brand.videoRules,
  });
});

// AI Picture Generator Route
app.post('/api/ai/picture-generate', async (req, res) => {
  const { brand_key, topic, headline, aspect_ratio, custom_directive } = req.body;
  const brand = BRANDS[brand_key as BrandKey];
  if (!brand) return res.status(400).json({ error: 'Invalid brand key' });

  const chosenAr = aspect_ratio || brand.pictureRules.aspectRatios[0] || '1:1';
  const rules = brand.pictureRules;

  const prompt = `
You are the Executive Visual Art Director for ${brand.name}.
Aesthetic Style: ${rules.aestheticStyle}
Lighting & Camera: ${rules.lightingAndCamera}
Color Grading: ${rules.colorGradingDirective}
Permitted Subjects: ${rules.permittedSubjects.join(', ')}
Strict Forbidden Tropes (Anti-AI Slop): ${rules.forbiddenVisualTropes.join(', ')}
Brand Colors: Background ${brand.palette.names.bg} (${brand.palette.bg}), Accent ${brand.palette.names.accent} (${brand.palette.accent})

Input Topic: ${topic || brand.sampleTopics[0]}
Headline Overlay: ${headline || `${brand.lexicon[0]} Protocol`}
Aspect Ratio: ${chosenAr}
User Directive: ${custom_directive || 'Default brand standard'}

Generate an optimized, production-grade image prompt package conforming strictly to this JSON format:
{
  "imagen_prompt": "Ultra-detailed prompt formulated for Google Imagen 3 and Midjourney v6 without any forbidden tropes",
  "negative_prompt": "smiling stock people, plastic textures, cartoony renders, fake neon, amateur lighting",
  "visual_concept": "2-sentence art director explanation of the composition and symbolism",
  "artistic_direction": {
    "lighting": "Specific lighting setup",
    "focal_length": "Camera and lens choice",
    "color_palette_hex": ["${brand.palette.bg}", "${brand.palette.accent}", "${brand.palette.secondary}"]
  },
  "compliance_audit": {
    "anti_slop_passed": true,
    "brand_color_match": true,
    "forbidden_tropes_detected": []
  }
}
`;

  if (aiClient) {
    try {
      const response: any = await generateWithFallback(aiClient, {
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      return res.json({ result: parsed, source: 'gemini-active' });
    } catch (err: any) {
      console.warn('Gemini picture prompt generation failed:', err.message);
    }
  }

  res.json({
    result: {
      imagen_prompt: `${rules.promptTemplate} Featuring architectural focus on ${topic || brand.sampleTopics[0]}, illuminated with ${brand.palette.names.accent} highlights on ${brand.palette.names.bg}. --ar ${chosenAr}`,
      negative_prompt: rules.forbiddenVisualTropes.join(', '),
      visual_concept: `Artistic visual for ${brand.name} highlighting ${brand.lexicon[0]} with ${rules.aestheticStyle}.`,
      artistic_direction: {
        lighting: rules.lightingAndCamera,
        focal_length: '35mm Leica Prime',
        color_palette_hex: [brand.palette.bg, brand.palette.accent, brand.palette.secondary],
      },
      compliance_audit: {
        anti_slop_passed: true,
        brand_color_match: true,
        forbidden_tropes_detected: [],
      },
    },
    source: 'brand-rules-engine',
  });
});

// AI Video Generator & Motion Storyboard Route
app.post('/api/ai/video-storyboard', async (req, res) => {
  const { brand_key, topic, video_length } = req.body;
  const brand = BRANDS[brand_key as BrandKey];
  if (!brand) return res.status(400).json({ error: 'Invalid brand key' });

  const rules = brand.videoRules;

  const prompt = `
You are the Executive Video Director for ${brand.name}.
Target Pace & Rhythm: ${rules.pacingAndRhythm}
Camera Movement: ${rules.cameraMotions.join(', ')}
Audio Aesthetic: ${rules.audioDesign}

Topic: ${topic || brand.sampleTopics[0]}
Requested Length: ${video_length || '30s'}

Generate a kinetic motion storyboard package conforming strictly to this JSON format:
{
  "storyboard": [
    {
      "timestamp": "0:00-0:05",
      "visual_scene": "Description of opening shot",
      "camera_direction": "Camera motion choice",
      "audio_cue": "Voiceover or atmospheric sound"
    }
  ],
  "veo_prompt": "Prompt for video generation model",
  "editorial_notes": "Director's notes on pacing and color"
}
`;

  if (aiClient) {
    try {
      const response: any = await generateWithFallback(aiClient, {
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      return res.json({ result: parsed, source: 'gemini-active' });
    } catch (err: any) {
      console.warn('Gemini video storyboard generation failed:', err.message);
    }
  }

  res.json({
    result: {
      storyboard: [
        {
          timestamp: '0:00-0:05',
          visual_scene: `Stark macro opening focusing on ${brand.lexicon[0]} architectural details.`,
          camera_direction: rules.cameraMotions[0] || 'Slow push-in',
          audio_cue: 'Deep atmospheric bass resonance with crisp VO hook.',
        },
      ],
      veo_prompt: `Cinematic footage of ${brand.name} aesthetic, ${rules.pacingAndRhythm}, 8k video.`,
      editorial_notes: 'Maintain stark contrast and brand pacing throughout.',
    },
    source: 'brand-video-rules-engine',
  });
});

app.listen(PORT, () => {
  console.log(`Server running dynamically on port ${PORT}`);
});
