"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        {/* Soft geometric shapes */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        
        {/* Logo/Title Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Title */}
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-light mb-4 text-slate-800"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '-0.02em',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            Casino Escolar
          </motion.h1>

          {/* Elegant separator */}
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          >
            <div className="w-8 h-px bg-slate-300" />
            <div className="mx-4 w-2 h-2 bg-emerald-400 rounded-full" />
            <div className="w-8 h-px bg-slate-300" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            Gestión inteligente de alimentación escolar
            <br />
            <span className="text-emerald-600">Nutrición • Organización • Bienestar</span>
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        >
          {/* Login Button */}
          <Link href="/auth/login">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Button
                size="lg"
                className="px-8 py-4 text-base font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                style={{
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Iniciar Sesión
                <motion.div
                  className="ml-2 w-4 h-4"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.div>
              </Button>
            </motion.div>
          </Link>

          {/* Register Button */}
          <Link href="/auth/sign-up">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-base font-medium bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 hover:bg-white hover:border-emerald-300 hover:text-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Crear Cuenta
                <motion.div
                  className="ml-2 w-4 h-4"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  +
                </motion.div>
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
        >
          {/* Feature 1 */}
          <motion.div
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Gestión Simple</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Administra menús y pedidos de forma intuitiva
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Alimentación Saludable</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Promovemos hábitos nutricionales balanceados
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="text-center group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-300">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Comunidad Educativa</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conecta familias, estudiantes y administración
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom accent */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <motion.div
            className="flex items-center space-x-2 text-slate-400 text-sm"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
            <span style={{ fontFamily: "'Inter', sans-serif" }}>Sistema de gestión educativa</span>
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}