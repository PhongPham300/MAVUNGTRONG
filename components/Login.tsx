
import React, { useState } from 'react';
import { Sprout, Loader2, Phone, MapPin, Globe } from 'lucide-react';
import { api } from '../services/api';
import { Employee, SystemSettings } from '../types';

interface LoginProps {
  onLoginSuccess: (user: Employee) => void;
  systemSettings: SystemSettings | null;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, systemSettings }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await api.login(code, password);
      if (user) {
        if (user.status !== 'Đang làm việc') {
          setError('Tài khoản này đã ngừng hoạt động.');
        } else {
          // Lưu vào localStorage nếu chọn ghi nhớ
          if (rememberMe) {
            localStorage.setItem('agrilink_user', JSON.stringify(user));
          } else {
            // Nếu không chọn thì xóa session cũ (nếu có) để đảm bảo an toàn
            localStorage.removeItem('agrilink_user');
          }
          onLoginSuccess(user);
        }
      } else {
        setError('Mã nhân viên hoặc mật khẩu không đúng.');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const company = systemSettings?.companyInfo;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-green-800 rounded-b-[3rem] z-0 shadow-xl"></div>
      
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-white p-2 rounded-full shadow-lg mb-4 -mt-16">
            {company?.logoUrl ? (
              <img 
                src={company.logoUrl} 
                alt="Logo" 
                className="w-24 h-24 rounded-full object-contain"
              />
            ) : (
              <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center text-green-700">
                <Sprout size={48} />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 uppercase px-4">
            {company?.name || "HỆ THỐNG QUẢN LÝ NÔNG NGHIỆP"}
          </h1>
          <p className="text-slate-500 mt-2">Đăng nhập hệ thống quản lý</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mã nhân viên</label>
            <input 
              type="text" 
              required
              placeholder="Nhập mã nhân viên..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <input 
              type="password" 
              required
              placeholder="Nhập mật khẩu..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="rememberMe"
              className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500 cursor-pointer"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer select-none">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-700/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'ĐĂNG NHẬP'}
          </button>
        </form>

        {/* Footer info from company settings */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
           {company?.address && (
             <p className="flex items-center justify-center gap-1">
               <MapPin size={10} /> {company.address}
             </p>
           )}
           <div className="flex justify-center gap-4">
             {company?.phone && (
               <p className="flex items-center gap-1">
                 <Phone size={10} /> {company.phone}
               </p>
             )}
             {company?.website && (
               <p className="flex items-center gap-1">
                 <Globe size={10} /> {company.website}
               </p>
             )}
           </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-green-800/50 text-xs">
         © 2025 Thanh Phong. All rights reserved.
      </div>
    </div>
  );
};
