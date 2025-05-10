"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Voice } from "@/types/tts-types"
import { AVAILABLE_VOICES } from "@/lib/voice-data"

interface VoiceSelectorProps {
  selectedVoice: Voice
  onSelectVoice: (voice: Voice) => void
}

export default function VoiceSelector({ selectedVoice, onSelectVoice }: VoiceSelectorProps) {
  const handleVoiceChange = (voiceId: string) => {
    const voice = AVAILABLE_VOICES.find((v) => v.id === voiceId)
    if (voice) {
      onSelectVoice(voice)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gender">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="gender">Gender</TabsTrigger>
            <TabsTrigger value="accent">Accent</TabsTrigger>
            <TabsTrigger value="all">All Voices</TabsTrigger>
          </TabsList>

          <TabsContent value="gender" className="space-y-4">
            <RadioGroup value={selectedVoice.id} onValueChange={handleVoiceChange}>
              {AVAILABLE_VOICES.filter((v) => v.gender === "male").map((voice) => (
                <div key={voice.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={voice.id} id={`gender-${voice.id}`} />
                  <Label htmlFor={`gender-${voice.id}`}>{voice.name}</Label>
                </div>
              ))}

              {AVAILABLE_VOICES.filter((v) => v.gender === "female").map((voice) => (
                <div key={voice.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={voice.id} id={`gender-${voice.id}`} />
                  <Label htmlFor={`gender-${voice.id}`}>{voice.name}</Label>
                </div>
              ))}

              {AVAILABLE_VOICES.filter((v) => v.gender === "neutral").map((voice) => (
                <div key={voice.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={voice.id} id={`gender-${voice.id}`} />
                  <Label htmlFor={`gender-${voice.id}`}>{voice.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>

          <TabsContent value="accent" className="space-y-4">
            <RadioGroup value={selectedVoice.id} onValueChange={handleVoiceChange}>
              {["american", "british", "australian", "indian", "other"].map((accent) => (
                <div key={accent} className="mb-4">
                  <h3 className="text-sm font-medium mb-2 capitalize">{accent}</h3>
                  <div className="space-y-2 ml-2">
                    {AVAILABLE_VOICES.filter((v) => v.accent === accent).map((voice) => (
                      <div key={voice.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={voice.id} id={`accent-${voice.id}`} />
                        <Label htmlFor={`accent-${voice.id}`}>{voice.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <RadioGroup value={selectedVoice.id} onValueChange={handleVoiceChange}>
              {AVAILABLE_VOICES.map((voice) => (
                <div key={voice.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={voice.id} id={`all-${voice.id}`} />
                  <Label htmlFor={`all-${voice.id}`}>{voice.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
