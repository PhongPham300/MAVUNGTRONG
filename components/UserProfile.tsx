import React, { useState } from 'react';
import { Employee } from '../types';
import { KeyRound, CheckCircle, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface UserProfileProps {
  currentUser: Employee;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: Employee) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentUser, isOpen, onClose, onUpdateUser }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (currentPassword !== currentUser.password) {
      setError('Mật khẩu hiện tại không đúng.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = { ...currentUser, password: newPassword };
      await api.updateEmployee(updatedUser);
      onUpdateUser(updatedUser);
      setSuccess('Đổi mật khẩu thành công!');
      
      // Lưu lại vào localStorage để không bị logout nếu f5
      localStorage.setItem('hoacuong_user', JSON.stringify(updatedUser));
      
      setTimeout(() => {
        onClose();
        setSuccess('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (e) {
      setError('Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <KeyRound size={20} className="text-green-600" />
            Đổi mật khẩu
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
             <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
               {currentUser.name.charAt(0)}
             </div>
             <div>
               <p className="font-bold text-slate-800">{currentUser.name}</p>
               <p className="text-sm text-slate-500">{currentUser.role}</p>
             </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
          {success && <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-100 flex items-center gap-2"><CheckCircle size={16}/> {success}</div>}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
            <input type="password" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
              value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
            <input type="password" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
              value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
            <input type="password" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-2 disabled:bg-slate-300">
               {isSubmitting && <Loader2 size={16} className="animate-spin" />}
               Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};