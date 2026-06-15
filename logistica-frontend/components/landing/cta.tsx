"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useState } from "react"

export function Cta() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    window.location.href = `mailto:ventas@logisticaweb.com?subject=Demo gratuita&body=Hola, me gustaría solicitar una demo gratuita. Mi correo es ${email}`
  }

  return (
    <section id="cta" className="relative py-24 bg-gray-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] as const }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-500/5 to-green-500/5 backdrop-blur-2xl border border-white/5"
        >
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              padding: "1px",
              background: "conic-gradient(from 0deg, #22C55E, #16A34A, #22C55E, #166534, #22C55E)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />

          <div className="relative z-10 p-8 sm:p-12 md:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white font-lexend">
              Deja de perder tiempo con procesos manuales
            </h2>
            <p className="text-lg mb-8 max-w-lg mx-auto text-gray-400 font-source-sans">
              Reserva una demo personalizada de 15 minutos. Sin compromiso, sin tarjeta, sin rodeos.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-5 py-3 rounded-lg text-sm outline-none transition-all bg-white/5 border border-white/10 text-white font-source-sans"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90 cursor-pointer bg-green-500 shadow-lg"
                style={{ boxShadow: "0 4px 20px rgba(34,197,94,0.2)" }}
              >
                Quiero optimizar mis envíos
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500 font-source-sans">
              Sin compromiso · Demostración personalizada · Implementación en 24h
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
