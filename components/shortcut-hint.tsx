import { cn } from "@/lib/utils"

interface ShortcutHintProps {
  keys: string[]
  className?: string
}

export function ShortcutHint({ keys, className }: ShortcutHintProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-200 rounded shadow-sm"
        >
          {key}
        </kbd>
      ))}
    </div>
  )
}
