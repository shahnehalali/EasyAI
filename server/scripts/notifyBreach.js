/* AVV Section 11.2 / Art. 33-34 GDPR: on a real personal data breach
   affecting a specific organisation, every Owner-role user of that
   organisation must be notified without undue delay, with the nature of
   the breach, its likely consequences, and the measures taken. This is a
   real incident-response action, run by hand for a real, specific
   incident, never triggered automatically.

   Usage:
     node scripts/notifyBreach.js --org=<organizationId> --details=./breach.json [--dry-run]

   breach.json shape:
     {
       "nature": "What happened, in plain terms",
       "consequences": "The likely consequences for affected people",
       "measures": "What has been done or is proposed to address it"
     }
*/
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/email/emailService');
const { encryptField } = require('../services/crypto/fieldCrypto');

const p = new PrismaClient();

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    args[key] = rest.length ? rest.join('=') : true;
  }
  return args;
}

const REQUIRED_FIELDS = ['nature', 'consequences', 'measures'];

(async () => {
  const args = parseArgs();
  if (!args.org || !args.details) {
    console.error('Usage: node scripts/notifyBreach.js --org=<organizationId> --details=./breach.json [--dry-run]');
    process.exitCode = 1;
    return;
  }

  const org = await p.organization.findUnique({ where: { id: args.org } });
  if (!org) {
    console.error(`No organization found with id ${args.org}`);
    process.exitCode = 1;
    return;
  }

  const details = JSON.parse(fs.readFileSync(args.details, 'utf8'));
  const missing = REQUIRED_FIELDS.filter((f) => !details[f]);
  if (missing.length) {
    console.error(`Missing required field(s) in ${args.details}: ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const recipients = await p.user.findMany({
    where: { organizationId: org.id, role: 'owner' },
    select: { id: true, email: true, fullName: true },
  });

  console.log(`Breach notification for "${org.name}" (${org.id}). ${recipients.length} owner(s) will be notified.`);

  if (args['dry-run']) {
    console.log('--dry-run set, not sending. Recipients:');
    recipients.forEach((r) => console.log(`  ${r.email}`));
    await p.$disconnect();
    return;
  }

  let sent = 0;
  for (const user of recipients) {
    try {
      await emailService.sendBreachNotificationEmail(user, org, details);
      const bodyText = `Nature: ${details.nature} Likely consequences: ${details.consequences} Measures: ${details.measures}`;
      await p.notification.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          type: 'breach_notice',
          title: 'Data breach notification',
          body: await encryptField(org.id, bodyText),
          emailSentAt: new Date(),
        },
      });
      sent += 1;
    } catch (err) {
      console.error(`  failed for ${user.email}: ${err.message}`);
    }
  }
  console.log(`Notified ${sent} of ${recipients.length} owner(s).`);
  await p.$disconnect();
})();
