import type { Voice } from "@/types/tts-types"

export const AVAILABLE_VOICES: Voice[] = [
  // American English
  {
    id: "en-US-female-1",
    name: "Rachel (American Female)",
    gender: "female",
    accent: "american",
  },
  {
    id: "en-US-male-1",
    name: "Josh (American Male)",
    gender: "male",
    accent: "american",
  },
  {
    id: "en-US-neutral-1",
    name: "Alex (American Neutral)",
    gender: "neutral",
    accent: "american",
  },

  // British English
  {
    id: "en-GB-female-1",
    name: "Charlotte (British Female)",
    gender: "female",
    accent: "british",
  },
  {
    id: "en-GB-male-1",
    name: "Thomas (British Male)",
    gender: "male",
    accent: "british",
  },

  // Australian English
  {
    id: "en-AU-female-1",
    name: "Freya (Australian Female)",
    gender: "female",
    accent: "australian",
  },
  {
    id: "en-AU-male-1",
    name: "James (Australian Male)",
    gender: "male",
    accent: "australian",
  },

  // Indian English
  {
    id: "en-IN-female-1",
    name: "Priya (Indian Female)",
    gender: "female",
    accent: "indian",
  },
  {
    id: "en-IN-male-1",
    name: "Raj (Indian Male)",
    gender: "male",
    accent: "indian",
  },

  // Other languages/accents
  {
    id: "es-ES-female-1",
    name: "Sofia (Spanish Female)",
    gender: "female",
    accent: "other",
  },
  {
    id: "fr-FR-female-1",
    name: "Camille (French Female)",
    gender: "female",
    accent: "other",
  },
  {
    id: "de-DE-male-1",
    name: "Klaus (German Male)",
    gender: "male",
    accent: "other",
  },
]
