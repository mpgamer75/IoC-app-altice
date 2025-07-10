// lib/ioc.ts
import { IoC, DashboardStats, ExportData } from '@/types';

// Mock data pour les IoCs
const MOCK_IOCS: IoC[] = [
  {
    id: '1',
    type: 'ip',
    value: '192.168.1.100',
    description: 'Suspicious IP detected in network traffic',
    severity: 'high',
    source: 'Network Monitoring',
    reporter: 'John Doe',
    reporterEmail: 'john.doe@company.com',
    dateReported: new Date('2024-07-01'),
    status: 'approved',
    tags: ['malware', 'botnet'],
    tlp: 'amber',
    confidence: 85,
    firstSeen: new Date('2024-06-30'),
    lastSeen: new Date('2024-07-01'),
    notes: 'Detected multiple connections to known C&C servers',
    references: ['https://threatintel.com/report/123']
  },
  {
    id: '2',
    type: 'domain',
    value: 'malicious-site.com',
    description: 'Phishing domain targeting corporate users',
    severity: 'critical',
    source: 'Email Security',
    reporter: 'Jane Smith',
    reporterEmail: 'jane.smith@company.com',
    dateReported: new Date('2024-07-02'),
    status: 'approved',
    tags: ['phishing', 'credential-theft'],
    tlp: 'red',
    confidence: 95,
    firstSeen: new Date('2024-07-01'),
    lastSeen: new Date('2024-07-02'),
    notes: 'Used in targeted phishing campaign',
    references: ['https://phishtank.com/phish_detail.php?phish_id=123']
  },
  {
    id: '3',
    type: 'hash',
    value: 'a1b2c3d4e5f6789012345678901234567890abcd',
    description: 'Malware hash detected',
    severity: 'medium',
    source: 'Endpoint Detection',
    reporter: 'Security Team',
    reporterEmail: 'security@company.com',
    dateReported: new Date('2024-07-03'),
    status: 'pending',
    tags: ['malware', 'trojan'],
    tlp: 'green',
    confidence: 70,
    notes: 'Needs verification'
  }
];

export class IoCService {
  private static iocs: IoC[] = [...MOCK_IOCS];
  
  static async getAllIoCs(): Promise<IoC[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.iocs];
  }
  
  static async getIoCById(id: string): Promise<IoC | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.iocs.find(ioc => ioc.id === id) || null;
  }
  
  static async createIoC(iocData: Omit<IoC, 'id' | 'dateReported'>): Promise<IoC> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newIoC: IoC = {
      ...iocData,
      id: Date.now().toString(),
      dateReported: new Date(),
    };
    
    this.iocs.push(newIoC);
    return newIoC;
  }
  
  static async updateIoC(id: string, updates: Partial<IoC>): Promise<IoC | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.iocs.findIndex(ioc => ioc.id === id);
    if (index === -1) return null;
    
    this.iocs[index] = { ...this.iocs[index], ...updates };
    return this.iocs[index];
  }
  
  static async deleteIoC(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.iocs.findIndex(ioc => ioc.id === id);
    if (index === -1) return false;
    
    this.iocs.splice(index, 1);
    return true;
  }
  
  static async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const iocs = this.iocs;
    
    // Calculate stats
    const iocsByType = iocs.reduce((acc, ioc) => {
      acc[ioc.type] = (acc[ioc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const iocsBySeverity = iocs.reduce((acc, ioc) => {
      acc[ioc.severity] = (acc[ioc.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const iocsByStatus = iocs.reduce((acc, ioc) => {
      acc[ioc.status] = (acc[ioc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topReporters = Object.entries(
      iocs.reduce((acc, ioc) => {
        acc[ioc.reporter] = (acc[ioc.reporter] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
    // Generate weekly trend (last 7 days)
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const count = iocs.filter(ioc => {
        const iocDate = ioc.dateReported.toISOString().split('T')[0];
        return iocDate === dateStr;
      }).length;
      
      return {
        date: dateStr,
        count
      };
    });
    
    return {
      totalIoCs: iocs.length,
      iocsByType,
      iocsBySeverity,
      iocsByStatus,
      recentActivity: iocs
        .sort((a, b) => b.dateReported.getTime() - a.dateReported.getTime())
        .slice(0, 10),
      topReporters,
      weeklyTrend
    };
  }
  
  static async exportIoCs(format: 'txt' | 'json' | 'csv'): Promise<ExportData> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      format,
      iocs: this.iocs,
      timestamp: new Date()
    };
  }
  
  static generateExportContent(exportData: ExportData): string {
    switch (exportData.format) {
      case 'txt':
        return this.generateTxtExport(exportData.iocs);
      case 'json':
        return this.generateJsonExport(exportData.iocs);
      case 'csv':
        return this.generateCsvExport(exportData.iocs);
      default:
        throw new Error('Unsupported export format');
    }
  }
  
  private static generateTxtExport(iocs: IoC[]): string {
    let content = `# FortiGate IoC Export\n`;
    content += `# Generated: ${new Date().toISOString()}\n`;
    content += `# Total IoCs: ${iocs.length}\n\n`;
    
    iocs.forEach(ioc => {
      content += `${ioc.value}\n`;
    });
    
    return content;
  }
  
  private static generateJsonExport(iocs: IoC[]): string {
    const exportObj = {
      metadata: {
        generated: new Date().toISOString(),
        total: iocs.length,
        format: 'json'
      },
      iocs: iocs.map(ioc => ({
        ...ioc,
        dateReported: ioc.dateReported.toISOString(),
        firstSeen: ioc.firstSeen?.toISOString(),
        lastSeen: ioc.lastSeen?.toISOString()
      }))
    };
    
    return JSON.stringify(exportObj, null, 2);
  }
  
  private static generateCsvExport(iocs: IoC[]): string {
    const headers = [
      'id', 'type', 'value', 'description', 'severity', 'source',
      'reporter', 'reporterEmail', 'dateReported', 'status',
      'tags', 'tlp', 'confidence', 'notes'
    ];
    
    let content = headers.join(',') + '\n';
    
    iocs.forEach(ioc => {
      const row = [
        ioc.id,
        ioc.type,
        `"${ioc.value}"`,
        `"${ioc.description}"`,
        ioc.severity,
        `"${ioc.source}"`,
        `"${ioc.reporter}"`,
        ioc.reporterEmail,
        ioc.dateReported.toISOString(),
        ioc.status,
        `"${ioc.tags.join(';')}"`,
        ioc.tlp,
        ioc.confidence,
        `"${ioc.notes || ''}"`
      ];
      content += row.join(',') + '\n';
    });
    
    return content;
  }
}