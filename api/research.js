export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const { sector } = req.body;
  if (!sector) return res.status(400).json({ error: 'No sector provided' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,   // ← stored in Vercel env vars
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: `[PASTE THE FULL SYSTEM_PROMPT FROM analyst-research.html HERE]`,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Conduct a full deep-dive research analysis on: "${sector}". Search extensively — market reports, news, Crunchbase, company profiles, recent funding. Be specific with real numbers, real companies, real events.`
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
