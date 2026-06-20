export class WebAuthnProvider {
  async register(userId: string) {
    console.log(`[WebAuthn] Registering passkey for user ${userId}`);
    return { success: true };
  }
  
  async authenticate(credential: any) {
    console.log(`[WebAuthn] Authenticating passkey`);
    return { success: true, userId: '1' };
  }
}
