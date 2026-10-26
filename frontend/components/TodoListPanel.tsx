"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, RotateCcw, X, ListTodo, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/ThemeProvider"

export interface Todo {
  id: number
  text: string
  description: string
  completed: boolean
}

const snappyTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 1,
}

const LONG_DESCRIPTION_LENGTH = 90

interface TodoListPanelProps {
  todos: Todo[]
  editingId: number | null
  onToggle: (id: number) => void
  onRemove: (id: number) => void
  onEdit: (todo: Todo) => void
}

export default function TodoListPanel({ todos, editingId, onToggle, onRemove, onEdit }: TodoListPanelProps) {
  const { theme } = useTheme()
  const dark = theme === "dark"
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })
  const completedCount = todos.filter((todo) => todo.completed).length
  const remainingCount = todos.length - completedCount

  return (
    <motion.aside
      aria-label="Todos"
      className="todo-list-panel pointer-events-auto w-full max-w-sm md:w-80 shrink-0"
      layout="position"
      initial={{ opacity: 0, scale: 0.85, x: -24 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.85, x: -24 }}
      transition={snappyTransition}
    >
      <div className={`${dark ? "bg-black border-gray-800 text-white shadow-[0_2px_10px_rgba(255,255,255,0.1)]" : "bg-white/80 border-gray-200 text-gray-900 shadow-[0_2px_20px_rgba(80,80,200,0.1)] backdrop-blur-sm"} border rounded-3xl p-4`}>
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListTodo className={`h-4 w-4 ${dark ? "text-gray-400" : "text-gray-500"}`} aria-hidden="true" />
            <h2 className="font-semibold text-sm">Todos</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-blue-500 text-white rounded-full px-2 h-6 flex items-center font-medium">
              {remainingCount} left
            </span>
            <span className={`${dark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-600"} rounded-full px-2 h-6 flex items-center font-medium`}>
              {completedCount} done
            </span>
          </div>
        </header>
        <Separator className={`${dark ? "bg-[#222222]" : "bg-gray-200"} mb-3`} />
        <ul className="flex flex-col max-h-[40vh] md:max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1 [color-scheme:dark] [scrollbar-width:thin] [scrollbar-color:#333333_transparent]">
          <AnimatePresence initial={false}>
            {sortedTodos.map((todo) => {
              const isLong = todo.description.length > LONG_DESCRIPTION_LENGTH || todo.description.includes("\n")
              const isDescriptionExpanded = expandedIds.has(todo.id)
              const isEditing = editingId === todo.id

              return (
                <motion.li
                  key={todo.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={snappyTransition}
                  className="overflow-hidden"
                  layout="position"
                >
                  <div
                    className={`flex items-start justify-between gap-2 my-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                      isEditing ? `${dark ? "bg-[#111111]" : "bg-blue-50"} ring-1 ring-blue-500/40` : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0 pt-1">
                      <button
                        type="button"
                        onClick={() => onToggle(todo.id)}
                        className={`block w-full text-left text-sm font-medium leading-snug [overflow-wrap:anywhere] ${
                          todo.completed
                            ? `${dark ? "text-gray-500" : "text-gray-400"} line-through decoration-gray-400`
                            : "text-blue-400"
                        }`}
                      >
                        {todo.text}
                      </button>
                      {todo.description && (
                        <>
                          <p
                            className={`mt-1 text-xs leading-relaxed whitespace-pre-line [overflow-wrap:anywhere] ${
                              todo.completed
                                ? dark ? "text-gray-600" : "text-gray-400"
                                : dark ? "text-gray-400" : "text-gray-500"
                            } ${isDescriptionExpanded ? "" : "line-clamp-2"}`}
                          >
                            {todo.description}
                          </p>
                          {isLong && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(todo.id)}
                              className={`mt-0.5 text-[11px] font-medium ${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} transition-colors`}
                              aria-expanded={isDescriptionExpanded}
                            >
                              {isDescriptionExpanded ? "Show less" : "Show more"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <div className={`flex items-center ${dark ? "bg-[#111111] border-[#222222]" : "bg-gray-100 border-gray-200"} rounded-md border shrink-0`}>
                      <Button
                        onClick={() => onEdit(todo)}
                        size="sm"
                        variant="ghost"
                        className={`h-8 w-8 p-0 ${dark ? "text-gray-400 hover:text-gray-200 hover:bg-[#222222]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"} rounded-none rounded-l-md`}
                        aria-label={`Edit "${todo.text}"`}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Separator orientation="vertical" className={`h-4 ${dark ? "bg-[#222222]" : "bg-gray-200"}`} />
                      <Button
                        onClick={() => onToggle(todo.id)}
                        size="sm"
                        variant="ghost"
                        className={`h-8 w-8 p-0 ${dark ? "text-gray-400 hover:text-gray-200 hover:bg-[#222222]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"} rounded-none`}
                        aria-label={`${todo.completed ? "Revert" : "Complete"} "${todo.text}"`}
                      >
                        {todo.completed ? <RotateCcw size={13} /> : <Check size={13} />}
                      </Button>
                      <Separator orientation="vertical" className={`h-4 ${dark ? "bg-[#222222]" : "bg-gray-200"}`} />
                      <Button
                        onClick={() => onRemove(todo.id)}
                        size="sm"
                        variant="ghost"
                        className={`h-8 w-8 p-0 ${dark ? "text-gray-400 hover:text-gray-200 hover:bg-[#222222]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"} rounded-none rounded-r-md`}
                        aria-label={`Remove "${todo.text}" from the list`}
                      >
                        <X size={13} />
                      </Button>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </div>
    </motion.aside>
  )
}
