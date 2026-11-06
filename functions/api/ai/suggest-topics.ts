export async function onRequestPost(context: { request: Request }) {
  try {
    const body = (await context.request.json()) as { brand_key?: string };
    const brand_key = body.brand_key || 'default';

    const suggestions = [
      `2027 Hilton Head Summit Executive Framework for ${brand_key}`,
      `Operational Agility in Autonomous Workflows`,
      `Leadership Metrics and Strategic Alignment`,
    ];

    return new Response(JSON.stringify({ success: true, topics: suggestions }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
