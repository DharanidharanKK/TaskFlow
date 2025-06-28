import { useState } from 'react';
import { MoreHorizontal, Calendar, User, Tag, Share2, Trash2, Edit, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo?: string[];
  createdBy: string;
  createdAt: string;
  tags: string[];
  reminder?: {
    enabled: boolean;
    date: string;
    time: string;
  };
}

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onShare: (task: Task) => void;
}

export const TaskCard = ({ task, onUpdate, onDelete, onShare }: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isOverdue = () => {
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today && task.status !== 'completed';
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
      task.status === 'completed' ? 'border-green-200 bg-green-50/50' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className={`font-semibold text-lg ${
              task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'
            }`}>
              {task.title}
            </h3>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('-', ' ')}
            </Badge>
            {task.reminder?.enabled && (
              <Badge className="bg-blue-100 text-blue-800">
                <Bell className="h-3 w-3 mr-1" />
                Reminder
              </Badge>
            )}
          </div>

          <p className={`text-slate-600 mb-4 ${task.status === 'completed' ? 'line-through' : ''}`}>
            {task.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className={`flex items-center gap-1 ${isOverdue() ? 'text-red-600' : ''}`}>
              <Calendar className="h-4 w-4" />
              <span>{formatDate(task.dueDate)}</span>
              {isOverdue() && <span className="text-red-600 font-medium">(Overdue)</span>}
            </div>

            {task.reminder?.enabled && (
              <div className="flex items-center gap-1 text-blue-600">
                <Bell className="h-4 w-4" />
                <span>Alarm: {formatDate(task.reminder.date)} at {formatTime(task.reminder.time)}</span>
              </div>
            )}

            {task.assignedTo && task.assignedTo.length > 0 && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{task.assignedTo.length} assigned</span>
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <div className="flex gap-1">
                  {task.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{task.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(task.createdAt)}</span>
            </div>
          </div>

          {isExpanded && task.assignedTo && task.assignedTo.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-2">Assigned to:</p>
              <div className="flex flex-wrap gap-2">
                {task.assignedTo.map((email) => (
                  <Badge key={email} variant="secondary" className="text-xs">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Select
            value={task.status}
            onValueChange={(value) => onUpdate(task.id, { status: value as Task['status'] })}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onShare(task)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                <User className="h-4 w-4 mr-2" />
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
