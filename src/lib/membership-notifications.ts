// Utility functions for membership notifications
// Note: This requires an email service like SendGrid, Resend, or similar
import { getAppwriteAdminHeaders, getAppwriteUrl } from '@/lib/appwrite-env';

interface Membership {
  $id: string;
  appwriteUserId: string;
  plan: string;
  wineLimit: number;
  currentWineCount: number;
  expiresAt: string;
  isActive: boolean;
  resetYear: number;
}

// Check if membership expires within specified days
export function isExpiringWithinDays(membership: Membership, days: number): boolean {
  const expiresAt = new Date(membership.expiresAt);
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + days);
  
  return expiresAt <= warningDate && expiresAt > new Date();
}

// Get user details for notification
export async function getUserDetails(appwriteUserId: string) {
  try {
    const response = await fetch(getAppwriteUrl(`/users/${appwriteUserId}`), {
      headers: getAppwriteAdminHeaders()
    });
    
    if (response.ok) {
      const userData = await response.json();
      return {
        email: userData.email,
        name: userData.prefs?.displayName || userData.name || 'Uživatel'
      };
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
  
  return null;
}

// Send expiration warning email (placeholder - implement with your email service)
export async function sendExpirationWarning(membership: Membership, daysUntilExpiry: number) {
  try {
    const userDetails = await getUserDetails(membership.appwriteUserId);
    if (!userDetails) return false;
    
    console.log(`Would send expiration warning to ${userDetails.email}:`);
    console.log(`- Name: ${userDetails.name}`);
    console.log(`- Plan: ${membership.plan}`);
    console.log(`- Expires in: ${daysUntilExpiry} days`);
    console.log(`- Expires at: ${new Date(membership.expiresAt).toLocaleDateString('cs-CZ')}`);
    
    // TODO: Implement actual email sending
    // Example with SendGrid, Resend, or similar:
    /*
    const emailData = {
      to: userDetails.email,
      subject: `Vaše členství etiketa.wine vyprší za ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'den' : 'dny'}`,
      html: generateExpirationWarningEmail(userDetails.name, membership, daysUntilExpiry)
    };
    
    const emailResponse = await sendEmail(emailData);
    return emailResponse.success;
    */
    
    return true;
  } catch (error) {
    console.error('Error sending expiration warning:', error);
    return false;
  }
}

// Send expiration notification email (placeholder)
export async function sendExpirationNotification(membership: Membership) {
  try {
    const userDetails = await getUserDetails(membership.appwriteUserId);
    if (!userDetails) return false;
    
    console.log(`Would send expiration notification to ${userDetails.email}:`);
    console.log(`- Name: ${userDetails.name}`);
    console.log(`- Plan: ${membership.plan}`);
    console.log(`- Expired at: ${new Date(membership.expiresAt).toLocaleDateString('cs-CZ')}`);
    
    // TODO: Implement actual email sending
    
    return true;
  } catch (error) {
    console.error('Error sending expiration notification:', error);
    return false;
  }
}

// Generate HTML email template for expiration warning
function generateExpirationWarningEmail(userName: string, membership: Membership, daysUntilExpiry: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Připomínka prodloužení členství</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">etiketa.wine</h1>
        
        <h2>Připomínka prodloužení členství</h2>
        
        <p>Dobrý den ${userName},</p>
        
        <p>Upozorňujeme Vás, že Vaše členství v tarifním plánu <strong>${membership.plan}</strong> vyprší za <strong>${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'den' : 'dny'}</strong>.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">Detaily členství:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Tarif:</strong> ${membership.plan}</li>
            <li><strong>Datum vypršení:</strong> ${new Date(membership.expiresAt).toLocaleDateString('cs-CZ')}</li>
            <li><strong>Využité vína:</strong> ${membership.currentWineCount}/${membership.wineLimit === -1 ? '∞' : membership.wineLimit}</li>
          </ul>
        </div>
        
        <p>Pro prodloužení členství nebo změnu tarifu nás prosím kontaktujte na <a href="mailto:info@etiketa.wine">info@etiketa.wine</a>.</p>
        
        <p>Děkujeme za využívání našich služeb!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6b7280;">
          Tento email byl automaticky vygenerován systémem etiketa.wine.
        </p>
      </div>
    </body>
    </html>
  `;
}

// Generate HTML email template for expiration notification
function generateExpirationNotificationEmail(userName: string, membership: Membership): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Členství bylo ukončeno</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">etiketa.wine</h1>
        
        <h2>Členství bylo ukončeno</h2>
        
        <p>Dobrý den ${userName},</p>
        
        <p>Informujeme Vás, že Vaše členství v tarifním plánu <strong>${membership.plan}</strong> bylo ukončeno dne ${new Date(membership.expiresAt).toLocaleDateString('cs-CZ')}.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Vaše data zůstávají zachována</strong> a budou k dispozici po obnovení členství.</p>
        </div>
        
        <p>Pro obnovení členství nebo dotazy nás prosím kontaktujte na <a href="mailto:info@etiketa.wine">info@etiketa.wine</a>.</p>
        
        <p>Děkujeme za využívání našich služeb a těšíme se na spolupráci v budoucnu!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #6b7280;">
          Tento email byl automaticky vygenerován systémem etiketa.wine.
        </p>
      </div>
    </body>
    </html>
  `;
}
