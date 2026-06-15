"use client"

import { MessageCircle, Globe, Video, Code2, ArrowUp } from "lucide-react"

const footerLinks = [
  { title: "Producto", links: ["Tracking", "Dashboard", "Rutas IA", "App Conductores", "Integraciones", "API"] },
  { title: "Recursos", links: ["Blog", "Casos de éxito", "Documentación", "Webinars", "Calculadora ROI"] },
  { title: "Compañía", links: ["Sobre nosotros", "Equipo", "Carreras", "Prensa", "Contacto"] },
]

const socials = [
  { icon: MessageCircle, href: "#", label: "X" },
  { icon: Globe, href: "#", label: "LinkedIn" },
  { icon: Video, href: "#", label: "YouTube" },
  { icon: Code2, href: "#", label: "GitHub" },
]

export function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <footer className="relative bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 text-xl font-bold mb-4 text-white font-lexend">
              <div className="size-8 rounded-lg flex items-center justify-center text-gray-950 text-sm font-bold bg-green-500">
                L
              </div>
              Logística Web
            </a>
            <p className="text-sm max-w-xs mb-6 text-gray-500 font-source-sans">
              Plataforma de logística inteligente para empresas que buscan eficiencia y control total de sus operaciones.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="size-10 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer bg-white/5 border border-white/5 text-gray-400 opacity-40 hover:opacity-100 hover:bg-green-500/10 hover:border-green-500/20"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4 text-white font-lexend">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-all cursor-pointer text-gray-500 font-source-sans hover:text-gray-400"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
          <p className="text-xs text-gray-500 font-source-sans">© 2026 Logística Web. Todos los derechos reservados.</p>
          <button
            onClick={scrollTop}
            className="size-10 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer bg-white/5 border border-white/5 text-gray-400 opacity-40 hover:opacity-100 hover:bg-green-500/10"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  )
}
