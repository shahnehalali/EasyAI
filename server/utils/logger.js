// Centralized logger - every backend module imports from here. Never console.* directly.
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const current = levels[process.env.LOG_LEVEL] ?? levels.info;

const format = (level, args) => {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level.toUpperCase()}]`, ...args];
};

const emit = (level) => (...args) => {
  if (levels[level] > current) return;
  const target = level === 'error' ? console.error
    : level === 'warn' ? console.warn
      : console.log;
  target(...format(level, args));
};

module.exports = {
  error: emit('error'),
  warn: emit('warn'),
  info: emit('info'),
  debug: emit('debug'),
};
