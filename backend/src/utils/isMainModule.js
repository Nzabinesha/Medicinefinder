/**
 * Reliable "run as main script" check for ESM on Windows/macOS/Linux.
 * Avoids import.meta.url === `file://${process.argv[1]}` (breaks on Windows paths / encoding).
 */
import { fileURLToPath } from 'url';
import path from 'path';

export function isMainModule(importMetaUrl) {
  const scriptPath = path.resolve(fileURLToPath(importMetaUrl));
  const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return Boolean(invoked && scriptPath === invoked);
}
