'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [message, setMessage] = useState('Checking Supabase...')

  useEffect(() => {
    async function test() {
      const { error } = await supabase.auth.getSession()

      if (error) {
        setMessage('Supabase error ❌')
      } else {
        setMessage('Supabase connected successfully ✅')
      }
    }

    test()
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial',
      }}
    >
      <div
        style={{
          padding: 30,
          borderRadius: 12,
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h1>Doctor Dictation System</h1>
        <p>{message}</p>
      </div>
    </main>
  )
}
