// src/lib/medusa-token-manager.ts
import axios, { AxiosResponse } from 'axios';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
const MEDUSA_ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const MEDUSA_ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

class MedusaTokenManager {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    console.log('MedusaTokenManager initialized with URL:', MEDUSA_BACKEND_URL);
  }

  private async authenticate(): Promise<string> {
    try {
      console.log('🔐 Authenticating with Medusa...');

      const response = await axios.post(`${MEDUSA_BACKEND_URL}/admin/auth/token`, {
        email: MEDUSA_ADMIN_EMAIL,
        password: MEDUSA_ADMIN_PASSWORD
      });

      const { access_token } = response.data;

      this.accessToken = access_token;
      // Set expiry to 1 hour from now (adjust based on your token settings)
      this.tokenExpiry = Date.now() + 60 * 60 * 1000;

      console.log('✅ Authentication successful, token expires in 1 hour');
      return access_token;
    } catch (error: any) {
      console.error('❌ Failed to authenticate with Medusa:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(`Authentication failed: ${error.message}`);
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

  async makeAuthenticatedRequest<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', endpoint: string, data?: any, params?: any): Promise<T> {
    try {
      const token = await this.getValidToken();

      const config = {
        method,
        url: `${MEDUSA_BACKEND_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        ...(data && { data }),
        ...(params && { params }),
        timeout: 30000 // 30 second timeout
      };

      console.log(`📡 Making ${method} request to ${endpoint}`, {
        params: params || 'none',
        hasData: !!data
      });

      const response: AxiosResponse<T> = await axios(config);

      console.log(`✅ Request successful: ${method} ${endpoint}`, {
        status: response.status,
        dataSize: JSON.stringify(response.data).length
      });

      return response.data;
    } catch (error: any) {
      // Log detailed error information
      console.error(`❌ Request failed: ${method} ${endpoint}`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });

      // If it's an auth error, try to re-authenticate once
      if (error.response?.status === 401 && this.accessToken) {
        console.log('🔄 Auth error detected, clearing token and retrying...');
        this.accessToken = null;
        this.tokenExpiry = null;

        try {
          const token = await this.getValidToken();

          const config = {
            method,
            url: `${MEDUSA_BACKEND_URL}${endpoint}`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            ...(data && { data }),
            ...(params && { params }),
            timeout: 30000
          };

          console.log(`🔄 Retrying ${method} request to ${endpoint}`);
          const response: AxiosResponse<T> = await axios(config);

          console.log(`✅ Retry successful: ${method} ${endpoint}`);
          return response.data;
        } catch (retryError: any) {
          console.error('❌ Retry authentication failed:', {
            message: retryError.message,
            status: retryError.response?.status,
            data: retryError.response?.data
          });
          throw retryError;
        }
      }

      // Re-throw with more context
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      const enhancedError = new Error(`Medusa API Error: ${errorMessage}`);

      (enhancedError as any).status = error.response?.status;
      (enhancedError as any).response = error.response;
      throw enhancedError;
    }
  }

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
