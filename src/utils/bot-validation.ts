export function validateBotToken(token: string): boolean {
  const botTokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;

  return botTokenRegex.test(token);
}

export function extractBotIdFromToken(token: string): string | null {
  const match = token.match(/^(\d+):/);

  return match ? match[1] : null;
}

export function sanitizeBotName(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9\s-_]/g, '');
}
