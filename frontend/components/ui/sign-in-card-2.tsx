"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Mail, Lock, Eye, EyeClosed, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { apiSignIn, saveToken } from "@/lib/api"

type FocusedField = "username" | "password" | null

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  )
}

const beamTransition = (delay: number) => ({
  duration: 2.5,
  ease: "easeInOut" as const,
  repeat: Number.POSITIVE_INFINITY,
  repeatDelay: 1,
  delay,
})

function LightBeams() {
  return (
    <div className="pointer-events-none absolute -inset-px overflow-hidden rounded-2xl" aria-hidden="true">
      <motion.div className="absolute top-0 left-0 h-px w-1/2 bg-gradient-to-r from-transparent via-white to-transparent" animate={{ left: ["-50%", "100%"], opacity: [0.25, 0.65, 0.25] }} transition={{ left: beamTransition(0), opacity: { duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" } }} />
      <motion.div className="absolute top-0 right-0 h-1/2 w-px bg-gradient-to-b from-transparent via-white to-transparent" animate={{ top: ["-50%", "100%"], opacity: [0.25, 0.65, 0.25] }} transition={{ top: beamTransition(0.6), opacity: { duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror", delay: 0.6 } }} />
      <motion.div className="absolute right-0 bottom-0 h-px w-1/2 bg-gradient-to-r from-transparent via-white to-transparent" animate={{ right: ["-50%", "100%"], opacity: [0.25, 0.65, 0.25] }} transition={{ right: beamTransition(1.2), opacity: { duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror", delay: 1.2 } }} />
      <motion.div className="absolute bottom-0 left-0 h-1/2 w-px bg-gradient-to-b from-transparent via-white to-transparent" animate={{ bottom: ["-50%", "100%"], opacity: [0.25, 0.65, 0.25] }} transition={{ bottom: beamTransition(1.8), opacity: { duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror", delay: 1.8 } }} />
    </div>
  )
}

function InputHighlight() {
  return (
    <motion.div
      layoutId="input-highlight"
      className="absolute inset-0 -z-10 bg-white/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  )
}

export function SignInCard() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [focusedInput, setFocusedInput] = useState<FocusedField>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const data = await apiSignIn(username, password)
      saveToken(data.token, data.User)
      router.push("/todos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 w-full max-w-sm"
      style={{ perspective: 1500 }}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ z: 10 }}
      >
        <div className="group relative">
          <motion.div
            className="absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-70"
            animate={{
              boxShadow: [
                "0 0 10px 2px rgba(255,255,255,0.03)",
                "0 0 15px 5px rgba(255,255,255,0.05)",
                "0 0 10px 2px rgba(255,255,255,0.03)",
              ],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", repeatType: "mirror" }}
          />

          <LightBeams />

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
            <div
              className="absolute inset-0 opacity-[0.03]"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)",
                backgroundSize: "30px 30px",
              }}
            />

            <div className="relative mb-5 space-y-1 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10"
              >
                <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-lg font-bold text-transparent">
                  T
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-xl font-bold text-transparent"
              >
                Welcome Back
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-white/60"
              >
                Sign in to continue to your to-dos
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div className="space-y-3">
                <motion.div
                  className={cn("relative", focusedInput === "username" && "z-10")}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Mail
                      aria-hidden="true"
                      className={cn(
                        "absolute left-3 h-4 w-4 transition-all duration-300",
                        focusedInput === "username" ? "text-white" : "text-white/40",
                      )}
                    />
                    <Input
                      type="text"
                      name="username"
                      autoComplete="username"
                      aria-label="Username"
                      placeholder="Username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedInput("username")}
                      onBlur={() => setFocusedInput(null)}
                      className="h-10 w-full border-transparent bg-white/5 pr-3 pl-10 text-white transition-all duration-300 placeholder:text-white/30 focus:border-white/20 focus:bg-white/10"
                    />
                    {focusedInput === "username" && <InputHighlight />}
                  </div>
                </motion.div>

                <motion.div
                  className={cn("relative", focusedInput === "password" && "z-10")}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="relative flex items-center overflow-hidden rounded-lg">
                    <Lock
                      aria-hidden="true"
                      className={cn(
                        "absolute left-3 h-4 w-4 transition-all duration-300",
                        focusedInput === "password" ? "text-white" : "text-white/40",
                      )}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      aria-label="Password"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      className="h-10 w-full border-transparent bg-white/5 pr-10 pl-10 text-white transition-all duration-300 placeholder:text-white/30 focus:border-white/20 focus:bg-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 text-white/40 transition-colors duration-300 hover:text-white"
                    >
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
                    </button>
                    {focusedInput === "password" && <InputHighlight />}
                  </div>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="group/button relative mt-5 w-full"
              >
                {error && (
                  <p className="mb-2 text-center text-xs text-red-400">{error}</p>
                )}
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 blur-lg transition-opacity duration-300 group-hover/button:opacity-70" />
                <div className="relative flex h-10 items-center justify-center overflow-hidden rounded-lg bg-white font-medium text-black transition-all duration-300">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/70 border-t-transparent" />
                        <span className="sr-only">Signing in</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="button-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-1 text-sm font-medium"
                      >
                        Sign In
                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>

              <motion.p
                className="mt-4 text-center text-xs text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="group/signup relative inline-block">
                  <span className="relative z-10 font-medium text-white transition-colors duration-300 group-hover/signup:text-white/70">
                    Sign up
                  </span>
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover/signup:w-full" />
                </Link>
              </motion.p>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
