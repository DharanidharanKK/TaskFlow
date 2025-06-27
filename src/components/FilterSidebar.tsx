
import { Calendar, Clock, AlertTriangle, Users, CheckCircle, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  taskCounts: {
    all: number;
    today: number;
    overdue: number;
    'high-priority': number;
    shared: number;
    completed: number;
  };
  className?: string;
  isDarkMode?: boolean;
}

export const FilterSidebar = ({ activeFilter, onFilterChange, taskCounts, className, isDarkMode = false }: FilterSidebarProps) => {
  const filters = [
    {
      id: 'all',
      label: 'All Tasks',
      icon: List,
      count: taskCounts.all,
      color: isDarkMode ? 'text-gray-400' : 'text-slate-600'
    },
    {
      id: 'today',
      label: 'Due Today',
      icon: Calendar,
      count: taskCounts.today,
      color: 'text-blue-600'
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: Clock,
      count: taskCounts.overdue,
      color: 'text-red-600'
    },
    {
      id: 'high-priority',
      label: 'High Priority',
      icon: AlertTriangle,
      count: taskCounts['high-priority'],
      color: 'text-orange-600'
    },
    {
      id: 'shared',
      label: 'Shared Tasks',
      icon: Users,
      count: taskCounts.shared,
      color: 'text-purple-600'
    },
    {
      id: 'completed',
      label: 'Completed Tasks',
      icon: CheckCircle,
      count: taskCounts.completed,
      color: 'text-green-600'
    }
  ];

  return (
    <div className={cn(
      `w-full lg:w-64 rounded-xl p-4 lg:p-6 shadow-sm border h-fit`,
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-slate-200',
      className
    )}>
      <h3 className={cn(
        "font-semibold mb-3 lg:mb-4 text-base lg:text-lg",
        isDarkMode ? 'text-white' : 'text-slate-900'
      )}>
        Filters
      </h3>
      <div className="space-y-2 lg:space-y-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 group border",
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-900"
                  : isDarkMode
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white border-transparent hover:border-gray-600"
                    : "hover:bg-slate-50 text-slate-700 hover:border-slate-200 border-transparent"
              )}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <Icon className={cn(
                    "h-5 w-5", 
                    isActive ? "text-blue-600" : filter.color
                  )} />
                </div>
                <span className={cn(
                  "font-medium text-sm lg:text-base truncate",
                  isActive && "text-blue-900"
                )}>
                  {filter.label}
                </span>
              </div>
              <div className="flex-shrink-0 ml-3">
                <span className={cn(
                  "text-xs lg:text-sm px-2 py-1 rounded-full min-w-[24px] text-center font-medium",
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : isDarkMode
                      ? "bg-gray-600 text-gray-300 group-hover:bg-gray-500"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                )}>
                  {filter.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
