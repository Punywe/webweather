import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/dashbroad";
import Overall from "./pages/overall";
import AddNode from "./pages/addnode";
import DetailHour from "./pages/DetailHour";
import AboutUs from "./pages/about_us";
import { ThemeToggle } from "./components/ThemeToggle";
import Lenis from 'lenis'
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,        // ความเร็ว (สูง = ช้าลง)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easing curve
      smooth: true,
      mouseMultiplier: 1,   // sensitivity ของ mouse wheel
      touchMultiplier: 2,   // sensitivity ของ touch
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/overall" element={<Overall />} />
        <Route path="/addnode" element={<AddNode />} />
        <Route path="/detail-hour/:node" element={<DetailHour />} />
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
      <ThemeToggle />
    </BrowserRouter>
  )
}

export default App

