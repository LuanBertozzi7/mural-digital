import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Feed from './pages/Feed'
import Submit from './pages/Submit'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
