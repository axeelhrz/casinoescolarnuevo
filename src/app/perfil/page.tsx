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
  GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
                Mis datos
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-clean mt-1">
                Modificá tu información de contacto y los datos de tus hijos si corresponde
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="panel-card-content space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-educational">
                        Nombre *
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        placeholder="Tu nombre"
                        className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="label-educational">
                        Apellido *
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        placeholder="Tu apellido"
                        className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label-educational">
                      Correo electrónico *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="tu@email.com"
                      className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="label-educational">
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="label-educational">
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

              {/* Gestión de hijos - Solo para apoderados */}
              {user.tipoUsuario === 'apoderado' && (
                <Card className="panel-card">
                  <CardHeader className="panel-card-header">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Mis hijos registrados</span>
                      </CardTitle>
                      <Button
                        onClick={addChild}
                        size="sm"
                        className="btn-panel-primary"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar hijo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="panel-card-content">
                    {children.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">
                          No tienes hijos registrados
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                          Agrega la información de tus hijos para gestionar sus pedidos
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {children.map((child, index) => (
                          <motion.div
                            key={child.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                                  Hijo {index + 1}
                                </h4>
                                {child.level && (
                                  <Badge variant="outline" className="text-xs">
                                    <GraduationCap className="w-3 h-3 mr-1" />
                                    {getSchoolLevelLabel(child.level)}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                onClick={() => removeChild(child.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="md:col-span-2">
                                <label className="label-educational">
                                  Nombre completo *
                                </label>
                                <Input
                                  value={child.name}
                                  onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                                  placeholder="Nombre del hijo/a"
                                  className={errors[`child_${child.id}_name`] ? 'border-red-500' : ''}
                                />
                                {errors[`child_${child.id}_name`] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors[`child_${child.id}_name`]}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="label-educational">
                                  Edad *
                                </label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="18"
                                  value={child.edad || ''}
                                  onChange={(e) => updateChild(child.id, 'edad', parseInt(e.target.value) || 0)}
                                  placeholder="Edad"
                                  className={errors[`child_${child.id}_edad`] ? 'border-red-500' : ''}
                                />
                                {errors[`child_${child.id}_edad`] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors[`child_${child.id}_edad`]}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="label-educational">
                                  Curso *
                                </label>
                                <Input
                                  value={child.curso}
                                  onChange={(e) => updateChild(child.id, 'curso', e.target.value)}
                                  placeholder="Ej: 3° Básico A"
                                  className={errors[`child_${child.id}_curso`] ? 'border-red-500' : ''}
                                />
                                {errors[`child_${child.id}_curso`] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors[`child_${child.id}_curso`]}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="label-educational">
                                  Nivel
                                </label>
                                <select
                                  value={child.level}
                                  onChange={(e) => updateChild(child.id, 'level', e.target.value as 'basico' | 'medio')}
                                  className="select-educational"
                                >
                                  <option value="basico">Básico</option>
                                  <option value="medio">Medio</option>
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
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
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {emailVerified ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Correo verificado
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Correo sin verificar
                          </span>
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
                      <div className="space-y-2">
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
                          <div className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
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
                  <div className="space-y-3">
                    <Button
                      onClick={handleSaveChanges}
                      disabled={!hasChanges || isSaving}
                      className="w-full btn-panel-primary"
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
                    
                    {hasChanges && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                        Tienes cambios sin guardar
                      </p>
                    )}
                    
                    {!hasChanges && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        No hay cambios para guardar
                      </p>
                    )}
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
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
                      <p>
                        Tus datos están protegidos y solo se usan para la gestión del casino escolar.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Mail className="w-4 h-4 mt-0.5 text-blue-600" />
                      <p>
                        Mantén tu correo actualizado para recibir notificaciones importantes.
                      </p>
                    </div>
                    {user.tipoUsuario === 'apoderado' && (
                      <div className="flex items-start space-x-2">
                        <Users className="w-4 h-4 mt-0.5 text-blue-600" />
                        <p>
                          La información de tus hijos es necesaria para gestionar sus pedidos de almuerzo.
                        </p>
                      </div>
                    )}
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 mt-0.5 text-blue-600" />
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