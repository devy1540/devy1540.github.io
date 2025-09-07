/**
 * JWT 토큰 생성을 위한 유틸리티
 * GitHub App 인증에 사용됩니다.
 */

import { SignJWT, importPKCS8 } from 'jose';

/**
 * GitHub App JWT 토큰 생성
 */
export async function generateGitHubAppJWT(
  appId: string,
  privateKey: string
): Promise<string> {
  try {
    // 환경변수에서 \n을 실제 개행으로 변환
    const normalizedPrivateKey = privateKey.replace(/\\n/g, '\n');

    console.log('Using App ID:', appId);
    console.log(
      'Private key preview:',
      normalizedPrivateKey.substring(0, 50) + '...'
    );

    // PKCS#1을 PKCS#8로 변환
    const pkcs8Key = await convertPkcs1ToPkcs8(normalizedPrivateKey);

    // 개인키 import
    const privateKeyObject = await importPKCS8(pkcs8Key, 'RS256');

    const now = Math.floor(Date.now() / 1000);

    // JWT 생성
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(now - 10) // 10초 전 (시계 동기화 문제 방지)
      .setExpirationTime(now + 600) // 10분 후 만료
      .setIssuer(appId)
      .sign(privateKeyObject);

    console.log('JWT generated successfully');
    return jwt;
  } catch (error) {
    console.error('GitHub App JWT generation failed:', error);
    throw new Error(`Failed to generate GitHub App JWT token: ${error}`);
  }
}

/**
 * PKCS#1을 PKCS#8로 변환
 */
async function convertPkcs1ToPkcs8(pkcs1Pem: string): Promise<string> {
  try {
    console.log('Converting PKCS#1 to PKCS#8...');

    // 이미 PKCS#8인 경우 그대로 반환
    if (pkcs1Pem.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log('Key is already PKCS#8 format');
      return pkcs1Pem;
    }

    // PKCS#1 base64 데이터 추출
    const base64Data = pkcs1Pem
      .replace('-----BEGIN RSA PRIVATE KEY-----', '')
      .replace('-----END RSA PRIVATE KEY-----', '')
      .replace(/\s+/g, '');

    console.log('Extracted base64 length:', base64Data.length);

    // DER 데이터로 변환
    const derData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // PKCS#8 래퍼 생성 (간단한 ASN.1 구조)
    const pkcs8Wrapper = new Uint8Array([
      0x30,
      0x82, // SEQUENCE
      (derData.length + 22) >> 8,
      (derData.length + 22) & 0xff, // length
      0x02,
      0x01,
      0x00, // version
      0x30,
      0x0d, // AlgorithmIdentifier SEQUENCE
      0x06,
      0x09, // OID
      0x2a,
      0x86,
      0x48,
      0x86,
      0xf7,
      0x0d,
      0x01,
      0x01,
      0x01, // RSA OID
      0x05,
      0x00, // NULL
      0x04,
      0x82, // OCTET STRING
      derData.length >> 8,
      derData.length & 0xff, // length
      ...derData,
    ]);

    // Base64로 인코딩
    const pkcs8Base64 = btoa(String.fromCharCode(...pkcs8Wrapper));

    // PEM 형식으로 포맷
    const lines = pkcs8Base64.match(/.{1,64}/g) || [];
    const pkcs8Pem = [
      '-----BEGIN PRIVATE KEY-----',
      ...lines,
      '-----END PRIVATE KEY-----',
    ].join('\n');

    console.log('Successfully converted to PKCS#8');
    return pkcs8Pem;
  } catch (error) {
    console.error('PKCS#1 to PKCS#8 conversion failed:', error);

    // 폴백: 단순 헤더 교체
    console.log('Trying simple header replacement...');
    return pkcs1Pem
      .replace('-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----')
      .replace('-----END RSA PRIVATE KEY-----', '-----END PRIVATE KEY-----');
  }
}
