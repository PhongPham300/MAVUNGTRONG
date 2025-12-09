
import React, { useState } from 'react';
import { Employee, Role, AppPermissions } from '../types';
import { Plus, Search, User, Edit, Trash2, X, Eye, EyeOff, Shield, Info, CreditCard } from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[]; roles: Role[]; onAddEmployee: (e: Omit<Employee, 'id'>) => Promise<void>; onUpdateEmployee: (e: Employee) => Promise<void>; onDeleteEmployee: (id: string) => Promise<void>; permissions: AppPermissions;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ employees, roles, onAddEmployee, onUpdateEmployee, onDeleteEmployee, permissions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState<Partial<Employee>>({ 
    status: 'Đang làm việc', 
    joinDate: new Date().toISOString().split('T')[0], 
    password: '123' 
  });

  const resetForm = () => { 
    setFormData({ 
      status: 'Đang làm việc', 
      joinDate: new Date().toISOString().split('T')[0], 
      password: '123',
      dob: '',
      identityCard: '',
      address: '',
      email: '',
      phone: ''
    }); 
    setEditingId(null); 
    setErrors({});
    setShowPassword(false);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name) newErrors.name = "Tên không được để trống";
    if (!formData.code) newErrors.code = "Mã nhân viên không được để trống";
    if (!formData.role) newErrors.role = "Vui lòng chọn chức vụ";
    
    // Validate Phone (VN format basic)
    if (formData.phone && !/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone)) {
       newErrors.phone = "Số điện thoại không hợp lệ";
    }
    
    // Validate Email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
       newErrors.email = "Email không hợp lệ";
    }
    
    // Validate Password
    if (formData.password && formData.password.length < 3) {
      newErrors.password = "Mật khẩu quá ngắn (min 3)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (validateForm()) {
      if(editingId) await onUpdateEmployee({...formData, id: editingId} as Employee); 
      else await onAddEmployee(formData as Omit<Employee, 'id'>); 
      setIsModalOpen(false); 
      resetForm(); 
    }
  };

  const filtered = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự</h2>
        {permissions.createStaff && <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex gap-2 shadow-sm"><Plus size={20}/><span className="hidden sm:inline">Thêm nhân viên</span></button>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input className="pl-8 p-2 border rounded-lg w-full max-w-xs focus:ring-2 focus:ring-green-500 outline-none" placeholder="Tìm kiếm tên, mã..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm min-w-[800px]">
             <thead className="bg-slate-50 text-slate-600 font-semibold"><tr><th className="p-4">Nhân viên</th><th className="p-4">Chức vụ</th><th className="p-4">Liên hệ</th><th className="p-4">Ngày vào làm</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">#</th></tr></thead>
             <tbody className="divide-y">
               {filtered.map(e => (
                 <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                   <td className="p-4 flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">{e.name.charAt(0)}</div>
                     <div><div className="font-medium text-slate-800">{e.name}</div><div className="text-xs text-slate-500 font-mono">{e.code}</div></div>
                   </td>
                   <td className="p-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium border">{e.role}</span></td>
                   <td className="p-4"><div className="text-sm">{e.phone}</div><div className="text-xs text-slate-400">{e.email}</div></td>
                   <td className="p-4 text-slate-500">{e.joinDate}</td>
                   <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${e.status === 'Đang làm việc' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{e.status}</span></td>
                   <td className="p-4 text-right">
                     <div className="flex justify-end gap-2">
                       {permissions.updateStaff && <button onClick={() => {setEditingId(e.id); setFormData(e); setIsModalOpen(true);}} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={16}/></button>}
                       {permissions.deleteStaff && <button onClick={() => onDeleteEmployee(e.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>}
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh]">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Cập nhật hồ sơ' : 'Thêm nhân viên mới'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Group 1: Account Info */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2 border-b pb-2"><User size={16}/> Thông tin tài khoản</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mã nhân viên <span className="text-red-500">*</span></label>
                      <input className={`w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none ${errors.code ? 'border-red-500':''}`} placeholder="VD: NV001" value={formData.code||''} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} readOnly={!!editingId && formData.code !== 'ADMIN'}/>
                      {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Chức vụ <span className="text-red-500">*</span></label>
                      <select className={`w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none ${errors.role ? 'border-red-500':''}`} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="">-- Chọn chức vụ --</option>
                        {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </select>
                      {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium mb-1">Trạng thái làm việc</label>
                     <select className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                       <option value="Đang làm việc">Đang làm việc</option>
                       <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                     </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium mb-1">Ngày vào làm</label>
                      <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={formData.joinDate||''} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                   </div>
                 </div>
              </div>

              {/* Group 2: Personal Info */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2 border-b pb-2"><Info size={16}/> Thông tin cá nhân</h4>
                 <div>
                    <label className="block text-sm font-medium mb-1">Họ và tên <span className="text-red-500">*</span></label>
                    <input className={`w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none ${errors.name ? 'border-red-500':''}`} placeholder="Nhập họ tên đầy đủ" value={formData.name||''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                       <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" value={formData.dob||''} onChange={e => setFormData({...formData, dob: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                       <input className={`w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none ${errors.phone ? 'border-red-500':''}`} placeholder="09xxxx" value={formData.phone||''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                       {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium mb-1">Số CCCD / CMND</label>
                       <div className="relative">
                          <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                          <input className="w-full pl-9 p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" placeholder="12 số..." value={formData.identityCard||''} onChange={e => setFormData({...formData, identityCard: e.target.value})} />
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1">Địa chỉ thường trú</label>
                       <input className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none" placeholder="Số nhà, đường, phường/xã..." value={formData.address||''} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                 </div>
              </div>

              {/* Group 3: Security */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2 border-b pb-2"><Shield size={16}/> Bảo mật & Liên hệ</h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium mb-1">Email</label>
                       <input type="email" className={`w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none ${errors.email ? 'border-red-500':''}`} placeholder="email@example.com" value={formData.email||''} onChange={e => setFormData({...formData, email: e.target.value})} />
                       {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                       <label className="block text-sm font-medium mb-1">Mật khẩu đăng nhập</label>
                       <div className="relative">
                          <input 
                             type={showPassword ? "text" : "password"} 
                             className={`w-full p-2 pr-10 border rounded focus:ring-2 focus:ring-green-500 outline-none ${errors.password ? 'border-red-500':''}`} 
                             placeholder="******" 
                             value={formData.password||''} 
                             onChange={e => setFormData({...formData, password: e.target.value})} 
                          />
                          {permissions.manageRoles && (
                             <button 
                               type="button"
                               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                               onClick={() => setShowPassword(!showPassword)}
                               title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu (Admin)"}
                             >
                               {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                             </button>
                          )}
                       </div>
                       {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                       <p className="text-[10px] text-slate-400 mt-1">Chỉ Quản trị viên mới có quyền xem mật khẩu.</p>
                    </div>
                 </div>
              </div>

            </form>
            
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
               <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-white transition-colors">Hủy bỏ</button>
               <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm font-medium transition-colors">
                  {editingId ? 'Cập nhật hồ sơ' : 'Thêm nhân viên'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
