import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User as UserIcon,
  CheckSquare,
  Plus,
  Trash2,
  Send,
  Clock,
  Tag,
  AlertCircle,
  X,
} from 'lucide-react';
import { Task, Comment, User, TaskStatus, TaskPriority } from '../../types';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  projectMembers?: User[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  projectMembers = [],
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [membersList, setMembersList] = useState<User[]>(projectMembers);
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync members list
  useEffect(() => {
    if (projectMembers && projectMembers.length > 0) {
      setMembersList(projectMembers);
    } else if (isOpen) {
      api
        .getUsers()
        .then((res: any) => {
          const list = res.users || res.members || [];
          if (list.length > 0) {
            setMembersList(list);
          } else if (user) {
            setMembersList([user]);
          }
        })
        .catch(() => {
          if (user) setMembersList([user]);
        });
    }
  }, [projectMembers, isOpen, user]);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setSelectedAssignees((task.assignees || []).map((a) => a.id || (a as any)._id));
      setChecklist(task.checklist || []);
      setLabels(task.labels || []);

      // Load task comments
      loadComments(task._id);
    }
  }, [task]);

  // Listen for real-time comment additions
  useEffect(() => {
    if (!socket || !task) return;

    const handleNewComment = (data: { taskId: string; comment: Comment }) => {
      if (data.taskId === task._id) {
        setComments((prev) => {
          if (prev.some((c) => c._id === data.comment._id)) return prev;
          return [...prev, data.comment];
        });
      }
    };

    const handleCommentDeleted = (data: { taskId: string; commentId: string }) => {
      if (data.taskId === task._id) {
        setComments((prev) => prev.filter((c) => c._id !== data.commentId));
      }
    };

    socket.on('comment:new', handleNewComment);
    socket.on('comment:deleted', handleCommentDeleted);

    return () => {
      socket.off('comment:new', handleNewComment);
      socket.off('comment:deleted', handleCommentDeleted);
    };
  }, [socket, task]);

  const loadComments = async (taskId: string) => {
    try {
      const res = await api.getTaskComments(taskId);
      setComments(res.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  if (!isOpen || !task) return null;

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const res = await api.updateTask(task._id, {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assignees: selectedAssignees,
        checklist,
        labels,
      });

      onTaskUpdated(res.task);
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setIsDeleting(true);
      await api.deleteTask(task._id);
      onTaskDeleted(task._id);
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await api.createComment(task._id, commentText.trim());
      setComments((prev) => {
        if (prev.some((c) => c._id === res.comment._id)) return prev;
        return [...prev, res.comment];
      });
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    if (!labels.includes(newLabel.trim())) {
      setLabels((prev) => [...prev, newLabel.trim()]);
    }
    setNewLabel('');
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels((prev) => prev.filter((l) => l !== labelToRemove));
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white dark:bg-[#181D33] rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 z-10 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-3 py-1 rounded-full uppercase tracking-wider">
              Task Details
            </span>
            <PriorityBadge priority={priority} size="md" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg sm:text-xl font-bold bg-transparent text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="Task Title..."
            />
          </div>

          {/* Quick Controls Grid: Status, Priority, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-[#F5F6FC] dark:bg-[#151A2E] p-4 rounded-2xl">
            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white dark:bg-[#1E2540] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white dark:bg-[#1E2540] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Due Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white dark:bg-[#1E2540] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Assignees Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Assignees
            </label>
            <div className="flex flex-wrap gap-2">
              {membersList.map((m) => {
                const mId = m.id || (m as any)._id;
                const isAssigned = selectedAssignees.includes(mId);
                const isMe = user && (user._id === mId || user.id === mId);
                return (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => toggleAssignee(mId)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isAssigned
                        ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Avatar name={m.name} src={m.avatar} size="xs" />
                    <span>
                      {m.name} {isMe ? '(You)' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add details, acceptance criteria, context..."
              className="w-full bg-[#F5F6FC] dark:bg-[#151A2E] border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Checklist ({checklist.filter((i) => i.completed).length}/{checklist.length})
              </label>
            </div>

            <div className="space-y-2 mb-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F6FC] dark:bg-[#151A2E] group"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`text-xs sm:text-sm text-slate-700 dark:text-slate-200 truncate ${
                        item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                  <button
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                className="flex-1 bg-[#F5F6FC] dark:bg-[#151A2E] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Labels
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {labels.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300"
                >
                  <Tag className="w-3 h-3" />
                  {l}
                  <button
                    onClick={() => handleRemoveLabel(l)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-xs">
              <input
                type="text"
                placeholder="New label..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                className="flex-1 bg-[#F5F6FC] dark:bg-[#151A2E] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Comments Discussion Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              Task Discussion
              <span className="text-xs font-normal text-slate-400">
                ({comments.length} comments)
              </span>
            </h4>

            {/* Comment Thread */}
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation below!</p>
              ) : (
                comments.map((c) => {
                  const isAuthor = user?.id === c.author?.id || user?.id === (c.author as any)?._id;
                  return (
                    <div
                      key={c._id}
                      className="p-3 rounded-2xl bg-[#F5F6FC] dark:bg-[#151A2E] flex items-start gap-3 group"
                    >
                      <Avatar name={c.author?.name} src={c.author?.avatar} size="xs" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {c.author?.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {c.text}
                        </p>
                      </div>

                      {isAuthor && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-[#F5F6FC] dark:bg-[#151A2E] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmittingComment}
                disabled={!commentText.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:px-6 bg-[#FAFAFE] dark:bg-[#14182E] border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSaveChanges} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
