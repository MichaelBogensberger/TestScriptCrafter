"use client"

import { useEffect, useState } from "react"

/**
 * Hook um sicherzustellen, dass Code nur auf dem Client ausgeführt wird
 * Verhindert Hydration-Mismatches bei Browser-APIs
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Wrapper für Browser-APIs die nur auf dem Client verfügbar sind
 */
export const clientOnly = {
  clipboard: {
    writeText: (text: string): Promise<void> => {
      if (typeof window === 'undefined' || !navigator?.clipboard) {
        return Promise.reject(new Error('Clipboard API nicht verfügbar'))
      }
      return navigator.clipboard.writeText(text)
    }
  },
  
  download: {
    file: (content: string, filename: string, mimeType: string = 'text/plain'): void => {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('Download API nicht verfügbar (SSR)')
        return
      }
      
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      
      setTimeout(() => {
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
      }, 100)
    }
  }
}
