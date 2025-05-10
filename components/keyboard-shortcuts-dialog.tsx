"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"

type ShortcutCategory = {
  name: string
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    name: "General",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close dialogs" },
    ],
  },
  {
    name: "Text Input",
    shortcuts: [
      { keys: ["Ctrl", "Enter"], description: "Generate speech" },
      { keys: ["Ctrl", "E"], description: "Enhance with AI" },
      { keys: ["Ctrl", "Backspace"], description: "Clear text" },
    ],
  },
  {
    name: "Navigation",
    shortcuts: [
      { keys: ["Ctrl", "1"], description: "Switch to Plain Text tab" },
      { keys: ["Ctrl", "2"], description: "Switch to SSML tab" },
      { keys: ["Ctrl", "3"], description: "Switch to Markdown tab" },
      { keys: ["Ctrl", "4"], description: "Switch to Batch tab" },
    ],
  },
  {
    name: "Batch Processing",
    shortcuts: [
      { keys: ["Ctrl", "B"], description: "Add to batch" },
      { keys: ["Ctrl", "P"], description: "Start/pause batch processing" },
      { keys: ["Ctrl", "S"], description: "Stop batch processing" },
    ],
  },
  {
    name: "Audio Playback",
    shortcuts: [
      { keys: ["Space"], description: "Play/pause audio" },
      { keys: ["Left"], description: "Skip backward 5 seconds" },
      { keys: ["Right"], description: "Skip forward 5 seconds" },
      { keys: ["M"], description: "Mute/unmute" },
    ],
  },
  {
    name: "Voice Settings",
    shortcuts: [
      { keys: ["Ctrl", "ArrowUp"], description: "Increase rate" },
      { keys: ["Ctrl", "ArrowDown"], description: "Decrease rate" },
      { keys: ["Ctrl", "ArrowRight"], description: "Increase pitch" },
      { keys: ["Ctrl", "ArrowLeft"], description: "Decrease pitch" },
      { keys: ["Shift", "ArrowUp"], description: "Increase volume" },
      { keys: ["Shift", "ArrowDown"], description: "Decrease volume" },
    ],
  },
]

export function KeyboardShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {SHORTCUT_CATEGORIES.map((category) => (
            <div key={category.name} className="space-y-3">
              <h3 className="font-medium text-lg text-blue-400">{category.name}</h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-md shadow"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
