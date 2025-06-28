import { useState } from 'react';
import { X, User, LogOut, Sun, Moon, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SupabaseUser | null;
  isDarkMode: boolean;
  onDarkModeToggle: (enabled: boolean) => void;
  onLogout: () => void;
}

export const SettingsModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  isDarkMode, 
  onDarkModeToggle,
  onLogout 
}: SettingsModalProps) => {
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
      onClose();
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

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google': return 'Google';
      case 'github': return 'GitHub';
      case 'facebook': return 'Facebook';
      default: return 'Email';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-3">
            <Settings className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Settings
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Information */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <User className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} />
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Account Information
              </h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Email</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currentUser?.email}
                </p>
              </div>
              {currentUser?.app_metadata?.provider && (
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Provider</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {getProviderName(currentUser.app_metadata.provider)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Preferences
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDarkMode ? <Sun className="h-5 w-5 text-gray-300" /> : <Moon className="h-5 w-5 text-slate-600" />}
                <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dark Mode</span>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={onDarkModeToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} />
                <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Task Reminders</span>
              </div>
              <Switch
                checked={alarmEnabled}
                onCheckedChange={setAlarmEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} />
                <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Email Notifications</span>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 