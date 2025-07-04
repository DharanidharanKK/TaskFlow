
import { useState } from 'react';
import { MoreHorizontal, Calendar, User, Tag, Share2, Trash2, Edit, Clock, Bell, File, Eye, Download } from 'lucide-react';
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
  attachmentUrl?: string;
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
  isDarkMode?: boolean;
}

export const TaskCard = ({ task, onUpdate, onDelete, onShare, isDarkMode = false }: TaskCardProps) => {
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

  const getFileName = (url: string) => {
    return url.split('/').pop()?.split('?')[0] || 'attachment';
  };

  const handleViewFile = () => {
    if (task.attachmentUrl) {
      window.open(task.attachmentUrl, '_blank');
    }
  };

  return (
    <div className={`${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
    } rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-md ${
      task.status === 'completed' 
        ? isDarkMode ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50/50' 
        : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className={`font-semibold text-lg ${
              task.status === 'completed' 
                ? isDarkMode ? 'line-through text-gray-400' : 'line-through text-slate-500'
                : isDarkMode ? 'text-white' : 'text-slate-900'
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

          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-slate-600'
          } mb-4 ${task.status === 'completed' ? 'line-through' : ''}`}>
            {task.description}
          </p>

          {/* File Attachment */}
          {task.attachmentUrl && (
            <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            } border`}>
              <div className="flex items-center space-x-2">
                <File className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {getFileName(task.attachmentUrl)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewFile}
                className={`h-8 w-8 p-0 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className={`flex flex-wrap items-center gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
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
            <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>Assigned to:</p>
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
            <SelectTrigger className={`w-32 h-8 text-xs ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
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
