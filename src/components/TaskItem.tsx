'use client'

import { Task } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface TaskItemProps {
  task: Task
  onStatusChange: (checked: boolean) => void
  onDelete: () => void
}

export function TaskItem({ task, onStatusChange, onDelete }: TaskItemProps) {
  return (
    <Card className={`border-l-4 ${task.is_completed ? 'border-l-green-500' : 'border-l-blue-500'}`}>
      <CardContent className="p-3 flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={task.is_completed}
            onCheckedChange={onStatusChange}
            className="mt-1"
          />
          
          <div className="flex-1">
            <p className={`text-sm ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.content}
            </p>
            
            {task.is_completed && task.completed_at && (
              <p className="text-xs text-muted-foreground mt-1">
                تم الإنجاز منذ {formatDistanceToNow(new Date(task.completed_at), { addSuffix: false, locale: ar })}
              </p>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 rounded-full"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </CardContent>
    </Card>
  )
}
