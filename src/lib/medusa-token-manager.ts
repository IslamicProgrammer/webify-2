// src/lib/medusa-token-manager.ts
import axios, { AxiosResponse } from 'axios';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL || 'admin@gmail.com';
const MEDUSA_ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || 'Anonim@@1';

class MedusaTokenManager {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    console.log('MedusaTokenManager initialized with URL:', MEDUSA_BACKEND_URL);
  }

  private async authenticate(): Promise<string> {
    try {
      console.log('🔐 DEBUG: Starting authentication...');
      console.log('🔐 DEBUG: URL:', MEDUSA_BACKEND_URL);
      console.log('🔐 DEBUG: Email available:', !!MEDUSA_ADMIN_EMAIL);
      console.log('🔐 DEBUG: Password available:', !!MEDUSA_ADMIN_PASSWORD);

      const authUrl = `${MEDUSA_BACKEND_URL}/auth/user/emailpass
`;

      console.log('🔐 DEBUG: Auth URL:', authUrl);

      const response = await axios.post(authUrl, {
        email: MEDUSA_ADMIN_EMAIL,
        password: MEDUSA_ADMIN_PASSWORD
      });

      console.log('🔐 DEBUG: Auth response status:', response.status);
      console.log('🔐 DEBUG: Auth response keys:', Object.keys(response.data || {}));

      const access_token = response.data.token || response.data.access_token;

      if (!access_token) {
        throw new Error('No access_token in response');
      }

      this.accessToken = access_token;
      this.tokenExpiry = Date.now() + 60 * 60 * 1000;

      console.log('✅ DEBUG: Authentication successful');
      console.log('🔐 DEBUG: Token preview:', access_token.substring(0, 20) + '...');

      return access_token;
    } catch (error: any) {
      console.error('❌ DEBUG: Authentication failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async makeAuthenticatedRequest<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', endpoint: string, data?: any, params?: any): Promise<T> {
    try {
      console.log(`📡 DEBUG: Starting ${method} request to ${endpoint}`);

      const token = await this.getValidToken();

      console.log(`📡 DEBUG: Token obtained, length: ${token.length}`);

      const fullUrl = `${MEDUSA_BACKEND_URL}${endpoint}`;

      console.log(`📡 DEBUG: Full URL: ${fullUrl}`);
      console.log(`📡 DEBUG: Params:`, params);

      const config = {
        method,
        url: fullUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        ...(data && { data }),
        ...(params && { params }),
        timeout: 30000
      };

      console.log(`📡 DEBUG: Request headers:`, config.headers);

      const response: AxiosResponse<T> = await axios(config);

      console.log(`✅ DEBUG: Request successful:`, {
        status: response.status,
        statusText: response.statusText,
        dataKeys: Object.keys(response.data || {}),
        dataSize: JSON.stringify(response.data).length
      });

      return response.data;
    } catch (error: any) {
      console.error(`❌ DEBUG: Request failed:`, {
        method,
        endpoint,
        fullUrl: `${MEDUSA_BACKEND_URL}${endpoint}`,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        requestHeaders: error.config?.headers
      });

      // If it's an auth error, try to re-authenticate once
      if (error.response?.status === 401 && this.accessToken) {
        console.log('🔄 DEBUG: 401 detected, attempting re-authentication...');
        this.accessToken = null;
        this.tokenExpiry = null;

        try {
          const newToken = await this.getValidToken();

          console.log('🔄 DEBUG: Re-authentication successful, retrying request...');

          const config = {
            method,
            url: `${MEDUSA_BACKEND_URL}${endpoint}`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`
            },
            ...(data && { data }),
            ...(params && { params }),
            timeout: 30000
          };

          const response: AxiosResponse<T> = await axios(config);

          console.log(`✅ DEBUG: Retry successful`);
          return response.data;
        } catch (retryError: any) {
          console.error('❌ DEBUG: Retry failed:', retryError.response?.data);
          throw retryError;
        }
      }

      throw error;
    }
  }

  private async getValidToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('🔄 Using cached Medusa token');
      return this.accessToken;
    }

    // If no valid token, authenticate
    console.log('🔄 Token expired or missing, authenticating...');
    return this.authenticate();
  }

  // async makeAuthenticatedRequest<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', endpoint: string, data?: any, params?: any): Promise<T> {
  //   try {
  //     const token = await this.getValidToken();

  //     const config = {
  //       method,
  //       url: `${MEDUSA_BACKEND_URL}${endpoint}`,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`
  //       },
  //       ...(data && { data }),
  //       ...(params && { params }),
  //       timeout: 30000 // 30 second timeout
  //     };

  //     console.log(`📡 Making ${method} request to ${endpoint}`, {
  //       params: params || 'none',
  //       hasData: !!data
  //     });

  //     const response: AxiosResponse<T> = await axios(config);

  //     console.log(`✅ Request successful: ${method} ${endpoint}`, {
  //       status: response.status,
  //       dataSize: JSON.stringify(response.data).length
  //     });

  //     return response.data;
  //   } catch (error: any) {
  //     // Log detailed error information
  //     console.error(`❌ Request failed: ${method} ${endpoint}`, {
  //       message: error.message,
  //       status: error.response?.status,
  //       statusText: error.response?.statusText,
  //       data: error.response?.data,
  //       code: error.code
  //     });

  //     // If it's an auth error, try to re-authenticate once
  //     if (error.response?.status === 401 && this.accessToken) {
  //       console.log('🔄 Auth error detected, clearing token and retrying...');
  //       this.accessToken = null;
  //       this.tokenExpiry = null;

  //       try {
  //         const token = await this.getValidToken();

  //         const config = {
  //           method,
  //           url: `${MEDUSA_BACKEND_URL}${endpoint}`,
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${token}`
  //           },
  //           ...(data && { data }),
  //           ...(params && { params }),
  //           timeout: 30000
  //         };

  //         console.log(`🔄 Retrying ${method} request to ${endpoint}`);
  //         const response: AxiosResponse<T> = await axios(config);

  //         console.log(`✅ Retry successful: ${method} ${endpoint}`);
  //         return response.data;
  //       } catch (retryError: any) {
  //         console.error('❌ Retry authentication failed:', {
  //           message: retryError.message,
  //           status: retryError.response?.status,
  //           data: retryError.response?.data
  //         });
  //         throw retryError;
  //       }
  //     }

  //     // Re-throw with more context
  //     const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
  //     const enhancedError = new Error(`Medusa API Error: ${errorMessage}`);

  //     (enhancedError as any).status = error.response?.status;
  //     (enhancedError as any).response = error.response;
  //     throw enhancedError;
  //   }
  // }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeAuthenticatedRequest('GET', '/admin/auth/session');
      return true;
    } catch (error) {
      console.error('Medusa health check failed:', error);
      return false;
    }
  }

  // Method to clear token (for testing or manual reset)
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
    console.log('🔄 Token cleared manually');
  }
}

export const medusaTokenManager = new MedusaTokenManager();
