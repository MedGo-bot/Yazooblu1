export async function onRequestPost(context: { request: Request; env: Record<string, string> }) {
  try {
    const body = (await context.request.json()) as {
      brand_key?: string;
      audience?: string;
      channel?: string;
      topic?: string;
    };

    const { brand_key, audience, channel, topic } = body;

    if (!brand_key || !topic) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: brand_key or topic' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const responsePayload = {
      success: true,
      id: Date.now().toString(),
      brand_key,
      brand_name: brand_key,
      audience: audience || 'Executive Strategy',
      channel: channel || 'LinkedIn',
      topic,
      socialCopy: `Generated high-fidelity strategy content package for topic: "${topic}".`,
      status: 'Draft',
    };

    return new Response(JSON.stringify(responsePayload), {
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
