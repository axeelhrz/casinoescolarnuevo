"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Users,
  RefreshCw,
  Clock,
  Info,
  GraduationCap,
  Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SchoolLevelSelector } from '@/components/ui/school-level-selector'
import { Navbar } from '@/components/panel/Navbar'
import useAuth from '@/hooks/useAuth'
import { useProfileForm } from '@/hooks/useProfileForm'
import { useToast } from '@/hooks/use-toast'
import { getSchoolLevelLabel } from '@/lib/courseUtils'
import Link from 'next/link'

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [showEmailAlert, setShowEmailAlert] = useState(false)

  const {
    formData,
    children,
    isLoading,
    isSaving,
    hasChanges,
    emailVerified,
    errors,
    isResendingVerification,
    canResendVerification,
    resendCooldownTime,
    updateFormData,
    addChild,
    updateChild,
    removeChild,
    saveChanges,
    resendEmailVerification,
  } = useProfileForm()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSaveChanges = async () => {
    const success = await saveChanges()
    if (success) {
      toast({
        title: "Cambios guardados",
        description: "Tu información ha sido actualizada correctamente.",
        variant: "default"
      })
      setShowEmailAlert(false)
    } else {
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Intenta nuevamente.",
        variant: "destructive"
      })
    }
  }

  const handleResendVerification = async () => {
    const success = await resendEmailVerification()
    if (success) {
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo de verificación a tu dirección de email.",
        variant: "default"
      })
    } else {
      toast({
        title: "Error",
        description: errors.verification || "No se pudo enviar el correo de verificación.",
        variant: "destructive"
      })
    }
  }

  const handleEmailChange = (value: string) => {
    updateFormData('email', value)
    if (value !== user?.email) {
      setShowEmailAlert(true)
    } else {
      setShowEmailAlert(false)
    }
  }

  const getUserTypeLabel = () => {
    return user?.tipoUsuario === 'funcionario' ? 'Funcionario' : 'Apoderado'
  }

  const getUserTypeBadgeColor = () => {
    return user?.tipoUsuario === 'funcionario' 
      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  }

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${remainingSeconds}s`
  }

  if (!mounted || authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="panel-content">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <div className="panel-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/panel">
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Panel
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-elegant">
                Mi Perfil
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-clean mt-1">
                Gestiona tu información personal y la de tus hijos
              </p>
              <div className="flex items-center space-x-3 mt-3">
                <Badge className={getUserTypeBadgeColor()}>
                  {getUserTypeLabel()}
                </Badge>
                <div className="flex items-center space-x-2">
                  {emailVerified ? (
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Email verificado</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-sm font-medium">Email sin verificar</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Alertas generales */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {errors.verification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.verification}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {showEmailAlert && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Al cambiar tu correo deberás volver a verificarlo
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {resendCooldownTime > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <div className="flex items-center justify-between">
                      <span>
                        Espera <strong>{formatCooldownTime(resendCooldownTime)}</strong> antes de solicitar otro correo de verificación
                      </span>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {formatCooldownTime(resendCooldownTime)}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Datos personales */}
              <Card className="panel-card">
                <CardHeader className="panel-card-header">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Información Personal</span>
                    <Edit3 className="w-4 h-4 text-slate-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="panel-card-content space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nombre *
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        placeholder="Tu nombre"
                        className={`transition-all duration-200 ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Apellido *
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        placeholder="Tu apellido"
                        className={`transition-all duration-200 ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Correo electrónico *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="tu@email.com"
                      className={`transition-all duration-200 ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className={`transition-all duration-200 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Tipo de usuario
                    </label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getUserTypeBadgeColor()}>
                        {getUserTypeLabel()}
                      </Badge>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        (No editable)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gestión de hijos - Para apoderados y funcionarios */}
              <Card className="panel-card">
                <CardHeader className="panel-card-header">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>
                        {user.tipoUsuario === 'apoderado' 
                          ? 'Mis hijos registrados' 
                          : 'Mis hijos registrados (opcional)'
                        }
                      </span>
                      <Edit3 className="w-4 h-4 text-slate-400" />
                    </CardTitle>
                    <Button
                      onClick={addChild}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar hijo
                    </Button>
                  </div>
                  {user.tipoUsuario === 'funcionario' && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Como funcionario, puedes agregar información de tus hijos para gestionar también sus menús además del tuyo.
                    </p>
                  )}
                </CardHeader>
                <CardContent className="panel-card-content">
                  {children.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {user.tipoUsuario === 'apoderado' 
                          ? 'No tienes hijos registrados' 
                          : 'No tienes hijos registrados'
                        }
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-4">
                        {user.tipoUsuario === 'apoderado'
                          ? 'Agrega la información de tus hijos para gestionar sus pedidos'
                          : 'Agrega la información de tus hijos para gestionar sus pedidos además del tuyo'
                        }
                      </p>
                      <Button
                        onClick={addChild}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar primer hijo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {children.map((child, index) => (
                        <motion.div
                          key={child.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="relative border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          {/* Header del hijo */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                  Hijo {index + 1}
                                </h4>
                                {child.level && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {getSchoolLevelLabel(child.level)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => removeChild(child.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Formulario del hijo */}
                          <div className="space-y-4">
                            {/* Nombre completo */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nombre completo *
                              </label>
                              <Input
                                value={child.name}
                                onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                                placeholder="Nombre completo del hijo/a"
                                className={`transition-all duration-200 ${errors[`child_${child.id}_name`] ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                              />
                              {errors[`child_${child.id}_name`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`child_${child.id}_name`]}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Edad */}
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  Edad *
                                </label>
                                <Input
                                  type="number"
                                  min="3"
                                  max="18"
                                  value={child.edad || ''}
                                  onChange={(e) => updateChild(child.id, 'edad', parseInt(e.target.value) || 0)}
                                  placeholder="Edad"
                                  className={`transition-all duration-200 ${errors[`child_${child.id}_edad`] ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                />
                                {errors[`child_${child.id}_edad`] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors[`child_${child.id}_edad`]}
                                  </p>
                                )}
                              </div>

                              {/* RUT */}
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  RUT (opcional)
                                </label>
                                <Input
                                  value={child.rut || ''}
                                  onChange={(e) => updateChild(child.id, 'rut', e.target.value)}
                                  placeholder="12345678-9"
                                  className={`transition-all duration-200 ${errors[`child_${child.id}_rut`] ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                                />
                                {errors[`child_${child.id}_rut`] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors[`child_${child.id}_rut`]}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Nivel educativo */}
                            <div>
                                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nivel educativo *
                              </label>
                              <SchoolLevelSelector
                                value={child.level}
                                onValueChange={(value) => updateChild(child.id, 'level', value)}
                                placeholder="Selecciona un nivel educativo"
                                className={`transition-all duration-200 ${errors[`child_${child.id}_level`] ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                              />
                              {errors[`child_${child.id}_level`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`child_${child.id}_level`]}
                                </p>
                              )}
                            </div>
                            
                            {/* Curso - COMPLETAMENTE LIBRE */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Curso *
                              </label>
                              <Input
                                value={child.curso}
                                onChange={(e) => updateChild(child.id, 'curso', e.target.value)}
                                placeholder="Ej: 3° Básico A, 1° Medio B, Kinder A, etc."
                                className={`transition-all duration-200 ${errors[`child_${child.id}_curso`] ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                              />
                              {errors[`child_${child.id}_curso`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`child_${child.id}_curso`]}
                                </p>
                              )}
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1"></p>                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Botón para agregar más hijos */}
                      <motion.button
                        type="button"
                        onClick={addChild}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Agregar otro hijo</span>
                      </motion.button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Verificación de correo */}
              <Card className="panel-card">
                <CardHeader className="panel-card-header">
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Verificación de correo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="panel-card-content">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {emailVerified ? (
                        <>
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              Correo verificado
                            </span>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                              Tu email está confirmado
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                              Correo sin verificar
                            </span>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Verifica tu email
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {emailVerified 
                        ? 'Tu correo electrónico está verificado y puedes recibir notificaciones importantes.'
                        : 'Es importante verificar tu correo para recibir notificaciones sobre pedidos y pagos.'
                      }
                    </p>

                    {!emailVerified && (
                      <div className="space-y-3">
                        <Button
                          onClick={handleResendVerification}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={!canResendVerification}
                        >
                          {isResendingVerification ? (
                            <>
                              <div className="loading-spinner w-4 h-4 mr-2" />
                              Enviando...
                            </>
                          ) : resendCooldownTime > 0 ? (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Esperar {formatCooldownTime(resendCooldownTime)}
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reenviar verificación
                            </>
                          )}
                        </Button>
                        
                        {resendCooldownTime > 0 && (
                          <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Para evitar spam, hay un límite en la frecuencia de envío de correos de verificación.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Acciones */}
              <Card className="panel-card">
                <CardHeader className="panel-card-header">
                  <CardTitle className="flex items-center space-x-2">
                    <Save className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Guardar cambios</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="panel-card-content">
                  <div className="space-y-4">
                    <Button
                      onClick={handleSaveChanges}
                      disabled={!hasChanges || isSaving}
                      className={`w-full transition-all duration-200 ${
                        hasChanges 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="loading-spinner w-4 h-4 mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center">
                      {hasChanges ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Tienes cambios sin guardar
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Todo guardado
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información adicional */}
              <Card className="panel-card">
                <CardHeader className="panel-card-header">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Información importante
                  </CardTitle>
                </CardHeader>
                <CardContent className="panel-card-content">
                  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <p>
                        Tus datos están protegidos y solo se usan para la gestión del casino escolar.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <p>
                        Mantén tu correo actualizado para recibir notificaciones importantes.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <p>
                        {user.tipoUsuario === 'apoderado'
                          ? 'La información de tus hijos es necesaria para gestionar sus pedidos de almuerzo.'
                          : 'Puedes agregar información de tus hijos para gestionar sus pedidos además del tuyo.'
                        }
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <GraduationCap className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <p>
                        El campo &quot;Curso&quot; es completamente libre. Puedes escribir cualquier curso, grado o nivel que necesites.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <p>
                        Los correos de verificación tienen un límite de frecuencia para prevenir spam.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

