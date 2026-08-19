// Trustworthy client IP, or null.
//
// An IP address is personal data (GDPR Recital 30), so we only store one when
// it is actually the subject's address. Behind this cluster's Traefik the
// service runs with externalTrafficPolicy: Cluster, which SNATs the source
// address at the node — so req.ip resolves to an internal 10.42.x.x address and
// X-Forwarded-For carries the same. Recording that was worse than useless: it
// looked like an audit trail, identified nobody, and still stored an address.
//
// Rather than store a fake, we store null until the address is genuinely
// external. To make real client IPs available, the cluster's Traefik Service
// needs externalTrafficPolicy: Local (or PROXY protocol at the load balancer);
// this helper then starts returning them with no code change.

// RFC1918 / loopback / link-local / CGNAT / IPv6 ULA + loopback.
const PRIVATE_V4 = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // 100.64.0.0/10 carrier-grade NAT
];

function isPrivateAddress(ip) {
  if (!ip) return true;
  let addr = String(ip).trim();
  // Express may hand back an IPv4-mapped IPv6 address (::ffff:10.0.0.1).
  if (addr.startsWith('::ffff:')) addr = addr.slice(7);
  if (addr === '::1' || addr === '::') return true;
  const lower = addr.toLowerCase();
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // IPv6 ULA
  if (lower.startsWith('fe80')) return true; // IPv6 link-local
  return PRIVATE_V4.some((re) => re.test(addr));
}

// `req.ip` already reflects the `trust proxy` setting, so we do not re-parse
// X-Forwarded-For ourselves — doing so would accept a client-supplied header.
function clientIp(req) {
  const ip = req?.ip;
  return isPrivateAddress(ip) ? null : ip;
}

module.exports = { clientIp, isPrivateAddress };
