
import { useState } from 'react';
import { Upload, File, X, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileAttachmentProps {
  attachmentUrl?: string;
  onAttachmentChange: (url: string | null) => void;
  isDarkMode?: boolean;
}

export const FileAttachment = ({ attachmentUrl, onAttachmentChange, isDarkMode = false }: FileAttachmentProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(data.path);

      onAttachmentChange(publicUrl);
      toast({
        title: "File uploaded successfully",
        description: "Your file has been attached to the task.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = () => {
    onAttachmentChange(null);
    toast({
      title: "Attachment removed",
      description: "File attachment has been removed from the task.",
    });
  };

  const getFileName = (url: string) => {
    return url.split('/').pop()?.split('?')[0] || 'attachment';
  };

  const handleViewFile = () => {
    if (attachmentUrl) {
      window.open(attachmentUrl, '_blank');
    }
  };

  if (attachmentUrl) {
    return (
      <div className={`flex items-center justify-between p-3 border rounded-lg ${
        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <File className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {getFileName(attachmentUrl)}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewFile}
            className={`h-8 w-8 p-0 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveAttachment}
            className={`h-8 w-8 p-0 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
      isDarkMode 
        ? 'border-gray-600 hover:border-gray-500' 
        : 'border-gray-300 hover:border-gray-400'
    } transition-colors`}>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
        disabled={isUploading}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`h-8 w-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          } ${isUploading ? 'animate-pulse' : ''}`} />
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {isUploading ? 'Uploading...' : 'Click to upload file'}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Max 10MB • Images, PDFs, Documents
            </p>
          </div>
        </div>
      </label>
    </div>
  );
};
