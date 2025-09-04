/**
 * JWT 토큰 생성을 위한 유틸리티
 * GitHub App 인증에 사용됩니다.
 */

interface JWTHeader {
  alg: string;
  typ: string;
}

interface JWTPayload {
  iat: number;
  exp: number;
  iss: string;
}

/**
 * Base64URL 인코딩
 */
function base64UrlEncode(obj: unknown): string {
  const jsonStr = JSON.stringify(obj);
  const base64 = btoa(jsonStr);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * PEM 형식의 RSA private key를 ArrayBuffer로 변환
 */
async function pemToArrayBuffer(pem: string): Promise<ArrayBuffer> {
  // PEM 헤더/푸터 제거 및 base64 디코딩
  const pemHeader = '-----BEGIN RSA PRIVATE KEY-----';
  const pemFooter = '-----END RSA PRIVATE KEY-----';
  const pemContents = pem
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');

  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * RS256 알고리즘을 사용하여 JWT 서명 생성
 */
async function signJWT(
  header: string,
  payload: string,
  privateKey: string
): Promise<string> {
  try {
    // Web Crypto API를 사용하여 서명
    const keyData = await pemToArrayBuffer(privateKey);
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    const dataToSign = new TextEncoder().encode(`${header}.${payload}`);
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      dataToSign
    );

    const signatureArray = new Uint8Array(signature);
    const signatureString = String.fromCharCode(...signatureArray);
    return btoa(signatureString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch (error) {
    console.error('JWT signing failed:', error);
    throw new Error('JWT signing failed');
  }
}

/**
 * GitHub App JWT 토큰 생성
 */
export async function generateGitHubAppJWT(
  appId: string,
  privateKey: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header: JWTHeader = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload: JWTPayload = {
    iat: now - 10, // 10초 전 (시계 동기화 문제 방지)
    exp: now + 600, // 10분 후 만료
    iss: appId,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);

  try {
    const signature = await signJWT(encodedHeader, encodedPayload, privateKey);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  } catch (error) {
    console.error('GitHub App JWT generation failed:', error);
    throw new Error('Failed to generate GitHub App JWT token');
  }
}
