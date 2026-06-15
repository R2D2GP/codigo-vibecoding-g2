"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useRef } from "react"

const testimonials = [
  {
    name: "Ramón Castilla",
    role: "Gerente de Supply Chain · Grupo Éxito",
    text: "Redujimos nuestros costos logísticos en 18% durante el primer trimestre. La optimización de rutas con IA nos ahorró más de 40 horas de planificación semanales.",
    rating: 5,
  },
  {
    name: "Pedro Castillo",
    role: "Director de Operaciones · TCC",
    text: "El tracking en tiempo real transformó la experiencia de nuestros clientes. Ahora saben exactamente dónde está su pedido y cuándo llegará.",
    rating: 5,
  },
  {
    name: "Augusto Leguía",
    role: "CEO · Logística del Valle",
    text: "Implementamos Logística Web en toda nuestra flota de 120 vehículos. La curva de aprendizaje fue mínima y el soporte técnico es excepcional.",
    rating: 5,
  },
  {
    name: "Dina Boluarte",
    role: "Jefe de Transporte · Distribuidora Nacional",
    text: "La integración con SAP fue un factor decisivo. En dos días teníamos todo funcionando sin interrupciones en nuestros procesos existentes.",
    rating: 4,
  },
  {
    name: "Manuel Odría",
    role: "Supply Chain Manager · MercadoLibre",
    text: "La app para conductores con firma digital eliminó por completo las disputas por entregas. Cada envío tiene evidencia fotográfica de respaldo.",
    rating: 5,
  },
]

function TiltCard({ children, className, style: customStyle }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    x.set((px - 0.5) * 5)
    y.set((py - 0.5) * -5)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: springY, rotateY: springX, ...customStyle }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0, 1] as const } },
}

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 bg-gray-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-lexend">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto text-gray-400 font-source-sans">
            +4,000 empresas confían en Logística Web para sus operaciones diarias.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={itemVariant} className="break-inside-avoid">
              <TiltCard
                className="rounded-2xl p-6 transition-shadow duration-300 bg-white/5 backdrop-blur-lg border border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-sm" style={{ color: i < t.rating ? "#22C55E" : "rgba(255,255,255,0.08)" }}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4 text-slate-200 font-source-sans">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-white font-lexend">
                    {t.name}
                  </p>
                  <p className="text-xs mt-0.5 text-gray-500 font-source-sans">
                    {t.role}
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
