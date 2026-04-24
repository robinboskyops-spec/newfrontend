import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Trash2, Camera, Scan, Users, Plus, X, Search } from 'lucide-react';
import { SurfaceCard } from './UIBase';
import { User, ShiftType } from '../types';

export const EmployeeManagement = ({ employees, attendance, onAdd, onUpdate, onDelete, showSalary, onScanRequest, scanData, onDirectScan, onCancelForm, onInitializeData }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    position: '', 
    department: '', 
    baseSalary: '', 
    shiftType: 'DAY' as ShiftType, 
    shiftTiming: '09:00 - 18:00',
    lunchTime: '12:30 - 13:30',
    shortBreak: '16:30 - 17:00',
    faceEnrolled: false,
    faceData: '',
    advanceAmount: ''
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (scanData && scanData.faceData && (isAdding || editingId)) {
      setFormData(prev => ({
        ...prev,
        faceEnrolled: true,
        faceData: scanData.faceData
      }));
    }
  }, [scanData, isAdding, editingId]);

  const startEditing = (emp: User) => {
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      position: emp.position || '',
      department: emp.department || '',
      baseSalary: emp.baseSalary?.toString() || '',
      shiftType: emp.shiftType || 'DAY',
      shiftTiming: emp.shiftTiming || '09:00 - 18:00',
      lunchTime: emp.lunchTime || '12:30 - 13:30',
      shortBreak: emp.shortBreak || '16:30 - 17:00',
      faceEnrolled: emp.faceEnrolled || false,
      faceData: emp.faceData || '',
      advanceAmount: emp.advanceAmount?.toString() || ''
    });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ 
      name: '', position: '', department: '', baseSalary: '', shiftType: 'DAY', shiftTiming: '09:00 - 18:00',
      lunchTime: '12:30 - 13:30', 
      shortBreak: '16:30 - 17:00',
      faceEnrolled: false, 
      faceData: '', advanceAmount: ''
    });
    if (onCancelForm) onCancelForm();
  };

  const getLastClockIn = (userId: string) => {
    const records = attendance?.filter((r: any) => r.userId === userId) || [];
    if (records.length === 0) return null;
    return records.sort((a: any, b: any) => b.clockIn.getTime() - a.clockIn.getTime())[0].clockIn;
  };

  const validateTiming = (timing: string) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d) - ([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(timing)) {
      return "Format must be HH:MM - HH:MM (e.g., 09:00 - 18:00)";
    }
    return null;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const error = validateTiming(formData.shiftTiming);
    if (error) {
      setValidationError(error);
      return;
    }

    if (!formData.faceEnrolled) {
      if (confirm(`Employee record requires a high-fidelity biometric scan. Initialize scanner?`)) {
        onScanRequest('FACE');
      }
      return;
    }

    if (editingId) {
      onUpdate({
        ...employees.find((e: any) => e.id === editingId),
        ...formData,
        baseSalary: parseInt(formData.baseSalary) || 0,
        advanceAmount: parseInt(formData.advanceAmount as string) || 0
      });
      setEditingId(null);
    } else {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        role: 'EMPLOYEE',
        baseSalary: parseInt(formData.baseSalary) || 0,
        advanceAmount: parseInt(formData.advanceAmount as string) || 0
      });
      setIsAdding(false);
    }
    
    setFormData({ 
      name: '', position: '', department: '', baseSalary: '', shiftType: 'DAY', shiftTiming: '09:00 - 18:00',
      lunchTime: '12:30 - 13:30', 
      shortBreak: '16:30 - 17:00',
      faceEnrolled: false, 
      faceData: '', advanceAmount: ''
    });
    setValidationError(null);
  };

  if (!isAdding && !editingId && employees.length === 0) {
    return (
      <div className="p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 group hover:border-neon-primary-container/40 transition-colors">
          <Users size={32} className="text-white/20 group-hover:text-neon-primary-container transition-colors" />
        </div>
        <div className="space-y-4 max-w-xs mx-auto">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Workforce Offline</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
            The cloud-synced workforce directory is currently unpopulated on this terminal.
          </p>
          <div className="pt-4 space-y-3">
             <button 
              onClick={onInitializeData}
              className="w-full py-4 bg-neon-primary-container text-white text-[10px] font-black uppercase tracking-widest rounded-sharp hover:scale-105 transition-transform shadow-2xl font-bold"
             >
              Initialize Global Dataset
             </button>
             <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-4 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-sharp hover:bg-white/10 transition-all underline underline-offset-4 font-bold"
             >
              Manually Register Identity
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-6">
        <h3 className="font-display font-black uppercase tracking-widest text-[#0070FF]/60 text-[10px]">Workforce Directory</h3>
        {!editingId && (
          <button 
            onClick={() => {
              if (!isAdding) cancelEdit();
              setIsAdding(!isAdding);
            }}
            className="px-4 py-2 bg-neon-primary-container text-white rounded-sharp text-[10px] font-bold uppercase tracking-widest"
          >
            {isAdding ? 'Cancel' : 'Add Employee'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-6 glass rounded-sharp space-y-4 border border-white/10 relative">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-bold text-neon-primary-container uppercase tracking-widest">
                  {editingId ? 'Edit Employee Details' : 'Register New Employee'}
                </h4>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="text-white/40 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Full Name" className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="Position" className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm outline-none" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Department" className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm outline-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required />
                <input placeholder="Salary" type="number" className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm outline-none" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-3 bg-neon-primary-container font-bold uppercase tracking-widest text-xs rounded-lg">
                  {editingId ? 'Update Identity' : 'Register Identity'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
          <input 
            type="text"
            placeholder="Search..."
            className="w-full py-3 pl-12 pr-4 bg-surface-low border border-white/5 rounded-sharp outline-none text-[10px] uppercase font-bold tracking-widest px-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 space-y-3">
        {employees
          .filter((emp: User) => {
            const search = searchTerm.toLowerCase();
            return emp.name.toLowerCase().includes(search) || emp.position?.toLowerCase().includes(search);
          })
          .map((emp: User) => {
            const lastClockIn = getLastClockIn(emp.id);
            return (
              <SurfaceCard key={emp.id} className="group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white leading-none">{emp.name}</p>
                      {showSalary && emp.baseSalary && (
                        <span className="text-[10px] bg-neon-primary-container/20 text-neon-primary-container px-2 py-0.5 rounded-full font-bold">
                          ${emp.baseSalary.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">{emp.position} • {emp.department}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onDirectScan(emp)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10"><Scan size={14} /></button>
                    <button onClick={() => startEditing(emp)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10"><Pencil size={14} /></button>
                    <button onClick={() => onDelete(emp.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20"><Trash2 size={14} /></button>
                  </div>
                </div>
              </SurfaceCard>
            );
          })}
      </div>
    </div>
  );
};
