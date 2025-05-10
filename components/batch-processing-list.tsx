"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { BatchEntry } from "./text-to-speech-app"

interface BatchProcessingListProps {
  entries: BatchEntry[]
  currentIndex: number
  onRemove: (id: string) => void
  isProcessing: boolean
}

export default function BatchProcessingList({
  entries,
  currentIndex,
  onRemove,
  isProcessing,
}: BatchProcessingListProps) {
  const getStatusBadge = (status: string, isActive: boolean) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-gray-800 text-gray-300">
            Pending
          </Badge>
        )
      case "processing":
        return <Badge className="bg-blue-600 text-white">Processing</Badge>
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={`flex items-center justify-between p-3 rounded-md shadow-sm ${
            index === currentIndex ? "bg-blue-900/30 border border-blue-500" : "bg-gray-800 border border-gray-700/50"
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">{entry.name}</span>
              {getStatusBadge(entry.status, index === currentIndex)}
            </div>
            <p className="text-xs text-gray-400 truncate">{entry.text}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(entry.id)}
            disabled={isProcessing}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      ))}
    </div>
  )
}
