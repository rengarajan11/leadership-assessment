/**
 * Google Apps Script mail endpoint for the Leadership Assessment.
 *
 * Deploy as: Web app
 * Execute as: Me
 * Who has access: Anyone
 * Then put the deployment URL in index.html as MAIL_ENDPOINT.
 */
const ADMIN_EMAIL = 'rengarajan11@gmail.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (!data.pdfBase64 || !data.imageBase64) {
      return json({ success: false, error: 'Missing PDF or image attachment.' });
    }

    const pdf = Utilities.newBlob(
      Utilities.base64Decode(data.pdfBase64),
      'application/pdf',
      data.pdfName || 'leadership-assessment.pdf'
    );
    const image = Utilities.newBlob(
      Utilities.base64Decode(data.imageBase64),
      'image/png',
      data.imageName || 'leadership-profile.png'
    );

    GmailApp.sendEmail(
      ADMIN_EMAIL,
      data.subject || 'Leadership assessment results',
      'The leadership assessment results are attached as a PDF and image.',
      {
        htmlBody: data.htmlBody || '<p>Leadership assessment results are attached.</p>',
        attachments: [pdf, image],
        name: 'Leadership Assessment'
      }
    );

    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: String(error) });
  }
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
