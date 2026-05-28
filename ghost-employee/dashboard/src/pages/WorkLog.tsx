import { useState, useEffect, useRef } from 'react'
import WorkLogTable from '@/components/WorkLogTable'
import { getTasks } from '@/services/api'
import type { Task } from '@/types'
import gsap from 'gsap'

export default function WorkLog() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  async function fetchTasks() {
    const data = await getTasks()
    if (data === null) {
      setError(true)
    } else {
      setError(false)
      setTasks(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (loading) return
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
      )
    }
  }, [loading])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        width: '100%',
      }}
    >
      <div>
        <h1 className="page-title">Work Log</h1>
        <p className="page-subtitle">Full history of all ghost tasks — click any row to expand</p>
        <hr className="page-divider" />
      </div>

      {error && !loading && (
        <div className="banner-error">
          ⚠ Failed to load — retrying in 10s
        </div>
      )}

      <WorkLogTable tasks={tasks} loading={loading} />
    </div>
  )
}
