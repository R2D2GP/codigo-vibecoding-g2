"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

const links = [
  { label: "Características", href: "#features" },
  { label: "Cómo funciona", href: "#how-it-works" },
  { label: "Testimonios", href: "#testimonials" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTo = (href: string) => {
    setOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2 text-xl font-bold text-white font-lexend">
          <div className="size-8 rounded-lg flex items-center justify-center text-gray-950 text-sm font-bold bg-green-500">
            L
          </div>
          Logística Web
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-sm font-medium transition-colors hover:opacity-70 cursor-pointer text-gray-400"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("#cta")}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90 cursor-pointer bg-green-500"
          >
            Comenzar ahora
          </button>
        </nav>

        <button
          className="md:hidden p-2 cursor-pointer text-gray-400"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden backdrop-blur-xl border-t border-white/5"
            style={{ background: "rgba(17,24,39,0.95)" }}
          >
            <div className="flex flex-col gap-3 px-6 py-6">
              {links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-left text-sm font-medium py-2 cursor-pointer text-gray-400"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => scrollTo("#cta")}
                className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white text-center transition-all hover:opacity-90 cursor-pointer bg-green-500"
              >
                Comenzar ahora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
