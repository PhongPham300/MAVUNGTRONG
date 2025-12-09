import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProcessSOP } from './components/ProcessSOP';
import { AreaManagement } from './components/AreaManagement';
import { PurchaseManagement } from './components/PurchaseManagement';
import { FarmingManagement } from './components/FarmingManagement';
import { EmployeeManagement } from './components/EmployeeManagement';
import { DocumentManagement } from './components/DocumentManagement'; 
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { UserProfile } from './components/UserProfile';
import { api } from './services/api';
import { PlantingArea, PurchaseTransaction, FarmingActivity, Employee, LinkageStatusOption, SystemSettings, AppPermissions, Folder, SystemFile, SurveyRecord, PurchaseContract, BackupData } from './types';
import { Loader2, Menu, Sprout, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [areaSubTab, setAreaSubTab] = useState<'all' | 'priority' | 'calendar' | 'legal'>('all');
  const [areaHighlightStatus, setAreaHighlightStatus] = useState<string | null>(null);

  const [purchaseSubTab, setPurchaseSubTab] = useState<'survey' | 'negotiation' | 'harvest'>('harvest');
  const [farmingSubTab, setFarmingSubTab] = useState<'before_harvest' | 'after_harvest'>('before_harvest');

  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  
  const [areas, setAreas] = useState<PlantingArea[]>([]);
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [contracts, setContracts] = useState<PurchaseContract[]>([]);

  const [farmingLogs, setFarmingLogs] = useState<FarmingActivity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [linkageStatuses, setLinkageStatuses] = useState<LinkageStatusOption[]>([]);
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<SystemFile[]>([]);
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // New state for connection error
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Optimized loadData
  const loadData = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      // Use the new single-call method from API
      const data = await api.fetchAllData();
      
      setAreas(data.areas);
      setPurchases(data.purchases);
      setSurveys(data.surveys);
      setContracts(data.contracts);
      setFarmingLogs(data.farmingLogs);
      setEmployees(data.employees);
      setLinkageStatuses(data.linkageStatuses);
      setFolders(data.folders);
      setFiles(data.files);
      setSystemSettings(data.systemSettings);
      
    } catch (error: any) { 
      console.error("Lỗi tải dữ liệu:", error); 
      setConnectionError(error.message || "Không thể kết nối với Google Sheet. Vui lòng kiểm tra Deployment.");
    } finally { 
      setIsLoading(false); 
    }
  };

  // Initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('hoacuong_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Load data immediately if user exists locally
        loadData();
      } catch (error) {
        localStorage.removeItem('hoacuong_user');
      }
    }
  }, []);

  const userPermissions: AppPermissions = useMemo(() => {
    if (!currentUser || !systemSettings) {
      return {} as AppPermissions;
    }
    const foundRole = systemSettings.roles.find(r => r.name === currentUser.role);
    if (foundRole) return foundRole.permissions;

    // Fallback Admin
    if (currentUser.code === 'ADMIN' || currentUser.role === 'Quản trị viên') {
      return {
        viewDashboard: true, viewSOP: true, viewSettings: true,
        viewArea: true, createArea: true, updateArea: true, deleteArea: true, approveLegal: true,
        viewFarming: true, createFarming: true, updateFarming: true, deleteFarming: true,
        viewPurchase: true, createPurchase: true, updatePurchase: true, deletePurchase: true, viewFinancials: true,
        viewStaff: true, createStaff: true, updateStaff: true, deleteStaff: true, manageRoles: true,
        viewDocuments: true, manageDocuments: true
      };
    }
    return {} as AppPermissions;
  }, [currentUser, systemSettings]);

  const handleLoginSuccess = (user: Employee) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('hoacuong_user');
    setCurrentUser(null);
    setAreas([]); setPurchases([]); setEmployees([]);
    setFolders([]); setFiles([]);
    setIsSidebarOpen(false);
  };

  // Navigation Handlers
  const handleNavigateToArea = (subTab: 'all' | 'priority' | 'calendar' | 'legal', approachStatus?: string) => {
    setAreaSubTab(subTab);
    setAreaHighlightStatus(approachStatus || null);
    setActiveTab('areas');
  };
  const handleNavigateToDocs = () => setActiveTab('documents');
  const handleNavigateToFarming = (stage: 'before_harvest' | 'after_harvest' = 'before_harvest') => {
    setFarmingSubTab(stage);
    setActiveTab('farming');
  };
  const handleNavigateToPurchase = (subTab: 'survey' | 'negotiation' | 'harvest') => {
    setPurchaseSubTab(subTab);
    setActiveTab('purchases');
  };
  const handleNavigateToDashboard = () => setActiveTab('dashboard');

  // CRUD Wrapper with Alert
  const handleCrud = async (action: () => Promise<any>, successMsg?: string) => {
    setIsLoading(true);
    try {
      await action();
      // Optionally reload data to sync, or just rely on local state update if implemented
      // Ideally, the API methods return the new object, and we update state locally in the handlers below.
      if (successMsg) console.log(successMsg);
    } catch (e) {
      alert("Thao tác thất bại. Vui lòng kiểm tra kết nối Google Sheet.");
      console.error(e);
      // If error, try reloading to see if we lost connection
      loadData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddArea = async (n: any) => handleCrud(async () => { const r = await api.addArea(n); setAreas(p => [...p, r]); });
  const handleUpdateArea = async (u: any) => handleCrud(async () => { const r = await api.updateArea(u); setAreas(p => p.map(a => a.id === r.id ? r : a)); });
  const handleDeleteArea = async (id: string) => handleCrud(async () => { await api.deleteArea(id); setAreas(p => p.filter(a => a.id !== id)); });

  // ... (Similar wrappers for other entities)
  // To save space, we keep the pattern:
  const handleAddPurchase = async (n: any) => handleCrud(async () => { const r = await api.addPurchase(n); setPurchases(p => [...p, r]); });
  const handleUpdatePurchase = async (u: any) => handleCrud(async () => { const r = await api.updatePurchase(u); setPurchases(p => p.map(i => i.id === r.id ? r : i)); });
  const handleDeletePurchase = async (id: string) => handleCrud(async () => { await api.deletePurchase(id); setPurchases(p => p.filter(i => i.id !== id)); });

  const handleAddSurvey = async (n: any) => handleCrud(async () => { const r = await api.addSurvey(n); setSurveys(p => [...p, r]); });
  const handleUpdateSurvey = async (u: any) => handleCrud(async () => { const r = await api.updateSurvey(u); setSurveys(p => p.map(i => i.id === r.id ? r : i)); });
  const handleDeleteSurvey = async (id: string) => handleCrud(async () => { await api.deleteSurvey(id); setSurveys(p => p.filter(i => i.id !== id)); });

  const handleAddContract = async (n: any) => handleCrud(async () => { const r = await api.addContract(n); setContracts(p => [...p, r]); });
  const handleUpdateContract = async (u: any) => handleCrud(async () => { const r = await api.updateContract(u); setContracts(p => p.map(i => i.id === r.id ? r : i)); });
  const handleDeleteContract = async (id: string) => handleCrud(async () => { await api.deleteContract(id); setContracts(p => p.filter(i => i.id !== id)); });

  const handleAddFarmingLog = async (n: any) => handleCrud(async () => { const r = await api.addFarmingLog(n); setFarmingLogs(p => [...p, r]); });
  const handleUpdateFarmingLog = async (u: any) => handleCrud(async () => { const r = await api.updateFarmingLog(u); setFarmingLogs(p => p.map(i => i.id === r.id ? r : i)); });
  const handleDeleteFarmingLog = async (id: string) => handleCrud(async () => { await api.deleteFarmingLog(id); setFarmingLogs(p => p.filter(i => i.id !== id)); });

  const handleAddEmployee = async (n: any) => handleCrud(async () => { const r = await api.addEmployee(n); setEmployees(p => [...p, r]); });
  const handleUpdateEmployee = async (u: any) => handleCrud(async () => { const r = await api.updateEmployee(u); setEmployees(p => p.map(i => i.id === r.id ? r : i)); });
  const handleDeleteEmployee = async (id: string) => handleCrud(async () => { await api.deleteEmployee(id); setEmployees(p => p.filter(i => i.id !== id)); });

  const handleAddFolder = async (n: string, pid: string | null) => handleCrud(async () => { const r = await api.addFolder(n, pid); setFolders(p => [...p, r]); });
  const handleDeleteFolder = async (id: string) => handleCrud(async () => { await api.deleteFolder(id); setFolders(p => p.filter(f => f.id !== id)); });
  const handleUploadFile = async (f: File, pid: string | null) => handleCrud(async () => { const r = await api.uploadFile(f, pid); setFiles(p => [...p, r]); });
  const handleDeleteFile = async (id: string) => handleCrud(async () => { await api.deleteFile(id); setFiles(p => p.filter(f => f.id !== id)); });

  // Settings
  const handleAddStatus = async (s: any) => handleCrud(async () => { const r = await api.addLinkageStatus(s); setLinkageStatuses(p => [...p, r]); });
  const handleUpdateStatus = async (s: any) => handleCrud(async () => { const r = await api.updateLinkageStatus(s); setLinkageStatuses(p => p.map(i => i.id === r.id ? r : i)); });
  const handleDeleteStatus = async (id: string) => handleCrud(async () => { await api.deleteLinkageStatus(id); setLinkageStatuses(p => p.filter(i => i.id !== id)); });
  const handleUpdateSystemSettings = async (s: SystemSettings) => handleCrud(async () => { const r = await api.updateSystemSettings(s); setSystemSettings(r); });
  const handleUpdateUserPassword = (u: Employee) => { setCurrentUser(u); setEmployees(p => p.map(e => e.id === u.id ? u : e)); };
  const handleRestoreData = async (data: BackupData) => { 
    try { 
      setIsLoading(true);
      await api.restoreData(data); 
      await loadData(); 
      alert("Khôi phục thành công!"); 
    } catch(e) { alert("Lỗi khôi phục"); } finally { setIsLoading(false); }
  };

  if (!currentUser) return <Login onLoginSuccess={handleLoginSuccess} systemSettings={systemSettings} />;

  return (
    <div className="flex h-screen bg-slate-50 relative">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        currentUser={currentUser} onLogout={handleLogout}
        systemSettings={systemSettings} permissions={userPermissions}
        onOpenProfile={() => setIsProfileOpen(true)}
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className={`flex-1 flex flex-col md:ml-64 h-screen overflow-hidden`}>
        {/* Mobile Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between md:hidden shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <span className="font-bold text-lg text-green-800 flex items-center gap-1"><Sprout size={20} className="text-green-600"/>{systemSettings?.companyInfo?.name || "Hoa Cương"}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">{currentUser.name.charAt(0)}</div>
        </div>
        
        {/* CONNECTION ERROR BANNER */}
        {connectionError && (
          <div className="bg-red-50 border-b border-red-200 p-4 shrink-0 flex items-start gap-3">
             <AlertTriangle className="text-red-600 shrink-0 mt-0.5" />
             <div>
               <h4 className="font-bold text-red-700">Lỗi kết nối CSDL (Google Sheet)</h4>
               <p className="text-sm text-red-600 mt-1">{connectionError}</p>
             </div>
          </div>
        )}

        <main className={`flex-1 p-4 md:p-8 ${activeTab === 'documents' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          {isLoading && (
            <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="flex flex-col items-center gap-3"><Loader2 className="w-10 h-10 text-green-600 animate-spin" /><p className="text-slate-600 font-medium">Đang xử lý...</p></div>
            </div>
          )}

          {!isLoading && (
            <>
              {activeTab === 'dashboard' && <Dashboard areas={areas} purchases={purchases} farmingLogs={farmingLogs} files={files} onNavigateToArea={handleNavigateToArea} onNavigateToDocs={handleNavigateToDocs} onNavigateToFarming={handleNavigateToFarming} onNavigateToPurchase={handleNavigateToPurchase} />}
              {activeTab === 'sop' && <ProcessSOP onNavigateToArea={handleNavigateToArea} onNavigateToDocs={handleNavigateToDocs} onNavigateToFarming={handleNavigateToFarming} onNavigateToPurchase={handleNavigateToPurchase} onNavigateToDashboard={handleNavigateToDashboard} />}
              {activeTab === 'areas' && <AreaManagement areas={areas} linkageStatuses={linkageStatuses} systemSettings={systemSettings} onAddArea={handleAddArea} onUpdateArea={handleUpdateArea} onDeleteArea={handleDeleteArea} permissions={userPermissions} subTab={areaSubTab} onChangeSubTab={setAreaSubTab} employees={employees} highlightApproachStatus={areaHighlightStatus} farmingLogs={farmingLogs} purchases={purchases} />}
              {activeTab === 'farming' && <FarmingManagement areas={areas} logs={farmingLogs} employees={employees} systemSettings={systemSettings} onAddLog={handleAddFarmingLog} onUpdateLog={handleUpdateFarmingLog} onDeleteLog={handleDeleteFarmingLog} permissions={userPermissions} subTab={farmingSubTab} onChangeSubTab={setFarmingSubTab} />}
              {activeTab === 'purchases' && <PurchaseManagement areas={areas} purchases={purchases} surveys={surveys} contracts={contracts} onAddPurchase={handleAddPurchase} onUpdatePurchase={handleUpdatePurchase} onDeletePurchase={handleDeletePurchase} onAddSurvey={handleAddSurvey} onUpdateSurvey={handleUpdateSurvey} onDeleteSurvey={handleDeleteSurvey} onAddContract={handleAddContract} onUpdateContract={handleUpdateContract} onDeleteContract={handleDeleteContract} systemSettings={systemSettings} permissions={userPermissions} currentUser={currentUser} subTab={purchaseSubTab} onChangeSubTab={setPurchaseSubTab} />}
              {activeTab === 'staff' && <EmployeeManagement employees={employees} roles={systemSettings?.roles || []} onAddEmployee={handleAddEmployee} onUpdateEmployee={handleUpdateEmployee} onDeleteEmployee={handleDeleteEmployee} permissions={userPermissions} />}
              {activeTab === 'documents' && <DocumentManagement folders={folders} files={files} onAddFolder={handleAddFolder} onDeleteFolder={handleDeleteFolder} onUploadFile={handleUploadFile} onDeleteFile={handleDeleteFile} permissions={userPermissions} />}
              {activeTab === 'settings' && systemSettings && <Settings linkageStatuses={linkageStatuses} systemSettings={systemSettings} onAddStatus={handleAddStatus} onUpdateStatus={handleUpdateStatus} onDeleteStatus={handleDeleteStatus} onUpdateSystemSettings={handleUpdateSystemSettings} onRestoreData={handleRestoreData} />}
            </>
          )}
        </main>
      </div>

      <UserProfile currentUser={currentUser} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onUpdateUser={handleUpdateUserPassword} />
    </div>
  );
};
export default App;