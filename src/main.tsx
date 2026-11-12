import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Library from './pages/Library'
import PerfumePage from './pages/PerfumePage'
import Quiz from './pages/Quiz'
import './styles/base.css'

function ScrollReset() {
  const { pathname } = useLocation()
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <ScrollReset />
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="/perfume/:id" element={<PerfumePage />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="*" element={<Library />} />
    </Routes>
  </BrowserRouter>,
)
