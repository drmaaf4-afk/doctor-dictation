'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        window.location.href = '/login'
        return
      }

      setUserEmail(data.user.email || '')
    }

    getUser()

    return () => {
      if (audioURL.startsWith('blob:')) {
        URL.revokeObjectURL(audioURL)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [audioURL])

  function getSupportedMimeType() {
    const types = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
    ]

    for (const type of types) {
      if (
        typeof MediaRecorder !== 'undefined' &&
        MediaRecorder.isTypeSupported(type)
      ) {
        return type
      }
    }

    return ''
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      chunksRef.current = []
      setAudioBlob(null)

      if (audioURL.startsWith('blob:')) {
        URL.revokeObjectURL(audioURL)
      }
      setAudioURL('')

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/mp4'
        const blob = new Blob(chunksRef.current, {
          type: finalMimeType || 'audio/mp4',
        })

        const localUrl = URL.createObjectURL(blob)

        setAudioBlob(blob)
        setAudioURL(localUrl)
        setMessage('Recording stopped')
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setMessage('Recording...')
    } catch (error) {
      setMessage('Microphone access failed')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
  }

  async function uploadAudio() {
    try {
      if (!audioBlob) {
        setMessage('No audio to upload')
        return
      }

      const extension = audioBlob.type.includes('mp4') ? 'mp4' : 'webm'
      const fileName = `recordings/${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type || `audio/${extension}`,
        })

      if (uploadError) {
        setMessage(uploadError.message)
        return
      }

      setMessage('Audio uploaded successfully ✅')
    } catch (error) {
      setMessage('Upload failed')
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'white',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h1>Record Dictation</h1>
        <p>{userEmail}</p>

        {!isRecording ? (
          <button
            onClick={startRecording}
            style={{ width: '100%', padding: 12, marginBottom: 10 }}
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{ width: '100%', padding: 12, marginBottom: 10 }}
          >
            Stop Recording
          </button>
        )}

        {audioURL && (
          <>
            <audio
              controls
              playsInline
              src={audioURL}
              style={{ width: '100%', marginBottom: 10 }}
            />
            <button
              onClick={uploadAudio}
              style={{ width: '100%', padding: 12 }}
            >
              Upload Audio
            </button>
          </>
        )}

        <p style={{ marginTop: 15 }}>{message}</p>
      </div>
    </main>
  )
}
