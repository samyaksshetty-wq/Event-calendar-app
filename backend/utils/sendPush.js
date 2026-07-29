// Sends one push notification to every device registered in push_tokens,
// and removes any token Expo reports as no longer valid (e.g. the app was
// uninstalled) so the table doesn't grow forever. Returns only small counts -
// never the full per-token Expo response, which callers don't need and which
// can grow past what some callers (e.g. an external cron trigger) will read.
async function sendPushToAllDevices(pool, { title, body, data }) {
  const { rows: tokens } = await pool.query('SELECT token FROM push_tokens');
  if (tokens.length === 0) {
    return { sent: false, reason: 'No registered devices' };
  }

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: 'default',
    title,
    body,
    data: data || {},
  }));

  // Expo's push API accepts up to 100 messages per request
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));

  const results = [];
  for (const chunk of chunks) {
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(chunk),
    });
    const { data: chunkResults } = await expoRes.json();
    results.push(...(chunkResults || []));
  }

  // Results come back in the same order as messages/tokens, so line them up
  // to find devices that are no longer valid and remove them.
  const deadTokens = tokens
    .filter((_, i) => results[i]?.details?.error === 'DeviceNotRegistered')
    .map((t) => t.token);

  if (deadTokens.length > 0) {
    await pool.query('DELETE FROM push_tokens WHERE token = ANY($1)', [deadTokens]);
  }

  return { sent: true, deviceCount: tokens.length, removedDeadTokens: deadTokens.length };
}

module.exports = { sendPushToAllDevices };
