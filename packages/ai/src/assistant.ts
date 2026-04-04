export class AIAssistant {
  async chat(message: string) {
    console.log(`[AI Assistant] Received message: ${message}`);
    return "How can I help you with your content today?";
  }
}
