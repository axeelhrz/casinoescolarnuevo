"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AdminMenuItem } from '@/types/adminMenu'

interface MenuItemCardProps {
  item: AdminMenuItem
  onEdit: (item: AdminMenuItem) => void
  onDelete: (item: AdminMenuItem) => void
  isLoading?: boolean
}

export function MenuItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  isLoading = false
}: MenuItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleEdit = () => {
    onEdit(item)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete(item)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`transition-all duration-200 ${
          item.active 
            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
            : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 opacity-75'
        }`}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge 
                    variant={item.type === 'almuerzo' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {item.code}
                  </Badge>
                  
                  <Badge 
                    variant={item.active ? 'default' : 'secondary'}
                    className={`text-xs ${
                      item.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.active ? (
                      <Eye className="w-2 h-2 mr-1" />
                    ) : (
                      <EyeOff className="w-2 h-2 mr-1" />
                    )}
                    {item.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                
                <h4 className={`font-medium text-xs mb-1 ${
                  item.active 
                    ? 'text-slate-900 dark:text-slate-100' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {item.description}
                </h4>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar menú?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el menú &quot;{item.description}&quot; ({item.code}).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}