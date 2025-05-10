"use server"

import { xai } from "@ai-sdk/xai"
import { generateText } from "ai"

export async function enhanceTextWithAI(text: string, type: "text" | "ssml" | "markdown"): Promise<string> {
  try {
    let prompt = ""

    if (type === "text") {
      prompt = `Enhance the following text to make it sound more natural and expressive for text-to-speech conversion. 
      Add appropriate pauses, emphasis, and intonation cues while preserving the original meaning:
      
      ${text}`
    } else if (type === "ssml") {
      prompt = `Convert the following text into well-formatted SSML (Speech Synthesis Markup Language) with appropriate 
      tags for pauses, emphasis, prosody, and phonetic pronunciation where needed. Make it sound natural and expressive:
      
      ${text}`
    } else if (type === "markdown") {
      prompt = `Convert the following text into well-formatted Markdown with appropriate formatting for headings, 
      emphasis, lists, and other elements that would help with text-to-speech conversion:
      
      ${text}`
    }

    const { text: enhancedText } = await generateText({
      model: xai("grok-1"),
      prompt,
      system:
        "You are an expert in natural language processing and text-to-speech optimization. Your task is to enhance text for optimal speech synthesis, making it sound more natural and expressive.",
    })

    return enhancedText
  } catch (error) {
    console.error("Error enhancing text with AI:", error)
    return text // Return original text if enhancement fails
  }
}
