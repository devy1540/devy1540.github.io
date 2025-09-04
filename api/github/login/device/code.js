// Device Flow 초기화 API 프록시
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // URL-encoded form data 파싱
    const body = req.body || {};
    let client_id, scope;
    
    if (typeof body === 'string') {
      const params = new URLSearchParams(body);
      client_id = params.get('client_id');
      scope = params.get('scope');
    } else {
      client_id = body.client_id;
      scope = body.scope;
    }

    if (!client_id) {
      res.status(400).json({ error: 'client_id is required' });
      return;
    }

    // GitHub Device Flow API 호출
    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'devy1540-blog-cms',
      },
      body: new URLSearchParams({
        client_id,
        scope: scope || 'repo user',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      res.status(response.status).json({ 
        error: `GitHub API error: ${response.status}`,
        details: errorText
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Device flow error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}