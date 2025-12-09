import { PlantingArea, PurchaseTransaction, AreaStatus, FarmingActivity, Employee, LinkageStatusOption, SystemSettings, ActivityTypeOption, CropTypeOption, ProductQualityOption, Role, PriorityLevel, Folder, SystemFile, SurveyRecord, PurchaseContract, BackupData } from '../types';

// TODO: Thay thế URL này bằng URL Web App của Google Apps Script của bạn
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

// Dữ liệu cấu hình mặc định cho Tình trạng liên kết
let MOCK_LINKAGE_STATUSES: LinkageStatusOption[] = [
  { id: '1', label: 'Đã ký HĐ', color: 'bg-green-100 text-green-700' },
  { id: '2', label: 'Chờ ký', color: 'bg-amber-100 text-amber-700' },
  { id: '3', label: 'Hết hạn', color: 'bg-red-100 text-red-700' },
  { id: '4', label: 'Chưa liên kết', color: 'bg-slate-100 text-slate-600' }
];

// Dữ liệu mặc định cho Hoạt động canh tác
let MOCK_ACTIVITY_TYPES: ActivityTypeOption[] = [
  { id: '1', label: 'Bón phân' },
  { id: '2', label: 'Tưới nước' },
  { id: '3', label: 'Phun thuốc' },
  { id: '4', label: 'Làm cỏ' },
  { id: '5', label: 'Cắt tỉa' },
  { id: '6', label: 'Kiểm tra vườn' },
  { id: '7', label: 'Thu hoạch' },
  { id: '8', label: 'Rửa vườn' },
  { id: '9', label: 'Phục hồi đất' }
];

// Dữ liệu mặc định cho Loại cây trồng
let MOCK_CROP_TYPES: CropTypeOption[] = [
  { id: '1', label: 'Sầu riêng' },
  { id: '2', label: 'Cà phê' },
  { id: '3', label: 'Bơ 034' },
  { id: '4', label: 'Mắc ca' },
  { id: '5', label: 'Chanh leo' }
];

// Dữ liệu mặc định cho Phân loại hàng hóa
let MOCK_PRODUCT_QUALITIES: ProductQualityOption[] = [
  { id: '1', label: 'Loại 1 (Xuất khẩu)' },
  { id: '2', label: 'Loại 2 (Chợ)' },
  { id: '3', label: 'Hàng Kem' },
  { id: '4', label: 'Hàng Dạt' },
  { id: '5', label: 'Xô' }
];

// Dữ liệu mặc định cho Phân quyền (Roles)
let MOCK_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Quản trị viên',
    permissions: {
      viewDashboard: true, viewSOP: true, viewSettings: true, viewInsights: true,
      
      viewArea: true, createArea: true, updateArea: true, deleteArea: true, approveLegal: true,
      
      viewFarming: true, createFarming: true, updateFarming: true, deleteFarming: true,
      
      viewPurchase: true, createPurchase: true, updatePurchase: true, deletePurchase: true, viewFinancials: true,
      
      viewStaff: true, createStaff: true, updateStaff: true, deleteStaff: true, manageRoles: true,
      
      viewDocuments: true, manageDocuments: true
    }
  },
  {
    id: 'technician',
    name: 'Kỹ thuật viên',
    permissions: {
      viewDashboard: true, viewSOP: true, viewSettings: false, viewInsights: false,
      
      viewArea: true, createArea: false, updateArea: true, deleteArea: false, approveLegal: false,
      
      viewFarming: true, createFarming: true, updateFarming: true, deleteFarming: false,
      
      viewPurchase: false, createPurchase: false, updatePurchase: false, deletePurchase: false, viewFinancials: false,
      
      viewStaff: false, createStaff: false, updateStaff: false, deleteStaff: false, manageRoles: false,
      
      viewDocuments: true, manageDocuments: false
    }
  },
  {
    id: 'purchaser',
    name: 'Nhân viên Thu mua',
    permissions: {
      viewDashboard: true, viewSOP: true, viewSettings: false, viewInsights: false,
      
      viewArea: true, createArea: false, updateArea: false, deleteArea: false, approveLegal: false,
      
      viewFarming: false, createFarming: false, updateFarming: false, deleteFarming: false,
      
      viewPurchase: true, createPurchase: true, updatePurchase: true, deletePurchase: false, viewFinancials: true,
      
      viewStaff: false, createStaff: false, updateStaff: false, deleteStaff: false, manageRoles: false,
      
      viewDocuments: true, manageDocuments: false
    }
  }
];

// Mẫu biên bản ghi nhớ mặc định
const DEFAULT_MEMO_TEMPLATE = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-------------------

<b>BIÊN BẢN GHI NHỚ HỢP TÁC TIÊU THỤ NÔNG SẢN</b>

Hôm nay, ngày {{NGAY}} tháng {{THANG}} năm {{NAM}}, tại {{DIA_CHI_CONG_TY}}.

CHÚNG TÔI GỒM:

<b>BÊN A (Bên thu mua): {{TEN_CONG_TY}}</b>
Đại diện: Ông/Bà {{DAI_DIEN}}
Chức vụ: Giám đốc
Mã số thuế: {{MST}}
Điện thoại: {{SDT_CONG_TY}}
Địa chỉ: {{DIA_CHI_CONG_TY}}

<b>BÊN B (Bên trồng trọt): Ông/Bà {{CHU_HO}}</b>
Mã vùng trồng: {{MA_VUNG}}
Địa chỉ canh tác: {{DIA_CHI}}
Điện thoại liên hệ: ...........................

Hai bên thống nhất ký kết biên bản ghi nhớ với nội dung sau:

1. Bên B cam kết cung cấp sản phẩm nông sản từ diện tích {{DIEN_TICH}} ha trồng {{CAY_TRONG}}.
2. Dự kiến sản lượng thu hoạch: {{SAN_LUONG}} tấn.
3. Bên A cam kết bao tiêu sản phẩm đạt chuẩn chất lượng theo quy định.
4. Giá thu mua sẽ được chốt trước thời điểm thu hoạch 15 ngày dựa trên giá thị trường.

Biên bản này được lập thành 02 bản có giá trị như nhau.

<b>ĐẠI DIỆN BÊN A</b>                                    <b>ĐẠI DIỆN BÊN B</b>
(Ký, ghi rõ họ tên)                               (Ký, ghi rõ họ tên)
{{DAI_DIEN}}                                      {{CHU_HO}}`;

// Mẫu hợp đồng mua bán mặc định
const DEFAULT_CONTRACT_TEMPLATE = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-------------------

<b>HỢP ĐỒNG MUA BÁN NÔNG SẢN</b>
Số: {{SO_HD}}

Hôm nay, ngày {{NGAY}} tháng {{THANG}} năm {{NAM}}, chúng tôi gồm:

<b>BÊN A (Bên Mua): {{TEN_CONG_TY}}</b>
Địa chỉ: {{DIA_CHI_CONG_TY}}
Đại diện: {{DAI_DIEN}}

<b>BÊN B (Bên Bán): Ông/Bà {{CHU_HO}}</b>
Địa chỉ: {{DIA_CHI}}
Đại diện Vùng trồng: {{MA_VUNG}}

Hai bên thống nhất ký kết hợp đồng mua bán với các điều khoản sau:

<b>Điều 1: Nội dung mua bán</b>
Bên A đồng ý mua và Bên B đồng ý bán toàn bộ sản lượng {{CAY_TRONG}} tại vùng trồng {{MA_VUNG}}.

<b>Điều 2: Giá cả và Thanh toán</b>
- Giá chốt: {{GIA_CHOT}} VND
- Tiền cọc: {{TIEN_COC}} VND
- Số tiền còn lại sẽ được thanh toán sau khi hoàn tất thu hoạch.

<b>Điều 3: Cam kết</b>
Hai bên cam kết thực hiện đúng các điều khoản trên. Nếu có tranh chấp sẽ giải quyết trên tinh thần thương lượng.

<b>ĐẠI DIỆN BÊN A</b>           <b>ĐẠI DIỆN BÊN B</b>`;

// Mẫu hóa đơn mặc định
const DEFAULT_INVOICE_TEMPLATE = `
<div style="text-align:center">
  <h3>{{TEN_CONG_TY}}</h3>
  <p>{{DIA_CHI_CONG_TY}}</p>
  <hr/>
  <h2>PHIẾU CÂN / HÓA ĐƠN THU MUA</h2>
  <p>Số phiếu: {{SO_PHIEU}}</p>
  <p>Ngày: {{NGAY}}/{{THANG}}/{{NAM}}</p>
</div>

<div style="margin-top: 20px;">
  <p><b>Khách hàng (Nông hộ):</b> {{CHU_HO}}</p>
  <p><b>Vùng trồng:</b> {{TEN_VUNG}} ({{MA_VUNG}})</p>
</div>

<table style="width:100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #000;">
  <tr style="background-color: #f0f0f0;">
    <th style="border: 1px solid #000; padding: 8px;">Mặt hàng</th>
    <th style="border: 1px solid #000; padding: 8px;">Chất lượng</th>
    <th style="border: 1px solid #000; padding: 8px;">Số lượng (Kg)</th>
    <th style="border: 1px solid #000; padding: 8px;">Đơn giá</th>
    <th style="border: 1px solid #000; padding: 8px;">Thành tiền</th>
  </tr>
  <tr>
    <td style="border: 1px solid #000; padding: 8px;">{{CAY_TRONG}}</td>
    <td style="border: 1px solid #000; padding: 8px;">{{CHAT_LUONG}}</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;">{{SO_LUONG}}</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;">{{DON_GIA}}</td>
    <td style="border: 1px solid #000; padding: 8px; text-align: right;">{{THANH_TIEN}}</td>
  </tr>
</table>

<div style="margin-top: 20px; text-align: right;">
  <h3>TỔNG TIỀN: {{THANH_TIEN}} VND</h3>
</div>

<div style="margin-top: 40px; display: flex; justify-content: space-between;">
  <div style="text-align: center; width: 40%;">
    <p><b>Người lập phiếu</b></p>
    <br/><br/>
    <p>....................</p>
  </div>
  <div style="text-align: center; width: 40%;">
    <p><b>Người bán hàng</b></p>
    <br/><br/>
    <p>{{CHU_HO}}</p>
  </div>
</div>
`;

// Logo mặc định cho Hoa Cương (SVG Base64)
const DEFAULT_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjI0NSIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMTU4MDNkIiBzdHJva2Utd2lkdGg9IjE1Ii8+PHBhdGggZD0iTTI1NiA5NiBDIDE1MCA5NiAxMjAgMjQwIDgwIDM2MCBDIDYwIDQyMCAxNTAgNDUwIDI1NiA0NTAgQyAzNjIgNDUwIDQ1MiA0MjAgNDMyIDM2MCBDIDM5MiAyNDAgMzYyIDk2IDI1NiA5NiBaIiBmaWxsPSIjMjJjNTVlIi8+PHBhdGggZD0iTTI1NiA0NTAgTDI1NiAxNTAiIHN0cm9rZT0iIzE0NTMyZCIgc3Ryb2tlLXdpZHRoPSIxNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI1NiAzMDAgTCAzNTAgMjIwIiBzdHJva2U9IiMxNDUzMmQiIHN0cm9rZS13aWR0aD0iMTUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNTYgMjIwIEwgMTYwIDE1MCIgc3Ryb2tlPSIjMTQ1MzJkIiBzdHJva2Utd2lkdGg9IjE1IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=";

let MOCK_SYSTEM_SETTINGS: SystemSettings = {
  memoTemplate: DEFAULT_MEMO_TEMPLATE,
  contractTemplate: DEFAULT_CONTRACT_TEMPLATE,
  invoiceTemplate: DEFAULT_INVOICE_TEMPLATE,
  activityTypes: MOCK_ACTIVITY_TYPES,
  cropTypes: MOCK_CROP_TYPES,
  productQualities: MOCK_PRODUCT_QUALITIES,
  companyInfo: {
    name: 'CÔNG TY CỔ PHẦN ĐẦU TƯ NÔNG NGHIỆP HOA CƯƠNG',
    internationalName: 'HOA CUONG AGRICULTURAL INVESTMENT JOINT STOCK COMPANY',
    shortName: 'HOA CUONG AGRICULTURAL JSC',
    address: 'Tòa nhà VNO, Số 462 Phan Xích Long, Phường Cầu Kiệu, Thành phố Hồ Chí Minh, Việt Nam',
    phone: '',
    email: '',
    website: 'www.hoacuonggroup.com',
    taxCode: '0318078199',
    representative: 'VÕ THỊ THÙY',
    logoUrl: DEFAULT_LOGO
  },
  roles: MOCK_ROLES,
  fieldConfig: {
    area: { hectares: true, owner: true, location: false, estimatedYield: false },
    farming: { cost: false, actualArea: false, technician: true },
    purchase: { quality: true, price: true }
  }
};

// --- MOCK DATA FOR DOCUMENT LIBRARY ---
let MOCK_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Tài liệu Công ty', parentId: null, createdAt: '2023-01-01' },
  { id: 'f2', name: 'Biểu mẫu Hợp đồng', parentId: null, createdAt: '2023-01-01' },
  { id: 'f3', name: 'Quy trình Canh tác', parentId: 'f1', createdAt: '2023-02-15' },
  { id: 'f4', name: 'Brochure Giới thiệu', parentId: 'f1', createdAt: '2023-03-10' },
];

let MOCK_FILES: SystemFile[] = [
  { id: 'file1', name: 'Ho_so_nang_luc.pdf', folderId: 'f1', uploadDate: '2023-05-20', size: '2.5 MB', type: 'pdf' },
  { id: 'file2', name: 'Mau_Hop_dong_2024.docx', folderId: 'f2', uploadDate: '2023-12-01', size: '1.2 MB', type: 'doc' },
  { id: 'file3', name: 'Quy_trinh_bon_phan_SR.pdf', folderId: 'f3', uploadDate: '2023-06-15', size: '5.0 MB', type: 'pdf' },
];

// Dữ liệu giả lập (Mock Data)
let MOCK_AREAS: PlantingArea[] = [
  { 
    id: '1', 
    code: 'VN-DL-001', 
    name: 'Hợp tác xã Đại Lộc', 
    cropType: 'Sầu riêng', 
    hectares: 5.5, 
    location: 'Đạ Huoai, Lâm Đồng', 
    owner: 'Nguyễn Văn A', 
    phone: '0901234567',
    farmers: [
      { id: 'f1', name: 'Nguyễn Văn A', phone: '0901234567', areaSize: 2.5, notes: 'Chủ nhiệm' },
      { id: 'f2', name: 'Lê Văn Tám', phone: '0909888777', areaSize: 3.0, notes: 'Thành viên' }
    ],
    status: AreaStatus.HARVESTING, 
    estimatedYield: 15,
    linkageStatus: 'Đã ký HĐ',
    documents: [],
    priority: 'Ưu tiên 1',
    appointmentDate: '',
    appointmentNote: '',
    appointmentParticipants: [],
    approachStatus: 'Đã ký biên bản',
    legalStatus: 'Đã duyệt',
    authorizationDate: '2023-05-20',
    comments: 'Vùng này có năng suất cao, cần chú ý thu mua sớm.'
  },
  { 
    id: '2', 
    code: 'VN-DL-002', 
    name: 'Vườn ông Bảy', 
    cropType: 'Cà phê', 
    hectares: 2.3, 
    location: 'Di Linh, Lâm Đồng', 
    owner: 'Trần Văn Bảy', 
    phone: '0988123456',
    farmers: [],
    status: AreaStatus.ACTIVE, 
    estimatedYield: 8,
    linkageStatus: 'Đã ký HĐ',
    documents: [],
    priority: 'Ưu tiên 2',
    appointmentDate: '2024-06-15',
    appointmentNote: 'Gặp mặt thống nhất giá phân bón',
    appointmentParticipants: ['Trần Minh Tuấn'],
    approachStatus: 'Đã gặp',
    legalStatus: 'Trình ký',
    comments: 'Địa hình hơi dốc, khó vận chuyển vào mùa mưa.'
  },
  { 
    id: '3', 
    code: 'VN-DL-003', 
    name: 'Nông trại Xanh', 
    cropType: 'Bơ 034', 
    hectares: 10, 
    location: 'Bảo Lộc, Lâm Đồng', 
    owner: 'Lê Thị C',
    phone: '0912345678',
    farmers: [],
    status: AreaStatus.FALLOW, 
    estimatedYield: 20,
    linkageStatus: 'Chờ ký',
    documents: [],
    priority: 'Ưu tiên 1',
    appointmentDate: '2024-06-10',
    appointmentNote: 'Ký biên bản ghi nhớ hợp tác',
    appointmentParticipants: ['Quản trị viên', 'Trần Minh Tuấn'],
    approachStatus: 'Chưa gặp',
    legalStatus: 'Chưa xử lý'
  },
  { 
    id: '4', 
    code: 'VN-DL-004', 
    name: 'HTX Minh Toàn', 
    cropType: 'Sầu riêng', 
    hectares: 8, 
    location: 'Đạ Huoai, Lâm Đồng', 
    owner: 'Phạm Minh',
    phone: '0933555777',
    farmers: [], 
    status: AreaStatus.HARVESTING, 
    estimatedYield: 25,
    linkageStatus: 'Hết hạn',
    documents: [],
    priority: 'Ưu tiên 3',
    appointmentDate: '2024-06-20',
    appointmentNote: 'Đánh giá lại tiêu chuẩn VietGAP',
    appointmentParticipants: [],
    approachStatus: 'Không liên kết được',
    legalStatus: 'Chưa xử lý'
  },
  { 
    id: '5', 
    code: 'VN-DL-005', 
    name: 'Trại Mắc ca Hoàng Liên', 
    cropType: 'Mắc ca', 
    hectares: 12.5, 
    location: 'Lâm Hà, Lâm Đồng', 
    owner: 'Hoàng Thị Liên',
    phone: '0918888999',
    farmers: [], 
    status: AreaStatus.ACTIVE, 
    estimatedYield: 18,
    linkageStatus: 'Chờ ký',
    documents: [],
    priority: 'Ưu tiên 2',
    appointmentDate: '2024-07-05',
    appointmentNote: 'Khảo sát thực địa',
    appointmentParticipants: [],
    approachStatus: 'Chưa gặp',
    legalStatus: 'Chưa xử lý'
  },
];

let MOCK_PURCHASES: PurchaseTransaction[] = [
  { id: '101', date: '2023-10-15', areaId: '1', quantityKg: 500, pricePerKg: 80000, totalAmount: 40000000, quality: 'Loại 1 (Xuất khẩu)', notes: 'Thu hoạch đợt 1', history: [] },
  { id: '102', date: '2023-10-16', areaId: '1', quantityKg: 300, pricePerKg: 50000, totalAmount: 15000000, quality: 'Loại 2 (Chợ)', notes: 'Hàng dạt', history: [] },
  { id: '103', date: '2023-10-18', areaId: '4', quantityKg: 1200, pricePerKg: 82000, totalAmount: 98400000, quality: 'Loại 1 (Xuất khẩu)', notes: 'Hàng xuất khẩu', history: [] },
];

let MOCK_SURVEYS: SurveyRecord[] = [
  { id: 's1', date: '2024-05-10', areaId: '1', surveyor: 'Trần Minh Tuấn', estimatedOutput: 18, qualityAssessment: 'Tốt', standardCriteria: 'VietGAP', notes: 'Trái đều, vỏ đẹp' }
];

let MOCK_CONTRACTS: PurchaseContract[] = [
  { id: 'c1', date: '2024-05-20', areaId: '1', contractCode: 'HD-2405-001', agreedPrice: 85000, depositAmount: 100000000, status: 'Đã chốt', notes: 'Mua xô' }
];

let MOCK_FARMING_LOGS: FarmingActivity[] = [
  { 
    id: '201', 
    date: '2023-11-01', 
    areaId: '2', 
    activityType: 'Bón phân', 
    description: 'Bón NPK đợt 2 kích thích ra hoa', 
    technician: 'Kỹ sư Tuấn', 
    cost: 2500000,
    currentYield: 0,
    actualArea: 2.3,
    estimatedHarvestDate: '2024-02-15',
    stage: 'before_harvest'
  },
  { 
    id: '202', 
    date: '2023-11-02', 
    areaId: '1', 
    activityType: 'Phun thuốc', 
    description: 'Phòng trừ rầy xanh và nấm hồng', 
    technician: 'Tổ đội 3', 
    cost: 1200000,
    currentYield: 5000,
    actualArea: 5.5,
    estimatedHarvestDate: '2023-12-20',
    stage: 'before_harvest'
  },
  { 
    id: '203', 
    date: '2023-11-05', 
    areaId: '2', 
    activityType: 'Tưới nước', 
    description: 'Tưới nhỏ giọt 4h', 
    technician: 'Hệ thống tự động', 
    cost: 0,
    actualArea: 2.3,
    stage: 'before_harvest'
  },
  {
    id: '204',
    date: '2023-12-01',
    areaId: '1',
    activityType: 'Rửa vườn',
    description: 'Xịt rửa vườn sau thu hoạch',
    technician: 'Tổ đội 3',
    cost: 800000,
    actualArea: 5.5,
    stage: 'after_harvest'
  }
];

let MOCK_EMPLOYEES: Employee[] = [
  { id: '300', code: 'ADMIN', name: 'Quản trị viên', role: 'Quản trị viên', phone: '0900000000', password: '123', email: 'admin@hoacuonggroup.com', status: 'Đang làm việc', joinDate: '2020-01-01', dob: '1985-05-15', identityCard: '012345678901', address: 'TP. HCM' },
  { id: '301', code: 'NV-001', name: 'Trần Minh Tuấn', role: 'Kỹ thuật viên', phone: '0909123456', password: '123', email: 'tuan.kthuat@hoacuonggroup.com', status: 'Đang làm việc', joinDate: '2022-01-15', dob: '1990-01-01', identityCard: '098765432109', address: 'Lâm Đồng' },
  { id: '302', code: 'NV-002', name: 'Nguyễn Thị Mai', role: 'Nhân viên Thu mua', phone: '0912345678', password: '123', email: 'mai.thumua@hoacuonggroup.com', status: 'Đang làm việc', joinDate: '2022-03-20', dob: '1995-10-20', identityCard: '079123456789', address: 'Bảo Lộc' },
  { id: '303', code: 'NV-003', name: 'Lê Văn Hùng', role: 'Quản trị viên', phone: '0988777666', password: '123', email: 'hung.quanly@hoacuonggroup.com', status: 'Đang làm việc', joinDate: '2021-11-05', dob: '1988-12-12', identityCard: '068123123123', address: 'Di Linh' },
];

export const api = {
  // --- Auth API ---
  login: async (code: string, password: string): Promise<Employee | null> => {
    // REAL: Call server to validate
    return new Promise((resolve) => {
      setTimeout(() => {
        // So sánh code và password
        const user = MOCK_EMPLOYEES.find(e => e.code === code && e.password === password);
        resolve(user || null);
      }, 800);
    });
  },

  // --- Configuration API (Linkage Statuses) ---
  getLinkageStatuses: async (): Promise<LinkageStatusOption[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_LINKAGE_STATUSES]), 300));
  },

  addLinkageStatus: async (status: Omit<LinkageStatusOption, 'id'>): Promise<LinkageStatusOption> => {
    const newStatus = { ...status, id: Math.random().toString(36).substr(2, 9) };
    MOCK_LINKAGE_STATUSES.push(newStatus);
    return new Promise((resolve) => setTimeout(() => resolve(newStatus), 300));
  },

  updateLinkageStatus: async (status: LinkageStatusOption): Promise<LinkageStatusOption> => {
    const index = MOCK_LINKAGE_STATUSES.findIndex(s => s.id === status.id);
    if (index !== -1) {
      MOCK_LINKAGE_STATUSES[index] = status;
      return new Promise((resolve) => setTimeout(() => resolve(status), 300));
    }
    throw new Error("Status not found");
  },

  deleteLinkageStatus: async (id: string): Promise<void> => {
    MOCK_LINKAGE_STATUSES = MOCK_LINKAGE_STATUSES.filter(s => s.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 300));
  },

  // --- Configuration API (System Settings) ---
  getSystemSettings: async (): Promise<SystemSettings> => {
    return new Promise((resolve) => setTimeout(() => resolve({...MOCK_SYSTEM_SETTINGS}), 300));
  },

  updateSystemSettings: async (settings: SystemSettings): Promise<SystemSettings> => {
    MOCK_SYSTEM_SETTINGS = settings;
    // Đồng bộ lại MOCK constants nếu cần
    MOCK_ACTIVITY_TYPES = settings.activityTypes;
    MOCK_CROP_TYPES = settings.cropTypes;
    MOCK_PRODUCT_QUALITIES = settings.productQualities;
    MOCK_ROLES = settings.roles;
    
    return new Promise((resolve) => setTimeout(() => resolve(settings), 300));
  },

  // --- Area API ---
  getAreas: async (): Promise<PlantingArea[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_AREAS]), 500));
  },

  addArea: async (area: Omit<PlantingArea, 'id'>): Promise<PlantingArea> => {
    const newArea = { 
      ...area, 
      id: Math.random().toString(36).substr(2, 9),
      documents: area.documents || [],
      farmers: area.farmers || [],
      priority: area.priority || 'Chưa xếp hạng',
      appointmentDate: area.appointmentDate || '',
      appointmentNote: area.appointmentNote || '',
      appointmentParticipants: area.appointmentParticipants || [],
      approachStatus: area.approachStatus || 'Chưa gặp',
      legalStatus: area.legalStatus || 'Chưa xử lý',
      authorizationDate: area.authorizationDate || '',
      phone: area.phone || '',
      comments: area.comments || ''
    };
    MOCK_AREAS.push(newArea);
    return new Promise((resolve) => setTimeout(() => resolve(newArea), 500));
  },

  updateArea: async (area: PlantingArea): Promise<PlantingArea> => {
    const index = MOCK_AREAS.findIndex(item => item.id === area.id);
    if (index !== -1) {
      MOCK_AREAS[index] = area;
      return new Promise((resolve) => setTimeout(() => resolve(area), 500));
    }
    throw new Error("Area not found");
  },

  deleteArea: async (id: string): Promise<void> => {
    MOCK_AREAS = MOCK_AREAS.filter(a => a.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  },

  // --- Purchase API ---
  getPurchases: async (): Promise<PurchaseTransaction[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_PURCHASES]), 500));
  },

  addPurchase: async (purchase: Omit<PurchaseTransaction, 'id'>): Promise<PurchaseTransaction> => {
    const newPurchase = { 
      ...purchase, 
      id: Math.random().toString(36).substr(2, 9),
      totalAmount: purchase.quantityKg * purchase.pricePerKg,
      history: []
    };
    MOCK_PURCHASES.push(newPurchase);
    return new Promise((resolve) => setTimeout(() => resolve(newPurchase), 500));
  },

  updatePurchase: async (purchase: PurchaseTransaction): Promise<PurchaseTransaction> => {
    const index = MOCK_PURCHASES.findIndex(item => item.id === purchase.id);
    if (index !== -1) {
      const updatedPurchase = {
        ...purchase,
        totalAmount: purchase.quantityKg * purchase.pricePerKg
      };
      MOCK_PURCHASES[index] = updatedPurchase;
      return new Promise((resolve) => setTimeout(() => resolve(updatedPurchase), 500));
    }
    throw new Error("Purchase not found");
  },
  
  deletePurchase: async (id: string): Promise<void> => {
    MOCK_PURCHASES = MOCK_PURCHASES.filter(p => p.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  },

  // --- NEW: Survey API ---
  getSurveys: async (): Promise<SurveyRecord[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_SURVEYS]), 400));
  },

  addSurvey: async (survey: Omit<SurveyRecord, 'id'>): Promise<SurveyRecord> => {
    const newSurvey = { ...survey, id: Math.random().toString(36).substr(2, 9) };
    MOCK_SURVEYS.push(newSurvey);
    return new Promise((resolve) => setTimeout(() => resolve(newSurvey), 400));
  },

  updateSurvey: async (survey: SurveyRecord): Promise<SurveyRecord> => {
    const index = MOCK_SURVEYS.findIndex(item => item.id === survey.id);
    if (index !== -1) {
      MOCK_SURVEYS[index] = survey;
      return new Promise((resolve) => setTimeout(() => resolve(survey), 400));
    }
    throw new Error("Survey not found");
  },

  deleteSurvey: async (id: string): Promise<void> => {
    MOCK_SURVEYS = MOCK_SURVEYS.filter(s => s.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 400));
  },

  // --- NEW: Contract API ---
  getContracts: async (): Promise<PurchaseContract[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_CONTRACTS]), 400));
  },

  addContract: async (contract: Omit<PurchaseContract, 'id'>): Promise<PurchaseContract> => {
    const newContract = { ...contract, id: Math.random().toString(36).substr(2, 9) };
    MOCK_CONTRACTS.push(newContract);
    return new Promise((resolve) => setTimeout(() => resolve(newContract), 400));
  },

  updateContract: async (contract: PurchaseContract): Promise<PurchaseContract> => {
    const index = MOCK_CONTRACTS.findIndex(item => item.id === contract.id);
    if (index !== -1) {
      MOCK_CONTRACTS[index] = contract;
      return new Promise((resolve) => setTimeout(() => resolve(contract), 400));
    }
    throw new Error("Contract not found");
  },

  deleteContract: async (id: string): Promise<void> => {
    MOCK_CONTRACTS = MOCK_CONTRACTS.filter(c => c.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 400));
  },

  // --- Farming Log API ---
  getFarmingLogs: async (): Promise<FarmingActivity[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_FARMING_LOGS]), 500));
  },

  addFarmingLog: async (log: Omit<FarmingActivity, 'id'>): Promise<FarmingActivity> => {
    const newLog = { 
      ...log, 
      id: Math.random().toString(36).substr(2, 9),
      stage: log.stage || 'before_harvest'
    };
    MOCK_FARMING_LOGS.push(newLog);
    return new Promise((resolve) => setTimeout(() => resolve(newLog), 500));
  },

  updateFarmingLog: async (log: FarmingActivity): Promise<FarmingActivity> => {
    const index = MOCK_FARMING_LOGS.findIndex(item => item.id === log.id);
    if (index !== -1) {
      MOCK_FARMING_LOGS[index] = log;
      return new Promise((resolve) => setTimeout(() => resolve(log), 500));
    }
    throw new Error("Log not found");
  },

  deleteFarmingLog: async (id: string): Promise<void> => {
    MOCK_FARMING_LOGS = MOCK_FARMING_LOGS.filter(l => l.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  },

  // --- Employee API ---
  getEmployees: async (): Promise<Employee[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_EMPLOYEES]), 500));
  },

  addEmployee: async (emp: Omit<Employee, 'id'>): Promise<Employee> => {
    const newEmp = { 
      ...emp, 
      id: Math.random().toString(36).substr(2, 9),
      password: emp.password || '123' 
    };
    MOCK_EMPLOYEES.push(newEmp);
    return new Promise((resolve) => setTimeout(() => resolve(newEmp), 500));
  },

  updateEmployee: async (emp: Employee): Promise<Employee> => {
    const index = MOCK_EMPLOYEES.findIndex(item => item.id === emp.id);
    if (index !== -1) {
      MOCK_EMPLOYEES[index] = emp;
      return new Promise((resolve) => setTimeout(() => resolve(emp), 500));
    }
    throw new Error("Employee not found");
  },

  deleteEmployee: async (id: string): Promise<void> => {
    MOCK_EMPLOYEES = MOCK_EMPLOYEES.filter(e => e.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 500));
  },

  // --- DOCUMENT LIBRARY API (NEW) ---
  getFolders: async (): Promise<Folder[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_FOLDERS]), 300));
  },
  
  addFolder: async (name: string, parentId: string | null): Promise<Folder> => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      parentId,
      createdAt: new Date().toISOString()
    };
    MOCK_FOLDERS.push(newFolder);
    return new Promise((resolve) => setTimeout(() => resolve(newFolder), 300));
  },

  deleteFolder: async (id: string): Promise<void> => {
    MOCK_FOLDERS = MOCK_FOLDERS.filter(f => f.id !== id);
    // Xóa cả file trong folder đó
    MOCK_FILES = MOCK_FILES.filter(f => f.folderId !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 300));
  },

  getFiles: async (): Promise<SystemFile[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_FILES]), 300));
  },

  uploadFile: async (file: File, folderId: string | null): Promise<SystemFile> => {
    const newFile: SystemFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      folderId,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.name.split('.').pop() || 'unknown',
      url: URL.createObjectURL(file),
      file: file
    };
    MOCK_FILES.push(newFile);
    return new Promise((resolve) => setTimeout(() => resolve(newFile), 500));
  },

  deleteFile: async (id: string): Promise<void> => {
    MOCK_FILES = MOCK_FILES.filter(f => f.id !== id);
    return new Promise((resolve) => setTimeout(() => resolve(), 300));
  },

  // --- BACKUP & RESTORE ---
  backupData: async (): Promise<BackupData> => {
    // Collect all current mock data
    return new Promise((resolve) => setTimeout(() => resolve({
      version: '1.0',
      timestamp: new Date().toISOString(),
      areas: MOCK_AREAS,
      purchases: MOCK_PURCHASES,
      surveys: MOCK_SURVEYS,
      contracts: MOCK_CONTRACTS,
      farmingLogs: MOCK_FARMING_LOGS,
      employees: MOCK_EMPLOYEES,
      linkageStatuses: MOCK_LINKAGE_STATUSES,
      folders: MOCK_FOLDERS,
      files: MOCK_FILES,
      systemSettings: MOCK_SYSTEM_SETTINGS
    }), 1000));
  },

  restoreData: async (data: BackupData): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => {
      // Validate structure basic
      if (!data.areas || !data.systemSettings) throw new Error("File backup không hợp lệ");

      MOCK_AREAS = data.areas;
      MOCK_PURCHASES = data.purchases;
      MOCK_SURVEYS = data.surveys;
      MOCK_CONTRACTS = data.contracts;
      MOCK_FARMING_LOGS = data.farmingLogs;
      MOCK_EMPLOYEES = data.employees;
      MOCK_LINKAGE_STATUSES = data.linkageStatuses;
      MOCK_FOLDERS = data.folders;
      MOCK_FILES = data.files;
      MOCK_SYSTEM_SETTINGS = data.systemSettings;
      
      resolve();
    }, 1500));
  }
};