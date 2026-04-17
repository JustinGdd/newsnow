import type { NewsItem } from "@shared/types"
import { load } from "cheerio"

const pojieTodayRank = defineSource(async () => {
  const baseURL = "https://www.52pojie.cn"
  const url = `${baseURL}/misc.php?mod=ranklist&type=thread&view=replies&orderby=today`

  // 请求 HTML 数据
  const response = await myFetch<any>(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Referer": baseURL,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9",
      // 如果触发防CC盾，可能需要在此处增加 Cookie 字段
      // "Cookie": "your_cookie_here"
    },
  })

  const $ = load(response)
  const articles: NewsItem[] = []

  // Discuz! 系统的排行榜通常包裹在带有 'xld' 类的列表中，或 '.tl' 表格中
  // 此处兼容大多数 Discuz X 的列表渲染结构
  const $items = $(".xld > dl, .tl tr:not(.th)")

  $items.each((_, el) => {
    const $el = $(el)

    // 获取包含帖子特征链接的 <a> 标签
    const $a = $el.find("a[href*='thread-'], a[href*='viewthread']").first()
    const href = $a.attr("href") || ""
    const title = $a.text().trim()

    // 过滤掉未解析出链接或标题的空白元素
    if (!href || !title) return

    // 获取作者信息（通过寻找空间链接或作者类名）
    const author = $el.find("a[href*='space-uid']").first().text().trim() 
                   || $el.find(".author a").text().trim() 
                   || "未知作者"

    // 获取热度/回复数 (Discuz 排行榜数据通常在 .y 下的 em 标签中)
    const replies = $el.find(".y em, .num em").first().text().trim() || "0"

    // 补全完整链接
    const fullUrl = href.startsWith("http") ? href : `${baseURL}/${href}`
    
    // 正则提取帖子的专属 ID
    // 匹配如: thread-123456-1-1.html 里的 123456，或 tid=123456 里的 123456
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
        info: `${author}  |  今日回复数: ${replies}`,
      },
    })
  })

  return articles
})

export default defineSource({
  "52pojie": pojieTodayRank,
  "52pojie-today": pojieTodayRank,
})
