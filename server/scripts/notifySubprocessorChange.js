/* AVV Section 15.3: before adding or replacing a sub-processor, every
   Owner-role user across every organisation must be notified in advance, by
   email, naming the firm, address, task and transfer basis, so they can
   exercise their Section 15.4 right to object within 28 days. This is a
   real, deliberate legal notice about a real business change, so it is run
   by hand by an operator when a change actually happens, not triggered
   automatically by product code.

   Usage:
     node scripts/notifySubprocessorChange.js --details=./change.json [--dry-run]

   change.json shape:
     {
       "action": "adding" | "replacing",
       "name": "Example Corp GmbH",
       "address": "Musterstrasse 1, 10115 Berlin, Germany",
       "task": "Description of what this processor will do",
       "location": "Germany",
       "transferBasis": "n/a" | "Standard Contractual Clauses 2021/914 Module 3, ...",
       "effectiveDate": "2026-10-15"
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

const REQUIRED_FIELDS = ['action', 'name', 'address', 'task', 'location', 'effectiveDate'];

(async () => {
  const args = parseArgs();
  if (!args.details) {
    console.error('Usage: node scripts/notifySubprocessorChange.js --details=./change.json [--dry-run]');
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
    where: { role: 'owner' },
    select: { id: true, email: true, fullName: true, organizationId: true },
  });

  console.log(`Sub-processor change notice: ${details.action} "${details.name}", effective ${details.effectiveDate}.`);
  console.log(`${recipients.length} organisation owner(s) will be notified.`);

  if (args['dry-run']) {
    console.log('--dry-run set, not sending. Recipients:');
    recipients.forEach((r) => console.log(`  ${r.email} (org ${r.organizationId})`));
    await p.$disconnect();
    return;
  }

  let sent = 0;
  for (const user of recipients) {
    try {
      await emailService.sendSubprocessorChangeEmail(user, details);
      const bodyText = `${details.action === 'adding' ? 'Adding' : 'Replacing with'} ${details.name}, effective ${details.effectiveDate}. See the email sent to you for full details and your right to object.`;
      await p.notification.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          type: 'subprocessor_change',
          title: 'Upcoming sub-processor change',
          body: await encryptField(user.organizationId, bodyText),
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
