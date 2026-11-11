import { onRequestPost as handleGenerate } from '../functions/api/generate';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Handle OPTIONS for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Intercept POST /api/generate
    if (url.pathname === '/api/generate' && request.method === 'POST') {
      try {
        const response = await handleGenerate({ request, env, params: {}, waitUntil: ctx.waitUntil.bind(ctx), next: () => {} });
        return response;
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Fall back to Cloudflare static asset handling (dist/)
    return env.ASSETS.fetch(request);
  },
};
