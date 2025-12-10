import React from 'react';
import { LayoutDashboard, Sprout, ShoppingCart, Settings, ClipboardList, Users, LogOut, KeyRound, FolderOpen, X, Workflow } from 'lucide-react';
import { Employee, SystemSettings, AppPermissions } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Employee | null;
  onLogout: () => void;
  systemSettings: SystemSettings | null;
  permissions: AppPermissions;
  onOpenProfile: () => void;
  // Responsive props
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout, 
  systemSettings, 
  permissions, 
  onOpenProfile,
  isOpen,
  onClose
}) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, visible: permissions.viewDashboard },
    { id: 'sop', label: 'Quy trình', icon: Workflow, visible: permissions.viewSOP },
    { id: 'areas', label: 'Vùng trồng', icon: Sprout, visible: permissions.viewArea },
    { id: 'farming', label: 'Quản lý canh tác', icon: ClipboardList, visible: permissions.viewFarming },
    { id: 'purchases', label: 'Thu mua', icon: ShoppingCart, visible: permissions.viewPurchase },
    { id: 'documents', label: 'Kho tài liệu', icon: FolderOpen, visible: permissions.viewDocuments },
    { id: 'staff', label: 'Nhân viên', icon: Users, visible: permissions.viewStaff },
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    onClose(); // Close sidebar on mobile when item clicked
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full bg-green-900 text-white w-64 shadow-2xl z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-6 border-b border-green-800 flex flex-col items-center text-center relative">
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-green-300 hover:text-white md:hidden"
          >
            <X size={24} />
          </button>

          {systemSettings?.companyInfo?.logoUrl ? (
            <img 
              src={systemSettings.companyInfo.logoUrl} 
              alt="Company Logo" 
              className="w-16 h-16 rounded-full bg-white object-contain mb-3 p-1"
            />
          ) : (
            <Sprout className="w-12 h-12 text-green-300 mb-3" />
          )}
          <h1 className="text-xl font-bold leading-tight line-clamp-2">
            {systemSettings?.companyInfo?.name || "Hoa Cương Group"}
          </h1>
          
          {/* User Profile Trigger */}
          <button 
            onClick={() => { onOpenProfile(); onClose(); }}
            className="mt-4 flex items-center gap-2 bg-green-800/50 p-2 rounded-lg w-full hover:bg-green-700 transition-colors cursor-pointer group"
            title="Đổi mật khẩu"
          >
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-xs font-bold shrink-0 border border-green-600 group-hover:border-green-400">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="overflow-hidden text-left flex-1">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-green-300 truncate uppercase">{currentUser?.role}</p>
            </div>
            <KeyRound size={14} className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[calc(100vh-280px)]">
          {menuItems.filter(i => i.visible).map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-green-700 text-white shadow-md' 
                  : 'hover:bg-green-800 text-green-100'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-green-800 space-y-2 absolute bottom-0 w-full bg-green-900">
          {permissions.viewSettings && (
            <button 
              onClick={() => handleItemClick('settings')}
              className={`flex items-center gap-3 px-4 py-3 transition-colors w-full rounded-lg ${
                 activeTab === 'settings' ? 'bg-green-700 text-white' : 'text-green-200 hover:text-white hover:bg-green-800'
              }`}
            >
              <Settings size={20} className="shrink-0" />
              <span>Cấu hình</span>
            </button>
          )}
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-200 hover:text-white hover:bg-red-900/50 transition-colors w-full rounded-lg"
          >
            <LogOut size={20} className="shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};