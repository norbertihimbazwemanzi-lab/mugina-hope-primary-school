import { getAccessToken } from './authService';
import { SCHOOL_INFO } from '../data/schoolData';

export interface SendEmailPayload {
  to: string;
  subject: string;
  htmlBody: string;
  fromName?: string;
}

const encodeEmailBase64Url = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const sendGmailMessage = async (payload: SendEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const token = await getAccessToken();

  if (!token) {
    return {
      success: false,
      error: 'Gmail not connected. Please connect your Gmail account in the Admin Panel to send real emails.',
    };
  }

  try {
    const fromHeader = `${payload.fromName || SCHOOL_INFO.name} <me>`;
    const rawMessage = [
      `From: ${fromHeader}`,
      `To: ${payload.to}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      payload.htmlBody,
    ].join('\r\n');

    const encodedRaw = encodeEmailBase64Url(rawMessage);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedRaw }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `Gmail API HTTP ${response.status}`;
      return { success: false, error: errMsg };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown network error when sending email' };
  }
};

/**
 * Sends two emails when someone gets in touch:
 * 1. Admin Alert to the school admin (norbertihimbazwemanzi@gmail.com / school admin)
 * 2. Automated Feedback & Acknowledgement to the sender
 */
export const handleInquiryNotification = async (inquiry: {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  adminEmail: string;
}): Promise<{ adminNotified: boolean; senderNotified: boolean; error?: string }> => {
  let adminNotified = false;
  let senderNotified = false;
  let lastError: string | undefined;

  // 1. Notify School Admin
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
      <div style="background-color: #1e3a8a; padding: 16px; border-radius: 8px; color: white; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px;">Mugina Hope Primary & Nursery Academy</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #fde047;">New Website Contact Inquiry Received</p>
      </div>

      <p style="font-size: 15px; line-height: 1.5;">You received a new inquiry from the school website:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; width: 120px; border-bottom: 1px solid #f1f5f9;">Sender:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${inquiry.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Phone:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><a href="tel:${inquiry.phone}">${inquiry.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${inquiry.email || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Subject:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${inquiry.subject}</td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;">
        <strong style="display: block; margin-bottom: 6px; font-size: 13px; color: #475569;">Message:</strong>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        <p>Location: Next to Mugina Police Station, Kamonyi District, Southern Province, Rwanda.</p>
        <p>School Phone: ${SCHOOL_INFO.contact.phone}</p>
      </div>
    </div>
  `;

  const adminResult = await sendGmailMessage({
    to: inquiry.adminEmail,
    subject: `[Mugina Hope Academy] New Inquiry from ${inquiry.name}: ${inquiry.subject}`,
    htmlBody: adminHtml,
  });

  adminNotified = adminResult.success;
  if (!adminResult.success) {
    lastError = adminResult.error;
  }

  // 2. Automated Feedback to the Sender (if email provided)
  if (inquiry.email && inquiry.email.includes('@')) {
    const feedbackHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
        <div style="background-color: #1e3a8a; padding: 16px; border-radius: 8px; color: white; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">Mugina Hope Primary & Nursery Academy</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #fde047; font-style: italic;">&ldquo;We learn for our better future&rdquo;</p>
        </div>

        <h3 style="color: #0f172a; margin-top: 0;">Muraho, ${inquiry.name}!</h3>
        <p style="font-size: 14px; line-height: 1.6;">
          Thank you for getting in touch with Mugina Hope Primary & Nursery Academy. We have successfully received your inquiry regarding <strong>&ldquo;${inquiry.subject}&rdquo;</strong>.
        </p>
        <p style="font-size: 14px; line-height: 1.6;">
          Our administration office is reviewing your message and our team will get in touch with you shortly at <strong>${inquiry.phone}</strong>.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 14px;">Campus Information & Safety</h4>
          <p style="margin: 0; font-size: 13px; color: #15803d; line-height: 1.5;">
            Our academy is located in <strong>Mugina Sector, Kamonyi District</strong>, directly adjacent to the <strong>Mugina Police Station</strong>, ensuring a safe, secure, and serene learning environment for all nursery and primary pupils.
          </p>
        </div>

        <p style="font-size: 13px; color: #475569;">
          If you have urgent questions, you may also reach our Head of Admissions directly via phone or WhatsApp at <strong>${SCHOOL_INFO.contact.phone}</strong>.
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p style="margin: 0 0 4px 0; font-weight: bold;">Administration Office</p>
          <p style="margin: 0 0 4px 0;">Mugina Hope Primary & Nursery Academy</p>
          <p style="margin: 0;">Kamonyi, Southern Province, Rwanda · <a href="https://${SCHOOL_INFO.contact.website}" style="color: #2563eb;">${SCHOOL_INFO.contact.website}</a></p>
        </div>
      </div>
    `;

    const feedbackResult = await sendGmailMessage({
      to: inquiry.email,
      subject: `Thank you for contacting Mugina Hope Academy - We received your message`,
      htmlBody: feedbackHtml,
    });

    senderNotified = feedbackResult.success;
    if (!feedbackResult.success && !lastError) {
      lastError = feedbackResult.error;
    }
  }

  return { adminNotified, senderNotified, error: lastError };
};
