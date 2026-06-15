"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useRef, useCallback } from "react"
import { ArrowRight, Play, TrendingDown, Clock, CheckCircle2, MapPin, Package } from "lucide-react"

const headline = "Controla todos tus envíos en un solo lugar y reduce costos logísticos desde el primer día"
const subheadline = "Automatiza tu operación, optimiza rutas y ofrece seguimiento en tiempo real sin depender de Excel ni procesos manuales."
const nicheHeadline = "Gestiona pedidos y entregas de tu ferretería sin caos ni pérdidas de tiempo"
const nicheSubheadline = "Organiza rutas, controla envíos y haz seguimiento a cada pedido desde un solo sistema."

const staggerWords = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
  },
}

const wordVariant = {
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] as const } },
}

const orders = [
  { client: "Ferretería El Tornillo", address: "Cra 45 #23-12, Bogotá", status: "Entregado", eta: "10:32", color: "text-green-600", badgeBg: "bg-green-600/15" },
  { client: "Distribuidora XYZ", address: "Av. Siempre Viva 742, Medellín", status: "En ruta", eta: "11:45", color: "text-yellow-600", badgeBg: "bg-yellow-600/15" },
  { client: "Comercial del Valle", address: "Cl 5 #8-23, Cali", status: "En ruta", eta: "12:15", color: "text-yellow-600", badgeBg: "bg-yellow-600/15" },
  { client: "Materiales Sánchez", address: "Av. Oriental #30-15, Medellín", status: "Pendiente", eta: "14:00", color: "text-red-600", badgeBg: "bg-red-600/15" },
  { client: "Grupo Logístico del Sur", address: "Av. Principal #100-50, Arequipa", status: "Entregado", eta: "09:15", color: "text-green-600", badgeBg: "bg-green-600/15" },
]

export function Hero({ niche }: { niche?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 30, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 30, damping: 15 })

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }, [mouseX, mouseY])

  const scrollTo = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  const h = niche ? nicheHeadline : headline
  const sub = niche ? nicheSubheadline : subheadline
  const ctaText = niche ? "Quiero ordenar mis entregas" : "Quiero optimizar mis envíos"

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouse}
      className="relative min-h-dvh flex items-center overflow-hidden bg-gray-950"
    >
      {/* Mouse follower glow — keep spring for smooth tracking */}
      <motion.div
        className="absolute pointer-events-none z-[1] size-[600px] rounded-full will-change-transform"
        style={{
          left: springX,
          top: springY,
          background: "radial-gradient(circle, rgba(34,197,94,0.05), transparent 60%)",
          transform: "translate(-50%, -50%)",
        }}
      />
      <motion.div
        className="absolute pointer-events-none z-[1] size-[300px] rounded-full will-change-transform"
        style={{
          left: springX,
          top: springY,
          background: "radial-gradient(circle, rgba(59,130,246,0.04), transparent 60%)",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Background orbs — radial gradients can't be Tailwind */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-15 blur-[140px]" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.25), transparent)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px]" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.15), transparent)" }} />
      </div>

      {/* Subtle grid — CSS gradient, can't be Tailwind */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center min-h-dvh py-24 md:py-0">
          {/* LEFT: Text */}
          <div className="pt-6 md:pt-0">
            {/* 1. Headline */}
            <motion.h1
              variants={staggerWords}
              initial="hidden"
              animate="show"
              className="text-[1.35rem] sm:text-[1.75rem] md:text-[2.15rem] lg:text-[2.5rem] font-bold leading-[1.15] tracking-tight max-w-2xl text-white font-lexend"
            >
              {h.split(" ").map((word, i) => (
                <motion.span key={i} variants={wordVariant} className="inline-block mr-[0.25em] will-change-transform">
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* 2. CTA */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.6 } }}
              className="mt-8 flex flex-col gap-1.5"
            >
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => scrollTo("#cta")}
                  className="inline-flex items-center gap-2 px-10 py-5 rounded-xl text-white font-bold shadow-2xl transition-all hover:opacity-90 hover:-translate-y-0.5 cursor-pointer bg-green-500 text-[1.1rem] will-change-transform"
                  style={{ boxShadow: "0 8px 32px rgba(34,197,94,0.25)" }}
                >
                  {ctaText}
                  <ArrowRight size={22} />
                </button>
                <button
                  onClick={() => scrollTo("#features")}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all hover:opacity-70 cursor-pointer bg-white/5 backdrop-blur-md border border-white/10 text-gray-400"
                >
                  <Play size={18} />
                  Ver cómo funciona
                </button>
              </div>
              <p className="text-[11px] text-gray-400/65 font-source-sans">
                Sin tarjeta · Configuración en minutos · Demo guiada
              </p>
            </motion.div>

            {/* 3. Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.85 } }}
              className="mt-6 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed text-gray-400 font-source-sans"
            >
              {sub}
            </motion.p>

            {/* 4. Pain block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 1.05 } }}
              className="mt-8 rounded-xl p-6 bg-gray-900 border border-gray-800"
            >
              <p className="text-base font-bold flex items-center gap-2 text-green-500">
                <span className="size-1.5 rounded-full bg-current" />
                ¿Sigues gestionando envíos en Excel o WhatsApp?
              </p>
              <p className="text-sm mt-3 leading-relaxed text-gray-500 font-source-sans">
                ¿Pierdes tiempo coordinando entregas manualmente? <strong className="text-gray-400">¿Tus clientes preguntan constantemente por sus pedidos?</strong>
              </p>
            </motion.div>

            {/* 5. Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6, delay: 1.3 } }}
              className="mt-10"
            >
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex -space-x-2">
                  {["MA", "TC", "GS", "DL"].map((init, i) => (
                    <div
                      key={i}
                      className="size-10 rounded-full border-2 border-gray-950 flex items-center justify-center text-xs font-bold shadow-sm text-gray-950"
                      style={{ background: i % 2 === 0 ? "#22C55E" : "#16A34A", zIndex: 4 - i }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-base font-source-sans">
                    <span className="font-extrabold text-lg text-green-500">+4,000</span>
                    <span className="text-gray-400"> empresas ya optimizan su logística con nosotros</span>
                  </p>
                  <p className="text-sm mt-1 italic text-gray-500 font-source-sans">
                    &ldquo;Redujimos 30% el tiempo de gestión en solo semanas.&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Mockup + badges */}
          <div className="relative flex items-center justify-center md:justify-end md:pr-4">
            {/* Badge 1 — CSS float animation (GPU) instead of Framer repeat */}
            <div className="absolute -top-5 -left-1 z-20 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-gray-900/90 backdrop-blur-lg border border-white/10 text-gray-400 shadow-2xl animate-float-slow will-change-transform">
              <CheckCircle2 size={14} className="text-green-500 shrink-0" />
              <span>Seguimiento en tiempo real</span>
            </div>

            {/* Badge 2 */}
            <div className="absolute -bottom-5 -right-0 z-20 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-gray-900/90 backdrop-blur-lg border border-white/10 text-gray-400 shadow-2xl animate-float-slow-reverse will-change-transform">
              <TrendingDown size={14} className="text-green-500 shrink-0" />
              <span>Optimización automática de rutas</span>
            </div>

            {/* Mockup card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0, 1] as const } }}
              className="w-full max-w-md will-change-transform"
            >
              <div
                className="relative rounded-2xl p-[1.5px]"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(34,197,94,0.15), rgba(34,197,94,0.08))",
                  boxShadow: "0 30px 90px rgba(34,197,94,0.12), 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <div className="rounded-2xl overflow-hidden bg-gray-900">
                  {/* KPI bar */}
                  <div className="grid grid-cols-3 gap-3 px-4 py-3 bg-green-500/5 border-b border-white/5">
                    {[
                      { label: "Entregas a tiempo", value: "98%", icon: Clock, color: "text-green-500" },
                      { label: "Ahorro en rutas", value: "-23%", icon: TrendingDown, color: "text-green-500" },
                      { label: "Envíos activos", value: "12", icon: MapPin, color: "text-blue-400" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <kpi.icon size={13} className={kpi.color} />
                          <span className={`text-lg font-extrabold ${kpi.color}`}>{kpi.value}</span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-500">{kpi.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini map */}
                  <div className="h-24 relative overflow-hidden bg-green-500/5">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 30% 40%, rgba(34,197,94,0.12) 0%, transparent 50%),
                                    radial-gradient(circle at 70% 60%, rgba(34,197,94,0.08) 0%, transparent 40%)`,
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 96">
                      <path d="M40 70 Q100 25 180 48 T320 35" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
                      <path d="M60 75 Q130 50 200 60 T350 48" fill="none" stroke="#16A34A" strokeWidth="2" strokeDasharray="3 4" opacity="0.35" />
                      <circle cx="40" cy="70" r="3.5" fill="#22C55E" opacity="0.8" />
                      <circle cx="180" cy="48" r="3" fill="#16A34A" opacity="0.7" />
                      <circle cx="320" cy="35" r="3" fill="#22C55E" opacity="0.7" />
                    </svg>
                  </div>

                  {/* Orders list */}
                  <div className="p-3 space-y-0.5">
                    {orders.map((o) => (
                      <div key={o.client} className="flex items-center justify-between rounded-lg px-3 py-2 gap-2 bg-white/5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Package size={13} className={`${o.color} opacity-90 shrink-0`} />
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium truncate text-slate-200">{o.client}</p>
                            <p className="text-[10px] truncate text-gray-500">{o.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.color} ${o.badgeBg}`}>
                            {o.status}
                          </span>
                          <span className="text-[10px] text-gray-500">{o.eta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
