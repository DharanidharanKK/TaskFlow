import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  onTaskAction?: (action: string, taskData?: any) => void;
  isDarkMode?: boolean;
}

export const AIChatAssistant = ({ onTaskAction, isDarkMode = false }: AIChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: 'Hi! I\'m your AI assistant powered by Google Gemini. I can help you manage tasks with voice or text commands. Try saying: "Create a task to finish the report by tomorrow" or "What\'s the best way to stay organized?"',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or type your message.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const parseDateString = (dateStr: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (dateStr && dateStr.includes('today')) return today.toISOString().split('T')[0];
    if (dateStr && dateStr.includes('tomorrow')) return tomorrow.toISOString().split('T')[0];
    
    if (dateStr) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    }
    
    return today.toISOString().split('T')[0];
  };

  const executeGeminiAction = async (actionData: any) => {
    if (!onTaskAction) return;

    try {
      switch (actionData.action) {
        case 'create_task':
          await onTaskAction('create', {
            title: actionData.title,
            description: actionData.description || '',
            priority: actionData.priority || 'medium',
            dueDate: actionData.due_date ? parseDateString(actionData.due_date) : new Date().toISOString().split('T')[0],
            status: actionData.status || 'todo'
          });
          return `Created task: "${actionData.title}"`;

        case 'update_task':
          await onTaskAction('update', {
            targetTitle: actionData.target_title,
            title: actionData.title,
            description: actionData.description,
            priority: actionData.priority,
            dueDate: actionData.due_date ? parseDateString(actionData.due_date) : undefined,
            status: actionData.status
          });
          return `Updated task: "${actionData.target_title}"`;

        case 'delete_task':
          await onTaskAction('delete_by_title', { targetTitle: actionData.target_title });
          return `Deleted task: "${actionData.target_title}"`;

        case 'delete_all_tasks':
          await onTaskAction('delete_all');
          return "Deleted all tasks";

        case 'delete_all_completed_tasks':
          await onTaskAction('delete_completed');
          return "Deleted all completed tasks";

        case 'mark_task_complete':
          await onTaskAction('mark_complete', { targetTitle: actionData.target_title });
          return `Marked "${actionData.target_title}" as complete`;

        case 'mark_task_incomplete':
          await onTaskAction('mark_incomplete', { targetTitle: actionData.target_title });
          return `Marked "${actionData.target_title}" as incomplete`;

        case 'set_task_priority':
          await onTaskAction('set_priority', { 
            targetTitle: actionData.target_title, 
            priority: actionData.priority 
          });
          return `Set "${actionData.target_title}" priority to ${actionData.priority}`;

        case 'give_task_tip':
        case 'estimate_task_time':
          return actionData.response || "Here's a helpful tip for managing your tasks effectively.";

        default:
          return actionData.response || "I processed your request successfully.";
      }
    } catch (error) {
      console.error('Error executing Gemini action:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('Calling chat-ai function with message:', currentInput);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { message: currentInput }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data || !data.response) {
        throw new Error('Invalid response from AI service');
      }

      let responseContent = '';
      
      // Handle Gemini's JSON response
      if (typeof data.response === 'object' && data.response.action) {
        responseContent = await executeGeminiAction(data.response);
      } else {
        responseContent = data.response;
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Chat error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      if (error.message.includes('Rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message.includes('Invalid API key')) {
        errorMessage = 'There seems to be an issue with the Gemini API configuration. Please check the settings.';
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[500px] ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl z-50 flex flex-col`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <MessageCircle className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gemini AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceToggle}
            className={`${isListening ? 'bg-red-100 border-red-300' : ''} ${isDarkMode ? 'border-gray-600' : ''}`}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-red-600" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask me anything..."}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            disabled={isListening}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
