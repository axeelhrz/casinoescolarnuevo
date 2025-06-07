"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/app/lib/firebase"

export default function RegistroPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  
  const [children, setChildren] = useState([
    {
      id: 1,
      name: "",
      age: "",
      class: "",
      level: "basico"
    }
  ])
  
  const [showChildrenSection, setShowChildrenSection] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError("")
  }

  const handleChildChange = (id: number, field: string, value: string) => {
    setChildren(children.map(child => 
      child.id === id ? { ...child, [field]: value } : child
    ))
  }

  const addChild = () => {
    const newId = Math.max(...children.map(c => c.id)) + 1
    setChildren([...children, {
      id: newId,
      name: "",
      age: "",
      class: "",
      level: "basico"
    }])
  }

  const removeChild = (id: number) => {
    if (children.length > 1) {
      setChildren(children.filter(child => child.id !== id))
    }
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("El nombre es requerido")
      return false
    }
    if (!formData.lastName.trim()) {
      setError("El apellido es requerido")
      return false
    }
    if (!formData.email.trim()) {
      setError("El correo electrónico es requerido")
      return false
    }
    
    // Validación de email más robusta
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un correo electrónico válido")
      return false
    }
    
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }

    // Validar datos de hijos si la sección está visible
    if (showChildrenSection) {
      const validChildren = children.filter(child => child.name.trim() !== "")
      for (const child of validChildren) {
        if (!child.name.trim()) {
          setError("El nombre del niño es requerido")
          return false
        }
        if (!child.age || parseInt(child.age) < 3 || parseInt(child.age) > 18) {
          setError("La edad del niño debe estar entre 3 y 18 años")
          return false
        }
        if (!child.class.trim()) {
          setError("La clase del niño es requerida")
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email.trim(), 
        formData.password
      )
      const user = userCredential.user

      // Actualizar el perfil del usuario con el nombre
      await updateProfile(user, {
        displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`
      })

      // Preparar datos de los hijos (solo los que tienen nombre)
      const validChildren = showChildrenSection 
        ? children.filter(child => child.name.trim() !== "").map(child => ({
            id: child.id.toString(),
            name: child.name.trim(),
            age: parseInt(child.age) || 0,
            class: child.class.trim(),
            level: child.level as 'basico' | 'medio'
          }))
        : []

      // Determinar el tipo de usuario: si tiene hijos es funcionario/padre, si no es estudiante
      const userType = validChildren.length > 0 ? 'funcionario' : 'estudiante'

      // Guardar datos adicionales en Firestore
      const userData = {
        id: user.uid,
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userType,
        children: validChildren,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setDoc(doc(db, 'users', user.uid), userData)

      // Registro exitoso, redirigir al panel
      router.push('/panel')
      
    } catch (error: unknown) {
      console.error('Error al registrar usuario:', error)
      
      // Manejar diferentes tipos de errores de Firebase
      const firebaseError = error as { code?: string }
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          setError('Ya existe una cuenta con este correo electrónico.')
          break
        case 'auth/invalid-email':
          setError('Correo electrónico inválido.')
          break
        case 'auth/operation-not-allowed':
          setError('Registro no permitido. Contacta al administrador.')
          break
        case 'auth/weak-password':
          setError('La contraseña es muy débil. Debe tener al menos 6 caracteres.')
          break
        case 'auth/network-request-failed':
          setError('Error de conexión. Verifica tu conexión a internet.')
          break
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Intenta más tarde.')
          break
        default:
          setError('Error al crear la cuenta. Intenta nuevamente.')
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
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl"
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        
        {/* Auth Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-lg"
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
                Únete a nosotros
              </h1>
              <p className="text-slate-600 text-clean">
                Crea tu cuenta en Casino Escolar
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

            {/* Registration Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-5"
            >
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <label className="label-educational">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                    required
                    disabled={isLoading}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <label className="label-educational">
                    Apellido *
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Tu apellido"
                    required
                    disabled={isLoading}
                  />
                </motion.div>
              </div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <label className="label-educational">
                  Correo Electrónico *
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

              {/* Password Fields */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <label className="label-educational">
                  Contraseña *
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <label className="label-educational">
                  Confirmar Contraseña *
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repite tu contraseña"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </motion.div>

              {/* Children Section Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="pt-4"
              >
                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 text-clean">
                      ¿Tienes hijos en el colegio?
                    </h3>
                    <p className="text-xs text-slate-500 text-clean mt-1">
                      Opcional: Agrega a tus hijos para gestionar sus menús
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setShowChildrenSection(!showChildrenSection)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      showChildrenSection 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {showChildrenSection ? 'Ocultar' : 'Agregar'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Children Section */}
              {showChildrenSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="text-lg font-medium text-slate-800 mb-4 text-clean">
                      Información de tus hijos
                    </h3>
                    
                    {children.map((child, index) => (
                      <motion.div
                        key={child.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-4 bg-white/60 rounded-xl border border-slate-200 mb-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-slate-700 text-clean">
                            Hijo {index + 1}
                          </h4>
                          {children.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeChild(child.id)}
                              disabled={isLoading}
                              className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="label-educational">
                              Nombre del niño/a
                            </label>
                            <Input
                              type="text"
                              value={child.name}
                              onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                              placeholder="Nombre completo"
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="label-educational">
                                Edad
                              </label>
                              <Input
                                type="number"
                                value={child.age}
                                onChange={(e) => handleChildChange(child.id, 'age', e.target.value)}
                                placeholder="Edad"
                                min="3"
                                max="18"
                                disabled={isLoading}
                              />
                            </div>
                            
                            <div>
                              <label className="label-educational">
                                Clase
                              </label>
                              <Input
                                type="text"
                                value={child.class}
                                onChange={(e) => handleChildChange(child.id, 'class', e.target.value)}
                                placeholder="Ej: 3°A, 1°B"
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="label-educational">
                              Nivel Educativo
                            </label>
                            <select
                              value={child.level}
                              onChange={(e) => handleChildChange(child.id, 'level', e.target.value)}
                              className="select-educational"
                              disabled={isLoading}
                            >
                              <option value="basico">Educación Básica</option>
                              <option value="medio">Educación Media</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    <motion.button
                      type="button"
                      onClick={addChild}
                      whileHover={!isLoading ? { y: -1 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      disabled={isLoading}
                      className="w-full p-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-all duration-300 text-sm font-medium text-clean disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Agregar otro hijo
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="pt-4"
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
                        <span>Creando cuenta...</span>
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
                        <span className="relative z-10">Crear Cuenta</span>
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
              transition={{ duration: 0.6, delay: 1.3 }}
              className="flex items-center my-6"
            >
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="px-4 text-sm text-slate-500 text-clean">o</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </motion.div>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="text-center"
            >
              <p className="text-sm text-slate-600 text-clean">
                ¿Ya tienes una cuenta?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-emerald-600 hover:text-emerald-700 transition-colors duration-300 font-medium"
                >
                  Iniciar sesión
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
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
          transition={{ duration: 0.8, delay: 1.7 }}
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