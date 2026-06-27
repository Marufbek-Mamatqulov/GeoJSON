export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `Siz O'zbekiston geografiyasi bo'yicha mutaxassis va o'quv yordamchisiz.
GeoO'yin veb-ilovasi orqali foydalanuvchilarga O'zbekiston haqida ma'lumot berasiz.

Bilimlar:
- O'zbekiston 14 ta viloyat va Qoraqalpog'iston Respublikasidan iborat
- Viloyatlar: Toshkent sh., Toshkent vil., Samarqand, Farg'ona, Namangan, Andijon, Qashqadaryo, Surxondaryo, Buxoro, Navoiy, Xorazm, Jizzax, Sirdaryo, Qoraqalpog'iston
- Maydoni: 448 978 km², Aholisi: ~36 million
- Poytaxt: Toshkent shahri
- Rasmiy til: O'zbek tili, Pul birligi: So'm
- Muhim shaharlar: Toshkent, Samarqand, Namangan, Andijon, Farg'ona, Buxoro, Qarshi, Urganch, Nukus, Termiz
- Tarixiy joylar: Samarqand (Registon, Shohizinda, Guri Mir), Buxoro (Ark qal'asi, Kalon minorasi), Xiva (Ichan Qal'a)
- Daryolar: Amudaryo, Sirdaryo, Zarafshon, Qashqadaryo, Surxondaryo
- Tog'lar: Tyan-Shan, Pomir-Oloy, Hisor, Zarafshon, Turkiston tog' tizimlari
- Iqtisodiyot: Paxta, gaz, oltin, mis, ximiya sanoati

Qisqa, aniq va foydali javoblar bering. Foydalanuvchi so'ragan tilda javob bering (o'zbek, rus yoki ingliz).`;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'Server not configured' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let messages: Array<{ role: string; content: string }>;
  try {
    const body = await request.json() as { messages: typeof messages };
    messages = body.messages;
    if (!Array.isArray(messages)) throw new Error('invalid');
  } catch {
    return new Response(
      JSON.stringify({ error: { message: 'Invalid request body' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
