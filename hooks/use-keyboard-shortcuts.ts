"use client"

import { useEffect, useCallback, type RefObject } from "react"

type KeyboardShortcut = {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  preventDefault?: boolean
  description: string
  category: string
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  targetRef?: RefObject<HTMLElement>,
  enabled = true,
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey
        const altMatch = !!shortcut.altKey === event.altKey
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey
        const metaMatch = !!shortcut.metaKey === event.metaKey

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.action()
          return
        }
      }
    },
    [shortcuts, enabled],
  )

  useEffect(() => {
    const target = targetRef?.current || document

    target.addEventListener("keydown", handleKeyDown as EventListener)
    return () => {
      target.removeEventListener("keydown", handleKeyDown as EventListener)
    }
  }, [handleKeyDown, targetRef])

  return {
    shortcuts,
  }
}
