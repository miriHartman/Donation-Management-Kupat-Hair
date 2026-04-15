/**
 * 📋 Centralized Type Definitions
 * All TypeScript interfaces and types for the application
 */

// ==================== BRANCH TYPES ====================
export interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  is_active?: number | boolean;
  color?: string;
}

export interface CreateBranchData {
  name: string;
  address: string;
  phone: string;
  is_active: number;
}

export interface BranchDashboardProps {
  onLogout: () => void;
  onBack: () => void;
  branchName: string;
  branchId: number;
}

// ==================== DONATION TYPES ====================
export interface Donation {
  id: number;
  userId: number | string;
  amount: number;
  date: string;
  branchId: number;
  methodId: number;
  targetId: number;
  isRecurring: boolean;
  installments?: number;
}

export interface DonationData {
  id: number;
  date: string;
  amount: number;
  targetId: number;
  methodId: number;
  isRecurring: boolean;
  workerName: string;
  installments?: number;
  fundNumber?: string | null;
  targetOtherNote?: string | null;
  currency: string;
  notes?: string;
  branchId?: number;
  userId?: number | string;
}

export interface DonationPayload {
  userId: number | string | undefined;
  fundNumber: string | undefined;
  targetOtherNote: string | undefined;
  is_recurring: 0 | 1;
  months_count: number;
  targetId: number;
  methodId: number;
  amount?: number;
  date?: string;
  branchId?: number;
  currency?: string;
  workerName?: string;
  notes?: string;
  isRecurring?: boolean;
  installments?: number;
}

export interface Transaction {
  id: number;
  userId: string;
  amount: number;
  date: string;
  branch: string;
  branchId?: number;
  methodId: number;
  targetId: number;
  isRecurring: boolean;
  installments?: number;
  workerName?: string;
  currency?: string;
}

export interface BranchSummary {
  name: string;
  amount: number;
  count: number;
}

export interface BranchSummaryWithPercentage extends BranchSummary {
  percentage: number;
}

// ==================== DASHBOARD TYPES ====================
export interface DashboardStats {
  total: number;
  donations: number;
  branches: BranchInfo[];
}

export interface BranchInfo {
  id: number;
  name: string;
  amount: number;
}

export interface TodayStats {
  count: number;
  totalAmount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DashboardData {
  transactions: Transaction[];
  stats: Array<{ title: string; value: string | number; change?: string; isPositive?: boolean }>;
  todaySummary: DashboardStats;
  branchSummary: BranchSummaryWithPercentage[];
  branches: { id: number; name: string }[];
  pagination: Pagination;
}

// ==================== BILL TYPES ====================
export interface DailySummary {
  id?: number;
  date: string;
  total_amount: number;
  donation_count: number;
  bills_50: number;
  bills_100: number;
  bills_200: number;
}

export interface BillResponse {
  date: string;
  total_amount: number;
  donation_count: number;
  bills_50: number;
  bills_100: number;
  bills_200: number;
}

// ==================== AUTH TYPES ====================
export interface AuthTokenResponse {
  token: string;
  userId?: string;
  user?: {
    id: string;
    username: string;
    role?: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// ==================== EXCHANGE RATE TYPES ====================
export interface ExchangeRate {
  currency: string;
  rate: number;
  timestamp: string;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiError {
  response?: {
    status: number;
    data?: {
      message: string;
      error?: string;
    };
  };
  message: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  error?: string;
}

// ==================== FILTER/SEARCH TYPES ====================
export interface DashboardFilters {
  branch?: number;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

// ==================== UI COMPONENT TYPES ====================
export interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Branch>) => void;
  editingBranch?: Branch;
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

// ==================== FORM TYPES ====================
export interface FormFieldValue {
  value: string | number | boolean;
  error?: string;
}

// ==================== DONATION FORM TYPES ====================
export interface DonationFormData {
  amount: number;
  methodId: number;
  targetId: number;
  fundNumber?: number;
  targetOtherNote?: string;
  isRecurring: boolean;
  installments?: number;
  date: string;
}
