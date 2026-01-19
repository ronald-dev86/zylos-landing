// Helper para manejo de dominios configurable

// Para producción: usar dominio real
// Para desarrollo: usar localhost
const getDomainConfig = () => {
  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
  const isProduction = platformUrl.includes('.com');
  
  return {
    platformUrl,
    isProduction,
    domain: isProduction ? 'zylos.com' : 'localhost:3000',
    protocol: platformUrl.startsWith('https') ? 'https' : 'http'
  };
};

// Construir URL para subdominios
export const buildTenantUrl = (subdomain: string, path: string = ''): string => {
  const config = getDomainConfig();
  
  if (config.isProduction) {
    return `${config.protocol}://${subdomain}.${config.domain}${path}`;
  } else {
    return `${config.protocol}://localhost:3000${path}`;
  }
};

// Obtener URL base
export const getPlatformUrl = (): string => {
  return getDomainConfig().platformUrl;
};

// Obtener dominio base para UI display
export const getBaseDomain = (): string => {
  return getDomainConfig().domain;
};

// Para debugging
export const debugDomainConfig = () => {
  const config = getDomainConfig();
  console.log('🔍 Domain Config:', {
    platformUrl: config.platformUrl,
    isProduction: config.isProduction,
    domain: config.domain,
    protocol: config.protocol
  });
  return config;
};