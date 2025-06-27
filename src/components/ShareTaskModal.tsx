
import { useState } from 'react';
import { X, Mail, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

interface ShareTaskModalProps {
  task: Task;
  onShare: (taskId: string, emails: string[]) => void;
  onClose: () => void;
}

export const ShareTaskModal = ({ task, onShare, onClose }: ShareTaskModalProps) => {
  const [emails, setEmails] = useState<string[]>(task.assignedTo || []);
  const [newEmail, setNewEmail] = useState('');
  const [shareLink, setShareLink] = useState(`https://taskflow.app/shared/${task.id}`);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const handleAddEmail = () => {
    if (newEmail.trim() && !emails.includes(newEmail.trim())) {
      setEmails([...emails, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = () => {
    onShare(task.id, emails);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Share Task</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-2">{task.title}</h3>
            <p className="text-sm text-slate-600">{task.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              <Mail className="inline h-4 w-4 mr-1" />
              Share with team members
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email address..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
              />
              <Button 
                type="button" 
                onClick={handleAddEmail} 
                variant="outline"
                disabled={!newEmail.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <Badge 
                  key={email} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => handleRemoveEmail(email)}
                >
                  {email} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Or share via link
            </label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-slate-50"
              />
              <Button 
                onClick={handleCopyLink}
                variant="outline"
                className="flex items-center gap-2"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Collaboration Features</h4>
                <p className="text-sm text-blue-700">
                  Shared tasks allow real-time collaboration. Team members can update status, add comments, and receive notifications.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleShare}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Share Task
          </Button>
        </div>
      </div>
    </div>
  );
};
