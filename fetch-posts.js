import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE  = 'https://twotrees.tw/wp-json/wp/v2';
const OUT_DIR   = join(__dirname, 'src/content/blog');
const IMG_DIR   = join(__dirname, 'public/images/blog');
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(IMG_DIR, { recursive: true });

// 下載圖片，回傳本地路徑（/images/blog/filename）
async function downloadImage(url) {
  try {
    // 取得乾淨的檔名（去掉 query string）
    const cleanUrl = url.split('?')[0];
    const filename = basename(cleanUrl);
    const ext = extname(filename).toLowerCase();
    // 只處理常見圖片格式
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) return url;

    const localPath = join(IMG_DIR, filename);
    const publicPath = `/images/blog/${filename}`;

    const res = await fetch(url);
    if (!res.ok) return url;
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(localPath, buf);
    return publicPath;
  } catch {
    return url; // 下載失敗就保留原網址
  }
}

function htmlToMd(html = '') {
  return html
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\[[\s\S]*?\]/g, '')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, t) => '\n' + t.replace(/<[^>]+>/g,'').trim() + '\n\n')
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, l, t) =>
      '\n' + '#'.repeat(+l) + ' ' + t.replace(/<[^>]+>/g,'').trim() + '\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => '- ' + t.replace(/<[^>]+>/g,'').trim() + '\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '_$1_')
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '\n![$2]($1)\n')
    .replace(/<img[^>]+src="([^"]+)"[^>]*\/?>/gi, '\n![]($1)\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&nbsp;/g,' ').replace(/&hellip;/g,'…')
    .replace(/&#8216;/g,'\u2018').replace(/&#8217;/g,'\u2019')
    .replace(/&#8220;/g,'\u201C').replace(/&#8221;/g,'\u201D')
    .replace(/&#[0-9]+;/g, '')
    .replace(/^[ \t]+/gm, '')
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

// 找出 markdown 內所有圖片網址
function extractImageUrls(md) {
  const urls = new Set();
  const re = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g;
  let m;
  while ((m = re.exec(md)) !== null) urls.add(m[1]);
  return [...urls];
}

// 把 markdown 內的圖片網址替換為本地路徑
function replaceImageUrls(md, urlMap) {
  let result = md;
  for (const [original, local] of Object.entries(urlMap)) {
    result = result.replaceAll(original, local);
  }
  return result;
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
  console.log(`✅ 共 ${all.length} 篇，轉換並下載圖片中...`);

  for (const post of all) {
    const title = post.title.rendered.replace(/&amp;/g,'&').replace(/&#8217;/g,'\u2019');
    const slug  = post.slug;
    const date  = post.date.split('T')[0];
    const desc  = cleanDesc(post.excerpt.rendered);
    const cats  = getCategories(post);
    let body    = htmlToMd(post.content.rendered);

    // 下載內文圖片
    const imageUrls = extractImageUrls(body);
    const urlMap = {};
    for (const url of imageUrls) {
      const local = await downloadImage(url);
      if (local !== url) {
        urlMap[url] = local;
        console.log(`    🖼  ${basename(url)}`);
      }
    }
    body = replaceImageUrls(body, urlMap);

    // 下載封面圖
    let image = getFeaturedImage(post);
    if (image) {
      const localImage = await downloadImage(image);
      image = localImage;
    }

    const tEsc = title.includes(':') || title.includes('"') ? `"${title.replace(/"/g,'\\"')}"` : title;
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
