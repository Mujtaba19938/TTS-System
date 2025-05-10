"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from "lucide-react"
import { ShortcutHint } from "@/components/shortcut-hint"

interface AudioPlayerProps {
  audioUrl: string
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audioUrl])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const handleSeek = ([value]: number[]) => {
    if (!audioRef.current) return

    audioRef.current.currentTime = value
    setCurrentTime(value)
  }

  const handleVolumeChange = ([value]: number[]) => {
    if (!audioRef.current) return

    setVolume(value)
    audioRef.current.volume = value

    if (value === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.volume = volume || 1
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const skipBackward = () => {
    if (!audioRef.current) return

    audioRef.current.currentTime = Math.max(0, currentTime - 5)
  }

  const skipForward = () => {
    if (!audioRef.current) return

    audioRef.current.currentTime = Math.min(duration, currentTime + 5)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = audioUrl
    link.download = "tts-audio.mp3"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <span className="text-sm">{formatTime(duration)}</span>
        </div>

        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          aria-label="Seek time"
          className="cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            aria-label="Skip backward 5 seconds"
            className="hover:bg-gray-700 relative"
          >
            <SkipBack className="h-5 w-5" />
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-70">
              <ShortcutHint keys={["←"]} />
            </div>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white border-none relative"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-70">
              <ShortcutHint keys={["Space"]} />
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            aria-label="Skip forward 5 seconds"
            className="hover:bg-gray-700 relative"
          >
            <SkipForward className="h-5 w-5" />
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-70">
              <ShortcutHint keys={["→"]} />
            </div>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="hover:bg-gray-700 relative"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-70">
              <ShortcutHint keys={["M"]} />
            </div>
          </Button>

          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24 cursor-pointer"
            aria-label="Volume"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            aria-label="Download audio"
            className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
