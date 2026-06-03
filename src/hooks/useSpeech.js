import { useState, useRef, useCallback, useEffect } from 'react'

const NO_SPEECH_MS = 15000

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function useSpeech({ onFinalTranscript } = {}) {
  const SpeechRecognition = getSpeechRecognition()
  const supported = Boolean(SpeechRecognition)

  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')

  const recognitionRef = useRef(null)
  const noSpeechTimerRef = useRef(null)
  const hasSpokenRef = useRef(false)
  const transcriptRef = useRef('')
  const onFinalRef = useRef(onFinalTranscript)

  useEffect(() => {
    onFinalRef.current = onFinalTranscript
  }, [onFinalTranscript])

  const clearNoSpeechTimer = useCallback(() => {
    if (noSpeechTimerRef.current) {
      clearTimeout(noSpeechTimerRef.current)
      noSpeechTimerRef.current = null
    }
  }, [])

  const teardownRecognition = useCallback(() => {
    clearNoSpeechTimer()
    const recognition = recognitionRef.current
    recognitionRef.current = null
    if (!recognition) return

    try {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.stop()
    } catch {
      try {
        recognition.abort()
      } catch {
        /* ignore */
      }
    }
  }, [clearNoSpeechTimer])

  const finishListening = useCallback(() => {
    teardownRecognition()
    setIsListening(false)
  }, [teardownRecognition])

  const armNoSpeechTimer = useCallback(() => {
    clearNoSpeechTimer()
    noSpeechTimerRef.current = setTimeout(() => {
      if (!hasSpokenRef.current) {
        setError('No speech detected. Try speaking clearly, then tap the mic to stop.')
        finishListening()
      }
    }, NO_SPEECH_MS)
  }, [clearNoSpeechTimer, finishListening])

  useEffect(() => {
    return () => {
      teardownRecognition()
    }
  }, [teardownRecognition])

  const start = useCallback(() => {
    setError('')
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Use Chrome or Edge on desktop.')
      return false
    }
    if (isListening) {
      try {
        recognitionRef.current?.stop()
      } catch {
        finishListening()
      }
      return false
    }

    if (!window.isSecureContext) {
      setError('Voice input requires HTTPS or localhost.')
      return false
    }

    hasSpokenRef.current = false
    transcriptRef.current = ''
    setTranscript('')

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      armNoSpeechTimer()
    }

    recognition.onresult = (event) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      transcriptRef.current = text
      setTranscript(text)

      const last = event.results[event.results.length - 1]
      if (last?.isFinal && text.trim()) {
        hasSpokenRef.current = true
        clearNoSpeechTimer()
      } else if (text.trim()) {
        hasSpokenRef.current = true
        clearNoSpeechTimer()
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Allow mic access in browser settings.')
      } else if (event.error === 'network') {
        setError('Voice needs an internet connection in this browser.')
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError('Voice input failed. Try again.')
      }
      teardownRecognition()
      setIsListening(false)
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setIsListening(false)
      clearNoSpeechTimer()

      if (hasSpokenRef.current) {
        const finalText = transcriptRef.current.trim()
        if (finalText && onFinalRef.current) {
          onFinalRef.current(finalText)
        }
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      return true
    } catch {
      setError('Could not start voice input. Try again.')
      teardownRecognition()
      setIsListening(false)
      return false
    }
  }, [
    SpeechRecognition,
    isListening,
    finishListening,
    armNoSpeechTimer,
    teardownRecognition,
  ])

  const stop = useCallback(() => {
    if (!recognitionRef.current) {
      setIsListening(false)
      return
    }
    try {
      recognitionRef.current.stop()
    } catch {
      finishListening()
    }
  }, [finishListening])

  const reset = useCallback(() => {
    transcriptRef.current = ''
    setTranscript('')
    setError('')
    hasSpokenRef.current = false
  }, [])

  return {
    transcript,
    isListening,
    supported,
    error,
    start,
    stop,
    reset,
  }
}
