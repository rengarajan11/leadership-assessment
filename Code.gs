/**
 * Google Apps Script mail endpoint for the Leadership Assessment.
 * Deploy as a Web app: Execute as Me, Who has access: Anyone.
 */
const ADMIN_EMAIL = 'rengarajan11@gmail.com';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Empty request body.');
    }

    const data = JSON.parse(e.postData.contents);
    if (!data.pdfBase64 || !data.imageBase64) {
      throw new Error('The request did not contain both attachments.');
    }

    const pdf = toAttachment(data.pdfBase64, 'application/pdf', data.pdfName || 'leadership-assessment.pdf');
    const image = toAttachment(data.imageBase64, 'image/png', data.imageName || 'leadership-profile.png');
    const html = data.htmlBody || '<p>Your leadership assessment results are attached.</p>';
    const subject = data.subject || 'Leadership assessment results';

    GmailApp.sendEmail(ADMIN_EMAIL, subject, stripHtml(html), {
      htmlBody: html,
      attachments: [pdf, image],
      name: 'Leadership Assessment'
    });

    return json({success: true, message: 'Email sent with image and PDF attachments.'});
  } catch (error) {
    console.error(error);
    return json({success: false, error: String(error)});
  }
}

function toAttachment(value, mimeType, fileName) {
  // Accept either raw base64 or a complete data URL.
  const base64 = String(value).replace(/^data:[^;]+;base64,/, '');
  return Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
}

function stripHtml(html) {
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
