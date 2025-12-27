import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Nav(){
  const [open, setOpen] = useState(false)
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    userEmail: localStorage.getItem('userEmail')
  })

  useEffect(()=>{
    function handleAuthChange(){
      setAuth({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        userEmail: localStorage.getItem('userEmail')
      })
    }

    window.addEventListener('authChange', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    return ()=>{
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  },[])

  // hide Home link for technicians (and on dashboard)
  const showHome = !(auth.role === 'technician')

  const initials = auth.userEmail ? auth.userEmail.split('@')[0].slice(0,2).toUpperCase() : 'U'

  const navigate = useNavigate()
  function onLogout(){
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userEmail')
    window.dispatchEvent(new Event('authChange'))
    navigate('/')
  }

  return (
    <nav style={{display:'flex',gap:12,padding:12,borderBottom:'1px solid #eee',alignItems:'center'}}>
      {showHome && <Link to="/">Home</Link>}
      {!auth.token && <Link to="/login">Login</Link>}
      {!auth.token && <Link to="/signup">Sign up</Link>}
      {auth.token && auth.role === 'technician' && <Link to="/dashboard">Dashboard</Link>}

      <div style={{marginLeft:'auto',position:'relative',display:'flex',alignItems:'center',gap:8}}>
        {auth.token && (
          <>
            <button aria-label="Profile" onClick={()=>setOpen(v=>!v)} style={{width:36,height:36,borderRadius:18,background:'#ddd',border:'none',cursor:'pointer'}}>
              {initials}
            </button>
            {open && (
              <div style={{position:'absolute',right:0,top:48,background:'#fff',border:'1px solid #eee',padding:12,borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontWeight:600}}>{auth.userEmail}</div>
                <div style={{fontSize:12,color:'#666',marginBottom:8}}>Role: {auth.role}</div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={onLogout} style={{padding:'6px 10px'}}>Logout</button>
                  <Link to="/profile">Profile</Link>
                </div>
              </div>
            )}
          </>
        )}
        {!auth.token && null}
      </div>
    </nav>
  )
}


