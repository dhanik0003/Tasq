"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DynamicIslandTodo from "@/components/DynamicIslandTodo"
import { useTheme } from "@/components/ThemeProvider"
import { LogOut, Sun, Moon } from "lucide-react"
import { getStoredUser, clearToken, isLoggedIn } from "@/lib/api"

function getInitials(name: string): string {
  if (!name) return "U"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "U"
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TodosPage() {
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const dark = theme === "dark"
  const [displayName, setDisplayName] = useState("User")

  // Auth guard — redirect to sign-in if no token
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/sign-in")
      return
    }
    const u = getStoredUser()
    if (u) setDisplayName(u.fullname || u.username)
  }, [router])

  const handleSignOut = () => {
    clearToken()
    router.push("/sign-in")
  }

  // Glass pill style shared by both pills
  const glassPill = (overrides?: React.CSSProperties): React.CSSProperties => ({
    borderRadius: 74,
    background: dark
      ? "rgba(255, 255, 255, 0.06)"
      : "rgba(255, 255, 255, 0.45)",
    backdropFilter: dark
      ? "blur(24px) saturate(180%) brightness(0.9)"
      : "blur(24px) saturate(160%) brightness(1.05)",
    WebkitBackdropFilter: dark
      ? "blur(24px) saturate(180%) brightness(0.9)"
      : "blur(24px) saturate(160%) brightness(1.05)",
    border: dark
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : "1px solid rgba(100, 100, 180, 0.2)",
    boxShadow: dark
      ? "0 4px 24px rgba(0, 0, 0, 0.3)"
      : "0 4px 24px rgba(80, 80, 200, 0.12)",
    transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s",
    ...overrides,
  })

  const textPrimary = dark ? "rgba(255,255,255,0.85)" : "rgba(20,20,60,0.9)"
  const textSecondary = dark ? "rgba(255,255,255,0.4)" : "rgba(20,20,60,0.4)"
  const iconBg = dark ? "rgba(255,255,255,0.10)" : "rgba(80,80,200,0.10)"
  const iconRing = dark ? "rgba(255,255,255,0.15)" : "rgba(80,80,200,0.2)"

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      <DynamicIslandTodo />

      {/* Profile pill — top right */}
      <div className="pointer-events-none fixed top-4 right-4 z-50">
        <div
          className="pointer-events-auto flex items-center gap-3 px-3"
          style={{ width: 240, height: 52, ...glassPill() }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: iconBg, boxShadow: `0 0 0 1px ${iconRing}`, color: textPrimary }}
          >
            {getInitials(displayName)}
          </div>
          <span
            className="truncate text-sm font-medium drop-shadow-sm"
            style={{ color: textPrimary }}
          >
            {displayName}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: textSecondary }}
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Theme toggle — top left */}
      <div className="pointer-events-none fixed top-4 left-4 z-50">
        <div
          className="pointer-events-auto flex items-center gap-2 px-2.5"
          style={{ height: 44, ...glassPill() }}
        >
          {/* Sun */}
          <Sun
            aria-hidden="true"
            style={{
              width: 15, height: 15, flexShrink: 0,
              color: dark ? textSecondary : textPrimary,
              transition: "color 0.3s",
            }}
          />

          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            aria-label="Toggle dark mode"
            onClick={toggle}
            className="relative shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              background: dark ? "rgba(255,255,255,0.18)" : "rgba(80,80,200,0.2)",
              border: dark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(80,80,200,0.25)",
              transition: "background 0.3s, border-color 0.3s",
            }}
          >
            <span
              className="absolute top-[2px] flex items-center justify-center rounded-full bg-white transition-all duration-300"
              style={{
                width: 16,
                height: 16,
                left: dark ? "calc(100% - 18px)" : "2px",
                transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
              }}
            />
          </button>

          {/* Moon */}
          <Moon
            aria-hidden="true"
            style={{
              width: 14, height: 14, flexShrink: 0,
              color: dark ? textPrimary : textSecondary,
              transition: "color 0.3s",
            }}
          />
        </div>
      </div>
    </main>
  )
}
