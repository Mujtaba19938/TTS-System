"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import TextInput from "@/components/text-input"
import VoiceSelector from "@/components/voice-selector"
import CustomizationPanel from "@/components/customization-panel"
import AudioPlayer from "@/components/audio-player"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { generateSpeech } from "@/actions/tts-actions"
import type { Voice, SpeechOptions } from "@/types/tts-types"

export default function TtsInterface() {
  const [text, setText] = useState("")
  const [selectedVoice, setSelectedVoice] = useState<Voice>({
    id: "en-US-female-1",
    name: "American Female",
    gender: "female",
    accent: "american",
  })
  const [options, setOptions] = useState<SpeechOptions>({
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    emotion: "neutral",
  })
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputType, setInputType] = useState<"text" | "ssml" | "markdown">("text")

  const handleGenerate = async () => {
    if (!text.trim()) return

    setIsGenerating(true)
    setAudioUrl(null)

    try {
      const result = await generateSpeech({
        text,
        voice: selectedVoice.id,
        options,
        inputType,
      })

      if (result.success && result.audioUrl) {
        setAudioUrl(result.audioUrl)
      } else {
        console.error("Failed to generate speech:", result.error)
      }
    } catch (error) {
      console.error("Error generating speech:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="text" onValueChange={(value) => setInputType(value as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="text">Plain Text</TabsTrigger>
                <TabsTrigger value="ssml">SSML</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <TextInput value={text} onChange={setText} placeholder="Enter your text here..." type="text" />
              </TabsContent>

              <TabsContent value="ssml">
                <TextInput value={text} onChange={setText} placeholder="Enter SSML markup here..." type="ssml" />
              </TabsContent>

              <TabsContent value="markdown">
                <TextInput value={text} onChange={setText} placeholder="Enter markdown text here..." type="markdown" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {audioUrl && (
          <Card>
            <CardContent className="pt-6">
              <AudioPlayer audioUrl={audioUrl} />
            </CardContent>
          </Card>
        )}

        <Button onClick={handleGenerate} className="w-full py-6 text-lg" disabled={!text.trim() || isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Speech...
            </>
          ) : (
            "Generate Speech"
          )}
        </Button>
      </div>

      <div className="space-y-6">
        <VoiceSelector selectedVoice={selectedVoice} onSelectVoice={setSelectedVoice} />

        <CustomizationPanel options={options} onOptionsChange={setOptions} />
      </div>
    </div>
  )
}
