import type { Metadata } from "next"
import { SignUpCard } from "@/components/ui/sign-up-card"

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an account to manage your to-dos",
}

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignUpCard />
    </main>
  )
}
