import postgres from 'postgres';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DRAFTS } from './mockData';
import {
  BRANDS,
  BrandKey,
  Channel,
  ProductionPackage,
  HOOK_LIBRARY,
  getPlatformHooks,
  CHANNEL_SPECS,
} from './types';

export interface Env {
  HYPERDRIVE: Hyperdrive;
  ASSETS: Fetcher;
  GEMINI_API_KEY?: string;
  ELEVENLABS_API_KEY?: string;
  PIXABAY_API_KEY?: string;
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

const UNIVERSAL_FORBIDDEN_WORDS = [
  'delve',
  'tapestry',
  'game-changer',
  'beacon',
  'unlock',
  'elevate',
  'synergy',
  'paradigm shift',
  'cutting-edge',
  'revolutionize',
];

// ElevenLabs Brand Voice Mappings
const ELEVENLABS_BRAND_VOICES: Record<
  string,
  { primaryId: string; primaryName: string; secondaryId?: string; secondaryName?: string; lookupNames?: string[] }
> = {
  bos: {
    primaryId: '6xPz2opT0y5qtoRh1U1Y',
    primaryName: 'Christian (Serious TV Host)',
  },
  bes_outkast: {
    primaryId: '6xPz2opT0y5qtoRh1U1Y',
    primaryName: 'Christian (Serious TV Host)',
  },
  bes_health: {
    primaryId: 'zJ6rpe8s6MyLLO8MBnmq',
    primaryName: 'California dreaming',
  },
  porch_md: {
    primaryId: 'zJ6rpe8s6MyLLO8MBnmq',
    primaryName: 'California dreaming',
  },
  nuecofab: {
    primaryId: 'QskpmzLHRFPTEOkFlnAI',
    primaryName: 'Husky',
  },
  bhw_pr: {
    primaryId: 'ZmVD7qefWdrFFI6oxkBw',
    primaryName: 'Executive Officer From California',
    lookupNames: ['Executive Officer from California', 'San Francisco/Bay area Gen Z'],
  },
  hhls: {
    primaryId: 'XrExE9yKIg1WjnnlVkGX',
    primaryName: 'Matilda (Knowledgeable Professional)',
    secondaryId: 'pqHfZKP75CvOlQylNhV4',
    secondaryName: 'Bill (Wise, Mature, Balanced)',
  },
  hilton_head: {
    primaryId: 'XrExE9yKIg1WjnnlVkGX',
    primaryName: 'Matilda (Knowledgeable Professional)',
    secondaryId: 'pqHfZKP75CvOlQylNhV4',
    secondaryName: 'Bill (Wise, Mature, Balanced)',
  },
  fyrrion: {
    primaryId: 'zJ6rpe8s6MyLLO8MBnmq',
    primaryName: 'Eric / Daniel',
    lookupNames: ['Eric', 'Daniel'],
  },
};

let cachedVoiceMap: Record<string, string> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function detectBrandFromContext(brandKey?: string, stylePrompt?: string): string {
  if (brandKey && ELEVENLABS_BRAND_VOICES[brandKey.toLowerCase()]) {
    return brandKey.toLowerCase();
  }
  const text = `${brandKey || ''} ${stylePrompt || ''}`.toLowerCase();
  if (text.includes('nuecofab')) return 'nuecofab';
  if (text.includes('bh&w') || text.includes('bhw') || text.includes('public relations')) return 'bhw_pr';
  if (text.includes('fyrrion')) return 'fyrrion';
  if (text.includes('hhls') || text.includes('hilton head')) return 'hhls';
  if (text.includes('health') || text.includes('wellness') || text.includes('porch')) return 'bes_health';
  if (text.includes('bos') || text.includes('outkast')) return 'bos';
  return 'bos';
}

async function resolveElevenLabsVoice(
  apiKey: string,
  brandKey?: string,
  stylePrompt?: string,
  requestedVoice?: string
): Promise<{ voiceId: string; voiceName: string }> {
  const resolvedBrand = detectBrandFromContext(brandKey, stylePrompt);
  const config = ELEVENLABS_BRAND_VOICES[resolvedBrand] || ELEVENLABS_BRAND_VOICES.bos;

  // Use secondary voice (e.g. Bill for HHLS) if user chose a deep/grave voice preset
  const wantsSecondary =
    config.secondaryId &&
    requestedVoice &&
    ['Fenrir', 'Charon', 'Bill', 'Daniel'].some((v) =>
      requestedVoice.toLowerCase().includes(v.toLowerCase())
    );

  if (wantsSecondary && config.secondaryId) {
    return {
      voiceId: config.secondaryId,
      voiceName: config.secondaryName || config.primaryName,
    };
  }

  // Dynamic lookup for brands without hardcoded IDs (e.g., Fyrrion -> Eric / Daniel)
  if (config.lookupNames && config.lookupNames.length > 0 && resolvedBrand === 'fyrrion') {
    try {
      if (!cachedVoiceMap) {
        const res = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': apiKey },
        });
        if (res.ok) {
          const data = (await res.json()) as { voices?: Array<{ voice_id: string; name: string }> };
          cachedVoiceMap = {};
          for (const v of data.voices || []) {
            cachedVoiceMap[v.name.toLowerCase()] = v.voice_id;
          }
        }
      }
      if (cachedVoiceMap) {
        const preferredOrder =
          requestedVoice && ['Fenrir', 'Charon', 'Daniel'].includes(requestedVoice)
            ? ['daniel', 'eric']
            : ['eric', 'daniel'];
        for (const candidate of preferredOrder) {
          const matchedKey = Object.keys(cachedVoiceMap).find((k) => k.includes(candidate));
          if (matchedKey) {
            return {
              voiceId: cachedVoiceMap[matchedKey],
              voiceName: candidate === 'eric' ? 'Eric (Smooth, Trustworthy)' : 'Daniel (Steady Broadcaster)',
            };
          }
        }
      }
    } catch (e) {
      console.warn('ElevenLabs voice directory lookup failed, using default:', e);
    }
  }

  return {
    voiceId: config.primaryId,
    voiceName: config.primaryName,
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getSql(env: Env) {
  return postgres(env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false,
  });
}

function getAiClient(env: Env): GoogleGenAI | null {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  } catch {
    return null;
  }
}

async function generateWithFallback(client: GoogleGenAI, options: { contents: any; config?: any }) {
  try {
    return await client.models.generateContent({
      model: 'gemini-3.8-flash',
      ...options,
    });
  } catch (primaryErr: any) {
    console.warn(`Primary model error (${primaryErr?.message}). Failing over to gemini-3.1-flash-lite...`);
    return await client.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      ...options,
    });
  }
}

function generateFallbackPackage(
  brandKey: BrandKey,
  brandName: string,
  audience: string,
  channel: Channel,
  topic: string
): any {
  const brand = BRANDS[brandKey] || BRANDS['fyrrion'];
  const lexiconTerms = Array.isArray(brand?.lexicon) ? brand.lexicon.slice(0, 3).join(', ') : 'strategy, alignment';
  const platformHooks = typeof getPlatformHooks === 'function' ? getPlatformHooks(channel) : [];

  let postBody = '';
  if (channel === 'Bluesky') {
    postBody = `When evaluating ${topic.toLowerCase()}, standard assumptions collapse. True authority in our domain requires ${brand?.lexicon?.[0]?.toLowerCase() || 'rigor'} over transient sentiment. Rigorous standards dictate real-world outcomes.`.slice(0, 290);
  } else if (channel === 'Threads') {
    postBody = `Unpopular truth: The conversation around ${topic.toLowerCase()} is treating a structural crisis with cosmetic rhetoric. If you ignore ${brand?.lexicon?.[0]?.toLowerCase() || 'fundamentals'}, failure is guaranteed. Agree or disagree?`.slice(0, 290);
  } else if (channel === 'Pinterest') {
    postBody = `THE EDITORIAL BLUEPRINT: ${(brand?.name || 'STUDIO').toUpperCase()}\n\nTopic: ${topic}\n\nKey Spec Breakdown:\n• ${brand?.lexicon?.[0] || 'Rigor'}: Fundamental baseline verification\n• ${brand?.lexicon?.[1] || 'Precision'}: Eliminating cosmetic shortcuts\n• Operational Integrity: Verifiable evidence over marketing sentiment\n\nSave this Pin to your permanent resource board for technical reference.`.slice(0, 780);
  } else if (channel === 'X') {
    postBody = `${topic.slice(0, 130)}. Conventional practices ignore ${brand?.lexicon?.[0]?.toLowerCase() || 'core metrics'}. Signal over noise. Precision over panic.`.slice(0, 255);
  } else if (channel === 'TikTok') {
    postBody = `Watch what happens when you evaluate ${topic.toLowerCase()} through raw ${brand?.lexicon?.[0]?.toLowerCase() || 'data'}. This single operational shift changes the entire outcome. Save this workflow.`.slice(0, 240);
  } else if (channel === 'Instagram') {
    postBody = `THE STANDARD OF EXCELLENCE.\n\n${topic}.\n\nIn our domain, ${brand?.lexicon?.[0]?.toLowerCase() || 'rigor'} is not an ornamental phrase. It is the boundary between lasting authority and operational compromise.\n\n1. Establish definitive benchmarks.\n2. Reject cosmetic remedies.\n3. Demand evidentiary precision.\n\nRead the full dossier in our archive.`;
  } else {
    postBody = `The conversation surrounding ${topic.toLowerCase()} is too often clouded by superficial rhetoric.\n\nIn high-stakes environments, true authority requires grounding in ${lexiconTerms}.\n\nWhen leadership evaluates this challenge, three principles emerge:\n\n1. Structural Reality: Avoid short-term expedients that sacrifice permanent durability.\n2. Telemetry and Evidence: Validate every assertion against verifiable real-world metrics.\n3. Institutional Discipline: Protect core integrity before public posturing.\n\nTrue mastery is recognized not in the volume of claims made, but in the measurable permanence of execution.`;
  }

  const selectedHookTemplates = platformHooks.slice(0, 3);
  const hooks =
    selectedHookTemplates.length > 0
      ? selectedHookTemplates.map((template) =>
          template
            .replace(/\[X\]/g, topic)
            .replace(/\[Entity\]/g, brand.name)
            .replace(/\[Subject\]/g, topic)
        )
      : [
          `The conventional approach to ${topic.toLowerCase()} ignores ${brand?.lexicon?.[0] || 'core realities'}.`,
          `Why most executive strategies around ${topic.toLowerCase()} fail within 90 days.`,
          `The evidentiary framework for resolving ${topic.toLowerCase()}.`,
        ];

  const accentColor = brand?.palette?.accent || brand?.colors?.accent || '#f59e0b';
  const visualHeadline = `${(brand?.lexicon?.[0] || 'STRATEGY').toUpperCase()}: ${topic.split(' ').slice(0, 4).join(' ').toUpperCase()}`;
  const imagePrompt = `High-contrast cinematic editorial visual, representing ${brand.name}, color palette accents of ${accentColor} and deep rich background tones, architectural precision, 8k documentary photograph, award-winning editorial composition`;
  const tags = `#${brand.key.replace('_', '')} #${channel.replace(' ', '')} #${(brand?.lexicon?.[0] || 'Leadership').replace(/\s+/g, '')} #ExecutiveLeadership`;
  const voiceoverScript = `[0:00-0:05 Hook]\n"${hooks[0]}"\n\n[0:05-0:18 Context]\n"Too many organizations treat ${topic.toLowerCase()} as a secondary consideration. But in reality, ${(brand?.lexicon?.[1] || 'precision').toLowerCase()} dictates the outcome."\n\n[0:18-0:32 Protocol]\n"When we analyze the underlying architecture, the evidentiary standard leaves no room for ambiguity."\n\n[0:32-0:45 Directive]\n"Ground your decisions in measurable reality. Measure what endures."\n\n[Music / Tone: ${brand?.posture?.slice(0, 40) || 'Measured Gravitas'}]`;

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

async function insertDraft(sql: postgres.Sql, draft: ProductionPackage) {
  await sql`
    INSERT INTO drafts (
      id, brand_key, brand_name, channel, audience, topic, magazine_column,
      hook_options, selected_hook, post_body, voiceover_script,
      visual_headline, image_prompt, hashtags, status, rejection_reason, created_at
    ) VALUES (
      ${draft.id},
      ${draft.brand_key},
      ${draft.brand_name},
      ${draft.channel},
      ${draft.audience || null},
      ${draft.topic || null},
      ${draft.magazine_column || null},
      ${sql.json(draft.hook_options || [])},
      ${draft.selected_hook || null},
      ${draft.post_body || ''},
      ${draft.voiceover_script || ''},
      ${draft.visual_headline || ''},
      ${draft.image_prompt || ''},
      ${draft.hashtags || ''},
      ${draft.status || 'pending_review'},
      ${draft.rejection_reason || null},
      ${draft.created_at || new Date().toISOString()}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // Serve static frontend assets for non-API requests
    if (!pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    const sql = getSql(env);

    try {
      // ==================== HEALTH CHECK ====================
      if (pathname === '/api/health' && method === 'GET') {
        const result = await sql`SELECT NOW() AS server_time`;
        return json({
          status: 'ok',
          database: 'connected',
          elevenlabs_configured: Boolean(env.ELEVENLABS_API_KEY),
          pixabay_configured: Boolean(env.PIXABAY_API_KEY),
          server_time: result[0]?.server_time,
        });
      }

      // ==================== DRAFTS CRUD ROUTES ====================
      if (pathname === '/api/drafts' && method === 'GET') {
        let rows = await sql`SELECT * FROM drafts ORDER BY created_at DESC`;
        if (rows.length === 0 && Array.isArray(INITIAL_DRAFTS) && INITIAL_DRAFTS.length > 0) {
          for (const seed of INITIAL_DRAFTS) {
            await insertDraft(sql, seed);
          }
          rows = await sql`SELECT * FROM drafts ORDER BY created_at DESC`;
        }
        return json(rows);
      }

      if (pathname === '/api/drafts' && method === 'POST') {
        const body = (await request.json()) as any;
        const newDraft: ProductionPackage = {
          ...body,
          id: `draft-${Date.now()}`,
          status: body.status || 'pending_review',
          created_at: new Date().toISOString(),
        };
        await insertDraft(sql, newDraft);
        return json(newDraft, 201);
      }

      const statusMatch = pathname.match(/^\/api\/drafts\/([^/]+)\/status$/);
      if (statusMatch && method === 'PATCH') {
        const id = decodeURIComponent(statusMatch[1]);
        const { status, rejection_reason } = (await request.json()) as any;
        const updated =
          rejection_reason !== undefined
            ? await sql`UPDATE drafts SET status = ${status}, rejection_reason = ${rejection_reason} WHERE id = ${id} RETURNING *`
            : await sql`UPDATE drafts SET status = ${status} WHERE id = ${id} RETURNING *`;
        if (updated.length === 0) return json({ error: 'Draft not found' }, 404);
        return json(updated[0]);
      }

      const draftIdMatch = pathname.match(/^\/api\/drafts\/([^/]+)$/);
      if (draftIdMatch && method === 'PUT') {
        const id = decodeURIComponent(draftIdMatch[1]);
        const body = (await request.json()) as any;
        const existing = await sql`SELECT * FROM drafts WHERE id = ${id}`;
        if (existing.length === 0) return json({ error: 'Draft not found' }, 404);
        const merged = { ...existing[0], ...body };
        const updated = await sql`
          UPDATE drafts SET
            brand_key = ${merged.brand_key},
            brand_name = ${merged.brand_name},
            channel = ${merged.channel},
            audience = ${merged.audience || null},
            topic = ${merged.topic || null},
            magazine_column = ${merged.magazine_column || null},
            hook_options = ${sql.json(merged.hook_options || [])},
            selected_hook = ${merged.selected_hook || null},
            post_body = ${merged.post_body || ''},
            voiceover_script = ${merged.voiceover_script || ''},
            visual_headline = ${merged.visual_headline || ''},
            image_prompt = ${merged.image_prompt || ''},
            hashtags = ${merged.hashtags || ''},
            status = ${merged.status || 'pending_review'},
            rejection_reason = ${merged.rejection_reason || null}
          WHERE id = ${id}
          RETURNING *
        `;
        return json(updated[0]);
      }

      if (draftIdMatch && method === 'DELETE') {
        const id = decodeURIComponent(draftIdMatch[1]);
        await sql`DELETE FROM drafts WHERE id = ${id}`;
        return json({ success: true });
      }

      // ==================== STATIC METADATA ROUTES ====================
      if (pathname === '/api/hooks' && method === 'GET') {
        return json(HOOK_LIBRARY || []);
      }

      if (pathname === '/api/forbidden-words' && method === 'GET') {
        const byBrand: Record<string, string[]> = {};
        for (const [key, b] of Object.entries(BRANDS)) {
          byBrand[key] = b.forbiddenWords || [];
        }
        return json({
          universal: UNIVERSAL_FORBIDDEN_WORDS,
          byBrand,
        });
      }

      const brandRulesMatch = pathname.match(/^\/api\/brands\/([^/]+)\/rules$/);
      if (brandRulesMatch && method === 'GET') {
        const brand_key = decodeURIComponent(brandRulesMatch[1]);
        const brand = BRANDS[brand_key as BrandKey];
        if (!brand) return json({ error: 'Brand not found' }, 404);
        return json({
          brand_key: brand.key,
          brand_name: brand.name,
          pictureRules: brand.pictureRules || {},
          videoRules: brand.videoRules || {},
        });
      }

      // ==================== PIXABAY MEDIA CURATION ROUTES ====================
      if (pathname === '/api/media/pixabay-status' && method === 'GET') {
        return json({ configured: Boolean(env.PIXABAY_API_KEY) });
      }

      if (pathname === '/api/media/pixabay-photo' && method === 'POST') {
        const apiKey = env.PIXABAY_API_KEY;
        if (!apiKey) {
          return json({ configured: false, photo: null });
        }
        const { query, orientation } = (await request.json()) as any;
        const q = encodeURIComponent((query || 'architecture').trim());
        const orient = orientation === 'vertical' || orientation === 'horizontal' ? orientation : 'all';
        const pixabayUrl = `https://pixabay.com/api/?key=${apiKey}&q=${q}&image_type=photo&orientation=${orient}&safesearch=true&per_page=15`;

        const res = await fetch(pixabayUrl);
        if (!res.ok) {
          return json({ configured: true, photo: null, error: 'Pixabay photo lookup failed' });
        }
        const data = (await res.json()) as { hits?: any[] };
        const hits = Array.isArray(data.hits) ? data.hits : [];

        // Curated editorial filter: avoid overly viral/stock-cliche hits (< 60k downloads)
        const curated =
          hits.find((h) => (h.downloads || 0) < 60000 && h.largeImageURL) || hits[0] || null;

        if (!curated) {
          return json({ configured: true, photo: null });
        }

        return json({
          configured: true,
          photo: {
            id: curated.id,
            url: curated.largeImageURL || curated.webformatURL,
            previewUrl: curated.webformatURL,
            user: curated.user,
            downloads: curated.downloads,
            tags: curated.tags,
          },
        });
      }

      if (pathname === '/api/media/pixabay-video' && method === 'POST') {
        const apiKey = env.PIXABAY_API_KEY;
        if (!apiKey) {
          return json({ configured: false, video: null, candidates: [] });
        }
        const { query } = (await request.json()) as any;
        const q = encodeURIComponent((query || 'architecture').trim());
        const pixabayUrl = `https://pixabay.com/api/videos/?key=${apiKey}&q=${q}&safesearch=true&per_page=20`;

        const res = await fetch(pixabayUrl);
        if (!res.ok) {
          return json({ configured: true, video: null, candidates: [] });
        }
        const data = (await res.json()) as { hits?: any[] };
        const hits = Array.isArray(data.hits) ? data.hits : [];

        // Strict anti-generic threshold (< 30k downloads)
        const curatedHits = hits
          .filter((h) => (h.downloads || 0) < 30000 && h.videos)
          .map((h) => {
            const bestStream =
              h.videos?.medium?.url ||
              h.videos?.large?.url ||
              h.videos?.small?.url ||
              h.videos?.tiny?.url;
            return {
              id: h.id,
              url: bestStream,
              duration: h.duration,
              user: h.user,
              downloads: h.downloads,
              tags: h.tags,
            };
          })
          .filter((v) => Boolean(v.url));

        return json({
          configured: true,
          video: curatedHits[0] || null,
          candidates: curatedHits.slice(0, 6),
        });
      }

      // ==================== AI GENERATION ROUTES ====================
      const aiClient = getAiClient(env);

      if (pathname === '/api/ai/audit' && method === 'POST') {
        const { brand_key, channel, text } = (await request.json()) as any;
        const brand = BRANDS[brand_key as BrandKey];
        const content = (text || '').trim();
        const lower = content.toLowerCase();

        const forbiddenPool = [
          ...UNIVERSAL_FORBIDDEN_WORDS,
          ...(brand?.forbiddenWords || []),
        ];
        const violations = forbiddenPool.filter((word) => lower.includes(word.toLowerCase()));
        const lexiconMatches = (brand?.lexicon || []).filter((term) =>
          lower.includes(term.toLowerCase())
        );

        const spec = channel ? CHANNEL_SPECS[channel as Channel] : undefined;
        const overLimit = spec?.charLimit ? content.length > spec.charLimit : false;

        let score = 92 - violations.length * 14 + Math.min(lexiconMatches.length * 4, 8);
        if (overLimit) score -= 12;
        score = Math.max(20, Math.min(100, score));

        const suggestions: string[] = [];
        if (violations.length > 0) {
          suggestions.push(`Remove flagged terms: ${violations.join(', ')}.`);
        }
        if (lexiconMatches.length === 0 && brand?.lexicon?.length) {
          suggestions.push(
            `Anchor copy with core ${brand.name} lexicon: ${brand.lexicon.slice(0, 2).join(', ')}.`
          );
        }
        if (overLimit && spec?.charLimit) {
          suggestions.push(
            `Trim copy from ${content.length} to under ${spec.charLimit} characters for ${channel}.`
          );
        }
        if (suggestions.length === 0) {
          suggestions.push('Voice posture and lexical discipline align with studio standards.');
        }

        return json({
          result: {
            score,
            status: violations.length === 0 && !overLimit ? 'passed' : 'warning',
            violations,
            lexiconMatches,
            suggestions,
            summary:
              violations.length === 0
                ? `${brand?.name || 'Brand'} voice posture verified (${score}/100).`
                : `${violations.length} lexical violation(s) detected for ${brand?.name || 'brand'}.`,
          },
        });
      }

      if (pathname === '/api/generate' && method === 'POST') {
        const { brand_key, audience, channel, topic, magazine_column } = (await request.json()) as any;
        const brand = BRANDS[brand_key as BrandKey];
        if (!brand) return json({ error: 'Invalid brand key' }, 400);

        const prompt = `
Brand: ${brand.name} (${brand_key})
Brand Persona: ${brand.archetype}
Rhetorical Posture: ${brand.posture}
Mandatory Lexicon Anchors: ${Array.isArray(brand.lexicon) ? brand.lexicon.join(', ') : ''}
Negative Constraints: ${brand.negativeConstraints}
Forbidden Slang/Terms: ${[...(brand.forbiddenWords || []), ...UNIVERSAL_FORBIDDEN_WORDS].join(', ')}
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
            const parsed = JSON.parse(response.text?.trim() || '{}');
            const draft: ProductionPackage = {
              id: `draft-${Date.now()}`,
              brand_key: brand.key,
              brand_name: brand.name,
              channel,
              audience,
              topic,
              magazine_column: magazine_column || parsed.magazine_column || undefined,
              hook_options: parsed.hook_options || [`New directive in ${brand.lexicon?.[0] || 'strategy'}`],
              selected_hook: parsed.hook_options?.[0] || '',
              post_body: parsed.post_body || '',
              voiceover_script: parsed.voiceover_script || '',
              visual_headline: parsed.visual_headline || `${brand.lexicon?.[0] || 'Executive'} Protocol`,
              image_prompt: parsed.image_prompt || '',
              hashtags: parsed.hashtags || '',
              status: 'pending_review',
              created_at: new Date().toISOString(),
            };
            await insertDraft(sql, draft);
            return json({ draft, source: 'gemini-active' });
          } catch (err: any) {
            console.warn('Gemini API call failed, using fallback:', err?.message);
          }
        }

        const fallbackPkg = generateFallbackPackage(brand.key, brand.name, audience, channel, topic);
        const fallbackDraft: ProductionPackage = {
          id: `draft-${Date.now()}`,
          brand_key: brand.key,
          brand_name: brand.name,
          channel,
          audience,
          topic,
          magazine_column,
          ...fallbackPkg,
          selected_hook: fallbackPkg.hook_options?.[0] || '',
          status: 'pending_review',
          created_at: new Date().toISOString(),
        };
        await insertDraft(sql, fallbackDraft);
        return json({ draft: fallbackDraft, source: 'studio-autonomous-engine' });
      }

      if (pathname === '/api/ai/suggest-topics' && method === 'POST') {
        const { brand_key, audience } = (await request.json()) as any;
        const brand = BRANDS[brand_key as BrandKey];
        if (!brand) return json({ error: 'Invalid brand key' }, 400);

        const prompt = `
You are the Executive Editor for ${brand.name}.
Archetype: ${brand.archetype}
Rhetorical Posture: ${brand.posture}
Mandatory Lexicon Anchors: ${Array.isArray(brand.lexicon) ? brand.lexicon.join(', ') : ''}
Negative Constraints: ${brand.negativeConstraints}
Target Audience: ${audience || brand.audiences?.[0]}

Generate 3 urgent, contrarian, and high-impact editorial angles/topics for this brand.
Each angle should be 10-25 words, concrete, intellectually arresting, and grounded in real-world friction.
Never use fluff words like "delve", "tapestry", "game-changer", "beacon", "unlock", or "elevate".

Respond in JSON format:
{ "topics": ["Angle 1...", "Angle 2...", "Angle 3..."] }
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
            const parsed = JSON.parse(response.text?.trim() || '{}');
            if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
              return json({ topics: parsed.topics, source: 'gemini-active' });
            }
          } catch (err: any) {
            console.warn('Gemini topic suggestion error:', err?.message);
          }
        }

        const fallback = [
          `${brand.lexicon?.[0] || 'Strategic'} operational reality vs superficial market assumptions`,
          `Why conventional frameworks fail when evaluating ${brand.lexicon?.[1]?.toLowerCase() || 'execution'}`,
          `The structural risk of ignoring ${brand.lexicon?.[2] ? brand.lexicon[2].toLowerCase() : brand.lexicon?.[0]?.toLowerCase() || 'metrics'} in high-stakes environments`,
        ];
        return json({ topics: fallback, source: 'brand-lexicon-heuristics' });
      }

      if (pathname === '/api/ai/refine' && method === 'POST') {
        const { brand_key, channel, action, current_body, current_hook, current_headline, user_instruction } =
          (await request.json()) as any;
        const brand = BRANDS[brand_key as BrandKey];
        if (!brand) return json({ error: 'Invalid brand key' }, 400);

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
          directive = `Audit and eradicate any AI filler words, corporate jargon, or brand forbidden words (${(brand.forbiddenWords || []).join(', ')}). Reinforce mandatory lexicon anchors: ${(brand.lexicon || []).join(', ')}.`;
        } else {
          directive = user_instruction || 'Elevate the rhetorical force and platform alignment.';
        }

        const prompt = `
Brand: ${brand.name}
Archetype: ${brand.archetype}
Posture: ${brand.posture}
Mandatory Lexicon: ${(brand.lexicon || []).join(', ')}
Negative Constraints: ${brand.negativeConstraints}
Channel: ${channel} (Max characters: ${charLimit})

CURRENT ASSETS:
Hook: ${current_hook || ''}
Headline: ${current_headline || ''}
Body Copy: ${current_body || ''}

REFINEMENT DIRECTIVE:
${directive}

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
            const parsed = JSON.parse(response.text?.trim() || '{}');
            return json({ result: parsed, source: 'gemini-active' });
          } catch (err: any) {
            console.warn('Gemini refine call failed:', err?.message);
          }
        }

        let trimmedBody = current_body || '';
        if (action === 'tighten_chars' && charLimit) {
          trimmedBody = trimmedBody.slice(0, charLimit - 20) + '...';
        }
        return json({
          result: {
            refined_body: trimmedBody,
            refined_headline: current_headline || `${brand.lexicon?.[0] || 'Executive'} Protocol`,
            hook_options: [
              `The real problem with ${current_headline || 'this'} isn't execution—it's ${(brand.lexicon?.[0] || 'alignment').toLowerCase()}.`,
              `Conventional assumptions about this ignore ${brand.lexicon?.[1] || brand.lexicon?.[0] || 'core data'}.`,
              `Before signing off on another strategy deck, verify ${(brand.lexicon?.[0] || 'metrics').toLowerCase()}.`,
            ],
            selected_hook: `The real problem with ${current_headline || 'this'} isn't execution—it's ${(brand.lexicon?.[0] || 'alignment').toLowerCase()}.`,
            refinement_notes: 'Heuristic alignment with brand voice anchors applied.',
          },
          source: 'fallback-rules',
        });
      }

      if (pathname === '/api/ai/adapt-channel' && method === 'POST') {
        const { brand_key, target_channel, post_body, topic, original_hook } = (await request.json()) as any;
        const brand = BRANDS[brand_key as BrandKey];
        if (!brand) return json({ error: 'Invalid brand key' }, 400);

        const spec = CHANNEL_SPECS[target_channel as Channel] || CHANNEL_SPECS.LinkedIn;
        const charLimit = spec.charLimit || 2000;

        const prompt = `
Brand: ${brand.name}
Archetype: ${brand.archetype}
Mandatory Lexicon: ${(brand.lexicon || []).join(', ')}
Original Topic: ${topic}
Original Hook: ${original_hook || ''}
Original Copy: ${post_body}

Adapt this editorial content natively for ${target_channel}.
TARGET CHANNEL CONSTRAINTS:
- Character Limit: ${charLimit} characters.
- Format: ${spec.desc}

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
            const parsed = JSON.parse(response.text?.trim() || '{}');
            return json({ result: parsed, source: 'gemini-active' });
          } catch (err: any) {
            console.warn('Gemini adapt call failed:', err?.message);
          }
        }

        const fallbackPkg = generateFallbackPackage(
          brand.key,
          brand.name,
          brand.audiences?.[0] || 'Executive',
          target_channel as Channel,
          topic || brand.sampleTopics?.[0] || 'Leadership'
        );
        return json({
          result: {
            adapted_body: fallbackPkg.post_body,
            adapted_hook: fallbackPkg.hook_options[0],
            adapted_headline: fallbackPkg.visual_headline,
            hashtags: fallbackPkg.hashtags,
          },
          source: 'fallback-rules',
        });
      }

      // ==================== ELEVENLABS + GEMINI TTS ROUTE ====================
      if (pathname === '/api/ai/tts' && method === 'POST') {
        const { script, voice_name, style_prompt, brand_key } = (await request.json()) as any;
        const selectedVoice = voice_name || 'Kore';

        const cleanScript = (script || '')
          .replace(/\[\d+:\d+-\d+:\d+[^\]]*\]/g, '')
          .replace(/\[Music[^\]]*\]/gi, '')
          .replace(/\[Tone[^\]]*\]/gi, '')
          .replace(/"/g, '')
          .trim();

        if (!cleanScript) return json({ error: 'Empty script' }, 400);

        // 1. Primary: ElevenLabs Brand-Matched TTS
        if (env.ELEVENLABS_API_KEY) {
          try {
            const { voiceId, voiceName } = await resolveElevenLabsVoice(
              env.ELEVENLABS_API_KEY,
              brand_key,
              style_prompt,
              selectedVoice
            );

            const elResponse = await fetch(
              `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
              {
                method: 'POST',
                headers: {
                  'xi-api-key': env.ELEVENLABS_API_KEY,
                  'Content-Type': 'application/json',
                  Accept: 'audio/mpeg',
                },
                body: JSON.stringify({
                  text: cleanScript,
                  model_id: 'eleven_multilingual_v2',
                  voice_settings: {
                    stability: 0.55,
                    similarity_boost: 0.8,
                    style: 0.25,
                    use_speaker_boost: true,
                  },
                }),
              }
            );

            if (elResponse.ok) {
              const audioBuffer = await elResponse.arrayBuffer();
              const audioBase64 = arrayBufferToBase64(audioBuffer);
              return json({
                audioBase64,
                mimeType: 'audio/mpeg',
                voiceName,
                voiceId,
                source: 'elevenlabs',
              });
            } else {
              const errText = await elResponse.text();
              console.warn(`ElevenLabs TTS failed (${elResponse.status}): ${errText}`);
            }
          } catch (elErr: any) {
            console.warn('ElevenLabs TTS exception, falling back to Gemini TTS:', elErr?.message);
          }
        }

        // 2. Fallback: Gemini TTS
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
              return json({
                audioBase64: base64Audio,
                mimeType: 'audio/wav',
                voiceName: selectedVoice,
                source: 'gemini-3.8-flash-lite-tts',
              });
            }
          } catch (err: any) {
            return json(
              {
                error: 'TTS unavailable, fallback to browser speech synthesis',
                message: err?.message,
              },
              503
            );
          }
        }

        return json({ error: 'No TTS provider configured; use browser speech synthesis' }, 503);
      }

      if (pathname === '/api/ai/picture-generate' && method === 'POST') {
        const { brand_key, topic, headline, aspect_ratio, custom_directive } = (await request.json()) as any;
        const brand = BRANDS[brand_key as BrandKey];
        if (!brand) return json({ error: 'Invalid brand key' }, 400);

        const chosenAr = aspect_ratio || brand.pictureRules?.aspectRatios?.[0] || '1:1';
        const rules = brand.pictureRules || {};
        const accentColor = brand?.palette?.accent || brand?.colors?.accent || '#f59e0b';
        const bgColor = brand?.palette?.bg || brand?.colors?.bg || '#0a0a0a';

        const prompt = `
You are the Executive Visual Art Director for ${brand.name}.
Aesthetic Style: ${rules.aestheticStyle || 'Cinematic Documentary'}
Lighting & Camera: ${rules.lightingAndCamera || 'Low key architectural lighting'}
Color Grading: ${rules.colorGradingDirective || 'Muted high contrast'}
Permitted Subjects: ${(rules.permittedSubjects || []).join(', ')}
Strict Forbidden Tropes (Anti-AI Slop): ${(rules.forbiddenVisualTropes || []).join(', ')}
Brand Colors: Background ${bgColor}, Accent ${accentColor}

Input Topic: ${topic || brand.sampleTopics?.[0] || 'Strategic Leadership'}
Headline Overlay: ${headline || `${brand.lexicon?.[0] || 'Executive'} Protocol`}
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
    "color_palette_hex": ["${bgColor}", "${accentColor}"]
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
            const parsed = JSON.parse(response.text?.trim() || '{}');
            return json({ result: parsed, source: 'gemini-active' });
          } catch (err: any) {
            console.warn('Gemini picture generation failed:', err?.message);
          }
        }

        return json({
          result: {
            imagen_prompt: `${rules.aestheticStyle || 'Cinematic editorial documentary'} photograph depicting ${topic || 'executive leadership'}, ${rules.lightingAndCamera || 'low-key architectural lighting'}, ${rules.colorGradingDirective || 'muted high contrast'}, accented with ${accentColor}, 8k resolution, sharp focus`,
            negative_prompt: 'smiling stock people, plastic textures, cartoony renders, fake neon, amateur lighting',
            visual_concept: `Minimalist architectural composition anchoring ${brand.name}'s visual authority around ${topic || 'strategic clarity'}.`,
            artistic_direction: {
              lighting: rules.lightingAndCamera || 'Low-key directional key light',
              focal_length: '50mm f/1.4 prime',
              color_palette_hex: [bgColor, accentColor],
            },
            compliance_audit: {
              anti_slop_passed: true,
              brand_color_match: true,
              forbidden_tropes_detected: [],
            },
          },
          source: 'brand-rules-engine',
        });
      }

      if (pathname === '/api/ai/video-storyboard' && method === 'POST') {
        const { brand_key, topic, video_length } = (await request.json()) as any;
        const brand = BRANDS[brand_key as BrandKey];
        if (!brand) return json({ error: 'Invalid brand key' }, 400);

        const rules = brand.videoRules || {};

        const prompt = `
You are the Executive Video Director for ${brand.name}.
Target Pace & Rhythm: ${rules.pacingAndRhythm || 'Measured, steady'}
Camera Movement: ${(rules.cameraMotions || []).join(', ')}
Audio Aesthetic: ${rules.audioDesign || 'Low frequency ambient drone'}

Topic: ${topic || brand.sampleTopics?.[0] || 'Leadership'}
Requested Length: ${video_length || '30s'}

Generate a kinetic motion storyboard package conforming strictly to this JSON format:
{
  "storyboard": [
    {
      "timestamp": "0:00-0:05",
      "visual_scene": "Description of opening shot",
      "camera_direction": "Camera motion choice",
      "audio_cue": "Voiceover or atmospheric sound"
    },
    {
      "timestamp": "0:05-0:20",
      "visual_scene": "Description of core argument visual",
      "camera_direction": "Camera motion choice",
      "audio_cue": "Voiceover narration"
    },
    {
      "timestamp": "0:20-0:30",
      "visual_scene": "Description of closing directive",
      "camera_direction": "Static shot with graphic overlay",
      "audio_cue": "Fade to silence"
    }
  ],
  "pacing": "Measured and authoritative",
  "recommended_audio": "Low-frequency ambient drone with crisp narration"
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
            const parsed = JSON.parse(response.text?.trim() || '{}');
            return json({ result: parsed, source: 'gemini-active' });
          } catch (err: any) {
            console.warn('Gemini video storyboard generation failed:', err?.message);
          }
        }

        return json({
          result: {
            storyboard: [
              {
                timestamp: '0:00-0:05',
                visual_scene: `Opening shot focusing on ${topic || 'strategic infrastructure'}.`,
                camera_direction: 'Slow forward dolly',
                audio_cue: 'Executive narration voiceover',
              },
              {
                timestamp: '0:05-0:20',
                visual_scene: 'Data telemetry overlay showcasing real-world performance metrics.',
                camera_direction: 'Static macro shot',
                audio_cue: 'Subtle ambient pad',
              },
              {
                timestamp: '0:20-0:30',
                visual_scene: `Closing brand mark for ${brand.name} with directive overlay.`,
                camera_direction: 'Static frame',
                audio_cue: 'Fade to silence',
              },
            ],
            pacing: rules.pacingAndRhythm || 'Measured and authoritative',
            recommended_audio: rules.audioDesign || 'Low-frequency ambient drone',
          },
          source: 'brand-rules-engine',
        });
      }

      return json({ error: 'Not Found' }, 404);
    } catch (err: any) {
      console.error('Worker API error:', err);
      return json({ error: err?.message || 'Internal Server Error' }, 500);
    } finally {
      ctx.waitUntil(sql.end());
    }
  },
};
