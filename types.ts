
// Enum cho trạng thái vùng trồng (Canh tác)
export enum AreaStatus {
  ACTIVE = 'Đang canh tác',
  HARVESTING = 'Đang thu hoạch',
  FALLOW = 'Đất nghỉ',
  PENDING = 'Chờ duyệt'
}

// Interface cho tùy chọn Tình trạng liên kết (Cấu hình động)
export interface LinkageStatusOption {
  id: string;
  label: string;
  color: string; // Class Tailwind css (ví dụ: 'bg-green-100 text-green-700')
}

// Interface cho Tùy chọn Hoạt động canh tác (Cấu hình động)
export interface ActivityTypeOption {
  id: string;
  label: string;
}

// Interface cho Tùy chọn Loại cây trồng (Cấu hình động)
export interface CropTypeOption {
  id: string;
  label: string;
}

// Interface cho Tùy chọn Chất lượng sản phẩm (Cấu hình động)
export interface ProductQualityOption {
  id: string;
  label: string;
}

// Interface thông tin công ty
export interface CompanyInfo {
  name: string;
  internationalName?: string; // Tên quốc tế
  shortName?: string; // Tên viết tắt
  address: string;
  phone: string;
  email: string;
  website: string;
  taxCode: string;
  representative: string; // Người đại diện pháp luật
  logoUrl: string; // Đường dẫn logo
}

// --- NEW: Interface cho Quyền hạn Chi tiết (Granular Permissions) ---
export interface AppPermissions {
  // General
  viewDashboard: boolean;
  viewSOP: boolean;
  viewSettings: boolean; // Quyền truy cập cấu hình hệ thống

  // Area (Vùng trồng)
  viewArea: boolean;
  createArea: boolean;
  updateArea: boolean;
  deleteArea: boolean;
  approveLegal: boolean; // Quyền duyệt pháp lý

  // Farming (Canh tác)
  viewFarming: boolean;
  createFarming: boolean;
  updateFarming: boolean;
  deleteFarming: boolean;

  // Purchase (Thu mua & Hợp đồng)
  viewPurchase: boolean;
  createPurchase: boolean;
  updatePurchase: boolean;
  deletePurchase: boolean;
  viewFinancials: boolean; // Quyền xem giá tiền/doanh thu

  // Staff (Nhân sự)
  viewStaff: boolean;
  createStaff: boolean;
  updateStaff: boolean;
  deleteStaff: boolean;
  manageRoles: boolean; // Quản lý phân quyền

  // Documents (Tài liệu)
  viewDocuments: boolean;
  manageDocuments: boolean; // Upload/Delete file
}

// --- NEW: Interface cho Chức vụ (Role) ---
export interface Role {
  id: string;
  name: string; // Tên chức vụ (Quản lý, Kế toán...)
  permissions: AppPermissions;
}

// --- NEW: Interface cho Cấu hình trường bắt buộc ---
export interface FieldConfig {
  area: {
    hectares: boolean;
    owner: boolean;
    location: boolean;
    estimatedYield: boolean;
  };
  farming: {
    cost: boolean;
    actualArea: boolean;
    technician: boolean;
  };
  purchase: {
    quality: boolean;
    price: boolean;
  };
}

// Interface cho Cấu hình hệ thống chung
export interface SystemSettings {
  memoTemplate: string; // Mẫu biên bản ghi nhớ
  contractTemplate?: string; // Mẫu hợp đồng mua bán
  invoiceTemplate?: string; // Mẫu hóa đơn/phiếu cân
  activityTypes: ActivityTypeOption[]; // Danh sách các loại hoạt động canh tác
  cropTypes: CropTypeOption[]; // Danh sách loại cây trồng
  productQualities: ProductQualityOption[]; // Danh sách phân loại hàng hóa
  companyInfo: CompanyInfo; // Thông tin công ty
  roles: Role[]; // Danh sách chức vụ và quyền hạn
  fieldConfig: FieldConfig; // Cấu hình trường bắt buộc
}

// Enum cho chất lượng nông sản (Giữ lại để tham khảo, nhưng logic chính sẽ dùng string từ cấu hình)
export enum ProductQuality {
  TYPE_1 = 'Loại 1',
  TYPE_2 = 'Loại 2',
  TYPE_3 = 'Loại 3'
}

// Interface cho tài liệu đính kèm (Local trong form vùng trồng)
export interface AreaDocument {
  id: string;
  name: string;
  uploadDate: string;
  url?: string; 
  file?: File; 
}

// --- NEW: Interface cho Kho tài liệu chung (Document Library) ---
export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null là thư mục gốc
  createdAt: string;
}

export interface SystemFile {
  id: string;
  name: string;
  folderId: string | null; // null là thư mục gốc
  uploadDate: string;
  size: string;
  type: string; // pdf, doc, img...
  url?: string;
  file?: File;
}

// Interface cho Nông hộ (Farmer) thuộc vùng trồng
export interface Farmer {
  id: string;
  name: string;
  phone: string;
  areaSize: number; // Diện tích của hộ này (ha)
  notes?: string;
}

// Định nghĩa Mức độ ưu tiên
export type PriorityLevel = 'Ưu tiên 1' | 'Ưu tiên 2' | 'Ưu tiên 3' | 'Chưa xếp hạng';

// Định nghĩa Trạng thái tiếp cận
export type ApproachStatus = 'Chưa gặp' | 'Đã gặp' | 'Đã ký biên bản' | 'Không liên kết được';

// Định nghĩa Trạng thái pháp lý
export type LegalStatus = 'Chưa xử lý' | 'Trình ký' | 'Nộp hồ sơ' | 'Đã duyệt';

// Đối tượng Vùng trồng (Planting Area)
export interface PlantingArea {
  id: string;
  code: string; // Mã vùng trồng (e.g., VT-001)
  name: string; // Tên vùng/Hợp tác xã
  cropType: string; // Loại cây trồng (Lấy từ cấu hình)
  hectares: number; // Tổng diện tích (ha)
  location: string; // Địa chỉ
  owner: string; // Người đại diện / Chủ nhiệm HTX
  phone?: string; // Số điện thoại liên hệ
  farmers: Farmer[]; // Danh sách các hộ dân trong vùng
  status: AreaStatus; // Trạng thái canh tác
  estimatedYield: number; // Sản lượng dự kiến (tấn)
  comments?: string; // Bình luận / Ghi chú thêm
  
  // Thông tin mới
  linkageStatus: string; // Tình trạng liên kết (Lưu chuỗi text để linh động)
  documents: AreaDocument[]; // Danh sách tài liệu
  priority: PriorityLevel; // Mức độ ưu tiên
  
  // Lịch biểu tiếp cận (SOP Bước 1 & 2)
  appointmentDate?: string; // Ngày hẹn gặp tiếp cận / làm việc
  appointmentNote?: string; // Nội dung hẹn (VD: Gặp ký biên bản, Khảo sát vườn...)
  appointmentParticipants?: string[]; // Danh sách nhân viên tham gia (Tên hoặc ID)
  approachStatus?: ApproachStatus; // Trạng thái tiếp cận: Chưa gặp, Đã gặp...
  
  // Thủ tục pháp lý & Ủy quyền (SOP Bước 8)
  legalStatus?: LegalStatus;
  authorizationDate?: string; // Ngày ủy quyền/Cấp mã
  legalNotes?: string; // Ghi chú hồ sơ pháp lý
}

// --- NEW: Interface cho Lịch sử chỉnh sửa ---
export interface EditLog {
  date: string; // ISO date string
  editorName: string; // Tên người sửa
  action: string; // Mô tả thay đổi (VD: "Sửa số lượng 500 -> 600")
}

// --- NEW MODULE: THU MUA (3 GIAI ĐOẠN) ---

// Giai đoạn 1: Khảo sát & Đánh giá (Survey)
export interface SurveyRecord {
  id: string;
  date: string;
  areaId: string;
  surveyor: string; // Người khảo sát
  estimatedOutput: number; // Sản lượng đánh giá thực tế tại vườn (Tấn)
  qualityAssessment: string; // Đánh giá chất lượng (Tốt, Khá, TB...)
  standardCriteria: string; // Tiêu chuẩn áp dụng (VietGAP, GlobalGAP, Hàng thường...)
  notes?: string;
}

// Giai đoạn 2: Mua vườn & Hợp đồng (Purchase Contract)
export interface PurchaseContract {
  id: string;
  date: string;
  areaId: string;
  contractCode: string; // Số hợp đồng
  agreedPrice: number; // Giá chốt (VND/Kg hoặc trọn gói)
  depositAmount: number; // Tiền cọc
  status: 'Đang thương lượng' | 'Đã chốt' | 'Đã hủy';
  notes?: string;
}

// Giai đoạn 3: Thu hoạch & Tính tiền (Purchase Transaction - Existing)
export interface PurchaseTransaction {
  id: string;
  date: string;
  areaId: string; // Liên kết với PlantingArea
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  quality: string; // Thay đổi từ Enum sang string để động
  notes?: string;
  history?: EditLog[]; // Lịch sử chỉnh sửa
}

// Đối tượng Hoạt động canh tác (Farming Activity)
export interface FarmingActivity {
  id: string;
  date: string;
  areaId: string;
  activityType: string; // Bón phân, Tưới nước, Phun thuốc, v.v.
  description: string;
  technician: string; // Người thực hiện/Giám sát
  cost?: number; // Chi phí (nếu có)
  
  // Các trường thông tin bổ sung
  currentYield?: number; // Sản lượng trái hiện tại (đánh giá tại thời điểm này)
  actualArea?: number;   // Diện tích thực tế canh tác/chăm sóc đợt này
  estimatedHarvestDate?: string; // Thời gian thu hoạch dự kiến
  
  stage?: 'before_harvest' | 'after_harvest'; // Giai đoạn: Trước thu hoạch | Sau thu hoạch
}

// Đối tượng Nhân viên (Employee)
export interface Employee {
  id: string;
  code: string; // Mã nhân viên (NV001)
  name: string;
  role: string; // Chức vụ (Map với Role.name hoặc Role.id)
  phone: string;
  password?: string; // Mật khẩu đăng nhập (Tách riêng)
  email?: string;
  status: 'Đang làm việc' | 'Đã nghỉ việc';
  joinDate: string;
  
  // Thông tin chi tiết mới
  dob?: string; // Ngày sinh
  identityCard?: string; // CCCD/CMND
  address?: string; // Địa chỉ thường trú
}

// Dữ liệu tổng hợp cho Dashboard
export interface DashboardStats {
  totalAreas: number;
  totalHectares: number;
  totalRevenue: number;
  totalVolumeKg: number;
}

// --- Interface cho Backup Data ---
export interface BackupData {
  version: string;
  timestamp: string;
  areas: PlantingArea[];
  purchases: PurchaseTransaction[];
  surveys: SurveyRecord[];
  contracts: PurchaseContract[];
  farmingLogs: FarmingActivity[];
  employees: Employee[];
  linkageStatuses: LinkageStatusOption[];
  folders: Folder[];
  files: SystemFile[];
  systemSettings: SystemSettings;
}