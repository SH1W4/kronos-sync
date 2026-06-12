import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

/**
 * Shares a Google Calendar with a user by granting them 'writer' (editor) access.
 * Uses the calendar.acl.insert method.
 */
export async function shareCalendarWithUser(calendarId: string, userEmail: string) {
  if (!calendarId || !userEmail) {
    console.warn('⚠️ google-admin: shareCalendarWithUser called with missing calendarId or userEmail.');
    return { success: false, error: 'Calendar ID or User Email is missing' };
  }

  try {
    console.log(`[google-admin] Sharing calendar ${calendarId} with ${userEmail}...`);
    const response = await calendar.acl.insert({
      calendarId,
      requestBody: {
        role: 'writer',
        scope: {
          type: 'user',
          value: userEmail,
        },
      },
    });

    console.log(`✅ [google-admin] Calendar shared successfully. Rule ID: ${response.data.id}`);
    return { success: true, ruleId: response.data.id };
  } catch (error: any) {
    console.error(`❌ [google-admin] Error sharing calendar ${calendarId} with ${userEmail}:`, error);
    return { success: false, error: error.message || error };
  }
}

/**
 * Revokes access to a shared Google Calendar for a specific user.
 * Lists the ACL rules, finds the one matching the userEmail, and deletes it.
 */
export async function removeCalendarShare(calendarId: string, userEmail: string) {
  if (!calendarId || !userEmail) {
    console.warn('⚠️ google-admin: removeCalendarShare called with missing calendarId or userEmail.');
    return { success: false, error: 'Calendar ID or User Email is missing' };
  }

  try {
    console.log(`[google-admin] Revoking calendar ${calendarId} share access for ${userEmail}...`);
    const aclList = await calendar.acl.list({ calendarId });
    const rules = aclList.data.items || [];
    
    // Find matching rule
    const rule = rules.find((item) => item.scope?.value === userEmail);
    if (!rule || !rule.id) {
      console.log(`ℹ️ [google-admin] No sharing rule found for ${userEmail} on calendar ${calendarId}.`);
      return { success: true, message: 'No sharing rule found' };
    }

    await calendar.acl.delete({
      calendarId,
      ruleId: rule.id,
    });

    console.log(`✅ [google-admin] Revoked access for ${userEmail} successfully.`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ [google-admin] Error revoking calendar access for ${userEmail}:`, error);
    return { success: false, error: error.message || error };
  }
}
