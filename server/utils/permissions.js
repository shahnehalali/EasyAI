// Single source of truth for role-based permissions.
// Roles (org): owner > admin > member. platform_admin authors the law catalog.
const MATRIX = {
  'compliance.view': ['member', 'admin', 'owner', 'platform_admin'],
  'compliance.edit': ['member', 'admin', 'owner'],
  'export': ['member', 'admin', 'owner'],
  'members.manage': ['admin', 'owner'],
  'org.manage': ['admin', 'owner'],
  'catalog.manage': ['platform_admin'],
};

const ACTIONS = Object.keys(MATRIX);

function can(role, action) {
  return (MATRIX[action] || []).includes(role);
}

// All actions a role can perform (used by the client to render/hide controls).
function permissionsFor(role) {
  return ACTIONS.filter((a) => can(role, a));
}

module.exports = { MATRIX, ACTIONS, can, permissionsFor };
