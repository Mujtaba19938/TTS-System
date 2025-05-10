import { marked } from "marked"

export function processSSML(ssml: string): string {
  // For a real implementation, you would validate and process SSML here
  // For this example, we'll just return the SSML as is, assuming it's valid
  return ssml
}

export function processMarkdown(markdown: string): string {
  // Convert Markdown to plain text
  const html = marked(markdown)

  // Simple HTML to plain text conversion
  // In a real implementation, you would want to handle this more robustly
  const plainText = html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&[^;]+;/g, (match) => {
      // Handle HTML entities
      const entities: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
        "&nbsp;": " ",
      }
      return entities[match] || match
    })

  return plainText
}
