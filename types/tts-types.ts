export interface Voice {
  id: string
  name: string
  gender: "male" | "female" | "neutral"
  accent: string
}

export interface SpeechOptions {
  speed: number
  pitch: number
  volume: number
  emotion: string
}

export interface TtsResult {
  success: boolean
  audioUrl?: string
  error?: string
}
