
import { Calendar, Clock, AlertTriangle, Share2, CheckCircle, List } from 'lucide-react';
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
}

export const FilterSidebar = ({ activeFilter, onFilterChange, taskCounts, className }: FilterSidebarProps) => {
  const filters = [
    {
      id: 'all',
      label: 'All Tasks',
      icon: List,
      count: taskCounts.all,
      color: 'text-slate-600'
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
      label: 'Shared with Me',
      icon: Share2,
      count: taskCounts.shared,
      color: 'text-purple-600'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      count: taskCounts.completed,
      color: 'text-green-600'
    }
  ];

  return (
    <div className={cn("w-64 bg-white rounded-xl p-6 shadow-sm border border-slate-200 h-fit", className)}>
      <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
      <div className="space-y-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-900"
                  : "hover:bg-slate-50 text-slate-700"
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn("h-5 w-5", isActive ? "text-blue-600" : filter.color)} />
                <span className={cn("font-medium", isActive && "text-blue-900")}>
                  {filter.label}
                </span>
              </div>
              <span className={cn(
                "text-sm px-2 py-1 rounded-full min-w-[24px] text-center",
                isActive 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-slate-100 text-slate-600"
              )}>
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-slate-900 mb-2">Pro Tip</h4>
        <p className="text-sm text-slate-600">
          Use keyboard shortcuts: Press 'N' to create a new task, 'F' to toggle filters.
        </p>
      </div>
    </div>
  );
};
