import type { AuthResponse } from '@zylos/shared-types';

interface AuthCookieData {
  token: string;
  user: any;
  tenant: any;
  expiresAt?: string | null;
  refreshToken?: string;
}

export function setAuthCookie(authResponse: AuthResponse): void {
  if (!authResponse.success || !authResponse.data) {
    return;
  }

  const authData: AuthCookieData = {
    token: authResponse.data.auth?.token || '',
    refreshToken: authResponse.data.auth?.refreshToken || '',
    expiresAt: authResponse.data.auth?.expiresAt || null,
    user: authResponse.data.user,
    tenant: authResponse.data.tenant
  };

  const cookieValue = Buffer.from(JSON.stringify(authData)).toString('base64');
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  // Cookie HttpOnly (para seguridad - no accesible por JS)
  const httpOnlyCookie = `zylos_auth_secure=${cookieValue}; Max-Age=86400; Path=/; HttpOnly; ${isSecure ? 'Secure; ' : ''}SameSite=Strict`;
  
  // Cookie normal (para acceso por JS)
  const clientCookie = `zylos_auth=${cookieValue}; Max-Age=86400; Path=/; ${isSecure ? 'Secure; ' : ''}SameSite=Strict`;

  // En cliente, establecer cookies via document.cookie
  if (typeof window !== 'undefined') {
    document.cookie = clientCookie;
    // Nota: HttpOnly cookies no se pueden establecer desde cliente
    // Esto lo hará el server response en el login
  }
}

export function getAuthCookie(): AuthCookieData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  const targetCookie = cookies.find(cookie => 
    cookie.trim().startsWith('zylos_auth=')
  );

  if (!targetCookie) {
    return null;
  }

  try {
    const cookieValue = targetCookie.split('=')[1];
    if (!cookieValue) return null;
    
    const decodedData = atob(cookieValue);
    const parsedData = JSON.parse(decodedData);
    
    // Verificar si el token ha expirado
    if (parsedData.expiresAt) {
      const expiryTime = new Date(parsedData.expiresAt).getTime();
      const currentTime = new Date().getTime();
      if (currentTime > expiryTime) {
        return null; // Token expirado
      }
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
    return null;
  }
}

export function clearAuthCookie(): void {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  if (typeof window !== 'undefined') {
    document.cookie = `zylos_auth=; Max-Age=0; Path=/; ${isSecure ? 'Secure; ' : ''}SameSite=Strict`;
    document.cookie = `zylos_auth_secure=; Max-Age=0; Path=/; ${isSecure ? 'Secure; ' : ''}SameSite=Strict`;
  }
}