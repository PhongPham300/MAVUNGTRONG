import React, { useState, useRef, useEffect } from 'react';
import { LinkageStatusOption, SystemSettings, ActivityTypeOption, CropTypeOption, ProductQualityOption, Role, AppPermissions, FieldConfig, BackupData } from '../types';
import { Plus, Trash2, Save, Edit2, Settings as SettingsIcon, FileText, List, Building2, Upload, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ListOrdered, AlignJustify, Sprout, Shield, Database, LayoutTemplate, Download, ArchiveRestore, ShoppingCart } from 'lucide-react';
import { api } from '../services/api';

interface SettingsProps {
  linkageStatuses: LinkageStatusOption[];
  systemSettings: SystemSettings;
  onAddStatus: (status: Omit<LinkageStatusOption, 'id'>) => Promise<void>;
  onUpdateStatus: (status: LinkageStatusOption) => Promise<void>;
  onDeleteStatus: (id: string) => Promise<void>;
  onUpdateSystemSettings: (settings: SystemSettings) => Promise<void>;
  onRestoreData?: (data: BackupData) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ 
  linkageStatuses, 
  systemSettings, 
  onAddStatus, 
  onUpdateStatus, 
  onDeleteStatus,
  onUpdateSystemSettings,
  onRestoreData
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'roles' | 'config' | 'lists' | 'templates' | 'backup'>('company');
  const [listSubTab, setListSubTab] = useState<'linkage' | 'crops' | 'activities' | 'qualities'>('linkage');

  // --- STATE ---
  // Statuses
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('bg-slate-100 text-slate-600');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [editingColor, setEditingColor] = useState('');

  // Lists
  const [activities, setActivities] = useState<ActivityTypeOption[]>(systemSettings.activityTypes);
  const [newActivityLabel, setNewActivityLabel] = useState('');
  const [crops, setCrops] = useState<CropTypeOption[]>(systemSettings.cropTypes || []);
  const [newCropLabel, setNewCropLabel] = useState('');
  const [qualities, setQualities] = useState<ProductQualityOption[]>(systemSettings.productQualities || []);
  const [newQualityLabel, setNewQualityLabel] = useState('');

  // Roles
  const [roles, setRoles] = useState<Role[]>(systemSettings.roles || []);
  const [newRoleName, setNewRoleName] = useState('');

  // Template
  const [selectedTemplateType, setSelectedTemplateType] = useState<'memo' | 'contract' | 'invoice'>('memo');
  const editorRef = useRef<HTMLDivElement>(null);

  // Company Info
  const [companyInfo, setCompanyInfo] = useState(systemSettings.companyInfo);

  // Field Config
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>(systemSettings.fieldConfig || {
    area: { hectares: true, owner: true, location: false, estimatedYield: false },
    farming: { cost: false, actualArea: false, technician: true },
    purchase: { quality: true, price: true }
  });

  // Backup
  const backupInputRef = useRef<HTMLInputElement>(null);

  const colorOptions = [
    { label: 'Xám (Mặc định)', value: 'bg-slate-100 text-slate-600' },
    { label: 'Xanh lá (Thành công)', value: 'bg-green-100 text-green-700' },
    { label: 'Xanh dương (Hoạt động)', value: 'bg-blue-100 text-blue-700' },
    { label: 'Vàng (Cảnh báo)', value: 'bg-amber-100 text-amber-700' },
    { label: 'Đỏ (Nguy hiểm)', value: 'bg-red-100 text-red-700' },
    { label: 'Tím', value: 'bg-purple-100 text-purple-700' },
  ];

  // --- Handlers ---
  const handleSaveAllLists = async () => {
    await onUpdateSystemSettings({
      ...systemSettings,
      activityTypes: activities,
      cropTypes: crops,
      productQualities: qualities,
      roles: roles,
      fieldConfig: fieldConfig
    });
    alert("Đã lưu cấu hình!");
  };

  const handleAddLinkage = async () => { if (newStatusLabel.trim()) { await onAddStatus({ label: newStatusLabel, color: newStatusColor }); setNewStatusLabel(''); } };
  const startEditLinkage = (s: LinkageStatusOption) => { setEditingId(s.id); setEditingLabel(s.label); setEditingColor(s.color); };
  const saveEditLinkage = async () => { if (editingId) { await onUpdateStatus({ id: editingId, label: editingLabel, color: editingColor }); setEditingId(null); } };
  
  const handleDeleteItem = (id: string, list: any[], setList: any) => { setList(list.filter(a => a.id !== id)); };
  const handleAddItem = (label: string, list: any[], setList: any, setLabel: any) => { if (label.trim()) { setList([...list, { id: Math.random().toString(), label }]); setLabel(''); } };

  const handleAddRole = () => { if(newRoleName) { setRoles([...roles, { id: Math.random().toString(), name: newRoleName, permissions: {} as any }]); setNewRoleName(''); } };
  const handleUpdateRolePermission = (rid: string, k: keyof AppPermissions, v: boolean) => { setRoles(roles.map(r => r.id === rid ? { ...r, permissions: { ...r.permissions, [k]: v } } : r)); };
  
  // Template Handlers
  useEffect(() => {
    let content = '';
    if (selectedTemplateType === 'memo') content = systemSettings.memoTemplate;
    else if (selectedTemplateType === 'contract') content = systemSettings.contractTemplate || '';
    else if (selectedTemplateType === 'invoice') content = systemSettings.invoiceTemplate || '';
    if (editorRef.current) editorRef.current.innerHTML = content;
  }, [selectedTemplateType, systemSettings]);

  const handleSaveTemplate = async () => {
    if (editorRef.current) {
      const c = editorRef.current.innerHTML;
      const u = { ...systemSettings };
      if (selectedTemplateType === 'memo') u.memoTemplate = c;
      else if (selectedTemplateType === 'contract') u.contractTemplate = c;
      else if (selectedTemplateType === 'invoice') u.invoiceTemplate = c;
      await onUpdateSystemSettings(u);
      alert("Đã lưu mẫu!");
    }
  };

  const execCmd = (cmd: string, val?: string) => { 
    document.execCommand(cmd, false, val); 
    editorRef.current?.focus(); 
  };

  // Backup & Restore
  const handleBackup = async () => {
    try {
      const data = await api.backupData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hoacuong_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (e) { alert("Lỗi sao lưu"); }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onRestoreData) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          await onRestoreData(data);
        } catch (err) { alert("File không hợp lệ"); }
      };
      reader.readAsText(file);
    }
  };

  // Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyInfo(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Permission Group Config
  const PERMISSION_GROUPS = [
    { 
      name: 'Chung', 
      perms: [
        { k: 'viewDashboard', l: 'Xem Dashboard' }, 
        { k: 'viewSOP', l: 'Xem Quy trình' }, 
        { k: 'viewSettings', l: 'Cấu hình hệ thống' }
      ] 
    },
    { 
      name: 'Vùng trồng', 
      perms: [
        { k: 'viewArea', l: 'Xem DS' }, 
        { k: 'createArea', l: 'Thêm mới' }, 
        { k: 'updateArea', l: 'Cập nhật' }, 
        { k: 'deleteArea', l: 'Xóa' }, 
        { k: 'approveLegal', l: 'Duyệt pháp lý' }
      ] 
    },
    { 
      name: 'Canh tác', 
      perms: [
        { k: 'viewFarming', l: 'Xem Nhật ký' }, 
        { k: 'createFarming', l: 'Thêm mới' }, 
        { k: 'updateFarming', l: 'Cập nhật' }, 
        { k: 'deleteFarming', l: 'Xóa' }
      ] 
    },
    { 
      name: 'Thu mua', 
      perms: [
        { k: 'viewPurchase', l: 'Xem DS' }, 
        { k: 'createPurchase', l: 'Thêm mới' }, 
        { k: 'updatePurchase', l: 'Cập nhật' }, 
        { k: 'deletePurchase', l: 'Xóa' },
        { k: 'viewFinancials', l: 'Xem Giá/Tiền' }
      ] 
    },
    { 
      name: 'Nhân sự', 
      perms: [
        { k: 'viewStaff', l: 'Xem DS' }, 
        { k: 'createStaff', l: 'Thêm mới' }, 
        { k: 'updateStaff', l: 'Cập nhật' }, 
        { k: 'deleteStaff', l: 'Xóa' },
        { k: 'manageRoles', l: 'Phân quyền' }
      ] 
    },
    { 
      name: 'Tài liệu', 
      perms: [
        { k: 'viewDocuments', l: 'Xem/Tải' }, 
        { k: 'manageDocuments', l: 'Thêm/Xóa File' }
      ] 
    },
  ];

  // Reusable components
  const RenderListEditor = ({ title, items, newVal, setVal, onAdd, onDelete }: any) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-slate-700">{title}</h4>
      <div className="flex gap-2">
        <input className="border p-2 rounded flex-1 text-sm" placeholder="Nhập tên..." value={newVal} onChange={e => setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onAdd()}/>
        <button onClick={onAdd} className="bg-green-600 text-white px-3 rounded text-sm"><Plus size={16}/></button>
      </div>
      <ul className="border rounded divide-y max-h-60 overflow-y-auto">
        {items.map((i: any) => (
          <li key={i.id} className="p-2 flex justify-between hover:bg-slate-50 text-sm">
            <span>{i.label}</span>
            <button onClick={() => onDelete(i.id)} className="text-red-500"><Trash2 size={14}/></button>
          </li>
        ))}
      </ul>
    </div>
  );

  const RichTextToolbar = () => (
     <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border rounded-t-lg items-center">
        <div className="flex bg-white border rounded">
           <button onMouseDown={e => {e.preventDefault(); execCmd('bold');}} className="p-1.5 hover:bg-slate-100" title="In đậm"><Bold size={16}/></button>
           <button onMouseDown={e => {e.preventDefault(); execCmd('italic');}} className="p-1.5 hover:bg-slate-100" title="In nghiêng"><Italic size={16}/></button>
           <button onMouseDown={e => {e.preventDefault(); execCmd('underline');}} className="p-1.5 hover:bg-slate-100" title="Gạch chân"><Underline size={16}/></button>
        </div>
        
        <div className="flex bg-white border rounded">
           <button onMouseDown={e => {e.preventDefault(); execCmd('justifyLeft');}} className="p-1.5 hover:bg-slate-100" title="Căn trái"><AlignLeft size={16}/></button>
           <button onMouseDown={e => {e.preventDefault(); execCmd('justifyCenter');}} className="p-1.5 hover:bg-slate-100" title="Căn giữa"><AlignCenter size={16}/></button>
           <button onMouseDown={e => {e.preventDefault(); execCmd('justifyRight');}} className="p-1.5 hover:bg-slate-100" title="Căn phải"><AlignRight size={16}/></button>
           <button onMouseDown={e => {e.preventDefault(); execCmd('justifyFull');}} className="p-1.5 hover:bg-slate-100" title="Căn đều"><AlignJustify size={16}/></button>
        </div>

        <div className="flex bg-white border rounded">
           <button onMouseDown={e => {e.preventDefault(); execCmd('insertUnorderedList');}} className="p-1.5 hover:bg-slate-100" title="Danh sách"><List size={16}/></button>
           <button onMouseDown={e => {e.preventDefault(); execCmd('insertOrderedList');}} className="p-1.5 hover:bg-slate-100" title="Số thứ tự"><ListOrdered size={16}/></button>
        </div>

        <div className="flex gap-1 items-center bg-white border rounded px-1">
           <select onChange={e => execCmd('fontName', e.target.value)} className="text-xs p-1 outline-none border-r">
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
           </select>
           <select onChange={e => execCmd('fontSize', e.target.value)} className="text-xs p-1 outline-none">
              <option value="3">12px</option>
              <option value="4">14px</option>
              <option value="5">18px</option>
              <option value="6">24px</option>
              <option value="7">36px</option>
           </select>
        </div>
     </div>
  );

  return (
    <div className="flex h-full gap-6 max-w-6xl mx-auto">
      {/* Settings Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
        <div className="p-4 bg-slate-50 border-b flex items-center gap-2 font-bold text-slate-700">
           <SettingsIcon size={20}/> Cài đặt
        </div>
        <nav className="p-2 space-y-1">
          {[
            { id: 'company', label: 'Thông tin chung', icon: Building2 },
            { id: 'lists', label: 'Danh mục', icon: List },
            { id: 'config', label: 'Cấu hình Form', icon: LayoutTemplate },
            { id: 'templates', label: 'Biểu mẫu in ấn', icon: FileText },
            { id: 'roles', label: 'Phân quyền', icon: Shield },
            { id: 'backup', label: 'Sao lưu dữ liệu', icon: Database },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === item.id ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <item.icon size={18}/> {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto h-full">
        {/* TAB: COMPANY */}
        {activeTab === 'company' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold border-b pb-2">Thông tin Đơn vị</h3>
            
            <div className="flex items-center gap-4 mb-4 bg-slate-50 p-4 rounded-lg">
               {companyInfo.logoUrl ? (
                 <img src={companyInfo.logoUrl} className="w-20 h-20 object-contain border rounded bg-white"/>
               ) : (
                 <div className="w-20 h-20 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs text-center p-1">Chưa có Logo</div>
               )}
               <div>
                  <label className="bg-white border px-3 py-2 rounded cursor-pointer hover:bg-slate-100 inline-block">
                     <span className="flex items-center gap-2 text-sm font-medium"><Upload size={16}/> Tải logo lên</span>
                     <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Định dạng: PNG, JPG (Max 2MB)</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <div><label className="text-sm font-medium">Tên Công ty / HTX</label><input className="w-full border p-2 rounded" value={companyInfo.name} onChange={e=>setCompanyInfo({...companyInfo, name: e.target.value})}/></div>
                 <div><label className="text-sm font-medium">Tên quốc tế</label><input className="w-full border p-2 rounded" value={companyInfo.internationalName || ''} onChange={e=>setCompanyInfo({...companyInfo, internationalName: e.target.value})}/></div>
                 <div><label className="text-sm font-medium">Tên viết tắt</label><input className="w-full border p-2 rounded" value={companyInfo.shortName || ''} onChange={e=>setCompanyInfo({...companyInfo, shortName: e.target.value})}/></div>
                 <div><label className="text-sm font-medium">Đại diện pháp luật</label><input className="w-full border p-2 rounded" value={companyInfo.representative} onChange={e=>setCompanyInfo({...companyInfo, representative: e.target.value})}/></div>
               </div>
               <div className="space-y-4">
                 <div><label className="text-sm font-medium">Địa chỉ</label><input className="w-full border p-2 rounded" value={companyInfo.address} onChange={e=>setCompanyInfo({...companyInfo, address: e.target.value})}/></div>
                 <div><label className="text-sm font-medium">Mã số thuế</label><input className="w-full border p-2 rounded" value={companyInfo.taxCode} onChange={e=>setCompanyInfo({...companyInfo, taxCode: e.target.value})}/></div>
                 <div><label className="text-sm font-medium">Số điện thoại</label><input className="w-full border p-2 rounded" value={companyInfo.phone} onChange={e=>setCompanyInfo({...companyInfo, phone: e.target.value})}/></div>
                 <div><label className="text-sm font-medium">Website</label><input className="w-full border p-2 rounded" value={companyInfo.website} onChange={e=>setCompanyInfo({...companyInfo, website: e.target.value})}/></div>
               </div>
            </div>
            <div className="flex justify-end pt-4"><button onClick={async () => { await onUpdateSystemSettings({...systemSettings, companyInfo}); alert("Đã lưu!"); }} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex gap-2"><Save size={18}/> Lưu thay đổi</button></div>
          </div>
        )}

        {/* TAB: LISTS (Categories) */}
        {activeTab === 'lists' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex gap-2 border-b pb-1 overflow-x-auto">
               {[
                 {id: 'linkage', label: 'Tình trạng liên kết'}, 
                 {id: 'crops', label: 'Cây trồng'}, 
                 {id: 'activities', label: 'Hoạt động'},
                 {id: 'qualities', label: 'Chất lượng hàng'}
               ].map(t => (
                 <button key={t.id} onClick={() => setListSubTab(t.id as any)} className={`px-4 py-2 text-sm whitespace-nowrap ${listSubTab === t.id ? 'text-green-700 border-b-2 border-green-700 font-medium' : 'text-slate-500'}`}>{t.label}</button>
               ))}
            </div>

            {listSubTab === 'linkage' && (
               <div className="space-y-4">
                  <div className="flex gap-2 bg-slate-50 p-3 rounded">
                    <input className="flex-1 border p-2 rounded text-sm" placeholder="Trạng thái..." value={newStatusLabel} onChange={e=>setNewStatusLabel(e.target.value)}/>
                    <select className="border p-2 rounded text-sm" value={newStatusColor} onChange={e=>setNewStatusColor(e.target.value)}>{colorOptions.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select>
                    <button onClick={handleAddLinkage} className="bg-green-600 text-white px-3 rounded"><Plus/></button>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100"><tr><th className="p-2">Tên</th><th className="p-2">Màu</th><th className="p-2 text-right">#</th></tr></thead>
                    <tbody>
                      {linkageStatuses.map(s => (
                        <tr key={s.id} className="border-b">
                          {editingId === s.id ? (
                            <><td className="p-2"><input className="border p-1 w-full" value={editingLabel} onChange={e=>setEditingLabel(e.target.value)}/></td><td className="p-2"><select className="border p-1 w-full" value={editingColor} onChange={e=>setEditingColor(e.target.value)}>{colorOptions.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></td><td className="p-2 text-right"><button onClick={saveEditLinkage} className="text-green-600"><Save size={16}/></button></td></>
                          ) : (
                            <><td className="p-2">{s.label}</td><td className="p-2"><span className={`px-2 py-1 rounded text-xs ${s.color}`}>Mẫu</span></td><td className="p-2 text-right flex justify-end gap-2"><button onClick={()=>startEditLinkage(s)} className="text-blue-500"><Edit2 size={14}/></button><button onClick={()=>onDeleteStatus(s.id)} className="text-red-500"><Trash2 size={14}/></button></td></>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            )}
            {listSubTab === 'crops' && <RenderListEditor title="Loại Cây trồng" items={crops} newVal={newCropLabel} setVal={setNewCropLabel} onAdd={()=>handleAddItem(newCropLabel, crops, setCrops, setNewCropLabel)} onDelete={(id:string)=>handleDeleteItem(id, crops, setCrops)} />}
            {listSubTab === 'activities' && <RenderListEditor title="Loại Hoạt động" items={activities} newVal={newActivityLabel} setVal={setNewActivityLabel} onAdd={()=>handleAddItem(newActivityLabel, activities, setActivities, setNewActivityLabel)} onDelete={(id:string)=>handleDeleteItem(id, activities, setActivities)} />}
            {listSubTab === 'qualities' && <RenderListEditor title="Phân loại Hàng hóa" items={qualities} newVal={newQualityLabel} setVal={setNewQualityLabel} onAdd={()=>handleAddItem(newQualityLabel, qualities, setQualities, setNewQualityLabel)} onDelete={(id:string)=>handleDeleteItem(id, qualities, setQualities)} />}
            
            <div className="flex justify-end pt-4 border-t"><button onClick={handleSaveAllLists} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex gap-2"><Save size={18}/> Lưu danh mục</button></div>
          </div>
        )}

        {/* TAB: CONFIG (Required Fields) */}
        {activeTab === 'config' && (
           <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold border-b pb-2">Cấu hình Trường bắt buộc</h3>
              <p className="text-sm text-slate-500">Chọn các trường thông tin bắt buộc phải nhập trong các biểu mẫu.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="border p-4 rounded-lg">
                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2"><Sprout size={16}/> Vùng trồng</h4>
                    <div className="space-y-2">
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.area.hectares} onChange={e=>setFieldConfig({...fieldConfig, area: {...fieldConfig.area, hectares: e.target.checked}})}/> Diện tích</label>
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.area.owner} onChange={e=>setFieldConfig({...fieldConfig, area: {...fieldConfig.area, owner: e.target.checked}})}/> Chủ hộ</label>
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.area.location} onChange={e=>setFieldConfig({...fieldConfig, area: {...fieldConfig.area, location: e.target.checked}})}/> Địa chỉ</label>
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.area.estimatedYield} onChange={e=>setFieldConfig({...fieldConfig, area: {...fieldConfig.area, estimatedYield: e.target.checked}})}/> Sản lượng dự kiến</label>
                    </div>
                 </div>
                 <div className="border p-4 rounded-lg">
                    <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2"><List size={16}/> Canh tác</h4>
                    <div className="space-y-2">
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.farming.cost} onChange={e=>setFieldConfig({...fieldConfig, farming: {...fieldConfig.farming, cost: e.target.checked}})}/> Chi phí</label>
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.farming.actualArea} onChange={e=>setFieldConfig({...fieldConfig, farming: {...fieldConfig.farming, actualArea: e.target.checked}})}/> Diện tích thực hiện</label>
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.farming.technician} onChange={e=>setFieldConfig({...fieldConfig, farming: {...fieldConfig.farming, technician: e.target.checked}})}/> Người thực hiện</label>
                    </div>
                 </div>
                 <div className="border p-4 rounded-lg">
                    <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2"><ShoppingCart size={16}/> Thu mua</h4>
                    <div className="space-y-2">
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.purchase.quality} onChange={e=>setFieldConfig({...fieldConfig, purchase: {...fieldConfig.purchase, quality: e.target.checked}})}/> Chất lượng hàng</label>
                       <label className="flex items-center gap-2"><input type="checkbox" checked={fieldConfig.purchase.price} onChange={e=>setFieldConfig({...fieldConfig, purchase: {...fieldConfig.purchase, price: e.target.checked}})}/> Đơn giá</label>
                    </div>
                 </div>
              </div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveAllLists} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex gap-2"><Save size={18}/> Lưu cấu hình</button></div>
           </div>
        )}

        {/* TAB: TEMPLATES - RICH EDITOR */}
        {activeTab === 'templates' && (
           <div className="space-y-4 animate-fade-in h-full flex flex-col">
              <div className="flex justify-between items-center border-b pb-2">
                 <h3 className="font-bold">Biểu mẫu in ấn</h3>
                 <button onClick={handleSaveTemplate} className="bg-blue-600 text-white px-4 py-1.5 rounded flex gap-2 text-sm"><Save size={16}/> Lưu mẫu</button>
              </div>
              <div className="bg-slate-50 p-2 rounded mb-2">
                 <select className="border p-1 rounded text-sm w-full md:w-1/3" value={selectedTemplateType} onChange={e=>setSelectedTemplateType(e.target.value as any)}>
                    <option value="memo">Biên bản ghi nhớ</option><option value="contract">Hợp đồng mua bán</option><option value="invoice">Hóa đơn thu mua</option>
                 </select>
              </div>
              
              <div className="flex flex-col border rounded overflow-hidden flex-1">
                 <RichTextToolbar />
                 <div className="flex-1 p-4 overflow-y-auto outline-none" contentEditable ref={editorRef} style={{minHeight: '300px'}}></div>
              </div>
              
              <p className="text-xs text-slate-500">Hỗ trợ các biến: {'{{TEN_CONG_TY}}, {{CHU_HO}}, {{MA_VUNG}}, {{CAY_TRONG}}'}...</p>
           </div>
        )}
        
        {/* TAB: ROLES - GRANULAR PERMISSIONS */}
        {activeTab === 'roles' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between border-b pb-2">
                <h3 className="font-bold">Phân quyền Nhân viên</h3>
                <button onClick={handleSaveAllLists} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm"><Save size={16}/> Lưu quyền</button>
             </div>
             
             <div className="flex gap-2 mb-4 bg-slate-50 p-3 rounded">
               <input className="border p-2 rounded text-sm flex-1" placeholder="Thêm chức vụ mới..." value={newRoleName} onChange={e=>setNewRoleName(e.target.value)}/>
               <button onClick={handleAddRole} className="bg-green-600 text-white px-3 rounded text-sm font-medium">Thêm Chức vụ</button>
             </div>

             <div className="overflow-x-auto border rounded max-h-[500px]">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-100 font-semibold sticky top-0 z-10">
                    <tr>
                       <th className="p-3 border-b border-r bg-slate-100 w-48">Phân hệ</th>
                       <th className="p-3 border-b border-r bg-slate-100 w-48">Quyền hạn</th>
                       {roles.map(r=><th key={r.id} className="p-3 text-center border-b bg-slate-100 min-w-[100px]">{r.name}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                     {PERMISSION_GROUPS.map((group, gIdx) => (
                        <React.Fragment key={group.name}>
                           {group.perms.map((perm, pIdx) => (
                              <tr key={perm.k} className="hover:bg-slate-50">
                                 {pIdx === 0 && (
                                    <td className="p-3 font-bold text-slate-700 bg-slate-50/50 border-r align-top" rowSpan={group.perms.length}>
                                       {group.name}
                                    </td>
                                 )}
                                 <td className="p-3 border-r text-slate-600">{perm.l}</td>
                                 {roles.map(r => (
                                    <td key={r.id} className="p-3 text-center border-r last:border-0">
                                       <input 
                                          type="checkbox" 
                                          className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                                          checked={!!(r.permissions as any)[perm.k]} 
                                          onChange={e=>handleUpdateRolePermission(r.id, perm.k as any, e.target.checked)}
                                       />
                                    </td>
                                 ))}
                              </tr>
                           ))}
                        </React.Fragment>
                     ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {/* TAB: BACKUP & RESTORE */}
        {activeTab === 'backup' && (
           <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold border-b pb-2">Sao lưu & Khôi phục Dữ liệu</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="border p-6 rounded-xl bg-slate-50 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-blue-100 text-blue-700 rounded-full"><Download size={32}/></div>
                    <div>
                       <h4 className="font-bold text-lg">Sao lưu dữ liệu</h4>
                       <p className="text-sm text-slate-500 mt-1">Tải xuống toàn bộ dữ liệu hệ thống (Vùng trồng, Thu mua, Cấu hình...) dưới dạng file .JSON để lưu trữ an toàn.</p>
                    </div>
                    <button onClick={handleBackup} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm w-full md:w-auto">
                       Tải xuống bản sao lưu
                    </button>
                 </div>

                 <div className="border p-6 rounded-xl bg-slate-50 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-orange-100 text-orange-700 rounded-full"><ArchiveRestore size={32}/></div>
                    <div>
                       <h4 className="font-bold text-lg">Khôi phục dữ liệu</h4>
                       <p className="text-sm text-slate-500 mt-1">Khôi phục hệ thống từ file sao lưu cũ. <span className="text-red-500 font-bold">Lưu ý: Dữ liệu hiện tại sẽ bị ghi đè hoàn toàn.</span></p>
                    </div>
                    <label className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm w-full md:w-auto cursor-pointer">
                       Chọn file để khôi phục
                       <input type="file" accept=".json" hidden ref={backupInputRef} onChange={handleRestoreFile} />
                    </label>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};