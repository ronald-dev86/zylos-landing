// Helper functions para manejo de URLs de subdominios

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';

export function buildTenantUrl(subdomain: string, path: string = ''): string {
  const baseUrl = PLATFORM_URL.replace(/https?:\/\//, '');
  const [host, port] = baseUrl.split(':');
  
  // Para desarrollo local
  if (host === 'localhost') {
    return `http://${subdomain}.localhost:${port || 3000}${path}`;
  }
  
  // Para producción
  const protocol = PLATFORM_URL.startsWith('https') ? 'https' : 'http';
  return `${protocol}://${subdomain}.${host}${port ? `:${port}` : ''}${path}`;
}

export function getPlatformBaseUrl(): string {
  return PLATFORM_URL;
}