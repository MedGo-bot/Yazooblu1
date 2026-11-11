import { neon } from '@neondatabase/serverless';

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET: Filter items by stage ('review', 'scheduled', or 'vault')
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
        'review',                -- Lands directly in Approval Tab
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
      // 1. Human approves and sets the publishing date -> Hits the Calendar
      [updated] = await sql`
        UPDATE editorial_posts 
        SET 
          stage = 'scheduled',
          status = 'approved',
          scheduled_date = ${scheduled_date || new Date(Date.now() + 86400000).toISOString()},
          headline = COALESCE(${headline}, headline),
          content = COALESCE(${content}, content)
        WHERE id = ${id}
        RETURNING *
      `;
    } else if (action === 'MOVE_TO_VAULT') {
      // 2. Post is published live -> Moves into the permanent Media Vault
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
      // 3. Regular human text/headline edit
      [updated] = await sql`
        UPDATE editorial_posts 
        SET 
          headline = COALESCE(${headline}, headline),
          content = COALESCE(${content}, content),
          scheduled_date = COALESCE(${scheduled_date}, scheduled_date)
        WHERE id = ${id}
        RETURNING *
      `;
    }

    return json({ success: true, post: updated });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}
