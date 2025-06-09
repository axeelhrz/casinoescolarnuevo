// Tipos para niveles educativos
export type SchoolLevel = 'Pre School' | 'Lower School' | 'Middle School' | 'High School'

// Constantes para niveles educativos
export const SCHOOL_LEVELS: SchoolLevel[] = [
  'Pre School',
  'Lower School', 
  'Middle School',
  'High School'
]

// Configuración de cursos por nivel
export const COURSE_CONFIG: Record<SchoolLevel, {
  label: string
  description: string
  grades: string[]
  sections: string[]
}> = {
  'Pre School': {
    label: 'Pre School',
    description: 'Educación Preescolar',
    grades: ['Pre-K', 'Kinder'],
    sections: ['A', 'B', 'C']
  },
  'Lower School': {
    label: 'Lower School',
    description: 'Educación Básica (1° a 6°)',
    grades: ['1°', '2°', '3°', '4°', '5°', '6°'],
    sections: ['A', 'B', 'C', 'D']
  },
  'Middle School': {
    label: 'Middle School', 
    description: 'Educación Básica (7° y 8°)',
    grades: ['7°', '8°'],
    sections: ['A', 'B', 'C']
  },
  'High School': {
    label: 'High School',
    description: 'Educación Media (1° a 4°)',
    grades: ['1°', '2°', '3°', '4°'],
    sections: ['A', 'B', 'C']
  }
}

// Función para obtener información de un nivel
export function getSchoolLevelInfo(level: SchoolLevel) {
  const config = COURSE_CONFIG[level]
  if (!config) {
    console.warn(`School level not found: ${level}`)
    return COURSE_CONFIG['Lower School'] // Fallback
  }
  return config
}

// Función para obtener todos los cursos posibles de un nivel
export function getCoursesForLevel(level: SchoolLevel): string[] {
  const config = COURSE_CONFIG[level]
  if (!config) {
    console.warn(`School level not found: ${level}`)
    return ['1° A'] // Fallback
  }
  
  const courses: string[] = []
  
  config.grades.forEach(grade => {
    config.sections.forEach(section => {
      courses.push(`${grade} ${section}`)
    })
  })
  
  return courses
}

// Función para validar formato de curso
export function validateCourseFormat(curso: string, level?: SchoolLevel): boolean {
  if (!curso || curso.trim() === '') return false
  
  // Si se proporciona el nivel, validar contra los cursos permitidos
  if (level) {
    const validCourses = getCoursesForLevel(level)
    return validCourses.includes(curso.trim())
  }
  
  // Validación general: debe tener formato "Grado Sección" o ser Pre-K/Kinder
  const coursePattern = /^(Pre-K|Kinder|\d+°)\s+[A-Z]$/
  return coursePattern.test(curso.trim())
}

// Función para generar sugerencias de curso basadas en el nivel
export function getCourseOptions(level: SchoolLevel): Array<{ value: string; label: string }> {
  const courses = getCoursesForLevel(level)
  return courses.map(course => ({
    value: course,
    label: course
  }))
}

// Función para obtener el nivel basado en un curso (útil para migración)
export function getLevelFromCourse(curso: string): SchoolLevel | null {
  const trimmedCourse = curso.trim()
  
  // Pre School
  if (trimmedCourse.includes('Pre-K') || trimmedCourse.includes('Kinder')) {
    return 'Pre School'
  }
  
  // Extraer número del grado
  const gradeMatch = trimmedCourse.match(/(\d+)°/)
  if (gradeMatch) {
    const grade = parseInt(gradeMatch[1])
    
    if (grade >= 1 && grade <= 6) {
      return 'Lower School'
    } else if (grade >= 7 && grade <= 8) {
      return 'Middle School'
    } else if (grade >= 1 && grade <= 4) {
      // Podría ser media, pero necesitamos más contexto
      // Por defecto asumimos que 1-4 sin más contexto es básica
      return 'Lower School'
    }
  }
  
  // Si contiene "Medio" o "Media", es High School
  if (trimmedCourse.toLowerCase().includes('medio') || 
      trimmedCourse.toLowerCase().includes('media')) {
    return 'High School'
  }
  
  // Si contiene "Básico", determinar por número
  if (trimmedCourse.toLowerCase().includes('básico')) {
    const gradeMatch = trimmedCourse.match(/(\d+)/)
    if (gradeMatch) {
      const grade = parseInt(gradeMatch[1])
      if (grade >= 1 && grade <= 6) {
        return 'Lower School'
      } else if (grade >= 7 && grade <= 8) {
        return 'Middle School'
      }
    }
  }
  
  return null
}

// Función para migrar curso del formato antiguo al nuevo
export function migrateCourseFormat(oldCourse: string, currentLevel?: SchoolLevel): { curso: string; level: SchoolLevel } {
  const trimmedCourse = oldCourse.trim()
  
  // Si ya está en formato correcto y tenemos el nivel, usar tal como está
  if (currentLevel && validateCourseFormat(trimmedCourse, currentLevel)) {
    return { curso: trimmedCourse, level: currentLevel }
  }
  
  // Intentar detectar el nivel automáticamente
  const detectedLevel = getLevelFromCourse(trimmedCourse)
  
  if (detectedLevel) {
    // Intentar normalizar el formato
    let normalizedCourse = trimmedCourse
    
    // Normalizar formatos comunes
    normalizedCourse = normalizedCourse
      .replace(/(\d+)°?\s*(Básico|básico)/i, '$1°')
      .replace(/(\d+)°?\s*(Medio|medio|Media|media)/i, '$1°')
      .replace(/Pre\s*K/i, 'Pre-K')
      .replace(/Kínder/i, 'Kinder')
    
    // Si no tiene sección, agregar A por defecto
    if (/^\d+°$/.test(normalizedCourse) || normalizedCourse === 'Pre-K' || normalizedCourse === 'Kinder') {
      normalizedCourse += ' A'
    }
    
    // Validar el curso normalizado
    if (validateCourseFormat(normalizedCourse, detectedLevel)) {
      return { curso: normalizedCourse, level: detectedLevel }
    }
  }
  
  // Si no se puede migrar automáticamente, usar valores por defecto
  return {
    curso: '1° A',
    level: 'Lower School'
  }
}

// Función para obtener el label amigable de un nivel
export function getSchoolLevelLabel(level: SchoolLevel): string {
  const config = getSchoolLevelInfo(level)
  return config.label
}

// Función para obtener la descripción de un nivel
export function getSchoolLevelDescription(level: SchoolLevel): string {
  const config = getSchoolLevelInfo(level)
  return config.description
}