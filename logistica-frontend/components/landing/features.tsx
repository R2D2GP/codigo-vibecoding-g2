"use client"

import { motion } from "framer-motion"
import { MapPin, BarChart3, Route, Blocks, Smartphone, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  desc: string
  featured?: boolean
}

const features: Feature[] = [
  { icon: MapPin, title: "Tracking en tiempo real", desc: "Mapa interactivo con geolocalización precisa de flotas y envíos. Visualiza cada unidad en movimiento con actualización cada 5 segundos." },
  { icon: BarChart3, title: "Dashboard de operaciones", desc: "KPIs en vivo, alertas inteligentes y reportes automáticos. Toma decisiones basadas en datos con más de 15 métricas clave.", featured: true },
  { icon: Route, title: "Rutas optimizadas con IA", desc: "Algoritmos de inteligencia artificial que reducen costos de combustible hasta un 23% y mejoran tiempos de entrega." },
  { icon: Blocks, title: "Integración ERP y SAP", desc: "Conecta con tus sistemas existentes sin fricción. SAP, Oracle, Microsoft Dynamics y más de 50 ERPs compatibles." },
  { icon: Smartphone, title: "App móvil para conductores", desc: "Firma digital, evidencia fotográfica y navegación integrada. Tus conductores tienen todo lo necesario en una sola app." },
  { icon: TrendingDown, title: "Reducción de costos operativos", desc: "Disminuye gastos de combustible, mantenimiento y horas extra con planificación inteligente de rutas y cargas." },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const itemVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0, 1] as const } },
}

export function Features() {
  return (
    <section id="features" className="relative py-24 bg-gray-950">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-lexend">
            Todo lo que necesitas para gestionar tu logística
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-400 font-source-sans">
            Desde el tracking hasta la facturación, centraliza todas tus operaciones en una sola plataforma.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariant}
              className={`group relative rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 backdrop-blur-lg border border-white/5 ${
                f.featured
                  ? "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-green-500/5 to-green-500/5"
                  : "bg-white/5"
              }`}
              style={{
                boxShadow: f.featured ? "0 8px 40px rgba(34,197,94,0.06)" : "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <div className="inline-flex items-center justify-center size-12 rounded-xl mb-4 bg-green-500/10">
                <f.icon size={24} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white font-lexend">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 font-source-sans">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
