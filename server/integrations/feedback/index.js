// Wires the screenshot-feedback router into this app.
// Uses Tier 1 (custom send fn) so feedback flows through the app's existing
// email service. Since that service has no attachment support, the annotated
// screenshot is inlined into the email HTML as a base64 <img> (same approach
// the plugin's reference RitJira integration uses).
const { createFeedbackRouter } = require('./createFeedbackRouter');
const logger = require('../../utils/logger');
const emailService = require('../../services/email/emailService');

function buildFeedbackRouter() {
  return createFeedbackRouter({
    subjectPrefix: '[Easy AI Feedback]',
    logger,
    // recipients resolved from FEEDBACK_RECIPIENTS env (see server/.env).
    mailer: {
      send: async ({ to, subject, html, text, attachments }) => {
        let finalHtml = html;
        const shot = attachments && attachments[0];
        if (shot) {
          const b64 = shot.content.toString('base64');
          finalHtml += `<div style="margin-top:18px">`
            + `<img alt="Annotated screenshot" src="data:${shot.contentType};base64,${b64}" `
            + `style="max-width:100%;border:1px solid #e2e8f0;border-radius:8px" /></div>`;
        }
        for (const recipient of to) {
          await emailService.sendMail({ to: recipient, subject, html: finalHtml, text });
        }
      },
    },
  });
}

module.exports = { buildFeedbackRouter };
