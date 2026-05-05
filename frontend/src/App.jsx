import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import TopProgress, { initProgress } from './components/TopProgress'
import Header from './components/Header'
import Feed from './pages/Feed'
import Submit from './pages/Submit'
import Login from './pages/Login'
import Register from './pages/Register'
import MyPosts from './pages/MyPosts'
import AdminPanel from './pages/AdminPanel'
import Profile from './pages/Profile'
import PostDetail from './pages/PostDetail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

initProgress()

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <TopProgress />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/me/posts" element={<MyPosts />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/me/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>
      </ToastProvider>
    </BrowserRouter>
  )
}
