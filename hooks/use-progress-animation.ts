"use client"

import { useEffect, useState, useRef } from "react"

interface UseProgressAnimationOptions {
  isActive: boolean
  duration?: number
  maxProgress?: number
  increment?: number
}

/**
 * SSR-sicherer Hook für deterministische Progress-Animation
 * Vermeidet Math.random() und andere nicht-deterministische Werte
 */
export function useProgressAnimation({
  isActive,
  duration = 200,
  maxProgress = 90,
  increment = 5
}: UseProgressAnimationOptions) {
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const stepRef = useRef(0)

  useEffect(() => {
    if (isActive) {
      setProgress(0)
      stepRef.current = 0
      
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= maxProgress) return prev
          
          // Deterministische Progression basierend auf Schritten
          stepRef.current += 1
          const baseIncrement = increment
          const variableIncrement = (stepRef.current % 3) * 2 // Deterministische Variation
          
          return Math.min(prev + baseIncrement + variableIncrement, maxProgress)
        })
      }, duration)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    } else {
      // Animation beenden
      setProgress(100)
      const timeout = setTimeout(() => setProgress(0), 1000)
      return () => clearTimeout(timeout)
    }
  }, [isActive, duration, maxProgress, increment])

  return progress
}
