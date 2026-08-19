
const { clientIp, isPrivateAddress } = require('../utils/clientIp');

describe('isPrivateAddress', () => {
  it('treats the cluster SNAT range as private', () => {
    // These are the exact addresses the audit log was filling up with.
    for (const ip of ['10.42.0.0', '10.42.2.0', '10.42.3.0', '10.42.5.0']) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
  });

  it('covers the other private / non-routable ranges', () => {
    const priv = [
      '127.0.0.1', '169.254.1.1', '192.168.1.10',
      '172.16.0.1', '172.31.255.254', '100.64.0.1',
      '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1',
    ];
    for (const ip of priv) expect(isPrivateAddress(ip), ip).toBe(true);
  });

  it('does not treat public addresses as private', () => {
    const pub = ['8.8.8.8', '1.1.1.1', '172.32.0.1', '172.15.0.1', '193.99.144.80', '2a00:1450::1'];
    for (const ip of pub) expect(isPrivateAddress(ip), ip).toBe(false);
  });

  it('treats a missing address as private', () => {
    expect(isPrivateAddress(undefined)).toBe(true);
    expect(isPrivateAddress('')).toBe(true);
  });
});

describe('clientIp', () => {
  it('returns null rather than storing a meaningless internal address', () => {
    expect(clientIp({ ip: '10.42.3.0' })).toBeNull();
    expect(clientIp({})).toBeNull();
  });

  it('returns a genuine external address once the proxy forwards one', () => {
    expect(clientIp({ ip: '193.99.144.80' })).toBe('193.99.144.80');
  });

  it('ignores a client-supplied X-Forwarded-For (req.ip is the trusted value)', () => {
    // A spoofed header must not win over what the trust-proxy chain resolved.
    const req = { ip: '10.42.3.0', headers: { 'x-forwarded-for': '8.8.8.8' } };
    expect(clientIp(req)).toBeNull();
  });
});
