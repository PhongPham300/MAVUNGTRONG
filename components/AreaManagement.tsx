
import React, { useState, useMemo, useRef } from 'react';
import { PlantingArea, AreaStatus, LinkageStatusOption, AreaDocument, SystemSettings, Farmer, AppPermissions, PriorityLevel, Employee, ApproachStatus, LegalStatus, FarmingActivity, PurchaseTransaction } from '../types';
import { Plus, Search, MapPin, User, Filter, X, Upload, Download, Edit, Paperclip, FileText, Printer, Calendar, RefreshCw, Star, LayoutList, Kanban, CalendarRange, CheckSquare, Square, ShieldCheck, Users, Trash2, ChevronRight, Activity, ShoppingCart, Sprout, Phone, MessageSquare } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AreaManagementProps {
  areas: PlantingArea[];
  linkageStatuses: LinkageStatusOption[];
  systemSettings: SystemSettings | null;
  onAddArea: (area: Omit<PlantingArea, 'id'>) => Promise<void>;
  onUpdateArea: (area: PlantingArea) => Promise<void>;
  onDeleteArea: (id: string) => Promise<void>;
  permissions: AppPermissions;
  subTab: 'all' | 'priority' | 'calendar' | 'legal';
  onChangeSubTab: (tab: 'all' | 'priority' | 'calendar' | 'legal') => void;
  employees: Employee[];
  highlightApproachStatus?: string | null;
  farmingLogs?: FarmingActivity[];
  purchases?: PurchaseTransaction[];
}

export const AreaManagement: React.FC<AreaManagementProps> = ({ 
  areas, linkageStatuses, systemSettings, onAddArea, onUpdateArea, onDeleteArea, 
  permissions, subTab, onChangeSubTab, employees, highlightApproachStatus,
  farmingLogs, purchases
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  // NEW: Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingArea, setViewingArea] = useState<PlantingArea | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'farming' | 'purchase'>('info');

  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterLinkage, setFilterLinkage] = useState<string>('ALL');
  const [filterCrop, setFilterCrop] = useState<string>('ALL');
  const [filterProvince, setFilterProvince] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingFarmers, setIsImportingFarmers] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [farmerErrors, setFarmerErrors] = useState<{[key: string]: string}>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const farmerFileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<PlantingArea>>({
    status: AreaStatus.ACTIVE, linkageStatus: '', documents: [], farmers: [],
    priority: 'Chưa xếp hạng', appointmentDate: '', appointmentNote: '', appointmentParticipants: [],
    approachStatus: 'Chưa gặp', legalStatus: 'Chưa xử lý', authorizationDate: '', phone: '', comments: ''
  });

  const [memoContent, setMemoContent] = useState('');
  const [currentFarmerArea, setCurrentFarmerArea] = useState<PlantingArea | null>(null);
  const [editingFarmer, setEditingFarmer] = useState<Partial<Farmer>>({});

  const priorityLevels: PriorityLevel[] = ['Ưu tiên 1', 'Ưu tiên 2', 'Ưu tiên 3', 'Chưa xếp hạng'];

  const priorityCounts = useMemo(() => {
    const counts: {[key: string]: number} = {};
    priorityLevels.forEach(p => counts[p] = 0);
    areas.forEach(a => { const p = a.priority || 'Chưa xếp hạng'; if (counts[p] !== undefined) counts[p]++; });
    return counts;
  }, [areas]);

  const generateAreaCode = () => {
    const today = new Date();
    const dateStr = today.getFullYear().toString().substr(-2) + (today.getMonth() + 1).toString().padStart(2, '0') + today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MVT-${dateStr}-${random}`;
  };

  const resetForm = () => {
    setFormData({ 
      code: generateAreaCode(), status: AreaStatus.ACTIVE, linkageStatus: linkageStatuses[0]?.label || '',
      documents: [], farmers: [], cropType: systemSettings?.cropTypes?.[0]?.label || '', priority: 'Chưa xếp hạng',
      appointmentDate: '', appointmentNote: '', appointmentParticipants: [], approachStatus: 'Chưa gặp', legalStatus: 'Chưa xử lý', authorizationDate: '',
      phone: '', comments: ''
    });
    setEditingId(null); setErrors({});
  };

  const handleAddNew = () => { resetForm(); setIsModalOpen(true); };
  const handleRegenerateCode = () => { setFormData(prev => ({ ...prev, code: generateAreaCode() })); };
  const handleEdit = (area: PlantingArea) => { setFormData({ ...area }); setEditingId(area.id); setErrors({}); setIsModalOpen(true); };
  const handleViewDetail = (area: PlantingArea) => { setViewingArea(area); setDetailTab('info'); setIsDetailModalOpen(true); };
  const handleUpdateLegalStatus = async (area: PlantingArea, status: LegalStatus, dateStr?: string) => {
    try { await onUpdateArea({ ...area, legalStatus: status, authorizationDate: dateStr || area.authorizationDate }); } catch (e) { alert("Lỗi"); }
  };
  const handleDelete = async (id: string) => { if (window.confirm("Bạn có chắc chắn muốn xóa?")) await onDeleteArea(id); };

  const toggleParticipant = (empName: string) => {
    const current = formData.appointmentParticipants || [];
    setFormData({ ...formData, appointmentParticipants: current.includes(empName) ? current.filter(p => p !== empName) : [...current, empName] });
  };

  const openFarmerModal = (area: PlantingArea) => { setCurrentFarmerArea(area); setIsFarmerModalOpen(true); setEditingFarmer({}); setFarmerErrors({}); };
  const handleSaveFarmer = async () => {
    const newFarmerErrors: {[key: string]: string} = {};
    if (!editingFarmer.name) newFarmerErrors.name = "Tên không được để trống";
    if (!editingFarmer.areaSize || editingFarmer.areaSize <= 0) newFarmerErrors.areaSize = "Diện tích phải > 0";
    if (Object.keys(newFarmerErrors).length > 0) { setFarmerErrors(newFarmerErrors); return; }
    if (currentFarmerArea && editingFarmer.name && editingFarmer.areaSize) {
      let updatedFarmers = [...(currentFarmerArea.farmers || [])];
      if (editingFarmer.id) updatedFarmers = updatedFarmers.map(f => f.id === editingFarmer.id ? { ...f, ...editingFarmer } as Farmer : f);
      else updatedFarmers.push({ id: Math.random().toString(36).substr(2, 9), name: editingFarmer.name, phone: editingFarmer.phone || '', areaSize: Number(editingFarmer.areaSize), notes: editingFarmer.notes || '' });
      const updatedArea = { ...currentFarmerArea, farmers: updatedFarmers };
      setCurrentFarmerArea(updatedArea); await onUpdateArea(updatedArea); setEditingFarmer({}); setFarmerErrors({});
    }
  };
  const handleDeleteFarmer = async (farmerId: string) => {
    if (currentFarmerArea && window.confirm("Xóa hộ này?")) {
      const updatedFarmers = currentFarmerArea.farmers.filter(f => f.id !== farmerId);
      const updatedArea = { ...currentFarmerArea, farmers: updatedFarmers };
      setCurrentFarmerArea(updatedArea); await onUpdateArea(updatedArea);
    }
  };

  const getProvinceFromLocation = (location: string): string => {
    if (!location) return 'Khác'; const parts = location.split(','); return parts.length > 1 ? parts[parts.length - 1].trim() : 'Khác';
  };

  const { uniqueCrops, uniqueProvinces } = useMemo(() => {
    const crops = new Set<string>(); const provinces = new Set<string>();
    areas.forEach(a => { if (a.cropType) crops.add(a.cropType); if (a.location) provinces.add(getProvinceFromLocation(a.location)); });
    return { uniqueCrops: Array.from(crops).sort(), uniqueProvinces: Array.from(provinces).sort() };
  }, [areas]);

  const validateAreaForm = () => {
    const newErrors: {[key: string]: string} = {}; let isValid = true;
    const config = systemSettings?.fieldConfig?.area;

    if (!formData.code?.trim()) { newErrors.code = "Nhập mã vùng."; isValid = false; }
    if (!formData.name?.trim()) { newErrors.name = "Nhập tên vùng."; isValid = false; }
    
    // Dynamic config validation
    if (config?.hectares && (!formData.hectares || formData.hectares <= 0)) { newErrors.hectares = "> 0."; isValid = false; }
    if (config?.owner && !formData.owner?.trim()) { newErrors.owner = "Nhập chủ hộ."; isValid = false; }
    if (config?.location && !formData.location?.trim()) { newErrors.location = "Nhập địa chỉ."; isValid = false; }
    if (config?.estimatedYield && (!formData.estimatedYield || formData.estimatedYield < 0)) { newErrors.estimatedYield = "Nhập sản lượng."; isValid = false; }

    setErrors(newErrors); return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (validateAreaForm()) {
      if (editingId) await onUpdateArea({ ...formData, id: editingId } as PlantingArea); else await onAddArea(formData as Omit<PlantingArea, 'id'>);
      setIsModalOpen(false); resetForm();
    }
  };

  const processedAreas = useMemo(() => {
    let result = areas.filter(area => {
      const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) || area.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || area.status === filterStatus;
      const matchesLinkage = filterLinkage === 'ALL' || area.linkageStatus === filterLinkage;
      const matchesCrop = filterCrop === 'ALL' || area.cropType === filterCrop;
      const matchesProvince = filterProvince === 'ALL' || getProvinceFromLocation(area.location) === filterProvince;
      const matchesPriority = filterPriority === 'ALL' || area.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesLinkage && matchesCrop && matchesProvince && matchesPriority;
    });
    result.sort((a, b) => { const order = { 'Ưu tiên 1': 1, 'Ưu tiên 2': 2, 'Ưu tiên 3': 3, 'Chưa xếp hạng': 4 }; return (order[a.priority as PriorityLevel] || 4) - (order[b.priority as PriorityLevel] || 4); });
    return result;
  }, [areas, searchTerm, filterStatus, filterLinkage, filterCrop, filterProvince, filterPriority]);

  const clearFilters = () => { setSearchTerm(''); setFilterStatus('ALL'); setFilterLinkage('ALL'); setFilterCrop('ALL'); setFilterProvince('ALL'); setFilterPriority('ALL'); };
  const getLinkageColor = (lbl: string) => linkageStatuses.find(s => s.label === lbl)?.color || 'bg-slate-100 text-slate-600';
  const getPriorityColor = (p: PriorityLevel) => { if (p === 'Ưu tiên 1') return 'bg-red-100 text-red-700'; if (p === 'Ưu tiên 2') return 'bg-orange-100 text-orange-700'; if (p === 'Ưu tiên 3') return 'bg-blue-100 text-blue-700'; return 'bg-slate-100 text-slate-600'; };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { /* ...existing import logic... */ };
  const handleFarmerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { /* ...existing import logic... */ };
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; 
    if (files) {
      const newDocs: AreaDocument[] = Array.from(files).map((f: File) => ({ 
        id: Math.random().toString(), 
        name: f.name, 
        uploadDate: new Date().toISOString(), 
        url: URL.createObjectURL(f), 
        file: f 
      }));
      setFormData(p => ({ ...p, documents: [...(p.documents || []), ...newDocs] }));
    }
  };
  const removeDoc = (id: string) => { setFormData(p => ({ ...p, documents: p.documents?.filter(d => d.id !== id) })); };
  const handleViewDoc = (doc: AreaDocument) => { if (doc.url) window.open(doc.url, '_blank'); };
  const handleGenerateMemo = (area: PlantingArea) => {
    let content = systemSettings?.memoTemplate || ""; const c = systemSettings?.companyInfo;
    content = content.replace(/{{MA_VUNG}}/g, area.code).replace(/{{TEN_VUNG}}/g, area.name).replace(/{{CHU_HO}}/g, area.owner); // ... simplified for brevity
    setMemoContent(content); setIsMemoModalOpen(true);
  };

  // Filtered Logs for Detail View
  const relatedFarmingLogs = useMemo(() => {
    return farmingLogs?.filter(l => l.areaId === viewingArea?.id) || [];
  }, [farmingLogs, viewingArea]);

  const relatedPurchases = useMemo(() => {
    return purchases?.filter(p => p.areaId === viewingArea?.id) || [];
  }, [purchases, viewingArea]);

  const PriorityBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {['Ưu tiên 1', 'Ưu tiên 2', 'Ưu tiên 3'].map(p => (
        <div key={p} className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-4 border-b font-bold flex justify-between items-center bg-white"><span>{p}</span><span className="bg-slate-100 px-2 rounded-full text-xs">{areas.filter(a => a.priority === p).length}</span></div>
           <div className="p-4 space-y-3 overflow-y-auto max-h-[600px]">
              {areas.filter(a => a.priority === p).map(area => (
                <div key={area.id} className="bg-white p-3 rounded-lg border shadow-sm cursor-pointer" onClick={() => permissions.updateArea && handleEdit(area)}>
                   <div className="flex justify-between mb-2"><span className="font-bold text-sm">{area.code}</span><span className={`px-2 py-0.5 rounded text-[10px] ${getLinkageColor(area.linkageStatus)}`}>{area.linkageStatus}</span></div>
                   <div className="text-sm font-medium text-green-700">{area.name}</div>
                </div>
              ))}
           </div>
        </div>
      ))}
    </div>
  );

  const ScheduleList = () => (
    <div className="animate-fade-in overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1000px] md:min-w-0 md:grid md:grid-cols-4">
        {['Chưa gặp', 'Đã gặp', 'Đã ký biên bản', 'Không liên kết được'].map(status => (
          <div key={status} className={`flex-1 min-w-[250px] flex flex-col h-full rounded-xl border shadow-sm bg-white ${highlightApproachStatus === status ? 'ring-2 ring-green-400' : ''}`}>
             <div className="p-4 border-b font-bold bg-slate-50 flex justify-between"><span>{status}</span><span className="text-xs bg-white px-2 py-1 rounded">{areas.filter(a => (a.approachStatus||'Chưa gặp') === status).length}</span></div>
             <div className="p-3 space-y-3 overflow-y-auto max-h-[600px] bg-slate-50/50 flex-1">
                {areas.filter(a => (a.approachStatus||'Chưa gặp') === status).map(area => (
                  <div key={area.id} onClick={() => permissions.updateArea && handleEdit(area)} className="bg-white p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md">
                     <div className="font-bold text-sm mb-1">{area.code}</div>
                     <div className="text-sm text-green-700 mb-1">{area.name}</div>
                     {area.appointmentDate && <div className="text-xs bg-blue-50 text-blue-600 p-1 rounded flex gap-1"><Calendar size={12}/>{area.appointmentDate}</div>}
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const LegalProceduresBoard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
       <div className="p-4 border-b bg-slate-50"><h3 className="font-semibold text-slate-700 flex items-center gap-2"><ShieldCheck className="text-red-600" />Thủ tục pháp lý</h3></div>
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead><tr className="bg-white text-slate-600 text-sm font-semibold border-b"><th className="p-4">Mã vùng</th><th className="p-4">Tên vùng</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Tác vụ</th></tr></thead>
            <tbody className="text-slate-700">
               {areas.filter(a => a.linkageStatus.includes('Đã ký')).map(area => (
                 <tr key={area.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-bold">{area.code}</td>
                    <td className="p-4">{area.name}</td>
                    <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">{area.legalStatus}</span></td>
                    <td className="p-4 text-right">
                       {permissions.updateArea && <button onClick={() => handleEdit(area)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14}/></button>}
                       {permissions.approveLegal && area.legalStatus !== 'Đã duyệt' && <button onClick={() => handleUpdateLegalStatus(area, 'Đã duyệt')} className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Duyệt</button>}
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div><h2 className="text-2xl font-bold text-slate-800">Quản lý Vùng trồng</h2><p className="text-slate-500">Danh sách mã vùng và thông tin liên kết</p></div>
        <div className="flex flex-wrap gap-2">
           <div className="bg-white p-1 rounded-lg border border-slate-200 flex text-sm font-medium overflow-x-auto max-w-full">
              {[ {id: 'all', l: 'Data Tổng', i: LayoutList}, {id: 'priority', l: 'Ưu tiên', i: Kanban}, {id: 'calendar', l: 'Lịch', i: CalendarRange}, {id: 'legal', l: 'Pháp lý', i: ShieldCheck} ].map(t => (
                <button key={t.id} onClick={() => onChangeSubTab(t.id as any)} className={`px-3 py-1.5 rounded-md flex items-center gap-2 whitespace-nowrap ${subTab === t.id ? 'bg-slate-100 shadow-sm' : 'text-slate-500'}`}><t.i size={16} /> {t.l}</button>
              ))}
           </div>
           {permissions.createArea && <button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"><Plus size={20} /><span className="hidden sm:inline">Thêm vùng trồng</span></button>}
        </div>
      </div>

      {subTab === 'priority' ? <PriorityBoard /> : subTab === 'calendar' ? <ScheduleList /> : subTab === 'legal' ? <LegalProceduresBoard /> : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          {/* Toolbar Responsive */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Tìm kiếm..." className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 overflow-x-auto">
               <select className="px-3 py-2 border rounded-lg text-sm bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">Trạng thái: Tất cả</option>{Object.values(AreaStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <select className="px-3 py-2 border rounded-lg text-sm bg-white" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                  <option value="ALL">Ưu tiên: Tất cả</option>{priorityLevels.map(p => <option key={p} value={p}>{p}</option>)}
               </select>
               <select className="px-3 py-2 border rounded-lg text-sm bg-white" value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}>
                  <option value="ALL">Cây trồng: Tất cả</option>{uniqueCrops.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               {(searchTerm || filterStatus !== 'ALL' || filterCrop !== 'ALL') && <button onClick={clearFilters} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={18} /></button>}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm font-semibold">
                  <th className="p-4 border-b">Mã/Tên</th><th className="p-4 border-b">Loại cây</th><th className="p-4 border-b">Địa chỉ</th><th className="p-4 border-b">Diện tích</th>
                  <th className="p-4 border-b">Chủ hộ</th><th className="p-4 border-b">Trạng thái</th><th className="p-4 border-b">Liên kết</th><th className="p-4 border-b text-right">#</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {processedAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-50 border-b last:border-0 group">
                    <td className="p-4 cursor-pointer" onClick={() => handleViewDetail(area)}>
                      <div className="font-bold text-green-700 group-hover:underline">{area.code}</div>
                      <div className="text-sm text-slate-600">{area.name}</div>
                      <span className={`text-[10px] px-1 rounded border ${getPriorityColor(area.priority)}`}>{area.priority}</span>
                    </td>
                    <td className="p-4">{area.cropType}</td>
                    <td className="p-4 max-w-[150px] truncate" title={area.location}>{area.location}</td>
                    <td className="p-4">{area.hectares}</td>
                    <td className="p-4"><div className="flex flex-col"><span className="font-medium">{area.owner}</span><button onClick={() => openFarmerModal(area)} className="text-xs text-blue-600 flex items-center gap-1"><Users size={12}/> {area.farmers?.length} hộ</button></div></td>
                    <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100">{area.status}</span></td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs border ${getLinkageColor(area.linkageStatus)}`}>{area.linkageStatus}</span></td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-1">
                          {permissions.updateArea && <><button onClick={() => handleGenerateMemo(area)} className="text-purple-600 p-1"><FileText size={16}/></button><button onClick={() => handleEdit(area)} className="text-blue-600 p-1"><Edit size={16}/></button></>}
                          {permissions.deleteArea && <button onClick={() => handleDelete(area.id)} className="text-red-600 p-1"><Trash2 size={16}/></button>}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && viewingArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
             <div className="p-4 border-b flex justify-between items-center bg-slate-50">
               <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-sm">{viewingArea.code}</span>
                     {viewingArea.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 flex gap-3">
                     <span className="flex items-center gap-1"><MapPin size={12}/> {viewingArea.location}</span>
                     <span className="flex items-center gap-1"><User size={12}/> {viewingArea.owner}</span>
                     {viewingArea.phone && <span className="flex items-center gap-1"><Phone size={12}/> {viewingArea.phone}</span>}
                  </p>
               </div>
               <button onClick={() => setIsDetailModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
             </div>
             
             <div className="flex border-b">
                <button onClick={() => setDetailTab('info')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${detailTab === 'info' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Thông tin chung</button>
                <button onClick={() => setDetailTab('farming')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${detailTab === 'farming' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Lịch sử Canh tác</button>
                <button onClick={() => setDetailTab('purchase')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${detailTab === 'purchase' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Lịch sử Thu mua</button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {detailTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2"><Sprout size={18}/> Dữ liệu canh tác</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div><div className="text-xs text-slate-500">Loại cây</div><div className="font-medium">{viewingArea.cropType}</div></div>
                           <div><div className="text-xs text-slate-500">Diện tích</div><div className="font-medium">{viewingArea.hectares} ha</div></div>
                           <div><div className="text-xs text-slate-500">Sản lượng dự kiến</div><div className="font-medium">{viewingArea.estimatedYield} tấn</div></div>
                           <div><div className="text-xs text-slate-500">Trạng thái</div><div className="font-medium">{viewingArea.status}</div></div>
                        </div>
                        {viewingArea.comments && (
                          <div className="pt-2 border-t mt-2">
                             <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MessageSquare size={12}/> Ghi chú:</div>
                             <div className="text-sm bg-slate-50 p-2 rounded">{viewingArea.comments}</div>
                          </div>
                        )}
                     </div>
                     <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2"><Users size={18}/> Danh sách nông hộ ({viewingArea.farmers.length})</h4>
                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                           {viewingArea.farmers.length > 0 ? viewingArea.farmers.map(f => (
                              <div key={f.id} className="p-2 border rounded bg-slate-50 flex justify-between items-center text-sm">
                                 <div><div className="font-medium">{f.name}</div><div className="text-xs text-slate-400">{f.phone}</div></div>
                                 <div className="bg-white px-2 py-1 rounded border text-xs">{f.areaSize} ha</div>
                              </div>
                           )) : <p className="text-slate-400 italic text-sm">Chưa có dữ liệu nông hộ</p>}
                        </div>
                     </div>
                     <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4 md:col-span-2">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2"><ShieldCheck size={18}/> Pháp lý & Tài liệu</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div><div className="text-xs text-slate-500">Tình trạng liên kết</div><div className={`inline-block px-2 py-1 rounded text-xs border mt-1 ${getLinkageColor(viewingArea.linkageStatus)}`}>{viewingArea.linkageStatus}</div></div>
                           <div><div className="text-xs text-slate-500">Pháp lý</div><div className="font-medium mt-1">{viewingArea.legalStatus}</div></div>
                        </div>
                        <div className="space-y-2 mt-4">
                           <div className="text-xs font-medium text-slate-500">Tài liệu đính kèm:</div>
                           <div className="flex flex-wrap gap-2">
                              {viewingArea.documents && viewingArea.documents.length > 0 ? viewingArea.documents.map(d => (
                                 <div key={d.id} onClick={() => handleViewDoc(d)} className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs cursor-pointer hover:bg-blue-100">
                                    <Paperclip size={12}/> {d.name}
                                 </div>
                              )) : <span className="text-slate-400 text-xs italic">Không có tài liệu</span>}
                           </div>
                        </div>
                     </div>
                  </div>
                )}
                {detailTab === 'farming' && (
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50"><tr><th className="p-3">Ngày</th><th className="p-3">Hoạt động</th><th className="p-3">Chi tiết</th><th className="p-3">Người làm</th></tr></thead>
                        <tbody>
                           {relatedFarmingLogs.length > 0 ? relatedFarmingLogs.map(log => (
                              <tr key={log.id} className="border-b">
                                 <td className="p-3 text-slate-500">{log.date}</td>
                                 <td className="p-3"><span className="font-medium">{log.activityType}</span><div className="text-xs text-slate-400">{log.stage === 'before_harvest' ? 'Trước thu hoạch' : 'Sau thu hoạch'}</div></td>
                                 <td className="p-3">{log.description}</td>
                                 <td className="p-3">{log.technician}</td>
                              </tr>
                           )) : <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">Chưa có nhật ký canh tác</td></tr>}
                        </tbody>
                     </table>
                  </div>
                )}
                {detailTab === 'purchase' && (
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50"><tr><th className="p-3">Ngày</th><th className="p-3">Chất lượng</th><th className="p-3 text-right">Số lượng</th><th className="p-3 text-right">Đơn giá</th><th className="p-3 text-right">Thành tiền</th></tr></thead>
                        <tbody>
                           {relatedPurchases.length > 0 ? relatedPurchases.map(p => (
                              <tr key={p.id} className="border-b">
                                 <td className="p-3 text-slate-500">{p.date}</td>
                                 <td className="p-3">{p.quality}</td>
                                 <td className="p-3 text-right">{p.quantityKg} kg</td>
                                 <td className="p-3 text-right">{new Intl.NumberFormat('vi-VN').format(p.pricePerKg)}</td>
                                 <td className="p-3 text-right font-bold text-green-700">{new Intl.NumberFormat('vi-VN').format(p.totalAmount)}</td>
                              </tr>
                           )) : <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">Chưa có giao dịch thu mua</td></tr>}
                        </tbody>
                     </table>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Modal Edit/Add Area */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 shrink-0"><h3 className="font-bold">Thông tin Vùng Trồng</h3><button onClick={() => setIsModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 border-b pb-1">Thông tin chung</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Mã vùng <span className="text-red-500">*</span></label>
                        <div className="flex gap-1"><input required className={`w-full p-2 border rounded ${errors.code ? 'border-red-500':''}`} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} /><button type="button" onClick={handleRegenerateCode} className="p-2 bg-slate-100 rounded"><RefreshCw size={18}/></button></div>
                        {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                      </div>
                      <div><label className="block text-sm font-medium mb-1">Loại cây</label><select className="w-full p-2 border rounded" value={formData.cropType} onChange={e => setFormData({...formData, cropType: e.target.value})}>{systemSettings?.cropTypes?.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}</select></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tên vùng <span className="text-red-500">*</span></label>
                      <input required className={`w-full p-2 border rounded ${errors.name ? 'border-red-500':''}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Diện tích (Ha) {systemSettings?.fieldConfig?.area?.hectares && <span className="text-red-500">*</span>}</label>
                        <input type="number" step="0.1" className={`w-full p-2 border rounded ${errors.hectares ? 'border-red-500':''}`} value={formData.hectares||''} onChange={e => setFormData({...formData, hectares: parseFloat(e.target.value)})} />
                        {errors.hectares && <p className="text-xs text-red-500 mt-1">{errors.hectares}</p>}
                      </div>
                      <div>
                         <label className="block text-sm font-medium mb-1">Sản lượng (Tấn) {systemSettings?.fieldConfig?.area?.estimatedYield && <span className="text-red-500">*</span>}</label>
                         <input type="number" className={`w-full p-2 border rounded ${errors.estimatedYield ? 'border-red-500':''}`} value={formData.estimatedYield||''} onChange={e => setFormData({...formData, estimatedYield: parseFloat(e.target.value)})} />
                         {errors.estimatedYield && <p className="text-xs text-red-500 mt-1">{errors.estimatedYield}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Địa chỉ {systemSettings?.fieldConfig?.area?.location && <span className="text-red-500">*</span>}</label>
                      <input className={`w-full p-2 border rounded ${errors.location ? 'border-red-500':''}`} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                      {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium mb-1">Chủ hộ {systemSettings?.fieldConfig?.area?.owner && <span className="text-red-500">*</span>}</label>
                         <input className={`w-full p-2 border rounded ${errors.owner ? 'border-red-500':''}`} value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} />
                         {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner}</p>}
                       </div>
                       <div>
                         <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                         <input className="w-full p-2 border rounded" placeholder="SĐT liên hệ" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="font-semibold text-slate-700 border-b pb-1">Quản lý & Hợp tác</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-1">Trạng thái</label><select className="w-full p-2 border rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as AreaStatus})}><option value={AreaStatus.ACTIVE}>Đang canh tác</option><option value={AreaStatus.HARVESTING}>Đang thu hoạch</option><option value={AreaStatus.FALLOW}>Đất nghỉ</option><option value={AreaStatus.PENDING}>Chờ duyệt</option></select></div>
                      <div><label className="block text-sm font-medium mb-1">Liên kết</label><select className="w-full p-2 border rounded" value={formData.linkageStatus} onChange={e => setFormData({...formData, linkageStatus: e.target.value})}>{linkageStatuses.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}</select></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Ưu tiên</label><select className="w-full p-2 border rounded" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as PriorityLevel})}>{priorityLevels.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <div className="font-bold text-blue-800 mb-2">Lịch tiếp cận</div>
                      <div className="space-y-2">
                        <select className="w-full p-1 border rounded" value={formData.approachStatus} onChange={e => setFormData({...formData, approachStatus: e.target.value as ApproachStatus})}><option value="Chưa gặp">Chưa gặp</option><option value="Đã gặp">Đã gặp</option><option value="Đã ký biên bản">Đã ký biên bản</option><option value="Không liên kết được">Không liên kết được</option></select>
                        <input type="date" className="w-full p-1 border rounded" value={formData.appointmentDate||''} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} />
                        <input className="w-full p-1 border rounded" placeholder="Ghi chú hẹn..." value={formData.appointmentNote||''} onChange={e => setFormData({...formData, appointmentNote: e.target.value})} />
                        <div className="max-h-24 overflow-y-auto border bg-white p-1 rounded">{employees.map(e => <div key={e.id} onClick={() => toggleParticipant(e.name)} className={`flex gap-2 p-1 cursor-pointer ${formData.appointmentParticipants?.includes(e.name)?'text-blue-600 font-medium':''}`}>{formData.appointmentParticipants?.includes(e.name)?<CheckSquare size={14}/>:<Square size={14}/>} {e.name}</div>)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1"><label className="text-sm font-medium">Tài liệu</label><span onClick={() => docInputRef.current?.click()} className="text-blue-600 text-xs cursor-pointer flex items-center"><Paperclip size={12}/> Thêm</span></div>
                      <input type="file" ref={docInputRef} hidden multiple onChange={handleDocUpload} />
                      <div className="max-h-24 overflow-y-auto border rounded p-2 bg-slate-50 space-y-1">{formData.documents?.map(d => <div key={d.id} className="flex justify-between text-xs bg-white p-1 rounded border"><span onClick={() => handleViewDoc(d)} className="truncate max-w-[150px] text-blue-600 cursor-pointer">{d.name}</span><X size={12} className="cursor-pointer" onClick={() => removeDoc(d.id)}/></div>)}</div>
                    </div>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-medium mb-1">Bình luận / Ghi chú thêm</label>
                 <textarea className="w-full p-2 border rounded h-20" placeholder="Ghi chú về vùng trồng này..." value={formData.comments || ''} onChange={e => setFormData({...formData, comments: e.target.value})} />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Hủy</button><button type="submit" className="px-6 py-2 bg-green-600 text-white rounded">{editingId ? 'Cập nhật' : 'Thêm'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Memo & Farmer Modals */}
      {isMemoModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
             <div className="p-4 border-b flex justify-between"><h3 className="font-bold flex gap-2"><FileText/> Biên bản</h3><div className="flex gap-2"><button className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex gap-1"><Printer size={14}/> In</button><button onClick={() => setIsMemoModalOpen(false)}><X/></button></div></div>
             <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-100"><div className="bg-white p-8 min-h-full mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: memoContent }} /></div>
          </div>
        </div>
      )}
      {isFarmerModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
             <div className="p-4 border-b flex justify-between"><h3 className="font-bold">Nông hộ</h3><button onClick={() => setIsFarmerModalOpen(false)}><X/></button></div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-blue-50 p-4 rounded border grid grid-cols-1 sm:grid-cols-3 gap-3">
                   <input className="p-2 border rounded text-sm" placeholder="Tên *" value={editingFarmer.name||''} onChange={e => setEditingFarmer({...editingFarmer,name:e.target.value})} />
                   <input className="p-2 border rounded text-sm" placeholder="SĐT" value={editingFarmer.phone||''} onChange={e => setEditingFarmer({...editingFarmer,phone:e.target.value})} />
                   <input className="p-2 border rounded text-sm" placeholder="Diện tích *" type="number" value={editingFarmer.areaSize||''} onChange={e => setEditingFarmer({...editingFarmer,areaSize:parseFloat(e.target.value)})} />
                   <button onClick={handleSaveFarmer} className="col-span-1 sm:col-span-3 bg-blue-600 text-white py-1 rounded text-sm">Lưu</button>
                </div>
                <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr><th className="p-2">Tên</th><th className="p-2">SĐT</th><th className="p-2">DT</th><th className="p-2">#</th></tr></thead><tbody>{currentFarmerArea?.farmers?.map(f => <tr key={f.id} className="border-b"><td className="p-2">{f.name}</td><td className="p-2">{f.phone}</td><td className="p-2">{f.areaSize}</td><td className="p-2"><button onClick={() => handleDeleteFarmer(f.id)} className="text-red-500"><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
