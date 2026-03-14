"use server";

export async function sendNotification(to: string, subject: string, message: string) {
  // In a real application, you would use Resend, SendGrid, or Slack Webhook here.
  console.log(`[NOTIFICATION SERVICE] To: ${to} | Subject: ${subject} | Message: ${message}`);
  
  // Example for Resend (hypothetical):
  // await resend.emails.send({ from: 'UBMK <no-reply@ubmk.edu>', to, subject, html: message });
  
  return { sent: true };
}
