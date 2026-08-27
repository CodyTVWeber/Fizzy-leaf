const PREFIX = '[fizzy]';

export function logInfo(scope, message, extra) {
  // Diagnostic traces for MiniOxygen / Oxygen logs (info is not in the eslint allowlist).
  /* eslint-disable no-console */
  if (extra === undefined) console.log(PREFIX, scope, message);
  else console.log(PREFIX, scope, message, extra);
  /* eslint-enable no-console */
}

export function logWarn(scope, message, extra) {
  if (extra === undefined) console.warn(PREFIX, scope, message);
  else console.warn(PREFIX, scope, message, extra);
}

export function logError(scope, message, extra) {
  if (extra === undefined) console.error(PREFIX, scope, message);
  else console.error(PREFIX, scope, message, extra);
}

export function maskSecret(value) {
  if (!value) return '(missing)';
  const text = String(value);
  if (text.length <= 8) return `(set, len ${text.length})`;
  return `${text.slice(0, 4)}…${text.slice(-4)} (len ${text.length})`;
}
