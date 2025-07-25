import { useState } from 'react';
import { X, Calendar, Tag, User, Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileAttachment } from './FileAttachment';

interface Task {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo?: string[];
  tags: string[];
  attachmentUrl?: string;
  reminder?: {
    enabled: boolean;
    date: string;
    time: string;
  };
}

interface TaskFormProps {
  onSave: (task: Task) => void;
  onClose: () => void;
  initialTask?: Partial<Task>;
  isDarkMode?: boolean;
}

export const TaskForm = ({ onSave, onClose, initialTask, isDarkMode = false }: TaskFormProps) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState<Task['status']>(initialTask?.status || 'todo');
  const [priority, setPriority] = useState<Task['priority']>(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [tags, setTags] = useState<string[]>(initialTask?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [assignedEmails, setAssignedEmails] = useState<string[]>(initialTask?.assignedTo || []);
  const [newEmail, setNewEmail] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(initialTask?.attachmentUrl || null);
  const [reminderEnabled, setReminderEnabled] = useState(initialTask?.reminder?.enabled || false);
  const [reminderDate, setReminderDate] = useState(initialTask?.reminder?.date || '');
  const [reminderTime, setReminderTime] = useState(initialTask?.reminder?.time || '');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddEmail = () => {
    if (newEmail.trim() && !assignedEmails.includes(newEmail.trim())) {
      setAssignedEmails([...assignedEmails, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setAssignedEmails(assignedEmails.filter(email => email !== emailToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const task: Task = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      assignedTo: assignedEmails,
      tags,
      attachmentUrl: attachmentUrl || undefined,
      reminder: reminderEnabled ? {
        enabled: true,
        date: reminderDate,
        time: reminderTime
      } : undefined
    };

    onSave(task);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
              Task Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description..."
              rows={4}
              className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
                Status
              </label>
              <Select value={status} onValueChange={(value) => setStatus(value as Task['status'])}>
                <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
                Priority
              </label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Task['priority'])}>
                <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
                Due Date
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} h-4 w-4`} />
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* File Attachment Section */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
              File Attachment
            </label>
            <FileAttachment
              attachmentUrl={attachmentUrl}
              onAttachmentChange={setAttachmentUrl}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Reminder Section */}
          <div className={`p-4 rounded-lg border ${
            reminderEnabled 
              ? isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
              : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bell className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`} />
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  Set Reminder
                </label>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>
            
            {reminderEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
                    Reminder Date
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} h-4 w-4`} />
                    <Input
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
                    Reminder Time
                  </label>
                  <div className="relative">
                    <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} h-4 w-4`} />
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Assign Section */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-2`}>
              <User className="inline h-4 w-4 mr-1" />
              Assign to Team Members
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email address..."
                className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
              />
              <Button type="button" onClick={handleAddEmail} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {assignedEmails.map((email) => (
                <Badge key={email} variant="outline" className="cursor-pointer" onClick={() => handleRemoveEmail(email)}>
                  {email} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className={`flex justify-end gap-3 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={!title.trim()}
            >
              {initialTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
