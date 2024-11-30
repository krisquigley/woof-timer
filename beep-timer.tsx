"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"

const BeepTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(5)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isListening, setIsListening] = useState<boolean>(false)
  const [lastWord, setLastWord] = useState<string>("")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const recognitionRef = useRef<any>(null)
  const isAudioInitialized = useRef<boolean>(false)
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const initializeAudio = useCallback(() => {
    if (!isAudioInitialized.current) {
      audioRef.current = new Audio('/woof.mp3')
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (audioRef.current && audioContextRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain()
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
        sourceNodeRef.current.connect(gainNodeRef.current)
        gainNodeRef.current.connect(audioContextRef.current.destination)
        gainNodeRef.current.gain.value = 4.0
        isAudioInitialized.current = true
      }
    }

    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-GB'
        
        recognitionRef.current.onresult = (event: any) => {
          const last = event.results.length - 1
          const text = event.results[last][0].transcript.trim().toUpperCase()
          setLastWord(text)
          console.log(text)
          if (text.includes('HOT POTATO')) {
            startTimer()
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          if (isListening) {
            recognitionRef.current.start()
          }
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [isListening, window])

  const playBeep = useCallback((remainingTime: number) => {
    if (!isAudioInitialized.current) {
      initializeAudio()
    }

    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime)
      
      const volume = Math.min(1, 0.6 + (0.1 * (5 - remainingTime)))
      gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.1)
    }
  }, [initializeAudio])

  const playWoof = useCallback(() => {
    if (!isAudioInitialized.current) {
      initializeAudio()
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }, [initializeAudio])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setTimeLeft(5)
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 1) {
            playBeep(prevTime - 1)
          } else if (prevTime === 1) {
            playWoof()
          }
          return prevTime > 0 ? prevTime - 1 : 0
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      resetTimeoutRef.current = setTimeout(resetTimer, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, playBeep, playWoof, resetTimer])

  const startTimer = () => {
    initializeAudio()
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
    setIsActive(true)
  }

  const toggleListening = () => {
    if (!isListening) {
      recognitionRef.current?.start()
      setIsListening(true)
    } else {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-center">Woof Timer</h1>
        <div className="text-6xl font-bold mb-6 text-center">{timeLeft}</div>
        <div className="flex flex-col items-center space-y-4">
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
          <Button
            onClick={toggleListening}
            className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
          >
            {isListening ? "Stop Listening" : "Start Listening for 'HOT POTATO'"}
          </Button>
          {isListening && (
            <div className="text-sm text-gray-500 mt-2">
              Last heard: {lastWord || "Nothing yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BeepTimer
