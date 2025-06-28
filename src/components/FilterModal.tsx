import { useState } from 'react';
import { X, Filter, Calendar, AlertTriangle, Clock, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  isDarkMode: boolean;
}

export const FilterModal = ({ 
  isOpen, 
  onClose, 
  activeFilter, 
  onFilterChange, 
  sortBy, 
  onSortChange,
  isDarkMode 
}: FilterModalProps) => {
  const [localFilter, setLocalFilter] = useState(activeFilter);
  const [localSort, setLocalSort] = useState(sortBy);

  if (!isOpen) return null;

  const filters = [
    { id: 'all', label: 'All Tasks', icon: '📋' },
    { id: 'today', label: 'Due Today', icon: '📅' },
    { id: 'overdue', label: 'Overdue', icon: '⏰' },
    { id: 'high-priority', label: 'High Priority', icon: '🔴' },
    { id: 'medium-priority', label: 'Medium Priority', icon: '🟡' },
    { id: 'low-priority', label: 'Low Priority', icon: '🟢' },
    { id: 'shared', label: 'Shared Tasks', icon: '👥' },
    { id: 'completed', label: 'Completed Tasks', icon: '✅' }
  ];

  const sortOptions = [
    { id: 'priority-high', label: 'Priority (High → Low)', icon: '🔴🟡🟢' },
    { id: 'priority-low', label: 'Priority (Low → High)', icon: '🟢🟡🔴' },
    { id: 'date-earliest', label: 'Date (Earliest First)', icon: '📅↑' },
    { id: 'date-latest', label: 'Date (Latest First)', icon: '📅↓' },
    { id: 'created-newest', label: 'Created (Newest First)', icon: '🆕' },
    { id: 'created-oldest', label: 'Created (Oldest First)', icon: '📜' }
  ];

  const handleApply = () => {
    onFilterChange(localFilter);
    onSortChange(localSort);
    onClose();
  };

  const handleReset = () => {
    setLocalFilter('all');
    setLocalSort('priority-high');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-3">
            <Filter className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Filter & Sort
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filter Section */}
          <div>
            <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Filter by Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setLocalFilter(filter.id)}
                  className={`p-3 rounded-lg text-left transition-colors border ${
                    localFilter === filter.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-900'
                      : isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-300 hover:text-white border-gray-600'
                        : 'hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{filter.icon}</span>
                    <span className="font-medium text-sm">{filter.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Section */}
          <div>
            <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Sort by
            </h3>
            <Select value={localSort} onValueChange={setLocalSort}>
              <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center space-x-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Actions */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
            <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Quick Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setLocalFilter('high-priority')}
              >
                🔴 High Priority
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setLocalFilter('today')}
              >
                📅 Due Today
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setLocalFilter('overdue')}
              >
                ⏰ Overdue
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => setLocalFilter('shared')}
              >
                👥 Shared
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex justify-between pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleApply}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 