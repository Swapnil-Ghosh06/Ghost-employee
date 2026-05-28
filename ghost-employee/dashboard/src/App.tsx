import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lenis from 'lenis'
import Navbar from '@/components/Navbar'
import CommandPalette from '@/components/CommandPalette'
import Dashboard from '@/pages/Dashboard'
import WorkLog from '@/pages/WorkLog'
import CostTracker from '@/pages/CostTracker'
import Config from '@/pages/Config'
import Settings from '@/pages/Settings'

import { GooeyFilter } from '@/components/ui/gooey-filter'
import { PixelTrail } from '@/components/ui/pixel-trail'

// Import Lenis CSS
import 'lenis/dist/lenis.css'

export default function App() {
  const [cmdOpen, setCmdOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCmdOpen((o) => !o)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <BrowserRouter>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: 'var(--bg-base)',
          position: 'relative',
        }}
      >
        {/* Ambient Glassmorphic Background Blobs */}
        <div className="ambient-glow-wrapper">
          <div className="ambient-blob-1" />
          <div className="ambient-blob-2" />
        </div>
        {/* Gooey Pixel Trail — behind all content */}
        <GooeyFilter id="gooey-pixel-trail" strength={4} />
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ filter: 'url(#gooey-pixel-trail)' }}
        >
          <PixelTrail
            pixelSize={28}
            fadeDuration={600}
            delay={0}
            pixelClassName="bg-[#561C24] opacity-20 rounded-sm"
          />
        </div>

        {/* Fixed Horizontal Top Navbar */}
        <Navbar onOpenCmd={() => setCmdOpen(true)} />

        {/* Centered Main Content Area */}
        <main
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 1360,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 40px 60px',
            paddingTop: '112px', // offset to clear 72px navbar perfectly
            boxSizing: 'border-box',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/worklog" element={<WorkLog />} />
            <Route path="/cost" element={<CostTracker />} />
            <Route path="/config" element={<Config />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      </div>
    </BrowserRouter>
  )
}

