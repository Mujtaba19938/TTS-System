import TextToSpeechApp from "@/components/text-to-speech-app"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Text-to-Speech System",
  description: "Convert text to speech using your browser's built-in capabilities",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Text-to-Speech System</h1>
          <KeyboardShortcutsDialog />
        </div>
        <TextToSpeechApp />
      </div>
    </main>
  )
}
