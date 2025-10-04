import type { User, Company, Expense, ApprovalRule } from "./types";

const STORAGE_KEYS = {
  USERS: "expense_app_users",
  COMPANIES: "expense_app_companies",
  EXPENSES: "expense_app_expenses",
  APPROVAL_RULES: "expense_app_approval_rules",
  CURRENT_USER: "expense_app_current_user",
};

// Initialize with dummy data
export function initializeDatabase() {
  if (typeof window === "undefined") return;

  // Check if already initialized
  if (localStorage.getItem(STORAGE_KEYS.USERS)) return;

  // Create dummy company
  const dummyCompany: Company = {
    id: "company-1",
    name: "Acme Corporation",
    currency: "USD",
    countryCode: "US",
    createdAt: new Date().toISOString(),
  };

  // Create dummy users
  const dummyUsers: User[] = [
    {
      id: "user-1",
      email: "admin@acme.com",
      password: "admin123",
      name: "John Admin",
      role: "admin",
      companyId: "company-1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-2",
      email: "manager@acme.com",
      password: "manager123",
      name: "Sarah Manager",
      role: "manager",
      companyId: "company-1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-3",
      email: "employee@acme.com",
      password: "employee123",
      name: "Mike Employee",
      role: "employee",
      companyId: "company-1",
      managerId: "user-2",
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-4",
      email: "employee2@acme.com",
      password: "employee123",
      name: "Lisa Worker",
      role: "employee",
      companyId: "company-1",
      managerId: "user-2",
      createdAt: new Date().toISOString(),
    },
  ];

  // Create dummy expenses
  const dummyExpenses: Expense[] = [
    {
      id: "expense-1",
      employeeId: "user-3",
      employeeName: "Mike Employee",
      amount: 150.5,
      currency: "USD",
      amountInCompanyCurrency: 150.5,
      category: "Food",
      description: "Client dinner at Italian restaurant",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
      currentApproverId: "user-2",
      approvalHistory: [
        {
          approverId: "user-2",
          approverName: "Sarah Manager",
          action: "pending",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "expense-2",
      employeeId: "user-3",
      employeeName: "Mike Employee",
      amount: 85.0,
      currency: "EUR",
      amountInCompanyCurrency: 92.5,
      category: "Transportation",
      description: "Taxi to airport",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "approved",
      approvalHistory: [
        {
          approverId: "user-2",
          approverName: "Sarah Manager",
          action: "approved",
          comment: "Approved for business travel",
          timestamp: new Date(
            Date.now() - 4 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "expense-3",
      employeeId: "user-4",
      employeeName: "Lisa Worker",
      amount: 1200.0,
      currency: "USD",
      amountInCompanyCurrency: 1200.0,
      category: "Travel",
      description: "Flight tickets for conference",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
      currentApproverId: "user-2",
      approvalHistory: [
        {
          approverId: "user-2",
          approverName: "Sarah Manager",
          action: "pending",
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "expense-4",
      employeeId: "user-4",
      employeeName: "Lisa Worker",
      amount: 45.0,
      currency: "USD",
      amountInCompanyCurrency: 45.0,
      category: "Office Supplies",
      description: "Notebooks and pens",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "rejected",
      approvalHistory: [
        {
          approverId: "user-2",
          approverName: "Sarah Manager",
          action: "rejected",
          comment: "Please use company supplies",
          timestamp: new Date(
            Date.now() - 6 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Create dummy approval rule
  const dummyApprovalRules: ApprovalRule[] = [
    {
      id: "rule-1",
      companyId: "company-1",
      name: "Default Approval Flow",
      type: "sequential",
      approvers: [
        { userId: "user-2", userName: "Sarah Manager", sequence: 1 },
        { userId: "user-1", userName: "John Admin", sequence: 2 },
      ],
      isManagerApprover: true,
      conditions: [],
      levels: [],
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify([dummyCompany]));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dummyUsers));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(dummyExpenses));
  localStorage.setItem(
    STORAGE_KEYS.APPROVAL_RULES,
    JSON.stringify(dummyApprovalRules)
  );
}

// Database operations
export const db = {
  users: {
    getAll: (): User[] => {
      if (typeof window === "undefined") return [];
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    },
    getById: (id: string): User | null => {
      const users = db.users.getAll();
      return users.find((u) => u.id === id) || null;
    },
    getByEmail: (email: string): User | null => {
      const users = db.users.getAll();
      return users.find((u) => u.email === email) || null;
    },
    getByCompany: (companyId: string): User[] => {
      const users = db.users.getAll();
      return users.filter((u) => u.companyId === companyId);
    },
    getByManager: (managerId: string): User[] => {
      const users = db.users.getAll();
      return users.filter((u) => u.managerId === managerId);
    },
    create: (user: User): void => {
      const users = db.users.getAll();
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },
    update: (id: string, updates: Partial<User>): void => {
      const users = db.users.getAll();
      const index = users.findIndex((u) => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    },
    delete: (id: string): void => {
      const users = db.users.getAll();
      const filtered = users.filter((u) => u.id !== id);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    },
  },
  companies: {
    getAll: (): Company[] => {
      if (typeof window === "undefined") return [];
      const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      return data ? JSON.parse(data) : [];
    },
    getById: (id: string): Company | null => {
      const companies = db.companies.getAll();
      return companies.find((c) => c.id === id) || null;
    },
    create: (company: Company): void => {
      const companies = db.companies.getAll();
      companies.push(company);
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
    },
    update: (id: string, updates: Partial<Company>): void => {
      const companies = db.companies.getAll();
      const index = companies.findIndex((c) => c.id === id);
      if (index !== -1) {
        companies[index] = { ...companies[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
      }
    },
  },
  expenses: {
    getAll: (): Expense[] => {
      if (typeof window === "undefined") return [];
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    },
    getById: (id: string): Expense | null => {
      const expenses = db.expenses.getAll();
      return expenses.find((e) => e.id === id) || null;
    },
    getByEmployee: (employeeId: string): Expense[] => {
      const expenses = db.expenses.getAll();
      return expenses.filter((e) => e.employeeId === employeeId);
    },
    getByApprover: (approverId: string): Expense[] => {
      const expenses = db.expenses.getAll();
      return expenses.filter(
        (e) => e.currentApproverId === approverId && e.status === "pending"
      );
    },
    getPendingForApprover: (approverId: string): Expense[] => {
      return db.expenses.getByApprover(approverId);
    },
    getByCompany: (companyId: string): Expense[] => {
      const expenses = db.expenses.getAll();
      const users = db.users.getByCompany(companyId);
      const userIds = users.map((u) => u.id);
      return expenses.filter((e) => userIds.includes(e.employeeId));
    },
    create: (expense: Expense): void => {
      const expenses = db.expenses.getAll();
      expenses.push(expense);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    },
    update: (
      idOrExpense: string | Expense,
      updates?: Partial<Expense>
    ): void => {
      const expenses = db.expenses.getAll();

      if (typeof idOrExpense === "string") {
        // Old signature: update(id, updates)
        const index = expenses.findIndex((e) => e.id === idOrExpense);
        if (index !== -1 && updates) {
          expenses[index] = { ...expenses[index], ...updates };
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        }
      } else {
        // New signature: update(expense)
        const index = expenses.findIndex((e) => e.id === idOrExpense.id);
        if (index !== -1) {
          expenses[index] = idOrExpense;
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        }
      }
    },
    delete: (id: string): void => {
      const expenses = db.expenses.getAll();
      const filtered = expenses.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
    },
  },
  approvalRules: {
    getAll: (): ApprovalRule[] => {
      if (typeof window === "undefined") return [];
      const data = localStorage.getItem(STORAGE_KEYS.APPROVAL_RULES);
      return data ? JSON.parse(data) : [];
    },
    getByCompany: (companyId: string): ApprovalRule[] => {
      const rules = db.approvalRules.getAll();
      return rules.filter((r) => r.companyId === companyId);
    },
    create: (rule: ApprovalRule): void => {
      const rules = db.approvalRules.getAll();
      rules.push(rule);
      localStorage.setItem(STORAGE_KEYS.APPROVAL_RULES, JSON.stringify(rules));
    },
    update: (rule: ApprovalRule): void => {
      const rules = db.approvalRules.getAll();
      const index = rules.findIndex((r) => r.id === rule.id);
      if (index !== -1) {
        rules[index] = rule;
        localStorage.setItem(
          STORAGE_KEYS.APPROVAL_RULES,
          JSON.stringify(rules)
        );
      }
    },
    delete: (id: string): void => {
      const rules = db.approvalRules.getAll();
      const filtered = rules.filter((r) => r.id !== id);
      localStorage.setItem(
        STORAGE_KEYS.APPROVAL_RULES,
        JSON.stringify(filtered)
      );
    },
  },
  auth: {
    getCurrentUser: (): User | null => {
      if (typeof window === "undefined") return null;
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    },
    setCurrentUser: (user: User | null): void => {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    },
  },
};
