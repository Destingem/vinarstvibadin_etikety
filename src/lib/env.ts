/**
 * Environment variable utility functions
 * 
 * Provides typed, secure access to environment variables with
 * clear error messages when required variables are missing.
 */

/**
 * Get an environment variable value
 * 
 * @param key The environment variable name
 * @param required Whether the variable is required (throws if missing)
 * @param defaultValue Default value if not required and missing
 * @returns The environment variable value or default
 */
export function getEnv(key: string, required = false, defaultValue = ''): string {
  const value = process.env[key] || defaultValue;
  
  if (required && !value) {
    throw new Error(`Environment variable ${key} is required but not set.`);
  }
  
  return value;
}

/**
 * Environment variables used in the application
 */
export const env = {
  // Analytics/IP
  IP_INFO_KEY: getEnv('IP_INFO_KEY', false),
  
  // Add other environment variables as needed, e.g.:
  // NODE_ENV: getEnv('NODE_ENV', false, 'development'),
  // DATABASE_URL: getEnv('DATABASE_URL', true),
  
  // Function to determine if running in development mode
  isDevelopment: () => process.env.NODE_ENV === 'development',
  
  // Function to determine if running in production mode
  isProduction: () => process.env.NODE_ENV === 'production'
};