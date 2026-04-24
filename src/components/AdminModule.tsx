import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, DollarSign, FileText, Download, TrendingUp } from 'lucide-react';
import { SurfaceCard, StatItem } from './UIBase';
import { EmployeeManagement } from './EmployeeManagement';
import { User, AttendanceRecord, Role } from '../types';

import { getGranularPayroll } from '../services/payrollService';

export const AdminModule = ({ employees, attendance, onAddEmployee, onUpdateEmployee, onDeleteEmployee, userRole, onExportCSV, onScanRequest, scanData, onDirectScan, isOnline, isSyncing, onCancelForm, onInitializeData }: any) => {
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'PAYROLL' | 'REPORTS'>('EMPLOYEES');

  const totalEmployees = employees.length;
  const activeToday = attendance.filter((r: AttendanceRecord) => r.clockIn.toDateString() === new Date().toDateString()).length;
  const syncStatus = isSyncing ? 'Synchronizing Archive' : 'All Identity Nodes Secure';

  return (
    <div className="space-y-6 pb-24">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-8">
           <div className="space-y-1">
              <span className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-neon-primary-container leading-none">{syncStatus}</span>
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter leading-none mt-1">COMMAND TERMINAL</h2>
           </div>
        </div>

        <div className="flex bg-surface-low p-1 rounded-sharp border border-white/5 font-black">
          <button 
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] uppercase font-bold tracking-widest rounded-sharp transition-all ${activeTab === 'EMPLOYEES' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}
          >
            <Users size={12} /> Workforce
          </button>
          <button 
            onClick={() => setActiveTab('PAYROLL')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] uppercase font-bold tracking-widest rounded-sharp transition-all ${activeTab === 'PAYROLL' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}
          >
            <DollarSign size={12} /> Ledger
          </button>
          <button 
            onClick={() => setActiveTab('REPORTS')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] uppercase font-bold tracking-widest rounded-sharp transition-all ${activeTab === 'REPORTS' ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}
          >
            <FileText size={12} /> Intelligence
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'EMPLOYEES' && (
          <motion.div 
            key="employees"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="px-6 mb-8 grid grid-cols-2 gap-4">
               <StatItem label="Active Identity Nodes" value={totalEmployees} trend="+3.2%" />
               <StatItem label="Current Operations" value={activeToday} trend="+1.5%" />
            </div>
            <EmployeeManagement 
              employees={employees} 
              attendance={attendance}
              onAdd={onAddEmployee} 
              onUpdate={onUpdateEmployee}
              onDelete={onDeleteEmployee}
              showSalary={userRole === 'ADMIN'}
              onScanRequest={onScanRequest}
              scanData={scanData}
              onDirectScan={onDirectScan}
              onCancelForm={onCancelForm}
              onInitializeData={onInitializeData}
            />
          </motion.div>
        )}

        {activeTab === 'PAYROLL' && (
          <motion.div 
            key="payroll"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PayrollModule employees={employees} attendance={attendance} onExport={onExportCSV} />
          </motion.div>
        )}

        {activeTab === 'REPORTS' && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
             <div className="px-6 space-y-6">
                <SurfaceCard depth="low">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="p-2 bg-neon-primary-container/20 border border-neon-primary-container/40 rounded-lg">
                         <TrendingUp size={18} className="text-neon-primary-container" />
                      </div>
                      <h4 className="text-[10px] font-display font-black uppercase tracking-widest">Optimization Protocols</h4>
                   </div>
                   <div className="space-y-4">
                      <button onClick={() => onExportCSV('ATTENDANCE')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
                         <div className="text-left">
                            <p className="text-xs font-bold font-display uppercase tracking-widest mb-1 group-hover:text-neon-primary-container transition-colors">Clock Archive EXCEL</p>
                            <p className="text-[9px] text-white/40 uppercase font-bold">Multisheet Identity Audit (Current Month)</p>
                         </div>
                         <Download size={16} className="text-white/20 group-hover:text-neon-primary-container transition-colors" />
                      </button>
                   </div>
                </SurfaceCard>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const PayrollModule = ({ employees, attendance, onExport }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
     <div className="px-6 space-y-6">
        <SurfaceCard depth="low" className="border-l-4 border-neon-primary-container">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-display font-black uppercase tracking-widest text-[#0070FF]/60 mb-2 font-black">Financial Integrity Protocol</p>
               <h4 className="text-lg font-display font-black uppercase tracking-tighter leading-tight">Ledger Insights Hub</h4>
             </div>
             <button onClick={() => onExport('PAYROLL')} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
               <Download size={16} className="text-neon-primary-container" />
             </button>
           </div>
        </SurfaceCard>

        <div className="space-y-3">
           {employees.map((emp: User) => {
              const payroll = getGranularPayroll(emp, attendance);
              const isExpanded = expandedId === emp.id;
              
              return (
                 <SurfaceCard 
                   key={emp.id} 
                   onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                   className={`transition-all duration-500 ${isExpanded ? 'ring-1 ring-neon-primary-container/30' : ''}`}
                 >
                    <div className="flex justify-between items-center mb-1">
                       <div>
                          <p className="text-xs font-bold leading-none mb-1 font-black">{emp.name}</p>
                          <p className="text-[9px] text-white/40 uppercase font-black">{emp.position}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-display font-black text-white">${Number(payroll.netPayout).toLocaleString()}</p>
                          <p className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Net Payout</p>
                       </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-white/5 space-y-3 overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[8px] text-white/40 uppercase font-black">Regular Pay ({payroll.daysPresent} days)</p>
                              <p className="text-xs font-bold text-white">${Math.round(Number(payroll.regularPay)).toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] text-white/40 uppercase font-black">Overtime ({payroll.totalOvertimeHours}h)</p>
                              <p className="text-xs font-bold text-green-500">+${Math.round(Number(payroll.grossSalary) - Number(payroll.regularPay)).toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] text-white/40 uppercase font-black">Penalties / Lates</p>
                              <p className="text-xs font-bold text-red-500">-${payroll.totalPenalties}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] text-white/40 uppercase font-black">Advance Deducted</p>
                              <p className="text-xs font-bold text-orange-500">-${payroll.advanceAmount}</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center mt-2">
                             <p className="text-[8px] text-neon-primary-container uppercase font-black tracking-widest leading-none">Gross Archive</p>
                             <p className="text-xs font-display font-black text-white/80">${Math.round(Number(payroll.grossSalary)).toLocaleString()}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!isExpanded && (
                      <p className="text-[8px] text-white/10 uppercase font-black tracking-[0.2em] text-center mt-3">Click to expand audit details</p>
                    )}
                 </SurfaceCard>
              );
           })}
        </div>
     </div>
  );
};
