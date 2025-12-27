import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Signup(){
  const navigate = useNavigate()
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    setError('')
    if(!name || !email || !password){
      setError('Please fill all fields')
      return
    }
    // Placeholder: replace with real signup call
    console.log('Signing up',{name,email})
    alert('Signed up (demo)')
    navigate('/login')
  }

  return (
    <div style={{maxWidth:480,margin:'2rem auto',padding:20,border:'1px solid #eee',borderRadius:8}}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:6}}>Full name</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:6}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',marginBottom:6}}>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" style={{width:'100%',padding:8}} />
        </div>
        {error && <div style={{color:'red',marginBottom:12}}>{error}</div>}
        <button type="submit" style={{padding:'8px 16px'}}>Create account</button>
      </form>
      <p style={{marginTop:12}}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}
