// 从 Book.md 生成 VitePress 站点内容。
// Book.md 是唯一的内容来源，docs/book/、docs/public/、sidebar.json 都是生成物。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bookMd = path.join(root, 'Book.md')
const docsDir = path.join(root, 'docs')
const outDir = path.join(docsDir, 'book')
const publicDir = path.join(docsDir, 'public')

const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

/** 章节标题 -> 文件名（不含扩展名）。返回 null 表示丢弃该节。 */
function slugOf(title) {
  if (title === '目录') return null // 侧边栏已经是目录了
  if (title === '前言') return 'preface'
  if (title === '后记') return 'afterword'
  const chapter = title.match(/^第(.)章/)
  if (chapter) {
    const n = CN_NUM.indexOf(chapter[1])
    if (n >= 0) return 'ch' + String(n).padStart(2, '0')
  }
  const appendix = title.match(/^附录([A-Z])/)
  if (appendix) return 'appendix-' + appendix[1].toLowerCase()
  throw new Error(`未知的章节标题，请更新 slugOf(): ${title}`)
}

/** 把 Markdown 里的 <img> 标签转成标准 Markdown 图片语法，并把 ./ 路径改成站点绝对路径。 */
function normalizeImages(md) {
  return md.replace(/<img\s+([^>]*?)\/?>/g, (whole, attrs) => {
    const src = attrs.match(/src="([^"]+)"/)
    if (!src) return whole
    const alt = attrs.match(/alt="([^"]*)"/)
    const url = src[1].replace(/^\.\//, '/') // ./images/ch00/hex.png -> /images/ch00/hex.png
    return `![${alt ? alt[1] : ''}](${url})`
  })
}

function cleanup(md) {
  return normalizeImages(md)
    .replace(/<div style="page-break-after: always;"><\/div>/g, '') // 只对 PDF 有意义
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** 章内标题上提一级：## 章 -> # 标题，### 小节 -> ## 小节。 */
function promoteHeadings(md) {
  return md.replace(/^(#{2,3}) /gm, (_, hashes) => '#'.repeat(hashes.length - 1) + ' ')
}

function extractSections(md) {
  const sections = []
  let current = null
  for (const line of md.split('\n')) {
    const h2 = line.match(/^## (.+?)\s*$/)
    if (h2) {
      current = { title: h2[1], lines: [line] }
      sections.push(current)
    } else if (current) {
      current.lines.push(line)
    }
  }
  return sections
}

/** 收集页面内的 ### 小节，用于侧边栏展开。 */
function subsectionsOf(body) {
  const items = []
  for (const line of body.split('\n')) {
    const h3 = line.match(/^### (.+?)\s*$/)
    if (h3) items.push(h3[1])
  }
  return items
}

/** 复刻 VitePress 默认的标题锚点规则（中文标题保持原样）。 */
function anchor(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, '')
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true })
  fs.cpSync(src, dest, { recursive: true, filter: (f) => !f.endsWith('.DS_Store') })
}

// ---- 主流程 ----

const raw = fs.readFileSync(bookMd, 'utf8')
const version = raw.match(/^>\s*版本：(.+?)\s*$/m)?.[1] ?? ''

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

const sidebar = []
let count = 0

for (const section of extractSections(raw)) {
  const slug = slugOf(section.title)
  if (!slug) continue

  const body = cleanup(section.lines.join('\n'))
  fs.writeFileSync(path.join(outDir, `${slug}.md`), promoteHeadings(body) + '\n')
  count++

  const link = `/book/${slug}`
  const subs = subsectionsOf(body)
  sidebar.push({
    text: section.title,
    link,
    collapsed: subs.length > 0 ? true : undefined,
    items: subs.map((t) => ({ text: t, link: `${link}#${anchor(t)}` })),
  })
}

fs.mkdirSync(path.join(docsDir, '.vitepress'), { recursive: true })
fs.writeFileSync(
  path.join(docsDir, '.vitepress', 'sidebar.json'),
  JSON.stringify({ version, sidebar }, null, 2) + '\n'
)

fs.mkdirSync(publicDir, { recursive: true })
copyDir(path.join(root, 'images'), path.join(publicDir, 'images'))
copyDir(path.join(root, 'aigc'), path.join(publicDir, 'aigc'))

console.log(`生成 ${count} 个页面 -> docs/book/，版本 ${version}`)
