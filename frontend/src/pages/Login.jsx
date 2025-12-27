import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill both fields')
      return
    }
    // Placeholder: replace with real auth call
    console.log('Logging in', { email })
    alert('Logged in (demo)')
    navigate('/')
  }

  return (
    <div style={{maxWidth:480,margin:'2rem auto',padding:20,border:'1px solid #eee',borderRadius:8}}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:6}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:6}}>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" style={{width:'100%',padding:8}} />
        </div>
        {error && <div style={{color:'red',marginBottom:12}}>{error}</div>}
        <button type="submit" style={{padding:'8px 16px'}}>Sign in</button>
      </form>
      <p style={{marginTop:12}}>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  )
}
