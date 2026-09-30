// ——— AI helpers (Cloudflare Workers AI) ———
import { stripHtml } from './util.js';

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const FALLBACK_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

async function runJSON(env, system, user) {
  if (!env.AI) throw new Error('AI binding not available');
  let raw;
  const messages = [
    { role: 'system', content: system + ' Respond ONLY with valid JSON. No markdown fences, no commentary.' },
    { role: 'user', content: user },
  ];
  try {
    raw = await env.AI.run(MODEL, { messages, max_tokens: 1200 });
  } catch {
    raw = await env.AI.run(FALLBACK_MODEL, { messages, max_tokens: 1200 });
  }
  let text = typeof raw === 'string' ? raw
    : (raw?.response ?? raw?.result?.response ?? raw?.choices?.[0]?.message?.content ?? '');
  if (typeof text === 'object' && text !== null) return text; // model returned parsed JSON directly
  if (typeof text !== 'string') text = String(text ?? '');
  // strip accidental fences and grab first JSON object/array
  text = text.replace(/```(json)?/g, '').trim();
  const start = Math.min(...['{', '['].map(ch => { const i = text.indexOf(ch); return i === -1 ? Infinity : i; }));
  if (start !== Infinity) text = text.slice(start);
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (end !== -1) text = text.slice(0, end + 1);
  return JSON.parse(text);
}

// SEO suggestions for a draft post
export async function seoSuggestions(env, { title, body_html, category }) {
  const content = stripHtml(body_html).slice(0, 6000);
  const system = `You are an expert SEO editor for a pet care blog called Pet-GoToPro that covers dogs, cats, small pets, birds, reptiles, aquatics and invertebrates, and monetises with Amazon affiliate product reviews. You write for Google Search in 2026: search intent first, honest and specific, no clickbait, no keyword stuffing.`;
  const user = `Here is a draft blog post.
Category: ${category || 'unknown'}
Current title: ${title || '(none)'}
Content:
${content}

Return JSON with exactly these keys:
{
 "titles": [3 SEO title options, each under 60 characters, compelling and specific, include the current year only if the post is a product roundup or "best of"],
 "meta_description": "one meta description, 140-155 characters, includes the main keyword naturally and a reason to click",
 "slug": "a short lowercase-hyphenated url slug, max 8 words",
 "keywords": [8 target keywords/phrases, mix of head terms and long-tail],
 "seo_tips": [3 specific, actionable improvements for THIS post's search ranking, each one sentence]
}`;
  return runJSON(env, system, user);
}

// Blog topic ideas
export async function topicIdeas(env, { existingTitles, category }) {
  const system = `You are the content strategist for Pet-GoToPro, a pet care blog monetised with Amazon affiliate links, covering dogs, cats, small pets (hamsters, rabbits, guinea pigs, ferrets), birds, reptiles, aquatics (fish, shrimp), and invertebrates (tarantulas, hermit crabs). You suggest article topics with real Google search demand and buyer intent where relevant.`;
  const user = `Existing article titles on the site:
${(existingTitles || []).map(t => '- ' + t).join('\n') || '(none yet)'}

${category ? `Focus on the "${category}" category.` : 'Spread ideas across different pet categories.'}

Suggest 8 NEW article topics we have not covered. Mix informational care guides with affiliate-friendly product roundups. Return JSON:
{
 "ideas": [
   {"title": "proposed article title under 65 chars",
    "category": "one of: Dogs, Cats, Small Pets, Birds, Reptiles, Aquatics, Invertebrates, General",
    "target_keyword": "the main search phrase to target",
    "why": "one sentence on why this ranks well or converts",
    "type": "guide" or "product roundup"}
 ]
}`;
  const out = await runJSON(env, system, user);
  if (Array.isArray(out)) return { ideas: out };
  if (!Array.isArray(out?.ideas)) return { ideas: [] };
  return out;
}
