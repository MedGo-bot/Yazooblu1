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

interface SessionUser {
  id: number | string;
  email: string;
  name: string | null;
  role: string;
}

const SESSION_COOKIE = 'yazooblu_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

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

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array(0);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 3) return false;

  const iterations = Number(parts[0]);
  const saltHex = parts[1];
  const expectedHex = parts[2];
  if (!Number.isFinite(iterations) || iterations <= 0 || !saltHex || !expectedHex) {
    return false;
  }

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return timingSafeEqualBytes(new Uint8Array(derivedBits), hexToBytes(expectedHex));
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      cookies[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return cookies;
}

function makeSessionCookie(token: string, maxAge: number): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

async function getAuthenticatedUser(
  sql: postgres.Sql,
  request: Request
): Promise<SessionUser | null> {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return null;

  const rows = await sql<SessionUser[]>`
    SELECT u.id, u.email, u.name, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${sessionId}
      AND s.expires_at > NOW()
      AND u.is_active = TRUE
    LIMIT 1
  `;

  return rows[0] ?? null;
}

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

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders || {}),
    },
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

      // ==================== AUTH ROUTES ====================
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = (await request.json().catch(() => null)) as {
          email?: string;
          password?: string;
        } | null;
        const email = body?.email?.trim().toLowerCase();
        const password = body?.password ?? '';

        if (!email || !password) {
          return json({ error: 'Email and password are required.' }, 400);
        }

        const rows = await sql`
          SELECT id, email, password_hash, name, role, is_active
          FROM users
          WHERE LOWER(email) = ${email}
          LIMIT 1
        `;
        const user = rows[0];
        if (!user || !user.is_active) {
          return json({ error: 'Invalid email or password.' }, 401);
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
          return json({ error: 'Invalid email or password.' }, 401);
        }

        const sessionId = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
        const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

        await sql`
          INSERT INTO sessions (id, user_id, expires_at)
          VALUES (${sessionId}, ${user.id}, ${expiresAt})
        `;

        return json(
          {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          },
          200,
          { 'Set-Cookie': makeSessionCookie(sessionId, SESSION_TTL_SECONDS) }
        );
      }

      if (pathname === '/api/auth/me' && method === 'GET') {
        const cookies = parseCookies(request.headers.get('Cookie'));
        const sessionId = cookies[SESSION_COOKIE];
        if (!sessionId) {
          return json({ error: 'Not authenticated.' }, 401);
        }

        const rows = await sql`
          SELECT u.id, u.email, u.name, u.role
          FROM sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.id = ${sessionId}
            AND s.expires_at > NOW()
            AND u.is_active = TRUE
          LIMIT 1
        `;
        const user = rows[0];
        if (!user) {
          return json({ error: 'Session expired or invalid.' }, 401, {
            'Set-Cookie': makeSessionCookie('', 0),
          });
        }

        return json({ user });
      }

      if (pathname === '/api/auth/logout' && method === 'POST') {
        const cookies = parseCookies(request.headers.get('Cookie'));
        const sessionId = cookies[SESSION_COOKIE];
        if (sessionId) {
          await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
        }
        return json({ ok: true }, 200, {
          'Set-Cookie': makeSessionCookie('', 0),
        });
      }

      // ==================== SESSION GUARD FOR PRIVATE /API/* ROUTES ====================
      const isPublicApiRoute =
        pathname === '/api/health' || pathname.startsWith('/api/auth/');

      if (!isPublicApiRoute) {
        const authUser = await getAuthenticatedUser(sql, request);
        if (!authUser) {
          return json({ error: 'Unauthorized' }, 401);
        }
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

      // ==================== ELEVENLABS VOICE ROUTE ====================
      if (pathname === '/api/voice/elevenlabs' && method === 'POST') {
        const apiKey = env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return json({ error: 'ElevenLabs API key not configured.' }, 503);
        }
        const { text, brand_key, style_prompt, voice } = (await request.json()) as any;
        const cleanText = String(text || '').trim();
        if (!cleanText) {
          return json({ error: 'Text is required for voice synthesis.' }, 400);
        }

        const resolved = await resolveElevenLabsVoice(apiKey, brand_key, style_prompt, voice);
        const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolved.voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: cleanText.slice(0, 2500),
            model_id: 'eleven_multilingual_v2',
          }),
        });

        if (!ttsRes.ok) {
          return json({ error: 'ElevenLabs synthesis failed.' }, 502);
        }

        const audioBuf = await ttsRes.arrayBuffer();
        return json({
          voiceId: resolved.voiceId,
          voiceName: resolved.voiceName,
          mimeType: 'audio/mpeg',
          audioBase64: arrayBufferToBase64(audioBuf),
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

Generate 3 urgent, contrarian, and high-impact editorial angles/topics for this brand. Return valid JSON with shape: { "topics": ["...", "...", "..."] }.
`;

        if (aiClient) {
          try {
            const response: any = await generateWithFallback(aiClient, {
              contents: prompt,
              config: {
                systemInstruction: SYSTEM_RULES,
                temperature: 0.45,
                responseMimeType: 'application/json',
              },
            });
            const parsed = JSON.parse(response.text?.trim() || '{}');
            if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
              return json({ topics: parsed.topics.slice(0, 3), source: 'gemini-active' });
            }
          } catch (err: any) {
            console.warn('Topic suggestion Gemini call failed, using fallback:', err?.message);
          }
        }

        const anchor = brand.lexicon?.[0] || 'Strategic Discipline';
        return json({
          topics: [
            `Why conventional ${brand.name} assumptions break under real-world pressure (${anchor})`,
            `The hidden cost of delaying structural fixes in ${audience || 'executive operations'}`,
            `What separates durable ${brand.name} execution from short-lived noise`,
          ],
          source: 'studio-autonomous-engine',
        });
      }

      return json({ error: 'Not found' }, 404);
    } catch (err: any) {
      console.error('Worker error:', err);
      return json({ error: err?.message || 'Internal server error' }, 500);
    } finally {
      await sql.end();
    }
  },
};
