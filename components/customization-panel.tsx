"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SpeechOptions } from "@/types/tts-types"

interface CustomizationPanelProps {
  options: SpeechOptions
  onOptionsChange: (options: SpeechOptions) => void
}

export default function CustomizationPanel({ options, onOptionsChange }: CustomizationPanelProps) {
  const handleOptionChange = <K extends keyof SpeechOptions>(key: K, value: SpeechOptions[K]) => {
    onOptionsChange({
      ...options,
      [key]: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customization Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="speed-slider">Speaking Rate</Label>
            <span className="text-sm">{options.speed.toFixed(1)}x</span>
          </div>
          <Slider
            id="speed-slider"
            min={0.5}
            max={2.0}
            step={0.1}
            value={[options.speed]}
            onValueChange={([value]) => handleOptionChange("speed", value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="pitch-slider">Pitch</Label>
            <span className="text-sm">{options.pitch.toFixed(1)}</span>
          </div>
          <Slider
            id="pitch-slider"
            min={0.5}
            max={1.5}
            step={0.1}
            value={[options.pitch]}
            onValueChange={([value]) => handleOptionChange("pitch", value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Normal</span>
            <span>High</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="volume-slider">Volume</Label>
            <span className="text-sm">{options.volume.toFixed(1)}</span>
          </div>
          <Slider
            id="volume-slider"
            min={0.1}
            max={1.0}
            step={0.1}
            value={[options.volume]}
            onValueChange={([value]) => handleOptionChange("volume", value)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Quiet</span>
            <span>Normal</span>
            <span>Loud</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emotion-select">Emotional Tone</Label>
          <Select value={options.emotion} onValueChange={(value) => handleOptionChange("emotion", value)}>
            <SelectTrigger id="emotion-select">
              <SelectValue placeholder="Select emotion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="happy">Happy</SelectItem>
              <SelectItem value="sad">Sad</SelectItem>
              <SelectItem value="excited">Excited</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
