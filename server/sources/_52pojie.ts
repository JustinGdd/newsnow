import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import iconv from "iconv-lite"

const pojieTodayRank = defineSource(async () => {
  const baseURL = "https://www.52pojie.cn"
  const url = `${baseURL}/misc.php?mod=ranklist&type=thread&view=replies&orderby=today`

  // 1. 获取 ArrayBuffer 数据，而不是直接解析为文本
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Referer": baseURL,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  })

  const buffer = await res.arrayBuffer()
  
  // 2. 将 GBK 编码转换为 UTF-8
  // @ts-ignore (处理 buffer 类型兼容)
  const html = iconv.decode(Buffer.from(buffer), "gbk")

  const $ = load(html)
  const articles: NewsItem[] = []

  // 3. 针对吾爱破解排行榜表格的精确选择器 (类名为 .tl 的表格下的普通行)
  const $items = $(".tl tr:not(.th)")

  $items.each((_, el) => {
    const $el = $(el)

    // 标题通常在 th 里的 a 标签
    const $a = $el.find("th a").first()
    const href = $a.attr("href") || ""
    const title = $a.text().trim()

    if (!href || !title) return

    // 抓取作者和回复数
    const author = $el.find("td.by cite a").first().text().trim() || "未知作者"
    const replies = $el.find("td.num a").first().text().trim() || $el.find("td.num em").first().text().trim() || "0"

    const fullUrl = href.startsWith("http") ? href : `${baseURL}/${href}`

    // 提取帖子 ID
    let id = href
    const idMatch = href.match(/thread-(\d+)-/i) || href.match(/tid=(\d+)/i)
    if (idMatch && idMatch[1]) {
      id = idMatch[1]
    }

    articles.push({
      url: fullUrl,
      title,
      id,
      extra: {
        info: `${author}  |  回复: ${replies}`,
      },
    })
  })

  return articles
})

export default defineSource({
  "pojie": pojieTodayRank,
  "pojie-today": pojieTodayRank,
})
