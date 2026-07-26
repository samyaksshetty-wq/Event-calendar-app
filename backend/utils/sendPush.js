// Sends one push notification to every device registered in push_tokens.
// Used by anything that needs to notify everyone immediately (e.g. a new
// event being added), separate from the scheduled daily digest in push.js.
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

  const expoResults = [];
  for (const chunk of chunks) {
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(chunk),
    });
    expoResults.push(await expoRes.json());
  }

  return { sent: true, deviceCount: tokens.length, expoResults };
}

module.exports = { sendPushToAllDevices };
