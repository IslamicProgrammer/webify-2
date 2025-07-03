// import medusa from '@/lib/medusa-client';

// interface AuthTokens {
//   accessToken: string;
//   refreshToken: string;
// }

// class MedusaAuthService {
//   private static instance: MedusaAuthService;
//   private tokens: AuthTokens | null = null;

//   private constructor() {}

//   static getInstance(): MedusaAuthService {
//     if (!MedusaAuthService.instance) {
//       MedusaAuthService.instance = new MedusaAuthService();
//     }
//     return MedusaAuthService.instance;
//   }

//   async login(email: string, password: string): Promise<AuthTokens> {
//     try {
//       const response = await medusa.auth.login('user', 'emailpass', {
//         email,
//         password
//       });

//       this.tokens = {
//         accessToken: response.token,
//         refreshToken: response.refresh_token || ''
//       };

//       // Store tokens in localStorage for persistence
//       if (typeof window !== 'undefined') {
//         localStorage.setItem('medusa_tokens', JSON.stringify(this.tokens));
//       }

//       return this.tokens;
//     } catch (error) {
//       console.error('Medusa login failed:', error);
//       throw new Error('Failed to authenticate with Medusa backend');
//     }
//   }

//   async refreshAccessToken(): Promise<string> {
//     if (!this.tokens?.refreshToken) {
//       throw new Error('No refresh token available');
//     }

//     try {
//       const response = await medusa.admin.auth.refresh({
//         refresh_token: this.tokens.refreshToken
//       });

//       this.tokens.accessToken = response.token;

//       if (typeof window !== 'undefined') {
//         localStorage.setItem('medusa_tokens', JSON.stringify(this.tokens));
//       }

//       return this.tokens.accessToken;
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       this.logout();
//       throw new Error('Failed to refresh token');
//     }
//   }

//   getAccessToken(): string | null {
//     if (!this.tokens && typeof window !== 'undefined') {
//       const stored = localStorage.getItem('medusa_tokens');

//       if (stored) {
//         this.tokens = JSON.parse(stored);
//       }
//     }
//     return this.tokens?.accessToken || null;
//   }

//   logout(): void {
//     this.tokens = null;
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('medusa_tokens');
//     }
//   }

//   isAuthenticated(): boolean {
//     return !!this.getAccessToken();
//   }
// }

// export default MedusaAuthService;
