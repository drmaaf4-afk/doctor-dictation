'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Login successful ✅')

      window.location.href = '/dashboard'
    }
  }

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created ✅')
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
          padding: 30,
          borderRadius: 12,
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          width: 320,
          background: 'white',
        }}
      >
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <button
          onClick={handleLogin}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        >
          Login
        </button>

        <button
          onClick={handleSignup}
          style={{ width: '100%', padding: 8 }}
        >
          Sign Up
        </button>

        <p style={{ marginTop: 12 }}>{message}</p>
      </div>
    </main>
  )
}
