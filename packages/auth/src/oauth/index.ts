export class OAuthProvider {
  constructor(private provider: 'google' | 'github') {}
  
  async getAuthUrl() {
    return `https://${this.provider}.com/oauth/authorize`;
  }
  
  async verifyCallback(code: string) {
    console.log(`[OAuth] Verifying ${this.provider} callback with code ${code}`);
    return { success: true, userId: '1' };
  }
}
