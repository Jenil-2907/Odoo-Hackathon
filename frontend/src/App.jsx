import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from "./pages/home.jsx";
import Login from './pages/Login'
import Signup from './pages/Signup'


export default function App(){
  return (
    <BrowserRouter>
      <nav style={{display:'flex',gap:12,padding:12,borderBottom:'1px solid #eee'}}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign up</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
      </Routes>
    </BrowserRouter>
  )
}
