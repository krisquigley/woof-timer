"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"

const BeepTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(5)
  const [isActive, setIsActive] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/woof.mp3')
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
  }, [])

  const playBeep = useCallback(() => {
    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime)
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.1)
    }
  }, [])

  const playWoof = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 1) {
            playBeep()
          } else if (prevTime === 1) {
            playWoof()
          }
          return prevTime > 0 ? prevTime - 1 : 0
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, playBeep, playWoof])

  const startTimer = () => {
    setIsActive(true)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(5)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-center">Woof Timer</h1>
        <div className="text-6xl font-bold mb-6 text-center">{timeLeft}</div>
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={startTimer} 
            disabled={isActive || timeLeft === 0}
          >
            Start
          </Button>
          <Button 
            onClick={resetTimer} 
            disabled={isActive || timeLeft === 5}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BeepTimer
