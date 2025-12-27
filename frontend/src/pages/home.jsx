import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  useEffect(()=>{
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (token && role === 'technician') {
      navigate('/dashboard')
    }
  },[navigate])

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome 👋</h1>
      <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:20}}>
        <Link to="/login" style={styles.button}>Login</Link>
        <Link to="/signup" style={{...styles.button,background:'#eee'}}>Sign up</Link>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "4rem auto",
    padding: "2rem",
    textAlign: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: "10px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
  text: {
    fontSize: "1.1rem",
    color: "#444",
  },
  subText: {
    marginTop: "0.5rem",
    color: "#666",
  },
};

export default Home;
