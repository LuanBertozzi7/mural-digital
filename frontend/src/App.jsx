import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Feed from './pages/Feed'
import Submit from './pages/Submit'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/submit" element={<Submit />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
