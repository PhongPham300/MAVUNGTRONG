import { PlantingArea, PurchaseTransaction, FarmingActivity, Employee, LinkageStatusOption, SystemSettings, ActivityTypeOption, CropTypeOption, ProductQualityOption, Role, Folder, SystemFile, SurveyRecord, PurchaseContract, BackupData } from '../types';

// URL Google Apps Script Web App
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_PQnNtvqbjf-dPwkd03pMHayvwsTeKw-sAwhXQ7tD7zEnerpvWXjaH4rgC2XtFXPgjA/exec';

// --- CONSTANTS & DEFAULTS (Fallback) ---

const DEFAULT_LINKAGE_STATUSES: LinkageStatusOption[] = [
  { id: '1', label: 'Đã ký HĐ', color: 'bg-green-100 text-green-700' },
  { id: '2', label: 'Chờ ký', color: 'bg-amber-100 text-amber-700' },
  { id: '3', label: 'Hết hạn', color: 'bg-red-100 text-red-700' },
  { id: '4', label: 'Chưa liên kết', color: 'bg-slate-100 text-slate-600' }
];

const DEFAULT_ACTIVITY_TYPES: ActivityTypeOption[] = [
  { id: '1', label: 'Bón phân' },
  { id: '2', label: 'Tưới nước' },
  { id: '3', label: 'Phun thuốc' },
  { id: '4', label: 'Làm cỏ' },
  { id: '5', label: 'Thu hoạch' },
  { id: '6', label: 'Rửa vườn' }
];

const DEFAULT_CROP_TYPES: CropTypeOption[] = [
  { id: '1', label: 'Sầu riêng' },
  { id: '2', label: 'Cà phê' },
  { id: '3', label: 'Bơ 034' },
  { id: '4', label: 'Mắc ca' }
];

const DEFAULT_PRODUCT_QUALITIES: ProductQualityOption[] = [
  { id: '1', label: 'Loại 1' },
  { id: '2', label: 'Loại 2' },
  { id: '3', label: 'Xô' }
];

const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin', name: 'Quản trị viên',
    permissions: {
      viewDashboard: true, viewSOP: true, viewSettings: true,
      viewArea: true, createArea: true, updateArea: true, deleteArea: true, approveLegal: true,
      viewFarming: true, createFarming: true, updateFarming: true, deleteFarming: true,
      viewPurchase: true, createPurchase: true, updatePurchase: true, deletePurchase: true, viewFinancials: true,
      viewStaff: true, createStaff: true, updateStaff: true, deleteStaff: true, manageRoles: true,
      viewDocuments: true, manageDocuments: true
    }
  },
  {
    id: 'technician', name: 'Kỹ thuật viên',
    permissions: {
      viewDashboard: true, viewSOP: true, viewSettings: false,
      viewArea: true, createArea: false, updateArea: true, deleteArea: false, approveLegal: false,
      viewFarming: true, createFarming: true, updateFarming: true, deleteFarming: false,
      viewPurchase: false, createPurchase: false, updatePurchase: false, deletePurchase: false, viewFinancials: false,
      viewStaff: false, createStaff: false, updateStaff: false, deleteStaff: false, manageRoles: false,
      viewDocuments: true, manageDocuments: false
    }
  }
];

const DEFAULT_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI0NSIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMTU4MDNkIiBzdHJva2Utd2lkdGg9IjE1Ii8+PHBhdGggZD0iTTI1NiA5NiBDIDE1MCA5NiAxMjAgMjQwIDgwIDM2MCBDIDYwIDQyMCAxNTAgNDUwIDI1NiA0NTAgQyAzNjIgNDUwIDQ1MiA0MjAgNDMyIDM2MCBDIDM5MiAyNDAgMzYyIDk2IDI1NiA5NiBaIiBmaWxsPSIjMjJjNTVlIi8+PHBhdGggZD0iTTI1NiA0NTAgTDI1NiAxNTAiIHN0cm9rZT0iIzE0NTMyZCIgc3Ryb2tlLXdpZHRoPSIxNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI1NiAzMDAgTCAzNTAgMjIwIiBzdHJva2U9IiMxNDUzMmQiIHN0cm9rZS13aWR0aD0iMTUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNTYgMjIwIEwgMTYwIDE1MCIgc3Ryb2tlPSIjMTQ1MzJkIiBzdHJva2Utd2lkdGg9IjE1IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=";

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  memoTemplate: "",
  contractTemplate: "",
  invoiceTemplate: "",
  activityTypes: DEFAULT_ACTIVITY_TYPES,
  cropTypes: DEFAULT_CROP_TYPES,
  productQualities: DEFAULT_PRODUCT_QUALITIES,
  roles: DEFAULT_ROLES,
  companyInfo: {
    name: 'CÔNG TY CỔ PHẦN ĐẦU TƯ NÔNG NGHIỆP HOA CƯƠNG',
    internationalName: 'HOA CUONG AGRICULTURAL INVESTMENT JOINT STOCK COMPANY',
    shortName: 'HOA CUONG AGRICULTURAL JSC',
    address: 'Tòa nhà VNO, Số 462 Phan Xích Long, Phường Cầu Kiệu, Thành phố Hồ Chí Minh, Việt Nam',
    phone: '', email: '', website: 'www.hoacuonggroup.com', taxCode: '0318078199', representative: 'VÕ THỊ THÙY',
    logoUrl: DEFAULT_LOGO
  },
  fieldConfig: {
    area: { hectares: true, owner: true, location: false, estimatedYield: false },
    farming: { cost: false, actualArea: false, technician: true },
    purchase: { quality: true, price: true }
  }
};

// --- HELPER FUNCTIONS ---

const logError = (context: string, error: any) => {
  console.error(`[API Error] ${context}:`, error);
};

const sendRequest = async (action: string, collection?: string, data?: any) => {
  try {
    let response;
    
    // GET requests
    if (action === 'getAllData' || action.startsWith('get')) {
      const url = `${APPS_SCRIPT_URL}?action=${action}`;
      response = await fetch(url);
    } 
    // POST requests
    else {
      const payload = { action, collection, data };
      
      // Use standard fetch with text/plain to avoid CORS preflight issues typical with GAS Web Apps
      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    logError(`Request failed for action: ${action}`, error);
    throw error;
  }
};

// --- API EXPORTS ---

export const api = {
  // Login: Fetches all data first (to get employees) then checks credentials
  login: async (code: string, password: string): Promise<Employee | null> => {
    try {
      const result = await sendRequest('getAllData');
      const employees = result.employees || [];
      const user = employees.find((e: any) => e.code === code && e.password === password);
      
      if (user) return user;
      
      // Fallback Admin
      if (code === 'ADMIN' && password === '123') {
        return { 
           id: 'admin', code: 'ADMIN', name: 'Quản trị viên', role: 'Quản trị viên', 
           phone: '', status: 'Đang làm việc', joinDate: ''
        };
      }
      return null;
    } catch (e) {
      // Offline or Error fallback
      if (code === 'ADMIN' && password === '123') {
        return { 
           id: 'admin', code: 'ADMIN', name: 'Quản trị viên', role: 'Quản trị viên', 
           phone: '', status: 'Đang làm việc', joinDate: ''
        };
      }
      return null;
    }
  },

  // Optimized: Fetch everything in one go
  fetchAllData: async () => {
    const data = await sendRequest('getAllData');
    
    // Merge fetched settings with defaults to ensure structure
    const fetchedSettings = data.systemSettings || {};
    const mergedSettings = {
      ...DEFAULT_SYSTEM_SETTINGS,
      ...fetchedSettings,
      companyInfo: { ...DEFAULT_SYSTEM_SETTINGS.companyInfo, ...(fetchedSettings.companyInfo || {}) },
      fieldConfig: { ...DEFAULT_SYSTEM_SETTINGS.fieldConfig, ...(fetchedSettings.fieldConfig || {}) },
      // Ensure roles and lists exist
      roles: fetchedSettings.roles && fetchedSettings.roles.length > 0 ? fetchedSettings.roles : DEFAULT_ROLES,
      activityTypes: fetchedSettings.activityTypes || DEFAULT_ACTIVITY_TYPES,
      cropTypes: fetchedSettings.cropTypes || DEFAULT_CROP_TYPES,
      productQualities: fetchedSettings.productQualities || DEFAULT_PRODUCT_QUALITIES,
    };

    return {
      areas: data.areas || [],
      purchases: data.purchases || [],
      farmingLogs: data.farmingLogs || [],
      employees: data.employees || [],
      surveys: data.surveys || [],
      contracts: data.contracts || [],
      folders: data.folders || [],
      files: data.files || [],
      // Linkage statuses might be in settings or root
      linkageStatuses: data.linkageStatuses || DEFAULT_LINKAGE_STATUSES,
      systemSettings: mergedSettings
    };
  },

  // --- CRUD Wrappers ---
  
  // Areas
  getAreas: async () => (await sendRequest('getAllData')).areas || [],
  addArea: async (data: any) => {
    const newId = Math.random().toString(36).substr(2, 9);
    return (await sendRequest('create', 'Areas', { ...data, id: newId })).data;
  },
  updateArea: async (data: any) => (await sendRequest('update', 'Areas', data)).data,
  deleteArea: async (id: string) => (await sendRequest('delete', 'Areas', { id })).data,

  // Purchases
  getPurchases: async () => (await sendRequest('getAllData')).purchases || [],
  addPurchase: async (data: any) => {
    const newId = Math.random().toString(36).substr(2, 9);
    return (await sendRequest('create', 'Purchases', { ...data, id: newId })).data;
  },
  updatePurchase: async (data: any) => (await sendRequest('update', 'Purchases', data)).data,
  deletePurchase: async (id: string) => (await sendRequest('delete', 'Purchases', { id })).data,

  // Surveys
  getSurveys: async () => (await sendRequest('getAllData')).surveys || [],
  addSurvey: async (data: any) => {
    const newId = Math.random().toString(36).substr(2, 9);
    return (await sendRequest('create', 'Surveys', { ...data, id: newId })).data;
  },
  updateSurvey: async (data: any) => (await sendRequest('update', 'Surveys', data)).data,
  deleteSurvey: async (id: string) => (await sendRequest('delete', 'Surveys', { id })).data,

  // Contracts
  getContracts: async () => (await sendRequest('getAllData')).contracts || [],
  addContract: async (data: any) => {
    const newId = Math.random().toString(36).substr(2, 9);
    return (await sendRequest('create', 'Contracts', { ...data, id: newId })).data;
  },
  updateContract: async (data: any) => (await sendRequest('update', 'Contracts', data)).data,
  deleteContract: async (id: string) => (await sendRequest('delete', 'Contracts', { id })).data,

  // Farming Logs
  getFarmingLogs: async () => (await sendRequest('getAllData')).farmingLogs || [],
  addFarmingLog: async (data: any) => {
    const newId = Math.random().toString(36).substr(2, 9);
    return (await sendRequest('create', 'FarmingLogs', { ...data, id: newId })).data;
  },
  updateFarmingLog: async (data: any) => (await sendRequest('update', 'FarmingLogs', data)).data,
  deleteFarmingLog: async (id: string) => (await sendRequest('delete', 'FarmingLogs', { id })).data,

  // Employees
  getEmployees: async () => (await sendRequest('getAllData')).employees || [],
  addEmployee: async (data: any) => {
    const newId = Math.random().toString(36).substr(2, 9);
    return (await sendRequest('create', 'Employees', { ...data, id: newId })).data;
  },
  updateEmployee: async (data: any) => (await sendRequest('update', 'Employees', data)).data,
  deleteEmployee: async (id: string) => (await sendRequest('delete', 'Employees', { id })).data,

  // Documents
  getFolders: async () => (await sendRequest('getAllData')).folders || [],
  addFolder: async (name: string, parentId: string | null) => {
    const newFolder = { id: Math.random().toString(36).substr(2, 9), name, parentId, createdAt: new Date().toISOString() };
    return (await sendRequest('create', 'Folders', newFolder)).data;
  },
  deleteFolder: async (id: string) => (await sendRequest('delete', 'Folders', { id })).data,
  
  getFiles: async () => (await sendRequest('getAllData')).files || [],
  uploadFile: async (file: File, folderId: string | null) => {
    // Note: Actual file upload to GAS/Drive is complex. 
    // Here we just store metadata and a fake/blob URL for session.
    // In a real app with GAS, you'd convert to Base64 and send to GAS to save in Drive.
    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      folderId,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.name.split('.').pop() || 'unknown',
      url: "#", // Placeholder
      file: undefined // Cannot serialize File object to JSON
    };
    return (await sendRequest('create', 'Files', newFile)).data;
  },
  deleteFile: async (id: string) => (await sendRequest('delete', 'Files', { id })).data,

  // Settings & Config
  getLinkageStatuses: async () => (await sendRequest('getAllData')).linkageStatuses || DEFAULT_LINKAGE_STATUSES,
  addLinkageStatus: async (data: any) => (await sendRequest('create', 'Settings', { key: 'linkageStatuses', data })).data, // Simplified
  updateLinkageStatus: async (data: any) => (await sendRequest('update', 'Settings', { key: 'linkageStatuses', data })).data,
  deleteLinkageStatus: async (id: string) => (await sendRequest('delete', 'Settings', { key: 'linkageStatuses', id })).data,

  getSystemSettings: async () => (await sendRequest('getAllData')).systemSettings || DEFAULT_SYSTEM_SETTINGS,
  updateSystemSettings: async (settings: SystemSettings) => {
    // Send to 'updateSettings' action defined in GAS
    const payload = { action: 'updateSettings', data: settings };
    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Update settings failed");
    return settings;
  },

  // Backup & Restore
  backupData: async (): Promise<BackupData> => {
    const data = await sendRequest('getAllData');
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...data
    };
  },
  
  restoreData: async (data: BackupData) => {
    // To restore, we would ideally send a bulk update or just overwrite sheets.
    // For now, let's just update system settings and maybe clear/add items locally?
    // A full restore via API is heavy. 
    // Implementation: Send each collection to 'restore' endpoint if it existed, or just alert user to do manual setup.
    // For this demo, let's just trigger a settings update as a signal.
    await api.updateSystemSettings(data.systemSettings);
    // Ideally, iterate and create items.
  }
};
