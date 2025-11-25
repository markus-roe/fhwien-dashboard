'use client'

import { Course } from '@/data/mockData'
import { Checkbox } from '../ui/Checkbox'

interface Task {
  id: string
  title: string
  dueDate: string
  completed?: boolean
  course: Course
}

interface TasksWidgetProps {
  tasks: Task[]
  onTaskToggle?: (taskId: string) => void
}

export const TasksWidget = ({ tasks, onTaskToggle }: TasksWidgetProps) => {
  const pendingCount = tasks.filter((t) => !t.completed).length

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-900">Aufgaben</h3>
        {pendingCount > 0 && (
          <span className="bg-zinc-100 text-zinc-600 text-[10px] px-1.5 py-0.5 rounded font-medium border border-zinc-200">
            {pendingCount} Offen
          </span>
        )}
      </div>
      <div className="space-y-0">
        {tasks.map((task, index) => (
          <div key={task.id}>
            <label className="flex items-start gap-3 cursor-pointer group py-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onTaskToggle?.(task.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                  {task.title}
                  </p>
                {task.course && (
                  <p className="text-[10px] mt-0.5 font-medium text-zinc-500 truncate">
                    {task.course.title}
                  </p>
                )}
                <p
                  className="text-[10px] mt-0.5 font-medium text-zinc-500"
                >
                  {task.dueDate}
                </p>
              </div>
            </label>
            {index < tasks.length - 1 && (
              <div className="border-t border-zinc-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

