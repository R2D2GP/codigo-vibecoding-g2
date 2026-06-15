"use client"

import { motion } from "framer-motion"
import { UserPlus, Settings2, Route, PackageCheck } from "lucide-react"

const steps = [
  { num: "01", title: "Crea tu cuenta", desc: "Empieza en minutos, sin instalación.", icon: UserPlus },
  { num: "02", title: "Configura tu operación", desc: "Importa clientes, almacenes y flota fácilmente.", icon: Settings2 },
  { num: "03", title: "Optimiza tus rutas", desc: "Genera rutas eficientes en segundos.", icon: Route },
  { num: "04", title: "Gestiona en tiempo real", desc: "Monitorea entregas y notifica a tus clientes.", icon: PackageCheck },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
}

const stepVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] as const } },
}

const horizLineVariant = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1, delay: 0.2, ease: [0.25, 0.1, 0, 1] as const } },
}

const vertLineVariant = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0, 1] as const } },
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 bg-gray-950">
      <div className="mx-auto max-w-6xl px-6">
        {/* Speed indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 3v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Implementación rápida: listo en menos de 1 hora
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-lexend">
            Configura tu operación y empieza a entregar mejor hoy mismo
          </h2>
        </motion.div>

        {/* ═══ DESKTOP: horizontal ═══ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="hidden md:block"
        >
          <div className="flex gap-0 relative">
            {/* Line between number and circle */}
            <div className="absolute left-0 right-0 top-[calc(2.8rem+10px)] h-px overflow-hidden pointer-events-none">
              <motion.div
                variants={horizLineVariant}
                className="w-full h-full origin-left"
                style={{ background: "rgba(34,197,94,0.15)" }}
              />
            </div>

            {steps.map((step, i) => (
              <motion.div key={step.num} variants={stepVariant} className="flex-1 text-center">
                <span
                  className="text-[2.8rem] font-black leading-none select-none block pb-2.5 font-lexend"
                  style={{ color: "rgba(34,197,94,0.3)" }}
                >
                  {step.num}
                </span>
                <div
                  className="size-14 rounded-full flex items-center justify-center mx-auto mt-3 mb-3 shadow-lg"
                  style={{
                    background: i === 0 ? "#22C55E" : "rgba(34,197,94,0.1)",
                    border: i === 0 ? "none" : "1px solid rgba(34,197,94,0.2)",
                    color: i === 0 ? "#0B0F14" : "#22C55E",
                  }}
                >
                  <step.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-white font-lexend">{step.title}</h3>
                <p className="text-sm mt-1 max-w-44 mx-auto leading-relaxed text-gray-500 font-source-sans">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══ MOBILE: vertical ═══ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="md:hidden relative max-w-md mx-auto"
        >
          <div className="absolute left-8 top-0 bottom-0 w-px overflow-hidden">
            <motion.div
              variants={vertLineVariant}
              className="w-full h-full origin-top"
              style={{ background: "rgba(34,197,94,0.2)" }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div key={step.num} variants={stepVariant} className="relative flex items-start gap-5 pb-14 last:pb-0">
              <div className="relative z-10 shrink-0">
                <div
                  className="size-12 rounded-full flex items-center justify-center shadow-lg relative"
                  style={{
                    background: i === 0 ? "#22C55E" : "rgba(34,197,94,0.1)",
                    border: i === 0 ? "none" : "1px solid rgba(34,197,94,0.2)",
                    color: i === 0 ? "#0B0F14" : "#22C55E",
                  }}
                >
                  <step.icon size={18} />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-black font-lexend" style={{ color: "rgba(34,197,94,0.5)" }}>{step.num}</span>
                  <h3 className="font-bold text-white font-lexend text-base">{step.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-500 font-source-sans">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Micro-conversion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-base mb-5 text-gray-400 font-source-sans">
            Empieza hoy mismo y ten tu operación lista en menos de 1 hora
          </p>
          <a
            href="#cta"
            onClick={(e) => {
              e.preventDefault()
              const el = document.querySelector("#cta")
              if (el) el.scrollIntoView({ behavior: "smooth" })
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base shadow-xl transition-all hover:opacity-90 hover:-translate-y-0.5 cursor-pointer bg-green-500"
            style={{ boxShadow: "0 8px 32px rgba(34,197,94,0.25)" }}
          >
            Comenzar ahora
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
