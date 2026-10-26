// Central API layer — all backend communication lives here.
// Next.js rewrites proxy forwards /api/v1/* → http://localhost:3000/api/v1/*
// This avoids CORS and port conflicts entirely.

const BASE = "/api/v1"

// ─── Token storage ────────────────────────────────────────────────────────────

export function saveToken(token: string, user: { id: number; username: string; fullname: string }) {
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearToken() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export function getToken(): string | null {
  return localStorage.getItem("token")
}

export function getStoredUser(): { id: number; username: string; fullname: string } | null {
  const raw = localStorage.getItem("user")
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

// ─── Auth headers ─────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getToken()
  if (!token) throw new Error("Not authenticated")
  return { "Content-Type": "application/json", token }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiSignIn(username: string, password: string) {
  const res = await fetch(`${BASE}/user/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Sign in failed")
  // Response: { message, User: { id, username, fullname, ... }, token }
  return data as { token: string; User: { id: number; username: string; fullname: string } }
}

export async function apiSignUp(fullname: string, username: string, password: string) {
  const res = await fetch(`${BASE}/user/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullname, username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Sign up failed")
  return data as { message: string; response: { id: number; username: string; fullname: string } }
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export interface ApiTodo {
  id: number
  title: string
  description: string | null
  done: boolean
  createdAt: string
  userId: number
}

export async function apiGetTodos(): Promise<ApiTodo[]> {
  const res = await fetch(`${BASE}/todos`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Failed to fetch todos")
  return data.response as ApiTodo[]
}

export async function apiCreateTodo(title: string, description?: string): Promise<ApiTodo> {
  const body: Record<string, string> = { title }
  if (description) body.description = description
  const res = await fetch(`${BASE}/todos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Failed to create todo")
  return data.response as ApiTodo
}

export async function apiUpdateTodoStatus(id: number, done: boolean): Promise<ApiTodo> {
  const res = await fetch(`${BASE}/todos/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ done }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Failed to update todo")
  return data.response as ApiTodo
}

export async function apiEditTodo(id: number, title: string, description: string | null): Promise<ApiTodo> {
  const res = await fetch(`${BASE}/todos/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ title, description }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Failed to edit todo")
  return data.response as ApiTodo
}

export async function apiDeleteTodo(id: number): Promise<void> {
  const res = await fetch(`${BASE}/todos/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || "Failed to delete todo")
  }
}
