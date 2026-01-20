// Utility functions para manejo seguro de cookies
const COOKIE_NAME = 'zylos_signup_success';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 horas

export interface SignupCookieData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
  redirectUrl: string;
}

// Guardar datos en cookie (servidor)
export function setSignupCookie(data: SignupCookieData): void {
  // Solo en contexto de servidor
  if (typeof window === 'undefined') {
    // Esto se manejará en el API route
    return;
  }
}

// Guardar datos en cookie (cliente)
export function setSignupCookieClient(data: SignupCookieData): void {
  const cookieValue = btoa(JSON.stringify(data));
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${COOKIE_NAME}=${cookieValue}; max-age=${COOKIE_MAX_AGE}; path=/; secure=${isSecure}; samesite=strict`;
}

// Obtener datos desde cookie (intentar ambas)
export function getSignupCookie(): SignupCookieData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  
  // Intentar cookie normal primero
  let targetCookie = cookies.find(cookie => cookie.trim().startsWith(`${COOKIE_NAME}=`));
  
  if (!targetCookie) {
    console.log('🔍 Cookie normal no encontrada, intentando secure...');
    // Fallback: intentar cookie segura (solo para debug)
    targetCookie = cookies.find(cookie => cookie.trim().startsWith('zylos_signup_secure='));
  }

  if (!targetCookie) {
    console.log('❌ Ninguna cookie de signup encontrada');
    return null;
  }

  try {
    const cookieValue = targetCookie.split('=')[1];
    if (!cookieValue) return null;
    
    const decodedData = atob(cookieValue);
    const parsedData = JSON.parse(decodedData);
    
    console.log('✅ Cookie parseada exitosamente');
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing signup cookie:', error);
    return null;
  }
}

// Limpiar cookie
export function clearSignupCookie(): void {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/;`;
}

// Configurar cookie desde servidor (Next.js)
export function createSignupCookieResponse(data: SignupCookieData) {
  const cookieValue = btoa(JSON.stringify(data));
  const isSecure = process.env.NODE_ENV === 'production';
  
  return `${COOKIE_NAME}=${cookieValue}; Max-Age=${COOKIE_MAX_AGE}; Path=/; HttpOnly; ${isSecure ? 'Secure; ' : ''}SameSite=Strict`;
}