import { useState, useEffect } from 'react';
import { Plus, Search, Bell, Settings, Share2, Menu, X, Clock, Sun, Moon, Lock, LogOut, Filter, Calendar, AlertTriangle, CheckCircle, List, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { FilterSidebar } from '@/components/FilterSidebar';
import { AuthModal } from '@/components/AuthModal';
import { ShareTaskModal } from '@/components/ShareTaskModal';
import { SettingsModal } from '@/components/SettingsModal';
import { FilterModal } from '@/components/FilterModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

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

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority-high');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const { toast } = useToast();

  // Debug log to verify new features are loaded
  console.log('🚀 Enhanced Todo App loaded with new features:');
  console.log('- Settings Modal:', !!SettingsModal);
  console.log('- Filter Modal:', !!FilterModal);
  console.log('- Reminder support:', true);
  console.log('- User-specific tasks:', true);

  // Check authentication status and set up auth listener
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setTasks([]);
        setFilteredTasks([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user-specific tasks from localStorage when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const userTasksKey = `tasks_${currentUser.id}`;
      const savedTasks = localStorage.getItem(userTasksKey);
      
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          setTasks(parsedTasks);
          setFilteredTasks(parsedTasks);
        } catch (error) {
          console.error('Error parsing saved tasks:', error);
          setTasks([]);
          setFilteredTasks([]);
        }
      } else {
        // New user - start with empty task list
        setTasks([]);
        setFilteredTasks([]);
      }
    }
  }, [isAuthenticated, currentUser]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const userTasksKey = `tasks_${currentUser.id}`;
      localStorage.setItem(userTasksKey, JSON.stringify(tasks));
    }
  }, [tasks, isAuthenticated, currentUser]);

  // Filter and sort tasks based on search, active filter, and sort criteria
  useEffect(() => {
    let filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Hide completed tasks by default on mobile unless toggled
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'completed');
    }

    // Apply filters
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
      case 'medium-priority':
        filtered = filtered.filter(task => task.priority === 'medium');
        break;
      case 'low-priority':
        filtered = filtered.filter(task => task.priority === 'low');
        break;
      case 'shared':
        filtered = filtered.filter(task => task.assignedTo && task.assignedTo.length > 0);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
    }

    // Apply sorting
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    
    switch (sortBy) {
      case 'priority-high':
        filtered.sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'priority-low':
        filtered.sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'date-earliest':
        filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        break;
      case 'date-latest':
        filtered.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        break;
      case 'created-newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'created-oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        // Default sorting by priority (high first) and then by due date (earliest first)
        filtered.sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, activeFilter, sortBy, showCompleted]);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.email || 'user@example.com'
    };
    
    setTasks(prev => [newTask, ...prev]);
    setShowTaskForm(false);
    
    // Show reminder message if alarm is set
    if (taskData.reminder?.enabled) {
      const reminderDate = new Date(`${taskData.reminder.date}T${taskData.reminder.time}`);
      toast({
        title: "Task created successfully!",
        description: `Alarm set for ${reminderDate.toLocaleDateString()} at ${reminderDate.toLocaleTimeString()}`,
      });
    } else {
      toast({
        title: "Task created successfully!",
        description: "Your new task has been added to your list.",
      });
    }
  };

  const handleQuickCreateTask = () => {
    if (!quickTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: quickTaskTitle,
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.email || 'user@example.com',
      tags: []
    };
    
    setTasks(prev => [newTask, ...prev]);
    setQuickTaskTitle('');
    toast({
      title: "Task created!",
      description: "Your task has been added to your list.",
    });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
    
    // Show reminder message if alarm is updated
    if (updates.reminder?.enabled) {
      const reminderDate = new Date(`${updates.reminder.date}T${updates.reminder.time}`);
      toast({
        title: "Task updated!",
        description: `Alarm set for ${reminderDate.toLocaleDateString()} at ${reminderDate.toLocaleTimeString()}`,
      });
    } else {
      toast({
        title: "Task updated!",
        description: "Your changes have been saved.",
      });
    }
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

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setShowMobileMenu(false);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTaskCounts = () => ({
    all: tasks.length,
    today: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length,
    overdue: tasks.filter(t => t.dueDate < new Date().toISOString().split('T')[0] && t.status !== 'completed').length,
    'high-priority': tasks.filter(t => t.priority === 'high').length,
    'medium-priority': tasks.filter(t => t.priority === 'medium').length,
    'low-priority': tasks.filter(t => t.priority === 'low').length,
    shared: tasks.filter(t => t.assignedTo && t.assignedTo.length > 0).length,
    completed: tasks.filter(t => t.status === 'completed').length
  });

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-white rounded-lg animate-pulse"></div>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return <AuthModal onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-slate-200'} border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(true)}
                className={`lg:hidden ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <h1 className={`text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                TaskFlow
              </h1>
              
              {/* Temporary indicator that new features are loaded */}
              <div className="hidden lg:flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✨ Enhanced Features Loaded
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} h-4 w-4`} />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 w-64 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* Mobile Search */}
              <div className="md:hidden flex-1 max-w-xs">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} h-4 w-4`} />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              {/* Desktop Dark Mode Toggle */}
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={isDarkMode ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
              
              {/* Desktop Filter Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilterModal(true)}
                className={`hidden lg:flex ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Filter className="h-5 w-5" />
              </Button>
              
              {/* Desktop Settings Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettingsModal(true)}
                className={`hidden lg:flex ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Settings className="h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
              
              <Button
                onClick={() => setShowTaskForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-In Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className={`fixed left-0 top-0 h-full w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-y-auto`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(false)}
                className={isDarkMode ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* User Info */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Logged in as
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                  {currentUser?.email}
                </p>
              </div>

              {/* Filters Section */}
              <div>
                <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Filters</h3>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Tasks', icon: List, count: getTaskCounts().all },
                    { id: 'today', label: 'Due Today', icon: Calendar, count: getTaskCounts().today },
                    { id: 'overdue', label: 'Overdue', icon: Clock, count: getTaskCounts().overdue },
                    { id: 'high-priority', label: 'High Priority', icon: AlertTriangle, count: getTaskCounts()['high-priority'] },
                    { id: 'medium-priority', label: 'Medium Priority', icon: AlertTriangle, count: getTaskCounts()['medium-priority'] },
                    { id: 'low-priority', label: 'Low Priority', icon: AlertTriangle, count: getTaskCounts()['low-priority'] },
                    { id: 'shared', label: 'Shared Tasks', icon: Users, count: getTaskCounts().shared },
                    { id: 'completed', label: 'Completed Tasks', icon: CheckCircle, count: getTaskCounts().completed },
                  ].map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;
                    
                    return (
                      <button
                        key={filter.id}
                        onClick={() => handleFilterChange(filter.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-900'
                            : isDarkMode 
                              ? 'hover:bg-gray-700 text-gray-300 hover:text-white'
                              : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{filter.label}</span>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full min-w-[24px] text-center font-medium ${
                          isActive 
                            ? 'bg-blue-100 text-blue-700' 
                            : isDarkMode
                              ? 'bg-gray-600 text-gray-300'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Show Completed Tasks</span>
                  </div>
                  <Switch
                    checked={showCompleted}
                    onCheckedChange={setShowCompleted}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isDarkMode ? <Sun className="h-5 w-5 text-gray-300" /> : <Moon className="h-5 w-5 text-slate-600" />}
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dark Mode</span>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                  />
                </div>
              </div>

              {/* Settings Section */}
              <div>
                <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setShowSettingsModal(true);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}>
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-slate-50 text-red-600'
                    }`}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <FilterSidebar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            taskCounts={getTaskCounts()}
            className={`${showFilters ? 'block' : 'hidden'} lg:block`}
            isDarkMode={isDarkMode}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Desktop Stats */}
            <div className="hidden lg:grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} rounded-xl p-6 shadow-sm border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Total Tasks</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tasks.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-md"></div>
                  </div>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} rounded-xl p-6 shadow-sm border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>In Progress</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-yellow-600 rounded-md"></div>
                  </div>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} rounded-xl p-6 shadow-sm border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Completed Tasks</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {tasks.filter(t => t.status === 'completed').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-600 rounded-md"></div>
                  </div>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} rounded-xl p-6 shadow-sm border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Shared Tasks</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {tasks.filter(t => t.assignedTo && t.assignedTo.length > 0).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filter Info */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {activeFilter === 'all' ? 'All Tasks' : 
                   activeFilter === 'today' ? 'Due Today' :
                   activeFilter === 'overdue' ? 'Overdue' :
                   activeFilter === 'high-priority' ? 'High Priority' :
                   activeFilter === 'medium-priority' ? 'Medium Priority' :
                   activeFilter === 'low-priority' ? 'Low Priority' :
                   activeFilter === 'shared' ? 'Shared Tasks' :
                   activeFilter === 'completed' ? 'Completed Tasks' : 'Tasks'}
                </h2>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3 lg:space-y-4 pb-20 lg:pb-0">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-20 h-20 lg:w-24 lg:h-24 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Plus className={`w-6 h-6 lg:w-8 lg:h-8 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>No tasks here!</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-600'} mb-4`}>
                    {activeFilter === 'all' ? 'Get started by creating your first task' : 'No tasks match this filter'}
                  </p>
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

      {/* Mobile Quick Add Bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} border-t shadow-lg`}>
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Quick add task..."
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickCreateTask()}
              className={`pr-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
            <Button
              onClick={handleQuickCreateTask}
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
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

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
          onDarkModeToggle={setIsDarkMode}
          onLogout={handleLogout}
        />
      )}

      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default Index;
