"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlignLeft, Check, Pencil, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import TodoListPanel, { type Todo } from "@/components/TodoListPanel"
import { useTheme } from "@/components/ThemeProvider"
import {
  apiGetTodos,
  apiCreateTodo,
  apiEditTodo,
  apiUpdateTodoStatus,
  apiDeleteTodo,
  type ApiTodo,
} from "@/lib/api"

// Map API shape → local shape
function fromApi(t: ApiTodo): Todo {
  return { id: t.id, text: t.title, description: t.description ?? "", completed: t.done }
}

const snappyTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 1,
}

export default function DynamicIslandTodo() {
  const { theme } = useTheme()
  const dark = theme === "dark"

  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [apiError, setApiError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Load todos on mount
  useEffect(() => {
    apiGetTodos()
      .then(todos => setTodos(todos.map(fromApi)))
      .catch(() => {}) // user may not be logged in yet
  }, [])

  const resetForm = () => {
    setNewTodo("")
    setNewDescription("")
    setEditingId(null)
    setApiError("")
  }

  const submitTodo = async () => {
    const text = newTodo.trim()
    if (text === "") return
    const description = newDescription.trim()
    setApiError("")
    try {
      if (editingId !== null) {
        const updated = await apiEditTodo(editingId, text, description || null)
        setTodos(todos.map(t => t.id === editingId ? fromApi(updated) : t))
      } else {
        const created = await apiCreateTodo(text, description || undefined)
        setTodos([...todos, fromApi(created)])
      }
      resetForm()
      inputRef.current?.focus()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to save todo")
    }
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setNewTodo(todo.text)
    setNewDescription(todo.description)
    setIsExpanded(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const cancelEditing = () => {
    resetForm()
    inputRef.current?.focus()
  }

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    try {
      const updated = await apiUpdateTodoStatus(id, !todo.completed)
      setTodos(todos.map(t => t.id === id ? fromApi(updated) : t))
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to update todo")
    }
  }

  const removeTodo = async (id: number) => {
    try {
      await apiDeleteTodo(id)
      setTodos(todos.filter(t => t.id !== id))
      if (editingId === id) resetForm()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to delete todo")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submitTodo()
    } else if (e.key === "Escape" && editingId !== null) {
      e.preventDefault()
      cancelEditing()
    }
  }

  const isEditing = editingId !== null

  const completedTodos = todos.filter((todo) => todo.completed).length
  const remainingTodos = todos.length - completedTodos

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isExpanded && !target.closest(".dynamic-island-todo") && !target.closest(".todo-list-panel")) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row items-center justify-center gap-4 p-4 pointer-events-none">
    <motion.div
      className="dynamic-island-todo pointer-events-auto shrink-0"
      layout="position"
      initial={false}
      animate={{
        width: isExpanded ? "var(--di-expanded-width)" : "var(--di-collapsed-width)",
        height: isExpanded ? "auto" : "var(--di-collapsed-height)",
        borderRadius: isExpanded ? "var(--di-expanded-radius)" : "var(--di-border-radius)",
      }}
      transition={{
        ...snappyTransition,
        borderRadius: { duration: 0.08 },
      }}
    >
      <motion.div
        className={`${dark ? "bg-black border-gray-800 text-white" : "bg-white/80 border-gray-200 text-gray-900"} h-full cursor-pointer overflow-hidden rounded-[inherit] border backdrop-blur-sm`}
        onClick={() => !isExpanded && setIsExpanded(true)}
        layout
        transition={snappyTransition}
      >
        {!isExpanded && (
          <motion.div className="p-2 flex items-center justify-between h-full" layout>
            <span className="font-semibold">To-do List</span>
            <div className="flex items-center space-x-2 h-full">
              {remainingTodos > 0 && (
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 min-w-[24px] flex items-center justify-center text-xs font-medium">
                  {remainingTodos}
                </span>
              )}
              {completedTodos > 0 && (
                <span className={`${dark ? "bg-gray-600" : "bg-gray-300 text-gray-700"} rounded-full w-6 h-6 min-w-[24px] flex items-center justify-center text-xs font-medium`}>
                  {completedTodos}
                </span>
              )}
            </div>
          </motion.div>
        )}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ ...snappyTransition, opacity: { duration: 0.1 } }}
              className="p-4 pb-2"
            >
              {isEditing && (
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-blue-400 font-medium">Editing todo</span>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className={`${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {apiError && (
                <p className="mb-2 text-xs text-red-400">{apiError}</p>
              )}
              <div className="flex mb-2 items-center">
                <div className="flex-grow relative mr-2">
                  <Input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isEditing ? "Todo title" : "Add a new todo"}
                    className={`w-full h-10 pl-10 rounded-lg focus:ring-0 focus:ring-offset-0 ${
                      dark
                        ? "bg-[#111111] border-[#222222] text-gray-200 placeholder:text-gray-500 focus:border-[#333333]"
                        : "bg-gray-100 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-gray-300"
                    }`}
                    ref={inputRef}
                    aria-label="New todo input"
                  />
                  <Pencil className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${dark ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <Button
                  onClick={submitTodo}
                  className={`h-10 px-3 rounded-lg border ${
                    dark
                      ? "bg-[#111111] hover:bg-[#222222] text-gray-400 hover:text-gray-200 border-[#222222]"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 border-gray-200"
                  }`}
                >
                  {isEditing ? <Check size={16} /> : <Plus size={16} />}
                  <span className="sr-only">{isEditing ? "Save changes" : "Add todo"}</span>
                </Button>
              </div>
              <div className="relative mb-2">
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Description (optional)"
                  rows={2}
                  className={`w-full min-h-0 resize-none text-sm pl-10 py-2 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    dark
                      ? "bg-[#111111] border-[#222222] text-gray-300 placeholder:text-gray-500 focus-visible:border-[#333333]"
                      : "bg-gray-100 border-gray-200 text-gray-700 placeholder:text-gray-400 focus-visible:border-gray-300"
                  }`}
                  aria-label="New todo description"
                />
                <AlignLeft className={`absolute left-3 top-3 h-4 w-4 ${dark ? "text-gray-500" : "text-gray-400"}`} aria-hidden="true" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
    <AnimatePresence>
      {todos.length > 0 && (
        <TodoListPanel
          key="todo-list-panel"
          todos={todos}
          editingId={editingId}
          onToggle={toggleTodo}
          onRemove={removeTodo}
          onEdit={startEditing}
        />
      )}
    </AnimatePresence>
    </div>
  )
}

