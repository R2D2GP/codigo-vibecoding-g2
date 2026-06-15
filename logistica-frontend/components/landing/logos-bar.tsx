"use client"

import { motion } from "framer-motion"

const logos = [
  "TechCorp", "LogísticaTotal", "DistribuyeYa", "SupplyChainPro",
  "EnvíaRápido", "GlobalTrans", "MegaLogis", "CargaExpress",
]

export function LogosBar() {
  return (
    <section className="bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-center text-sm font-medium mb-8 text-gray-500">
          Empresas líderes confían en nosotros
        </p>
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            className="flex gap-16 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...logos, ...logos].map((name, i) => (
              <span key={i} className="text-lg font-bold whitespace-nowrap select-none text-gray-400/20">
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
