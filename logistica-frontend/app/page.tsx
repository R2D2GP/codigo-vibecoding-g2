"use client"

import { ParticleCanvas } from "@/components/landing/particle-canvas"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { LogosBar } from "@/components/landing/logos-bar"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import { Cta } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { useAuthStore } from "@/stores/auth-store"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const token = useAuthStore((s) => s.accessToken)
  const router = useRouter()

  useEffect(() => {
    if (token) router.replace("/dashboard")
  }, [token, router])

  return (
    <div className="lp-noise relative bg-gray-950 font-source-sans">
      <ParticleCanvas />
      <Navbar />
      <Hero />
      <LogosBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Cta />
      <Footer />
    </div>
  )
}
