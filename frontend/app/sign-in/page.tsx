import type { Metadata } from "next"
import { SignInCard } from "@/components/ui/sign-in-card-2"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to continue to your to-dos",
}

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignInCard />
    </main>
  )
}
