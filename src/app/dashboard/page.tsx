'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{textAlign:'center', marginTop:'100px'}}>
      <h1>Dashboard</h1>

      {user && (
        <>
          <p>Logged in as:</p>
          <h3>{user.email}</h3>
        </>
      )}

      <button onClick={logout} style={{marginTop:'20px'}}>
        Logout
      </button>
    </div>
  )
}
