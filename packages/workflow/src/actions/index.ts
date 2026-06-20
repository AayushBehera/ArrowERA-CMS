export const actions = {
  sendEmail: async (to: string, subject: string) => {
    console.log(`[Workflow Action] Sending email to ${to}`);
  }
};
