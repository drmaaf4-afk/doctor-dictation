'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

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
  }, [])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
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
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setMessage('Recording stopped')
    }
  }

  async function uploadAudio() {
    try {
      if (!audioURL || chunksRef.current.length === 0) {
        setMessage('No audio to upload')
        return
      }

      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const fileName = `recordings/${Date.now()}.webm`

      const { error } = await supabase.storage
        .from('audio-files')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
        })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Audio uploaded successfully ✅')
      }
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
      }}
    >
      <div
        style={{
          width: 360,
          background: 'white',
          padding: 30,
          borderRadius: 12,
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h1>Record Dictation</h1>
        <p>{userEmail}</p>

        {!isRecording ? (
          <button onClick={startRecording} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={{ width: '100%', padding: 10, marginBottom: 10 }}>
            Stop Recording
          </button>
        )}

        {audioURL && (
          <>
            <audio controls src={audioURL} style={{ width: '100%', marginBottom: 10 }} />
            <button onClick={uploadAudio} style={{ width: '100%', padding: 10 }}>
              Upload Audio
            </button>
          </>
        )}

        <p style={{ marginTop: 15 }}>{message}</p>
      </div>
    </main>
  )
}
