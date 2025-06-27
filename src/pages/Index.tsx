
import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Bell, Settings, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { FilterSidebar } from '@/components/FilterSidebar';
import { AuthModal } from '@/components/AuthModal';
import { ShareTaskModal } from '@/components/ShareTaskModal';
import { useToast } from '@/hooks/use-toast';

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
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('john.doe@example.com');
  const { toast } = useToast();

  // Mock data
  useEffect(() => {
    if (isAuthenticated) {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation for the new feature release',
          status: 'in-progress',
          priority: 'high',
          dueDate: '2024-01-15',
          createdBy: 'john.doe@example.com',
          createdAt: '2024-01-10',
          tags: ['documentation', 'urgent']
        },
        {
          id: '2',
          title: 'Review pull requests',
          description: 'Review and approve pending pull requests from team members',
          status: 'todo',
          priority: 'medium',
          dueDate: '2024-01-12',
          assignedTo: ['jane.smith@example.com'],
          createdBy: 'john.doe@example.com',
          createdAt: '2024-01-09',
          tags: ['code-review']
        },
        {
          id: '3',
          title: 'Setup CI/CD pipeline',
          description: 'Configure automated testing and deployment pipeline',
          status: 'completed',
          priority: 'high',
          dueDate: '2024-01-08',
          createdBy: 'john.doe@example.com',
          createdAt: '2024-01-05',
          tags: ['devops', 'automation']
        }
      ];
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
    }
  }, [isAuthenticated]);

  // Filter tasks based on search and active filter
  useEffect(() => {
    let filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (activeFilter) {
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(task => task.dueDate === today);
        break;
      case 'overdue':
        const now = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(task => task.dueDate < now && task.status !== 'completed');
        break;
      case 'high-priority':
        filtered = filtered.filter(task => task.priority === 'high');
        break;
      case 'shared':
        filtered = filtered.filter(task => task.assignedTo && task.assignedTo.length > 0);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, activeFilter]);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser
    };
    setTasks(prev => [newTask, ...prev]);
    setShowTaskForm(false);
    toast({
      title: "Task created successfully!",
      description: "Your new task has been added to your list.",
    });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
    toast({
      title: "Task updated!",
      description: "Your changes have been saved.",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list.",
    });
  };

  const handleShareTask = (taskId: string, emails: string[]) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      handleUpdateTask(taskId, { assignedTo: emails });
      setShowShareModal(false);
      toast({
        title: "Task shared successfully!",
        description: `Task shared with ${emails.join(', ')}`,
      });
    }
  };

  if (!isAuthenticated) {
    return <AuthModal onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="text-slate-600 hover:text-slate-900"
              >
                <Filter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-slate-900"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-slate-900"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setShowTaskForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            taskCounts={{
              all: tasks.length,
              today: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length,
              overdue: tasks.filter(t => t.dueDate < new Date().toISOString().split('T')[0] && t.status !== 'completed').length,
              'high-priority': tasks.filter(t => t.priority === 'high').length,
              shared: tasks.filter(t => t.assignedTo && t.assignedTo.length > 0).length,
              completed: tasks.filter(t => t.status === 'completed').length
            }}
            className={`${showFilters ? 'block' : 'hidden'} lg:block`}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">In Progress</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-yellow-600 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Completed</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {tasks.filter(t => t.status === 'completed').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-600 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Shared</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {tasks.filter(t => t.assignedTo && t.assignedTo.length > 0).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
                  <p className="text-slate-600 mb-4">Get started by creating your first task</p>
                  <Button
                    onClick={() => setShowTaskForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                    onShare={(task) => {
                      setSelectedTask(task);
                      setShowShareModal(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTaskForm && (
        <TaskForm
          onSave={handleCreateTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}

      {showShareModal && selectedTask && (
        <ShareTaskModal
          task={selectedTask}
          onShare={handleShareTask}
          onClose={() => {
            setShowShareModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Index;
