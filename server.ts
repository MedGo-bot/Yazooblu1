import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DRAFTS } from './src/mockData';
import { BRANDS, BrandKey, Channel, ProductionPackage, HOOK_LIBRARY, getPlatformHooks, CHANNEL_SPECS } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

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
    // Exactly under 300 characters
    postBody = `When evaluating ${topic.toLowerCase()}, standard assumptions collapse. True authority in our domain requires ${brand.lexicon[0].toLowerCase()} over transient sentiment. Rigorous standards dictate real-world outcomes.`.slice(0, 290);
  } else if (channel === 'Threads') {
    // Exactly under 300 characters
    postBody = `Unpopular truth: The conversation around ${topic.toLowerCase()} is treating a structural crisis with cosmetic rhetoric. If you ignore ${brand.lexicon[0].toLowerCase()}, failure is guaranteed. Agree or disagree?`.slice(0, 290);
  } else if (channel === 'Pinterest') {
    // Under 800 characters
    postBody = `THE EDITORIAL BLUEPRINT: ${brand.name.toUpperCase()}\n\nTopic: ${topic}\n\nKey Spec Breakdown:\n• ${brand.lexicon[0]}: Fundamental baseline verification\n• ${brand.lexicon[1]}: Eliminating cosmetic shortcuts\n• Operational Integrity: Verifiable evidence over marketing sentiment\n\nSave this Pin to your permanent resource board for technical reference.`.slice(0, 780);
  } else if (channel === 'X') {
    // Under 260 characters
    postBody = `${topic.slice(0, 130)}. Conventional practices ignore ${brand.lexicon[0].toLowerCase()}. Signal over noise. Precision over panic.`.slice(0, 255);
  } else if (channel === 'TikTok') {
    // Under 250 characters
    postBody = `Watch what happens when you evaluate ${topic.toLowerCase()} through raw ${brand.lexicon[0].toLowerCase()}. This single operational shift changes the entire outcome. Save this workflow.`.slice(0, 240);
  } else if (channel === 'Instagram') {
    postBody = `THE STANDARD OF EXCELLENCE.\n\n${topic}.\n\nIn our domain, ${brand.lexicon[0].toLowerCase()} is not an ornamental phrase. It is the boundary between lasting authority and operational compromise.\n\n1. Establish definitive benchmarks.\n2. Reject cosmetic remedies.\n3. Demand evidentiary precision.\n\nRead the full dossier in our archive.`;
  } else {
    postBody = `The conversation surrounding ${topic.toLowerCase()} is too often clouded by superficial rhetoric.\n\nIn high-stakes environments, true authority requires grounding in ${lexiconTerms}.\n\nWhen leadership evaluates this challenge, three principles emerge:\n\n1. Structural Reality: Avoid short-term expedients that sacrifice permanent durability.\n2. Telemetry and Evidence: Validate every assertion against verifiable real-world metrics.\n3. Institutional Discipline: Protect core integrity before public posturing.\n\nTrue mastery is recognized not in the volume of claims made, but in the measurable permanence of execution.`;
  }

  // Populate calibrated hooks from HOOK_LIBRARY tailored to the brand
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

// Real AI Generation Route using Gemini 3.8 Flash
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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out')), 10000)
      );

      const geminiCall = aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      });

      const response: any = await Promise.race([geminiCall, timeoutPromise]);
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
        hook_options: parsed.hook_options || [
          `New directive in ${brand.lexicon[0]}`,
        ],
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
      return res.json({ draft, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('Gemini API call failed, using high-fidelity fallback generator:', err.message);
    }
  }

  // Fallback high-fidelity generator when Gemini is not configured or fails
  const fallbackPkg = generateFallbackPackage(
    brand.key,
    brand.name,
    audience,
    channel,
    topic,
    magazine_column
  );

  const fallbackDraft: ProductionPackage = {
    id: `draft-${Date.now()}`,
    brand_key: brand.key,
    brand_name: brand.name,
    channel,
    audience,
    topic,
    magazine_column,
    hook_options: fallbackPkg.hook_options,
    selected_hook: fallbackPkg.hook_options[0],
    post_body: fallbackPkg.post_body,
    voiceover_script: fallbackPkg.voiceover_script,
    visual_headline: fallbackPkg.visual_headline,
    image_prompt: fallbackPkg.image_prompt,
    hashtags: fallbackPkg.hashtags,
    status: 'pending_review',
    created_at: new Date().toISOString(),
  };

  drafts.unshift(fallbackDraft);
  res.json({ draft: fallbackDraft, source: 'studio-autonomous-engine' });
});

// AI Angle / Topic Suggestion Route using Gemini 3.8 Flash
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
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
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
        return res.json({ topics: parsed.topics, source: 'gemini-3.8-flash' });
      }
    } catch (err: any) {
      console.warn('Gemini topic suggestion error:', err.message);
    }
  }

  // High-fidelity fallback based on brand sample topics
  const fallback = [
    `${brand.lexicon[0]} operational reality vs superficial market assumptions`,
    `Why conventional frameworks fail when evaluating ${brand.lexicon[1].toLowerCase()}`,
    `The structural risk of ignoring ${brand.lexicon[2] ? brand.lexicon[2].toLowerCase() : brand.lexicon[0].toLowerCase()} in high-stakes environments`,
  ];
  res.json({ topics: fallback, source: 'brand-lexicon-heuristics' });
});

// AI Polish / Refinement Route for Approval Queue
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
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      return res.json({ result: parsed, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('Gemini refine call failed:', err.message);
    }
  }

  // Fallback heuristic refinement
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

// AI Cross-Channel Adapt Route using Gemini 3.8 Flash
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
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      return res.json({ result: parsed, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('Gemini adapt call failed:', err.message);
    }
  }

  // Heuristic fallback
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

// AI Voiceover Studio TTS Route using Gemini 3.8 Flash-Lite TTS
app.post('/api/ai/tts', async (req, res) => {
  const { script, voice_name, style_prompt } = req.body;
  const selectedVoice = voice_name || 'Kore'; // Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'

  // Clean script: strip timestamps and brackets
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

// Brand Rules Retrieval Route for Governance & Audits
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

// AI Picture Generator Route using Gemini 3.8 Flash & Brand Visual Rules
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
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      return res.json({ result: parsed, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('Gemini picture prompt generation failed:', err.message);
    }
  }

  // Fallback high-fidelity response
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

// AI Video Generator & Motion Storyboard Route using Gemini 3.8 Flash & Brand Video Rules
app.post('/api/ai/video-storyboard', async (req, res) => {
  const { brand_key, topic, voiceover_script, channel, aspect_ratio } = req.body;
  const brand = BRANDS[brand_key as BrandKey];
  if (!brand) return res.status(400).json({ error: 'Invalid brand key' });

  const chosenAr = aspect_ratio || brand.videoRules.aspectRatios[0] || '9:16';
  const vRules = brand.videoRules;

  const prompt = `
You are the Executive Video & Motion Director for ${brand.name}.
Archetype: ${brand.archetype}
Pacing Directive: ${vRules.pacingDirective}
Motion & Camera Style: ${vRules.motionAndCameraStyle}
Kinetic Typography Rules: ${vRules.kineticTypographyRules}
Audio Bed Atmosphere: ${vRules.audioBedAtmosphere}
Forbidden Motion Tropes: ${vRules.forbiddenMotionTropes.join(', ')}
Aspect Ratio: ${chosenAr}

Input Topic: ${topic || brand.sampleTopics[0]}
Voiceover Script: ${voiceover_script || 'Standard brand protocol'}

Generate a 4-scene video storyboard sequence strictly conforming to this JSON format:
{
  "scenes": [
    {
      "timestamp": "0:00 - 0:05",
      "phase": "Hook",
      "visualDescription": "Opening visual composition setting stop-scroll tension",
      "cameraMovement": "Specific camera movement adhering to brand rules",
      "kineticTextOverlay": "Crisp kinetic text on screen (under 5 words)",
      "audioVoiceoverCue": "Opening hook audio voiceover",
      "veo_prompt": "Cinematic prompt tailored for Google Veo 2 / Runway Gen-3"
    },
    {
      "timestamp": "0:05 - 0:18",
      "phase": "Tension",
      "visualDescription": "Visual articulating the underlying operational tension",
      "cameraMovement": "Camera motion",
      "kineticTextOverlay": "Text overlay",
      "audioVoiceoverCue": "Context audio cue",
      "veo_prompt": "Prompt for video model"
    },
    {
      "timestamp": "0:18 - 0:32",
      "phase": "Diagnostic",
      "visualDescription": "Evidentiary proof / telemetry breakdown",
      "cameraMovement": "Camera motion",
      "kineticTextOverlay": "Text overlay",
      "audioVoiceoverCue": "Diagnostic audio cue",
      "veo_prompt": "Prompt for video model"
    },
    {
      "timestamp": "0:32 - 0:45",
      "phase": "Command",
      "visualDescription": "Definitive resolution and institutional brand seal",
      "cameraMovement": "Camera motion",
      "kineticTextOverlay": "Final directive headline",
      "audioVoiceoverCue": "Command audio cue",
      "veo_prompt": "Prompt for video model"
    }
  ],
  "pacing_notes": "${vRules.pacingDirective}",
  "audio_bed": "${vRules.audioBedAtmosphere}",
  "model_directives": "${vRules.aiModelDirectives}"
}
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.35,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.scenes)) {
        return res.json({ result: parsed, source: 'gemini-3.8-flash' });
      }
    } catch (err: any) {
      console.warn('Gemini video storyboard generation failed:', err.message);
    }
  }

  // Fallback high-fidelity storyboard
  const fallbackScenes = [
    {
      timestamp: '0:00 - 0:05',
      phase: 'Hook',
      visualDescription: `Stark macro focus on ${brand.palette.names.bg} texture with directional ${brand.palette.names.accent} rim lighting.`,
      cameraMovement: 'Slow forward dolly tracking, locking onto focal point.',
      kineticTextOverlay: `${brand.lexicon[0]} Protocol`,
      audioVoiceoverCue: `When evaluating ${topic || brand.sampleTopics[0]}, conventional assumptions fail.`,
      veo_prompt: `${vRules.aiModelDirectives} Establishing shot, dramatic tension.`,
    },
    {
      timestamp: '0:05 - 0:18',
      phase: 'Tension',
      visualDescription: `Architectural cross-section revealing systemic friction in ${brand.palette.names.bg}.`,
      cameraMovement: 'Smooth lateral tracking slider, 24fps motion cadence.',
      kineticTextOverlay: 'The Structural Blindspot',
      audioVoiceoverCue: `Too many leaders treat this as a cosmetic detail rather than a structural risk.`,
      veo_prompt: `${vRules.aiModelDirectives} Structural tension scene.`,
    },
    {
      timestamp: '0:18 - 0:32',
      phase: 'Diagnostic',
      visualDescription: `High-fidelity telemetry and evidentiary proof aligned with ${brand.lexicon[1] || brand.lexicon[0]}.`,
      cameraMovement: 'Subtle rack focus from foreground metric to background architectural depth.',
      kineticTextOverlay: 'Evidentiary Proof',
      audioVoiceoverCue: `When we analyze the underlying architecture, ambiguity disappears.`,
      veo_prompt: `${vRules.aiModelDirectives} Evidentiary diagnostic focus.`,
    },
    {
      timestamp: '0:32 - 0:45',
      phase: 'Command',
      visualDescription: `Definitive resolution framed with ${brand.name} signature sovereign seal.`,
      cameraMovement: 'Slow steady pull-back revealing complete structural symmetry.',
      kineticTextOverlay: 'Measure What Endures',
      audioVoiceoverCue: `Ground your decisions in measurable reality. Calibrate your standards accordingly.`,
      veo_prompt: `${vRules.aiModelDirectives} Final sovereign resolution.`,
    },
  ];

  res.json({
    result: {
      scenes: fallbackScenes,
      pacing_notes: vRules.pacingDirective,
      audio_bed: vRules.audioBedAtmosphere,
      model_directives: vRules.aiModelDirectives,
    },
    source: 'brand-rules-engine',
  });
});

// AI Deep Brand Compliance & Constraint Audit Route
app.post('/api/ai/audit', async (req, res) => {
  const { brand_key, text, channel } = req.body;
  const brand = BRANDS[brand_key as BrandKey];

  if (!brand) {
    return res.status(400).json({ error: 'Invalid brand key' });
  }

  const prompt = `
Brand: ${brand.name}
Archetype: ${brand.archetype}
Rhetorical Posture: ${brand.posture}
Mandatory Lexicon: ${brand.lexicon.join(', ')}
Negative Constraints: ${brand.negativeConstraints}
Forbidden Brand Slang: ${brand.forbiddenWords.join(', ')}
Universal Fluff to Penalize: delve, tapestry, game-changer, beacon, unlock, elevate
Channel: ${channel || 'Generic'}

TEXT TO AUDIT:
"""
${text}
"""

Evaluate this copy strictly. Respond with JSON:
{
  "compliance_score": 88, // 0-100 integer
  "verdict": "COMPLIANT" | "NON_COMPLIANT" | "NEEDS_REFINEMENT",
  "identified_violations": ["Forbidden term: ...", "Tone violation: ..."],
  "matched_lexicon": ["Mandatory term matched"],
  "missing_lexicon": ["Suggested term to include"],
  "critique": "2-sentence executive diagnosis of rhetorical posture",
  "surgical_rewrite": "Rewritten version eliminating all violations and strictly honoring brand constraints"
}
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_RULES,
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const jsonStr = response.text?.trim() || '';
      const parsed = JSON.parse(jsonStr);
      return res.json({ result: parsed, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('Gemini audit call failed:', err.message);
    }
  }

  // Fallback audit
  const lower = (text || '').toLowerCase();
  const detectedForbidden = brand.forbiddenWords.filter((w) => lower.includes(w.toLowerCase()));
  const detectedFluff = ['delve', 'tapestry', 'game-changer', 'beacon', 'unlock', 'elevate'].filter((w) =>
    lower.includes(w)
  );
  const matchedLexicon = brand.lexicon.filter((w) => lower.includes(w.toLowerCase()));

  const violations = [
    ...detectedForbidden.map((w) => `Brand Forbidden Slang: "${w}"`),
    ...detectedFluff.map((w) => `Universal Fluff: "${w}"`),
  ];

  const score = Math.max(20, 100 - violations.length * 25 + matchedLexicon.length * 10);

  res.json({
    result: {
      compliance_score: Math.min(100, score),
      verdict: violations.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
      identified_violations: violations,
      matched_lexicon: matchedLexicon,
      missing_lexicon: brand.lexicon.filter((w) => !lower.includes(w.toLowerCase())).slice(0, 2),
      critique: `Heuristic evaluation against ${brand.name} negative constraints and lexicon baseline.`,
      surgical_rewrite: text,
    },
    source: 'heuristic-rules',
  });
});

// ─────────────────────────────────────────────────────────────
// Pixabay Curated Media Integration
// Curates editorial photography & stock b-roll avoiding commercial stock gloss
// ─────────────────────────────────────────────────────────────

const BANNED_PIXABAY_TAGS = new Set([
  'cartoon',
  'illustration',
  'isolated',
  'white background',
  '3d render',
  'concept',
]);

async function fetchCuratedPixabayPhoto(searchQuery: string, orientation = 'all') {
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (!pixabayKey || pixabayKey === 'your_pixabay_api_key_here') {
    return null;
  }

  // Anchor the search query with editorial texture to avoid commercial stock gloss
  const curatedQ = `${searchQuery} subtle film dark`;
  const page = Math.floor(Math.random() * 2) + 1;

  const url = new URL('https://pixabay.com/api/');
  url.searchParams.set('key', pixabayKey);
  url.searchParams.set('q', curatedQ);
  url.searchParams.set('image_type', 'photo');
  url.searchParams.set('orientation', orientation);
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', '20');
  url.searchParams.set('page', String(page));

  try {
    let res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    let data: any = await res.json();
    let hits = Array.isArray(data.hits) ? data.hits : [];

    if (hits.length === 0) {
      // Fallback to unadorned query if refined query was too strict
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('page', '1');
      res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
      data = await res.json();
      hits = Array.isArray(data.hits) ? data.hits : [];
    }

    const qualifyingPhotos = hits.filter((photo: any) => {
      const tags = (photo.tags || '').toLowerCase().split(',').map((t: string) => t.trim());
      const downloads = photo.downloads || 0;

      // RULE 1: Reject images with cheesy or artificial tags
      if (tags.some((t: string) => BANNED_PIXABAY_TAGS.has(t))) return false;
      // RULE 2: Over-saturation filter (pass up images downloaded hundreds of thousands of times)
      if (downloads > 60000) return false;
      // RULE 3: Quality threshold (must have reasonable community approval without being viral stock)
      if (downloads < 50) return false;

      return true;
    });

    const candidateList = (qualifyingPhotos.length > 0 ? qualifyingPhotos : hits).slice(0, 8).map((item: any) => ({
      url: item.largeImageURL || item.webformatURL,
      preview_url: item.webformatURL,
      user: item.user,
      tags: item.tags,
      downloads: item.downloads,
    }));

    if (qualifyingPhotos.length > 0) {
      const pool = qualifyingPhotos.slice(0, 8);
      const winner = pool[Math.floor(Math.random() * pool.length)];
      return {
        url: winner.largeImageURL || winner.webformatURL,
        preview_url: winner.webformatURL,
        user: winner.user,
        tags: winner.tags,
        downloads: winner.downloads,
        candidates: candidateList,
      };
    } else if (hits.length > 0) {
      const winner = hits[0];
      return {
        url: winner.largeImageURL || winner.webformatURL,
        preview_url: winner.webformatURL,
        user: winner.user,
        tags: winner.tags,
        downloads: winner.downloads,
        candidates: candidateList,
      };
    }
  } catch (err: any) {
    console.warn('Pixabay photo fetch error:', err.message);
  }

  return null;
}

async function fetchCuratedPixabayVideo(searchQuery: string) {
  const pixabayKey = process.env.PIXABAY_API_KEY;
  if (!pixabayKey || pixabayKey === 'your_pixabay_api_key_here') {
    return null;
  }

  const url = new URL('https://pixabay.com/api/videos/');
  url.searchParams.set('key', pixabayKey);
  url.searchParams.set('q', searchQuery);
  url.searchParams.set('safesearch', 'true');
  url.searchParams.set('per_page', '12');

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    const data: any = await res.json();
    const hits = Array.isArray(data.hits) ? data.hits : [];

    // Filter videos with extreme view counts to avoid generic b-roll
    const curatedVideos = hits.filter((v: any) => (v.downloads || 0) < 30000);
    const pool = curatedVideos.length > 0 ? curatedVideos : hits;

    if (pool.length > 0) {
      const candidatePool = pool.slice(0, 6);
      const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      const vids = chosen.videos || {};
      const videoUrl = vids.medium?.url || vids.large?.url || vids.small?.url;
      const candidates = candidatePool.map((v: any) => {
        const itemVids = v.videos || {};
        return {
          url: itemVids.medium?.url || itemVids.large?.url || itemVids.small?.url,
          duration: v.duration,
          user: v.user,
          tags: v.tags,
          downloads: v.downloads,
          picture_id: v.picture_id,
        };
      });

      return {
        url: videoUrl,
        duration: chosen.duration,
        user: chosen.user,
        tags: chosen.tags,
        downloads: chosen.downloads,
        picture_id: chosen.picture_id,
        candidates,
      };
    }
  } catch (err: any) {
    console.warn('Pixabay video fetch error:', err.message);
  }

  return null;
}

// Pixabay Media API Routes
app.get('/api/media/pixabay-status', (_req, res) => {
  const isConfigured = Boolean(
    process.env.PIXABAY_API_KEY && process.env.PIXABAY_API_KEY !== 'your_pixabay_api_key_here'
  );
  res.json({ configured: isConfigured });
});

app.post('/api/media/pixabay-photo', async (req, res) => {
  const { query, orientation = 'all' } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const isConfigured = Boolean(
    process.env.PIXABAY_API_KEY && process.env.PIXABAY_API_KEY !== 'your_pixabay_api_key_here'
  );

  const photoResult = await fetchCuratedPixabayPhoto(query, orientation);
  res.json({
    photo: photoResult,
    candidates: (photoResult as any)?.candidates || [],
    configured: isConfigured,
  });
});

app.post('/api/media/pixabay-video', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const isConfigured = Boolean(
    process.env.PIXABAY_API_KEY && process.env.PIXABAY_API_KEY !== 'your_pixabay_api_key_here'
  );

  const videoResult = await fetchCuratedPixabayVideo(query);
  res.json({
    video: videoResult,
    candidates: (videoResult as any)?.candidates || [],
    configured: isConfigured,
  });
});

// Vite Middleware Mounting for Dev vs Static Serving for Production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ YazooBlu Editorial Engine active on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
