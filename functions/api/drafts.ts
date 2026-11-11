import { neon } from '@neondatabase/serverless';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

// OPTIONS: Handle browser preflight checks for POST, PUT, and DELETE
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET: Filter items by stage, brand, or fetch latest
export async function onRequestGet(context: any) {
  const { request, env } = context;
  if (!env.DATABASE_URL) return json({ error: 'DATABASE_URL missing' }, 500);

  try {
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage'); // 'review' | 'scheduled' | 'vault'
    const brandKey = url.searchParams.get('brand');
    const sql = neon(env.DATABASE_URL);

    let rows;
    if (brandKey && stage) {
      rows = await sql`
        SELECT * FROM editorial_posts 
        WHERE brand_key = ${brandKey} AND stage = ${stage}
        ORDER BY COALESCE(scheduled_date, created_at) ASC
      `;
    } else if (stage) {
      rows = await sql`
        SELECT * FROM editorial_posts 
        WHERE stage = ${stage}
        ORDER BY COALESCE(scheduled_date, created_at) ASC
      `;
    } else if (brandKey) {
      rows = await sql`
        SELECT * FROM editorial_posts 
        WHERE brand_key = ${brandKey}
        ORDER BY created_at DESC LIMIT 150
      `;
    } else {
      rows = await sql`
        SELECT * FROM editorial_posts 
        ORDER BY created_at DESC LIMIT 150
      `;
    }

    // Map Neon database schema into the ProductionPackage format expected by ApprovalQueue & Calendar
    const formattedDrafts = rows.map((r: any) => ({
      id: r.id,
      brand_key: r.brand_key,
      brand_name: r.brand_key === 'bes_outkast' ? 'Bes Outkast Society' : r.brand_key,
      topic: r.topic || 'Strategic Directive',
      visual_headline: r.headline || '',
      post_body: r.content || '',
      stage: r.stage || 'review',
      status: r.status || 'pending_approval',
      channel: r.channel || 'LinkedIn',
      hook_options: [r.headline || 'Directive Hook'],
      selected_hook: r.headline || 'Directive Hook',
      image_prompt: `High-authority executive editorial composition for ${r.brand_key}`,
      voiceover_script: r.content || '',
      hashtags: '#ExecutiveLeadership #StrategicGovernance',
      scheduled_date: r.scheduled_date,
      live_url: r.live_url,
      created_at: r.created_at,
    }));

    return json({ drafts: formattedDrafts, items: formattedDrafts });
  } catch (err: any) {
    return json({ error: err.message, drafts: [], items: [] }, 500);
  }
}

// POST: Stage new generation from Gemini into 'review'
export async function onRequestPost(context: any) {
  const { request, env } = context;
  if (!env.DATABASE_URL) return json({ error: 'DATABASE_URL missing' }, 500);

  try {
    const p = await request.json();
    const sql = neon(env.DATABASE_URL);

    const [post] = await sql`
      INSERT INTO editorial_posts (
        id, brand_key, headline, topic, content, stage, status, scheduled_date, created_at
      ) VALUES (
        ${p.id || crypto.randomUUID()},
        ${p.brand_key || 'bes_outkast'},
        ${p.headline || p.title || 'Untitled Strategic Directive'},
        ${p.topic || 'Executive Architecture'},
        ${p.content || p.body || ''},
        'review',
        'pending_approval',
        ${p.scheduled_date || null},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        headline = EXCLUDED.headline,
        content = EXCLUDED.content,
        topic = EXCLUDED.topic
      RETURNING *
    `;

    return json({ success: true, post });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}

// PUT: Handles Edits, Approval -> Calendar, and Published -> Vault transitions
export async function onRequestPut(context: any) {
  const { request, env } = context;
  if (!env.DATABASE_URL) return json({ error: 'DATABASE_URL missing' }, 500);

  try {
    const p = await request.json();
    const { id, action, headline, content, scheduled_date, live_url } = p;

    if (!id) return json({ error: 'Post ID is required' }, 400);
    const sql = neon(env.DATABASE_URL);

    let updated;

    if (action === 'APPROVE_AND_SCHEDULE') {
      [updated] = await sql`
        UPDATE editorial_posts 
        SET 
          stage = 'scheduled',
          status = 'approved',
          scheduled_date = ${scheduled_date || new Date(Date.now() + 86400000).toISOString()},
          headline = COALESCE(${headline ?? null}, headline),
          content = COALESCE(${content ?? null}, content)
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (action === 'MOVE_TO_VAULT') {
      [updated] = await sql`
        UPDATE editorial_posts 
        SET 
          stage = 'vault',
          status = 'published',
          published_at = NOW(),
          live_url = ${live_url || null}
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      [updated] = await sql`
        UPDATE editorial_posts 
        SET 
          headline = COALESCE(${headline ?? null}, headline),
          content = COALESCE(${content ?? null}, content),
          scheduled_date = COALESCE(${scheduled_date ?? null}, scheduled_date)
        WHERE id = ${id}
        RETURNING *
      `;
    }

    if (!updated) {
      return json({ error: `Record with ID "${id}" was not found.` }, 404);
    }

    return json({ success: true, post: updated });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}
