const ADMIN_EMAIL = 'rengarajan11@gmail.com';

function doGet() {
  return json({
    success: true,
    message: 'Leadership Assessment mail endpoint is running.'
  });
}

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (!data || (!data.pdfBase64 && !data.imageBase64)) {
      return json({ success: false, error: 'Missing PDF or image payload.' });
    }

    const pdf = Utilities.newBlob(
      Utilities.base64Decode(data.pdfBase64 || ''),
      'application/pdf',
      data.pdfName || 'leadership-assessment.pdf'
    );

    const image = Utilities.newBlob(
      Utilities.base64Decode(data.imageBase64 || ''),
      'image/png',
      data.imageName || 'leadership-profile.png'
    );

    GmailApp.sendEmail(
      ADMIN_EMAIL,
      data.subject || 'Leadership assessment results',
      data.message || 'The leadership assessment results are attached as a PDF and image.',
      {
        htmlBody: data.htmlBody || '<p>Leadership assessment results are attached.</p>',
        attachments: [pdf, image],
        name: 'Leadership Assessment',
        replyTo: data.participantEmail || ADMIN_EMAIL
      }
    );

    return json({ success: true });
  } catch (error) {
    Logger.log('Leadership assessment mail error: ' + String(error));
    return json({ success: false, error: String(error) });
  }
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
