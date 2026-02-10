/**
 * Frontend API models aligned with backend OpenAPI.
 */

export interface ApiResponse<T> {
  data: T;
  warning?: string;
}

/**
 * Simplified response for creation/action endpoints.
 * New backend returns {id, message, status/bonusEur} instead of full data.
 */
export interface ApiActionResponse {
  id?: string;
  message?: string;
  status?: string;
  bonusEur?: number;
  error?: string;
  warning?: string;
}

export type Role = 'CEO' | 'HR' | 'SALESMAN';

export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  username: string;
  role: Role;
  employeeId?: string | null;
}

export interface AuthLoginResponse {
  token: string;
  user: AuthUser;
}

export interface Salesman {
  _id?: string;
  employeeId: string;
  name: string;
  department: string;
  performanceYear: number;
  orangeHrmId?: string | null;
}

export interface SocialPerformanceRecord {
  _id?: string;
  salesmanEmployeeId: string;
  year: number;
  criterionKey: string;
  criterionName: string;
  targetValue: number;
  actualValue?: number; // Now optional on create
  weight: number;
  supervisorRating?: number;
  peerRating?: number;
  computedBonusEur?: number;
  remark?: string;
}

export interface SocialRecordsResponse {
  records: SocialPerformanceRecord[];
  socialTotalEur: number;
}

export interface OrderEvaluationRecord {
  _id?: string;
  salesmanEmployeeId: string;
  year: number;
  orderId: string;
  productName?: string;
  clientName?: string;
  clientRanking?: number;
  closingProbability?: number;
  itemsCount?: number;
  revenueEur?: number;
  computedBonusEur?: number;
  remark?: string;
}

export interface OrdersResponse {
  records: OrderEvaluationRecord[];
  ordersTotalEur: number;
}

export interface BonusRemark {
  byUsername: string;
  role: Role;
  text: string;
  createdAt: string;
}

export type BonusStatus =
  | 'DRAFT'
  | 'COMPUTED'
  | 'CEO_APPROVED'
  | 'HR_APPROVED'
  | 'STORED_IN_ORANGEHRM'
  | 'RELEASED_TO_SALESMAN'
  | 'SALESMAN_CONFIRMED';

export interface BonusComputation {
  _id?: string;
  salesmanEmployeeId: string;
  year: number;
  socialTotalEur: number;
  ordersTotalEur: number;
  totalBonusEur: number;
  status: BonusStatus;
  remarks?: BonusRemark[];
  details?: any;
  computedAt?: string;
  computedBy?: string;
}

export interface Qualification {
  _id?: string;
  salesmanEmployeeId: string;
  year: number;
  title: string;
  description?: string;
  createdBy?: string;
  storedInOrangeHrmAt?: string | null;
}

export interface BonusStatisticsItem {
  employeeId: string;
  totalBonusEur: number;
  socialTotalEur: number;
  ordersTotalEur: number;
}

export interface BonusStatistics {
  year: number;
  items: BonusStatisticsItem[];
}

export interface DependenciesHealth {
  orangehrm: { reachable: boolean };
  opencrx: { reachable: boolean };
  mongodb: { reachable: boolean };
  camunda: { reachable: boolean };
}
