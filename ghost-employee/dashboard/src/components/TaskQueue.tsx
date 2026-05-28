import { useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import gsap from 'gsap'
import { timeAgo } from '@/lib/utils'
import type { Task } from '@/types'

interface TaskQueueProps {
  tasks: Task[]
  onReorder: (tasks: Task[]) => void
}

interface SortableItemProps {
  task: Task
  index: number
  total: number
}

function SortableItem({ task, index, total }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        background: isDragging ? 'var(--accent-dim)' : 'transparent',
      }}
    >
      {/* Number badge */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          minWidth: 36,
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          borderRadius: 4,
          padding: '2px 8px',
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        {index === 0
          ? 'TOP'
          : index === total - 1
          ? 'END'
          : `#${String(index + 1).padStart(2, '0')}`}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {task.request}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
            {task.channel}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {timeAgo(task.created_at)}
          </span>
        </div>
      </div>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          padding: '2px 4px',
          borderRadius: 4,
          transition: 'color 120ms ease',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
      >
        <GripVertical size={13} />
      </div>
    </div>
  )
}

export default function TaskQueue({ tasks, onReorder }: TaskQueueProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (!containerRef.current) return
    const items = containerRef.current.querySelectorAll('[data-task-item]')
    gsap.from(items, { y: 12, opacity: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' })
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === over.id)
      onReorder(arrayMove(tasks, oldIndex, newIndex))
    }
  }

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          Task Queue
        </span>
        <span
          style={{
            marginLeft: 2,
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* List */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflowY: 'auto' }}
      >
        {tasks.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontStyle: 'italic',
            }}
          >
            Queue is empty ✓
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task, idx) => (
                <div key={task.id} data-task-item>
                  <SortableItem task={task} index={idx} total={tasks.length} />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
