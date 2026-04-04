export const logEvent = (eventName: string, properties: any) => {
  console.log(`[Analytics] Logged event: ${eventName}`, properties);
};
