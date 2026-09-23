const { guidance } = require('../lib/golf-grounding');
const instructions = `あなたは日本語のゴルフ規則相談アシスタントです。今日の日付に適用されるR&A/USGA/JGAの公式規則を検索して確認し、会話全体と写真を踏まえて答えてください。
最初に相談内容への具体的な結論、次に罰の有無・打数、次の行動、根拠規則を簡潔に示してください。一般論や関連規則の紹介だけで終えないでください。
「罰はない？」「必要な罰とは？」などは前の状況への追質問です。話題を変えず、回答済みの事実を再質問しないでください。
不明な事実を作らないこと。結論が変わる条件だけを最大2問で確認し、確認前にも条件別に分かる範囲を答える。
写真の観察と推測を区別する。境界や距離、ローカルルールは写真だけで断定しない。規則番号や引用を捏造しない。公式根拠を確認できない場合はその旨を明記し、確定裁定は委員会に確認する。
読みやすい短い日本語と改行を使い、表やHTMLは使わない。ゴルフ以外の依頼には対応しない。`;
function validate(body) {
  if (!body || !Array.isArray(body.messages) || !body.messages.length || body.messages.length > 39) throw Error('会話が長くなりました。「新しい相談」から始めてください。');
  let bytes = 0;
  const input = body.messages.map((m, i) => {
    if (!m || m.role !== (i % 2 ? 'assistant' : 'user') || typeof m.text !== 'string' || !m.text.trim() || m.text.length > 6000) throw Error('入力形式を確認してください。');
    bytes += Buffer.byteLength(m.text);
    if (m.role === 'assistant') return { role: 'assistant', content: m.text };
    const content = [{ type: 'input_text', text: m.text }];
    if (m.image) {
      if (typeof m.image !== 'string' || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(m.image)) throw Error('写真の形式を確認してください。');
      bytes += m.image.length;
      content.push({ type: 'input_image', image_url: m.image, detail: 'auto' });
    }
    return { role: 'user', content };
  });
  if (input.length % 2 !== 1 || bytes > 3000000) throw Error('写真または会話が大きすぎます。「新しい相談」から始めてください。');
  return input;
}
async function askOpenAI(input, withSearch = true) {
  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', store: false, max_output_tokens: 1800,
    instructions: instructions + guidance + '\n今日: ' + new Date().toISOString().slice(0, 10), input
  };
  if (withSearch) {
    payload.tools = [{ type: 'web_search', filters: { allowed_domains: ['randa.org', 'usga.org', 'jga.or.jp'] } }];
    payload.tool_choice = 'auto';
  }
  return fetch('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(50000), body: JSON.stringify(payload)
  });
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({ configured: Boolean(process.env.OPENAI_API_KEY) });
  if (req.method !== 'POST') return res.status(405).json({ error: 'この操作は利用できません。' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AIへの接続準備中です。' });
  let input;
  try { input = validate(typeof req.body === 'string' ? JSON.parse(req.body) : req.body); }
  catch (e) { return res.status(400).json({ error: e.message || '入力形式を確認してください。' }); }
  try {
    let upstream = await askOpenAI(input, true);
    if (!upstream.ok) {
      const raw = await upstream.text();
      console.error('OpenAI search request failed:', upstream.status, raw.slice(0, 1200));
      if (upstream.status !== 429 && upstream.status < 500) upstream = await askOpenAI(input, false);
      else return res.status(upstream.status === 429 ? 429 : 502).json({ error: upstream.status === 429 ? '現在AIを利用できる上限に達しています。時間をおいてお試しください。' : 'AIに接続できませんでした。しばらくしてから再送してください。' });
    }
    if (!upstream.ok) {
      const raw = await upstream.text(); console.error('OpenAI fallback failed:', upstream.status, raw.slice(0,1200));
      return res.status(502).json({ error: 'AIに接続できませんでした。しばらくしてから再送してください。' });
    }
    const data = await upstream.json();
    const parts = (data.output || []).filter(x => x.type === 'message').flatMap(x => x.content || []).filter(x => x.type === 'output_text');
    const text = parts.map(x => x.text).join('\n').trim();
    if (!text) { console.error('No output text:', JSON.stringify({ status:data.status, details:data.incomplete_details, types:(data.output||[]).map(x=>x.type) })); throw Error('empty response'); }
    const sources = parts.flatMap(x => x.annotations || []).filter(x => x.type === 'url_citation').map(x => ({ title: x.title, url: x.url }));
    return res.status(200).json({ text, sources });
  } catch (e) {
    console.error('golf-chat exception:', e?.name, e?.message);
    return res.status(502).json({ error: '回答を受け取れませんでした。入力を残していますので、もう一度送信してください。' });
  }
};
module.exports.validate = validate;
