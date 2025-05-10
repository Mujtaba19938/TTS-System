"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { enhanceTextWithAI } from "@/actions/ai-actions"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type: "text" | "ssml" | "markdown"
}

export default function TextInput({ value, onChange, placeholder, type }: TextInputProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setCharCount(value.length)
  }, [value])

  const handleEnhanceText = async () => {
    if (!value.trim()) return

    setIsEnhancing(true)
    try {
      const enhancedText = await enhanceTextWithAI(value, type)
      if (enhancedText) {
        onChange(enhancedText)
      }
    } catch (error) {
      console.error("Error enhancing text:", error)
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="text-input">Input Text</Label>
        <span className="text-sm text-muted-foreground">{charCount} characters</span>
      </div>

      <Textarea
        id="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] font-mono"
      />

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleEnhanceText} disabled={!value.trim() || isEnhancing}>
          {isEnhancing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enhance with AI
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
