"use server"

import { revalidatePath } from "next/cache"
import type { SpeechOptions } from "@/types/tts-types"
import { processSSML, processMarkdown } from "@/lib/text-processors"

interface GenerateSpeechParams {
  text: string
  voice: string
  options: SpeechOptions
  inputType: "text" | "ssml" | "markdown"
}

interface GenerateSpeechResult {
  success: boolean
  audioUrl?: string
  error?: string
}

export async function generateSpeech({
  text,
  voice,
  options,
  inputType,
}: GenerateSpeechParams): Promise<GenerateSpeechResult> {
  try {
    // Process the input based on type
    let processedText = text
    if (inputType === "ssml") {
      processedText = processSSML(text)
    } else if (inputType === "markdown") {
      processedText = processMarkdown(text)
    }

    // Prepare the TTS API request
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      },
      body: JSON.stringify({
        text: processedText,
        voice_id: mapVoiceIdToElevenLabsId(voice),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: mapEmotionToStyle(options.emotion),
          use_speaker_boost: true,
          speaking_rate: options.speed,
          pitch: mapPitchToElevenLabs(options.pitch),
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to generate speech")
    }

    // Get the audio data
    const audioBlob = await response.blob()

    // Create a temporary URL for the audio
    const audioUrl = URL.createObjectURL(audioBlob)

    // Store the audio file (in a real app, you might want to save this to a database or file storage)
    // For this example, we'll just return the blob URL

    revalidatePath("/")

    return {
      success: true,
      audioUrl,
    }
  } catch (error) {
    console.error("Error generating speech:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Helper functions to map our values to ElevenLabs API values
function mapVoiceIdToElevenLabsId(voiceId: string): string {
  // This would map our internal voice IDs to ElevenLabs voice IDs
  // For this example, we'll use a simple mapping
  const voiceMap: Record<string, string> = {
    "en-US-female-1": "21m00Tcm4TlvDq8ikWAM", // Rachel
    "en-US-male-1": "TxGEqnHWrfWFTfGW9XjX", // Josh
    "en-GB-female-1": "EXAVITQu4vr4xnSDxMaL", // Charlotte
    "en-GB-male-1": "ODq5zmih8GrVes37Dizd", // Thomas
    "en-AU-female-1": "XB0fDUnXU5powFXDhCwa", // Freya
    // Add more mappings as needed
  }

  return voiceMap[voiceId] || "21m00Tcm4TlvDq8ikWAM" // Default to Rachel if not found
}

function mapEmotionToStyle(emotion: string): number {
  // Map emotion to a style value (0.0 to 1.0)
  const emotionMap: Record<string, number> = {
    neutral: 0.0,
    happy: 0.3,
    sad: -0.3,
    excited: 0.6,
    serious: -0.2,
    friendly: 0.4,
  }

  return emotionMap[emotion] || 0.0
}

function mapPitchToElevenLabs(pitch: number): number {
  // Map our pitch (0.5 to 1.5) to ElevenLabs pitch (-1.0 to 1.0)
  return (pitch - 1.0) * 2
}
