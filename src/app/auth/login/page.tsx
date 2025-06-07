"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/app/lib/firebase"

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Verificar si el usuario existe en Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        // Si no existe en Firestore, redirigir al registro para completar perfil
        setError("Usuario no encontrado. Por favor, completa tu registro.")
        await auth.signOut()
        router.push('/auth/registro')
        return
      }

      // Login exitoso, redirigir al panel
      router.push('/panel')
      
    } catch (error: unknown) {
      console.error('Error al iniciar sesión:', error)
      
      // Manejar diferentes tipos de errores de Firebase
      const firebaseError = error as { code?: string }
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este correo electrónico.')
          break
        case 'auth/wrong-password':
          setError('Contraseña incorrecta.')
          break
        case 'auth/invalid-email':
          setError('Correo electrónico inválido.')
          break
        case 'auth/user-disabled':
          setError('Esta cuenta ha sido deshabilitada.')
          break
        case 'auth/too-many-requests':
          setError('Demasiados intentos fallidos. Intenta más tarde.')
          break
        case 'auth/invalid-credential':
          setError('Credenciales inválidas. Verifica tu correo y contraseña.')
          break
        default:
          setError('Error al iniciar sesión. Intenta nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        {/* Soft geometric shapes */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.35, 0.15],
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
        
        {/* Auth Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="auth-form-container rounded-2xl p-8">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-light text-slate-800 mb-2 text-elegant">
                Bienvenido
              </h1>
              <p className="text-slate-600 text-clean">
                Inicia sesión en Casino Escolar
              </p>
              
              {/* Elegant separator */}
              <motion.div
                className="flex items-center justify-center mt-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="w-8 h-px bg-slate-300" />
                <div className="mx-4 w-2 h-2 bg-emerald-400 rounded-full" />
                <div className="w-8 h-px bg-slate-300" />
              </motion.div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600 text-clean">{error}</p>
              </motion.div>
            )}

            {/* Login Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <label className="label-educational">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <label className="label-educational">
                  Contraseña
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-4 h-4 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <span className="text-sm text-slate-600 text-clean">Recordarme</span>
                </label>
                
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors duration-300 text-clean"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="pt-2"
              >
                <motion.div
                  whileHover={!isLoading ? { y: -2 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-auth-primary group relative overflow-hidden"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Iniciando sesión...</span>
                      </div>
                    ) : (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        />
                        <span className="relative z-10">Iniciar Sesión</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>

            {/* Separator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex items-center my-8"
            >
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="px-4 text-sm text-slate-500 text-clean">o</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="text-center"
            >
              <p className="text-sm text-slate-600 text-clean">
                ¿No tienes una cuenta?{" "}
                <Link 
                  href="/auth/registro" 
                  className="text-emerald-600 hover:text-emerald-700 transition-colors duration-300 font-medium"
                >
                  Crear cuenta
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-6"
        >
          <Link href="/">
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-back-home"
            >
              ← Volver al inicio
            </motion.button>
          </Link>
        </motion.div>

        {/* Bottom accent */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.div
            className="flex items-center space-x-2 text-slate-400 text-sm"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
            <span className="text-clean">Sistema de gestión educativa</span>
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}