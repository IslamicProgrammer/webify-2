// src/lib/medusa-token-manager.ts
import axios, { AxiosInstance } from 'axios';

interface TokenData {
  token: string;
  expiresAt: number;
}

class MedusaTokenManager {
  private static instance: MedusaTokenManager;
  private tokenData: TokenData | null = null;
  private readonly baseURL: string;
  private readonly adminEmail: string;
  private readonly adminPassword: string;

  private constructor() {
    this.baseURL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
    this.adminEmail = process.env.MEDUSA_ADMIN_EMAIL || 'admin@example.com';
    this.adminPassword = process.env.MEDUSA_ADMIN_PASSWORD || 'supersecret';
  }

  static getInstance(): MedusaTokenManager {
    if (!MedusaTokenManager.instance) {
      MedusaTokenManager.instance = new MedusaTokenManager();
    }
    return MedusaTokenManager.instance;
  }

  private async login(): Promise<string> {
    try {
      console.log('🔐 Logging into Medusa...');

      const response = await axios.post(`${this.baseURL}/auth/user/emailpass`, {
        email: this.adminEmail,
        password: this.adminPassword
      });

      const token = response.data.token;

      // Cache token for 23 hours (assuming 24h expiry)
      this.tokenData = {
        token,
        expiresAt: Date.now() + 23 * 60 * 60 * 1000
      };

      console.log('✅ Medusa login successful');
      return token;
    } catch (error) {
      console.error('❌ Medusa login failed:', error);
      throw new Error('Failed to authenticate with Medusa');
    }
  }

  private isTokenValid(): boolean {
    return !!(this.tokenData && this.tokenData.token && Date.now() < this.tokenData.expiresAt);
  }

  async getValidToken(): Promise<string> {
    if (this.isTokenValid()) {
      console.log('🔄 Using cached Medusa token');
      return this.tokenData!.token;
    }

    console.log('🆕 Getting new Medusa token (expired or missing)');
    // Token expired or doesn't exist, get new one
    // eslint-disable-next-line @typescript-eslint/return-await
    return await this.login();
  }

  async getAuthenticatedAxiosInstance(): Promise<AxiosInstance> {
    const token = await this.getValidToken();

    return axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Helper method for making authenticated requests
  async makeAuthenticatedRequest<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any, params?: any): Promise<T> {
    const client = await this.getAuthenticatedAxiosInstance();

    const config: any = { params };

    switch (method) {
      case 'GET':
        return (await client.get(endpoint, config)).data;
      case 'POST':
        return (await client.post(endpoint, data, config)).data;
      case 'PUT':
        return (await client.put(endpoint, data, config)).data;
      case 'DELETE':
        return (await client.delete(endpoint, config)).data;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  // Clear token (useful for logout or error handling)
  clearToken(): void {
    this.tokenData = null;
  }
}

// Export singleton instance
export const medusaTokenManager = MedusaTokenManager.getInstance();
