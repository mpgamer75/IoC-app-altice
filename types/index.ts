// types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface IoC {
  id: string;
  type: 'ip' | 'domain' | 'url' | 'hash';
  value: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  reporter: string;
  reporterEmail: string;
  dateReported: Date;
  status: 'pending' | 'approved' | 'rejected';
  tags: string[];
  tlp: 'white' | 'green' | 'amber' | 'red'; // Traffic Light Protocol
  confidence: number; // 0-100
  lastSeen?: Date;
  firstSeen?: Date;
  notes?: string;
  references?: string[];
}

export interface DashboardStats {
  totalIoCs: number;
  iocsByType: Record<string, number>;
  iocsBySeverity: Record<string, number>;
  iocsByStatus: Record<string, number>;
  recentActivity: IoC[];
  topReporters: Array<{ name: string; count: number }>;
  weeklyTrend: Array<{ date: string; count: number }>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface ExportData {
  format: 'txt' | 'json' | 'csv';
  iocs: IoC[];
  timestamp: Date;
}