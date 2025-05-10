"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Plus, Play, Pause, StopCircle, Volume2, Info, AudioWaveformIcon as Waveform } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import BatchProcessingList from "@/components/batch-processing-list"
import AudioPlayer from "@/components/audio-player"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { ShortcutHint } from "@/components/shortcut-hint"

interface Voice {
  id: string
  name: string
  gender: string
  accent: string
  lang: string
}

export interface BatchEntry {
  id: string
  text: string
  status: "pending" | "processing" | "completed" | "error"
  name: string
}

const MAX_CHARS = 5000

export default function TextToSpeechApp() {
  const [text, setText] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [inputType, setInputType] = useState<"text" | "ssml" | "markdown" | "batch">("text")
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState("")
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [emotion, setEmotion] = useState("neutral")
  const [activeTab, setActiveTab] = useState("gender")
  const [batchEntries, setBatchEntries] = useState<BatchEntry[]>([])
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [currentBatchIndex, setCurrentBatchIndex] = useState(-1)
  const [batchProgress, setBatchProgress] = useState(0)
  const [enhancing, setEnhancing] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const synth = useRef<SpeechSynthesis | null>(null)
  const audioContext = useRef<AudioContext | null>(null)
  const audioAnalyser = useRef<AnalyserNode | null>(null)
  const audioSource = useRef<MediaElementAudioSourceNode | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const audioPlayerRef = useRef<HTMLDivElement>(null)

  // Available voices mapping
  const availableVoices: Voice[] = [
    { id: "en-US-male-1", name: "Josh (American Male)", gender: "male", accent: "american", lang: "en-US" },
    { id: "en-GB-male-1", name: "Thomas (British Male)", gender: "male", accent: "british", lang: "en-GB" },
    { id: "en-AU-male-1", name: "James (Australian Male)", gender: "male", accent: "australian", lang: "en-AU" },
    { id: "en-IN-male-1", name: "Raj (Indian Male)", gender: "male", accent: "indian", lang: "en-IN" },
    { id: "de-DE-male-1", name: "Klaus (German Male)", gender: "male", accent: "german", lang: "de-DE" },
    { id: "en-US-female-1", name: "Rachel (American Female)", gender: "female", accent: "american", lang: "en-US" },
    { id: "en-GB-female-1", name: "Charlotte (British Female)", gender: "female", accent: "british", lang: "en-GB" },
    { id: "en-AU-female-1", name: "Freya (Australian Female)", gender: "female", accent: "australian", lang: "en-AU" },
    { id: "en-IN-female-1", name: "Priya (Indian Female)", gender: "female", accent: "indian", lang: "en-IN" },
    { id: "es-ES-female-1", name: "Sofia (Spanish Female)", gender: "female", accent: "spanish", lang: "es-ES" },
    { id: "fr-FR-female-1", name: "Camille (French Female)", gender: "female", accent: "french", lang: "fr-FR" },
    { id: "en-US-neutral-1", name: "Alex (American Neutral)", gender: "neutral", accent: "american", lang: "en-US" },
  ]

  useEffect(() => {
    if (typeof window !== "undefined") {
      synth.current = window.speechSynthesis

      // Get available voices
      const loadVoices = () => {
        const systemVoices = synth.current?.getVoices() || []
        setVoices(systemVoices)

        // Set default voice
        if (systemVoices.length > 0 && !selectedVoice) {
          // Find a female voice as default
          const femaleVoice = systemVoices.find((v) => v.name.includes("female") || v.name.includes("Female"))
          setSelectedVoice(femaleVoice?.name || systemVoices[0].name)
        }
      }

      loadVoices()

      // Chrome loads voices asynchronously
      if (synth.current?.onvoiceschanged !== undefined) {
        synth.current.onvoiceschanged = loadVoices
      }

      // Clean up
      return () => {
        if (synth.current?.speaking) {
          synth.current.cancel()
        }

        if (audioSource.current) {
          audioSource.current.disconnect()
        }

        if (audioContext.current) {
          audioContext.current.close()
        }
      }
    }
  }, [selectedVoice])

  useEffect(() => {
    setCharCount(text.length)
  }, [text])

  // Handle batch processing
  useEffect(() => {
    if (batchProcessing && currentBatchIndex >= 0 && currentBatchIndex < batchEntries.length) {
      const currentEntry = batchEntries[currentBatchIndex]

      // Update status to processing
      const updatedEntries = [...batchEntries]
      updatedEntries[currentBatchIndex] = { ...currentEntry, status: "processing" }
      setBatchEntries(updatedEntries)

      // Process the current entry
      processBatchEntry(currentEntry.text)
        .then(() => {
          // Mark as completed and move to next
          const newEntries = [...batchEntries]
          newEntries[currentBatchIndex] = { ...currentEntry, status: "completed" }
          setBatchEntries(newEntries)

          // Calculate progress
          const newProgress = Math.round(((currentBatchIndex + 1) / batchEntries.length) * 100)
          setBatchProgress(newProgress)

          // Move to next entry after a delay
          setTimeout(() => {
            if (currentBatchIndex < batchEntries.length - 1) {
              setCurrentBatchIndex(currentBatchIndex + 1)
            } else {
              // Batch complete
              setBatchProcessing(false)
              setCurrentBatchIndex(-1)
            }
          }, 500) // Small delay between entries
        })
        .catch(() => {
          // Mark as error
          const newEntries = [...batchEntries]
          newEntries[currentBatchIndex] = { ...currentEntry, status: "error" }
          setBatchEntries(newEntries)

          // Move to next entry
          setTimeout(() => {
            if (currentBatchIndex < batchEntries.length - 1) {
              setCurrentBatchIndex(currentBatchIndex + 1)
            } else {
              // Batch complete
              setBatchProcessing(false)
              setCurrentBatchIndex(-1)
            }
          }, 500)
        })
    }
  }, [batchProcessing, currentBatchIndex, batchEntries])

  const handleEnhanceWithAI = async () => {
    if (!text.trim()) return

    setEnhancing(true)

    try {
      // Simulate AI processing with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would call an AI service
      // For now, we'll add some formatting and improvements
      const enhancedText = text
        .replace(/\bi\b/g, "I")
        .replace(/\s+/g, " ")
        .replace(/\.\s*([a-z])/g, (_, letter) => `. ${letter.toUpperCase()}`)
        .replace(/\?\s*([a-z])/g, (_, letter) => `? ${letter.toUpperCase()}`)
        .replace(/!\s*([a-z])/g, (_, letter) => `! ${letter.toUpperCase()}`)
        .trim()

      setText(enhancedText + " [Enhanced with AI]")
    } catch (error) {
      console.error("Error enhancing text:", error)
    } finally {
      setEnhancing(false)
    }
  }

  const generateSpeech = async () => {
    if (!text.trim()) return

    setIsGenerating(true)
    setAudioUrl(null)

    if (synth.current) {
      // Cancel any ongoing speech
      if (synth.current.speaking) {
        synth.current.cancel()
      }

      try {
        // Create a new SpeechSynthesisUtterance
        const utterance = new SpeechSynthesisUtterance(text)

        // Set voice
        const voice = voices.find((v) => v.name === selectedVoice)
        if (voice) {
          utterance.voice = voice
        }

        // Set speech properties
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        // Create a MediaRecorder to capture the audio
        const audioChunks: Blob[] = []

        // Use a promise to wait for the speech to complete
        const speechPromise = new Promise<void>((resolve, reject) => {
          utterance.onend = () => resolve()
          utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))
        })

        // Speak the text
        synth.current.speak(utterance)

        // Wait for speech to complete
        await speechPromise

        // For demo purposes, create a simulated audio URL
        // In a real implementation, you would use the MediaRecorder API to capture the actual speech
        const simulatedAudioUrl = URL.createObjectURL(new Blob([new Uint8Array(100)], { type: "audio/mp3" }))

        setAudioUrl(simulatedAudioUrl)
      } catch (error) {
        console.error("Error generating speech:", error)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const processBatchEntry = (entryText: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synth.current || !entryText.trim()) {
        reject(new Error("Invalid speech synthesis or empty text"))
        return
      }

      const utterance = new SpeechSynthesisUtterance(entryText)

      // Set voice
      const voice = voices.find((v) => v.name === selectedVoice)
      if (voice) {
        utterance.voice = voice
      }

      // Set speech properties
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      // Set event handlers
      utterance.onend = () => resolve()
      utterance.onerror = () => reject(new Error("Speech synthesis error"))

      // Speak the text
      synth.current.speak(utterance)
    })
  }

  const addBatchEntry = () => {
    if (text.trim()) {
      const newEntry: BatchEntry = {
        id: Date.now().toString(),
        text: text,
        status: "pending",
        name: `Entry ${batchEntries.length + 1}`,
      }
      setBatchEntries([...batchEntries, newEntry])
      setText("")
    }
  }

  const removeBatchEntry = (id: string) => {
    setBatchEntries(batchEntries.filter((entry) => entry.id !== id))
  }

  const startBatchProcessing = () => {
    if (batchEntries.length > 0 && !batchProcessing) {
      setBatchProcessing(true)
      setBatchProgress(0)
      setCurrentBatchIndex(0)
    }
  }

  const pauseBatchProcessing = () => {
    if (synth.current && batchProcessing) {
      synth.current.pause()
      setBatchProcessing(false)
    }
  }

  const resumeBatchProcessing = () => {
    if (synth.current && !batchProcessing && currentBatchIndex >= 0) {
      synth.current.resume()
      setBatchProcessing(true)
    }
  }

  const stopBatchProcessing = () => {
    if (synth.current) {
      synth.current.cancel()
      setBatchProcessing(false)
      setCurrentBatchIndex(-1)

      // Reset all entries to pending
      const resetEntries = batchEntries.map((entry) => ({
        ...entry,
        status: entry.status === "completed" ? "completed" : "pending",
      }))
      setBatchEntries(resetEntries)
    }
  }

  const getCharCountColor = () => {
    const percentage = (charCount / MAX_CHARS) * 100
    if (percentage > 90) return "text-red-500"
    if (percentage > 75) return "text-yellow-500"
    return "text-gray-400"
  }

  const adjustVoiceSettings = (setting: "rate" | "pitch" | "volume", increment: boolean) => {
    const step = 0.1
    const min = 0.1
    const max = setting === "rate" ? 2.0 : setting === "pitch" ? 1.5 : 1.0

    if (setting === "rate") {
      const newRate = increment ? Math.min(rate + step, max) : Math.max(rate - step, min)
      setRate(newRate)
    } else if (setting === "pitch") {
      const newPitch = increment ? Math.min(pitch + step, max) : Math.max(pitch - step, min)
      setPitch(newPitch)
    } else if (setting === "volume") {
      const newVolume = increment ? Math.min(volume + step, max) : Math.max(volume - step, min)
      setVolume(newVolume)
    }
  }

  const clearText = () => {
    setText("")
  }

  const switchTab = (tabIndex: number) => {
    const tabs = ["text", "ssml", "markdown", "batch"]
    if (tabIndex >= 0 && tabIndex < tabs.length) {
      setInputType(tabs[tabIndex] as any)
    }
  }

  // Set up keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: "Enter",
        ctrlKey: true,
        action: () => {
          if (inputType !== "batch" && text.trim()) {
            generateSpeech()
          }
        },
        description: "Generate speech",
        category: "Text Input",
      },
      {
        key: "e",
        ctrlKey: true,
        action: () => {
          if (text.trim() && !enhancing) {
            handleEnhanceWithAI()
          }
        },
        description: "Enhance with AI",
        category: "Text Input",
      },
      {
        key: "Backspace",
        ctrlKey: true,
        action: clearText,
        description: "Clear text",
        category: "Text Input",
      },
      {
        key: "1",
        ctrlKey: true,
        action: () => switchTab(0),
        description: "Switch to Plain Text tab",
        category: "Navigation",
      },
      {
        key: "2",
        ctrlKey: true,
        action: () => switchTab(1),
        description: "Switch to SSML tab",
        category: "Navigation",
      },
      {
        key: "3",
        ctrlKey: true,
        action: () => switchTab(2),
        description: "Switch to Markdown tab",
        category: "Navigation",
      },
      {
        key: "4",
        ctrlKey: true,
        action: () => switchTab(3),
        description: "Switch to Batch tab",
        category: "Navigation",
      },
      {
        key: "b",
        ctrlKey: true,
        action: () => {
          if (inputType === "batch" && text.trim()) {
            addBatchEntry()
          }
        },
        description: "Add to batch",
        category: "Batch Processing",
      },
      {
        key: "p",
        ctrlKey: true,
        action: () => {
          if (inputType === "batch") {
            batchProcessing ? pauseBatchProcessing() : startBatchProcessing()
          }
        },
        description: "Start/pause batch processing",
        category: "Batch Processing",
      },
      {
        key: "s",
        ctrlKey: true,
        action: () => {
          if (inputType === "batch" && (batchProcessing || currentBatchIndex >= 0)) {
            stopBatchProcessing()
          }
        },
        description: "Stop batch processing",
        category: "Batch Processing",
      },
      {
        key: " ", // Space
        action: () => {
          if (audioUrl && audioPlayerRef.current) {
            const playButton = audioPlayerRef.current.querySelector(
              'button[aria-label="Play"], button[aria-label="Pause"]',
            )
            if (playButton) {
              ;(playButton as HTMLButtonElement).click()
            }
          }
        },
        description: "Play/pause audio",
        category: "Audio Playback",
        preventDefault: true,
      },
      {
        key: "ArrowUp",
        ctrlKey: true,
        action: () => adjustVoiceSettings("rate", true),
        description: "Increase rate",
        category: "Voice Settings",
      },
      {
        key: "ArrowDown",
        ctrlKey: true,
        action: () => adjustVoiceSettings("rate", false),
        description: "Decrease rate",
        category: "Voice Settings",
      },
      {
        key: "ArrowRight",
        ctrlKey: true,
        action: () => adjustVoiceSettings("pitch", true),
        description: "Increase pitch",
        category: "Voice Settings",
      },
      {
        key: "ArrowLeft",
        ctrlKey: true,
        action: () => adjustVoiceSettings("pitch", false),
        description: "Decrease pitch",
        category: "Voice Settings",
      },
      {
        key: "ArrowUp",
        shiftKey: true,
        action: () => adjustVoiceSettings("volume", true),
        description: "Increase volume",
        category: "Voice Settings",
      },
      {
        key: "ArrowDown",
        shiftKey: true,
        action: () => adjustVoiceSettings("volume", false),
        description: "Decrease volume",
        category: "Voice Settings",
      },
      {
        key: "?",
        action: () => {
          const helpButton = document.querySelector('button[aria-label="Keyboard shortcuts"]')
          if (helpButton) {
            ;(helpButton as HTMLButtonElement).click()
          }
        },
        description: "Show keyboard shortcuts",
        category: "General",
      },
    ],
    undefined,
    true,
  )

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="border border-gray-700 rounded-md overflow-hidden shadow-md">
            <Tabs defaultValue="text" onValueChange={(value) => setInputType(value as any)}>
              <div className="bg-gray-800 px-6 py-3">
                <TabsList className="bg-gray-700/50 w-full border border-gray-600/30 p-1 rounded-md">
                  <TabsTrigger
                    value="text"
                    className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    Plain Text
                  </TabsTrigger>
                  <TabsTrigger
                    value="ssml"
                    className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    SSML
                  </TabsTrigger>
                  <TabsTrigger
                    value="markdown"
                    className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    Markdown
                  </TabsTrigger>
                  <TabsTrigger
                    value="batch"
                    className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                  >
                    Batch
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 bg-gray-900">
                <TabsContent value="text" className="mt-0">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="text-input" className="text-base font-medium">
                        Input Text
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the text you want to convert to speech</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className={`text-sm ${getCharCountColor()}`}>
                      {charCount}/{MAX_CHARS} characters
                    </span>
                  </div>
                  <Textarea
                    id="text-input"
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Enter your text here..."
                    className="min-h-[200px] bg-gray-800/80 border-gray-600 resize-none p-4 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                  />
                  <div className="flex justify-end mt-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleEnhanceWithAI}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 relative"
                          disabled={!text.trim() || enhancing}
                        >
                          {enhancing ? (
                            <>
                              <span className="animate-pulse">✨</span>
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Enhance with AI
                              <div className="absolute right-2 top-1">
                                <ShortcutHint keys={["Ctrl", "E"]} className="scale-75 origin-top-right" />
                              </div>
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rewrite or enhance your text using AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TabsContent>

                <TabsContent value="ssml" className="mt-0">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="ssml-input" className="text-base font-medium">
                        Input Text
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter SSML markup for more control over speech synthesis</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className={`text-sm ${getCharCountColor()}`}>
                      {charCount}/{MAX_CHARS} characters
                    </span>
                  </div>
                  <Textarea
                    id="ssml-input"
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Enter SSML markup here..."
                    className="min-h-[200px] bg-gray-800/80 border-gray-600 resize-none p-4 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                  />
                  <div className="flex justify-end mt-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleEnhanceWithAI}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 relative"
                          disabled={!text.trim() || enhancing}
                        >
                          {enhancing ? (
                            <>
                              <span className="animate-pulse">✨</span>
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Enhance with AI
                              <div className="absolute right-2 top-1">
                                <ShortcutHint keys={["Ctrl", "E"]} className="scale-75 origin-top-right" />
                              </div>
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rewrite or enhance your text using AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TabsContent>

                <TabsContent value="markdown" className="mt-0">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="markdown-input" className="text-base font-medium">
                        Input Text
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter markdown text for formatted speech synthesis</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className={`text-sm ${getCharCountColor()}`}>
                      {charCount}/{MAX_CHARS} characters
                    </span>
                  </div>
                  <Textarea
                    id="markdown-input"
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Enter markdown text here..."
                    className="min-h-[200px] bg-gray-800/80 border-gray-600 resize-none p-4 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                  />
                  <div className="flex justify-end mt-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleEnhanceWithAI}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 relative"
                          disabled={!text.trim() || enhancing}
                        >
                          {enhancing ? (
                            <>
                              <span className="animate-pulse">✨</span>
                              Enhancing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Enhance with AI
                              <div className="absolute right-2 top-1">
                                <ShortcutHint keys={["Ctrl", "E"]} className="scale-75 origin-top-right" />
                              </div>
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rewrite or enhance your text using AI</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TabsContent>

                <TabsContent value="batch" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="batch-input" className="text-base font-medium">
                          Add Text Entry
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add multiple text entries for batch processing</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="text-sm text-gray-400">{batchEntries.length} entries</span>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        id="batch-input"
                        value={text}
                        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                        placeholder="Enter text to add to batch..."
                        className="min-h-[80px] bg-gray-800/80 border-gray-600 resize-none p-4 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
                      />
                      <Button
                        onClick={addBatchEntry}
                        className="h-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md relative"
                        disabled={!text.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <div className="absolute right-1 top-1">
                          <ShortcutHint keys={["Ctrl", "B"]} className="scale-75 origin-top-right" />
                        </div>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium">Batch Entries</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={batchProcessing ? pauseBatchProcessing : resumeBatchProcessing}
                          disabled={batchEntries.length === 0 || (currentBatchIndex < 0 && !batchProcessing)}
                          className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md relative"
                        >
                          {batchProcessing ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                          {batchProcessing ? "Pause" : currentBatchIndex >= 0 ? "Resume" : "Start"}
                          <ShortcutHint
                            keys={["Ctrl", "P"]}
                            className="scale-75 origin-top-right absolute right-1 top-1"
                          />
                        </Button>
                        <Button
                          size="sm"
                          onClick={stopBatchProcessing}
                          disabled={!batchProcessing && currentBatchIndex < 0}
                          variant="destructive"
                          className="h-9 shadow-md relative"
                        >
                          <StopCircle className="h-4 w-4 mr-1" />
                          Stop
                          <ShortcutHint
                            keys={["Ctrl", "S"]}
                            className="scale-75 origin-top-right absolute right-1 top-1"
                          />
                        </Button>
                      </div>
                    </div>

                    {batchEntries.length > 0 && (
                      <div className="space-y-4">
                        <div className="w-full bg-gray-800 rounded-full h-2.5">
                          <Progress value={batchProgress} className="h-2.5 rounded-full bg-blue-600" />
                        </div>

                        <BatchProcessingList
                          entries={batchEntries}
                          currentIndex={currentBatchIndex}
                          onRemove={removeBatchEntry}
                          isProcessing={batchProcessing}
                        />
                      </div>
                    )}

                    {batchEntries.length === 0 && (
                      <div className="text-center py-8 text-gray-400 bg-gray-800/50 rounded-md border border-gray-700/50 shadow-inner">
                        <p>No batch entries added yet.</p>
                        <p className="text-sm mt-1">Add text entries above to begin batch processing.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {inputType !== "batch" && (
            <>
              <Button
                onClick={generateSpeech}
                className="w-full mt-6 py-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 group relative"
                disabled={!text.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating Speech...
                  </>
                ) : (
                  <>
                    <Waveform className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Generate Speech
                    <div className="absolute right-3 top-3">
                      <ShortcutHint keys={["Ctrl", "Enter"]} />
                    </div>
                  </>
                )}
              </Button>

              {audioUrl && (
                <div className="mt-6 bg-gray-800 border border-gray-700 rounded-md p-4 shadow-md">
                  <h3 className="text-base font-medium mb-3 flex items-center">
                    <Volume2 className="mr-2 h-5 w-5 text-blue-400" />
                    Audio Preview
                  </h3>
                  <div ref={audioPlayerRef}>
                    <AudioPlayer audioUrl={audioUrl} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <span>Voice Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="gender" onValueChange={setActiveTab}>
                <TabsList className="bg-gray-800 w-full grid grid-cols-3 mb-4 border border-gray-700/50">
                  <TabsTrigger
                    value="gender"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Gender
                  </TabsTrigger>
                  <TabsTrigger
                    value="accent"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Accent
                  </TabsTrigger>
                  <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    All Voices
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="gender" className="mt-0">
                  <RadioGroup value={selectedVoice} onValueChange={setSelectedVoice} className="space-y-1">
                    {voices.map((voice) => (
                      <div key={voice.name} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-800">
                        <RadioGroupItem value={voice.name} id={`voice-${voice.name}`} />
                        <Label htmlFor={`voice-${voice.name}`} className="text-sm cursor-pointer">
                          {availableVoices.find((v) => v.name === voice.name)?.name || voice.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </TabsContent>

                <TabsContent value="accent" className="mt-0">
                  <RadioGroup value={selectedVoice} onValueChange={setSelectedVoice} className="space-y-1">
                    {voices.map((voice) => (
                      <div key={voice.name} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-800">
                        <RadioGroupItem value={voice.name} id={`accent-${voice.name}`} />
                        <Label htmlFor={`accent-${voice.name}`} className="text-sm cursor-pointer">
                          {availableVoices.find((v) => v.name === voice.name)?.name || voice.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                  <RadioGroup value={selectedVoice} onValueChange={setSelectedVoice} className="space-y-1">
                    {voices.map((voice) => (
                      <div key={voice.name} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-800">
                        <RadioGroupItem value={voice.name} id={`all-${voice.name}`} />
                        <Label htmlFor={`all-${voice.name}`} className="text-sm cursor-pointer">
                          {voice.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Customization Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="rate-slider" className="font-medium">
                    Speaking Rate
                  </Label>
                  <span className="text-sm font-medium text-blue-400">{rate.toFixed(1)}x</span>
                </div>
                <Slider
                  id="rate-slider"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="pitch-slider" className="font-medium">
                    Pitch
                  </Label>
                  <span className="text-sm font-medium text-blue-400">{pitch.toFixed(1)}</span>
                </div>
                <Slider
                  id="pitch-slider"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={[pitch]}
                  onValueChange={([value]) => setPitch(value)}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Low</span>
                  <span>Normal</span>
                  <span>High</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="volume-slider" className="font-medium">
                    Volume
                  </Label>
                  <span className="text-sm font-medium text-blue-400">{volume.toFixed(1)}</span>
                </div>
                <Slider
                  id="volume-slider"
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Quiet</span>
                  <span>Normal</span>
                  <span>Loud</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emotion-select" className="font-medium">
                  Emotional Tone
                </Label>
                <Select value={emotion} onValueChange={setEmotion}>
                  <SelectTrigger id="emotion-select" className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="serious">Serious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
