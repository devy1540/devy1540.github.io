/**
 * GitHub OAuth code → access_token 교환 프록시 (Cloudflare Worker).
 *
 * 정적 호스팅(GitHub Pages)에는 client_secret을 둘 수 없으므로, 이 Worker가
 * 서버 사이드에서 토큰 교환을 대신한다. 프론트는 code만 보내고 토큰을 받는다.
 *
 * 필요한 바인딩(시크릿/변수):
 *   - GITHUB_CLIENT_ID      (secret)
 *   - GITHUB_CLIENT_SECRET  (secret)
 *   - ALLOWED_ORIGIN        (var, 예: https://devy1540.dev)
 */

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env)

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors })
    }
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, cors)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: "invalid_body" }, 400, cors)
    }

    const code = body?.code
    if (!code) {
      return json({ error: "missing_code" }, 400, cors)
    }

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const data = await tokenRes.json().catch(() => null)
    if (!data || data.error || !data.access_token) {
      return json({ error: data?.error_description || data?.error || "exchange_failed" }, 400, cors)
    }

    return json(
      { access_token: data.access_token, token_type: data.token_type, scope: data.scope },
      200,
      cors
    )
  },
}

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  }
}

function json(payload, status, cors) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  })
}
