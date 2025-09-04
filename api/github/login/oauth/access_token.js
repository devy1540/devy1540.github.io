// Device Flow 토큰 획득 API 프록시
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
    let client_id, device_code, grant_type;
    
    if (typeof body === 'string') {
      const params = new URLSearchParams(body);
      client_id = params.get('client_id');
      device_code = params.get('device_code');
      grant_type = params.get('grant_type');
    } else {
      client_id = body.client_id;
      device_code = body.device_code;
      grant_type = body.grant_type;
    }

    if (!client_id || !device_code) {
      res.status(400).json({ error: 'client_id and device_code are required' });
      return;
    }

    // GitHub OAuth token API 호출
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'devy1540-blog-cms',
      },
      body: new URLSearchParams({
        client_id,
        device_code,
        grant_type: grant_type || 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub OAuth error:', response.status, errorText);
      res.status(response.status).json({ 
        error: `GitHub OAuth error: ${response.status}`,
        details: errorText
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('OAuth token error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}