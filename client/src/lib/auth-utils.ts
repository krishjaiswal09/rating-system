export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*/.test(error.message);
}

export function isForbiddenError(error: Error): boolean {
  return /^403: .*/.test(error.message);
}
