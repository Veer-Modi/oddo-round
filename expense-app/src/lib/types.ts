export type UserRole = "admin" | "manager" | "employee";

export type ExpenseStatus = "pending" | "approved" | "rejected" | "in_progress";

export type ExpenseCategory =
  | "Travel"
  | "Food"
  | "Accommodation"
  | "Transportation"
  | "Office Supplies"
  | "Entertainment"
  | "Other";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId: string;
  managerId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  currency: string;
  countryCode: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  currency: string;
  amountInCompanyCurrency?: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  currentApproverId?: string;
  approvalHistory: ApprovalHistoryItem[];
  createdAt: string;
}

export interface ApprovalHistoryItem {
  approverId: string;
  approverName: string;
  action: "approved" | "rejected" | "pending";
  comment?: string;
  timestamp: string;
}

export interface ApprovalRule {
  id: string;
  companyId: string;
  name: string;
  type?: "sequential" | "percentage" | "specific" | "hybrid";
  approvers: ApproverConfig[];
  percentageRequired?: number;
  specificApproverId?: string;
  isManagerApprover: boolean;
  conditions: ApprovalCondition[];
  levels: ApprovalLevel[];
  createdAt: string;
}

export interface ApprovalCondition {
  field: "amount" | "category";
  operator: ">" | "<" | ">=" | "<=" | "=";
  value: string;
}

export interface ApprovalLevel {
  level: number;
  approvers: ApproverConfig[];
}

export interface ApproverConfig {
  userId: string;
  userName: string;
  sequence?: number;
}

export interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (
    email: string,
    password: string,
    name: string,
    companyName: string,
    countryCode: string
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
