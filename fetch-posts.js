import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE  = 'https://twotrees.tw/wp-json/wp/v2';
const OUT_DIR   = join(__dirname, 'src/content/blog');
mkdirSync(OUT_DIR, { recursive: true });

function htmlToMd(html = '') {
  return html
    // 移除 script / style / noscript
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // 移除 Elementor / WordPress 目錄、[vc_*] shortcode
    .replace(/\[[\s\S]*?\]/g, '')
    // pre / code → 保留純文字，加換行
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, t) => '\n' + t.replace(/<[^>]+>/g,'').trim() + '\n\n')
    // 標題
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, l, t) =>
      '\n' + '#'.repeat(+l) + ' ' + t.replace(/<[^>]+>/g,'').trim() + '\n\n')
    // 清單
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => '- ' + t.replace(/<[^>]+>/g,'').trim() + '\n')
    // 粗體 / 斜體
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '_$1_')
    // 連結
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    // 圖片
    .replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '\n![$2]($1)\n')
    .replace(/<img[^>]+src="([^"]+)"[^>]*\/?>/gi, '\n![]($1)\n')
    // 段落 / 換行
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // 移除所有剩餘 HTML 標籤
    .replace(/<[^>]+>/g, '')
    // HTML entities
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&nbsp;/g,' ').replace(/&hellip;/g,'…')
    .replace(/&#8216;/g,'\u2018').replace(/&#8217;/g,'\u2019')
    .replace(/&#8220;/g,'\u201C').replace(/&#8221;/g,'\u201D')
    .replace(/&#[0-9]+;/g, '')
    // 移除每行行首空白（防止 Markdown 把縮排識別為 code block）
    .replace(/^[ \t]+/gm, '')
    // 收斂多餘空行、頭尾空白
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanDesc(raw = '') {
  return htmlToMd(raw)
    .replace(/\[…\]/g, '').replace(/\[&hellip;\]/g, '').replace(/…/g, '')
    .replace(/\n+/g, ' ').trim().slice(0, 200);
}

function getFeaturedImage(post) {
  try { return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null; } catch { return null; }
}
function getCategories(post) {
  try { return (post._embedded?.['wp:term']?.[0] || []).map(t => t.name); } catch { return []; }
}

async function main() {
  let page = 1, all = [];
  console.log('📡 抓取文章中...');
  while (true) {
    const res = await fetch(`${API_BASE}/posts?per_page=100&page=${page}&_embed=1`);
    if (!res.ok) break;
    const posts = await res.json();
    if (!posts.length) break;
    all = all.concat(posts);
    const total = parseInt(res.headers.get('X-WP-TotalPages') || '1');
    if (page >= total) break;
    page++;
  }
  console.log(`✅ 共 ${all.length} 篇，轉換中...`);

  for (const post of all) {
    const title = post.title.rendered.replace(/&amp;/g,'&').replace(/&#8217;/g,'\u2019');
    const slug  = post.slug;
    const date  = post.date.split('T')[0];
    const desc  = cleanDesc(post.excerpt.rendered);
    const image = getFeaturedImage(post);
    const cats  = getCategories(post);
    const body  = htmlToMd(post.content.rendered);
    const tEsc  = title.includes(':') || title.includes('"') ? `"${title.replace(/"/g,'\\"')}"` : title;
    const fm = ['---', `title: ${tEsc}`, `date: "${date}"`,
      `description: "${desc.replace(/"/g,'\\"')}"`,
      image ? `image: "${image}"` : null,
      `categories: [${cats.map(c=>`"${c}"`).join(', ')}]`, '---'].filter(Boolean).join('\n');
    writeFileSync(join(OUT_DIR, `${slug}.md`), `${fm}\n\n${body}`, 'utf-8');
    console.log(`  ✓ ${slug}.md`);
  }
  console.log('🎉 完成！');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
