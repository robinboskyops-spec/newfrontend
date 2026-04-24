/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, AttendanceRecord, Role, AppNotification } from './types';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, onSnapshot, setDoc, doc, updateDoc, deleteDoc, 
  query, orderBy, where, Timestamp, addDoc 
} from 'firebase/firestore';
import { 
  Users, DollarSign, Bell, LogOut, PieChart, ShieldCheck, 
  CheckCircle2, X, AlertCircle
} from 'lucide-react';

// Reorganized Components
import { Atmosphere, SurfaceCard } from './components/UIBase';
import { LoginScreen } from './components/LoginScreen';
import { AttendanceModule } from './components/AttendanceModule';
import { AdminModule } from './components/AdminModule';
import { NotificationCenter } from './components/NotificationCenter';
import { BiometricOverlay } from './components/ScannerOverlays';

// Services & Utils
import { handleFirestoreError } from './services/dbErrorHandler';
import { getGranularPayroll } from './services/payrollService';
import { 
  playClockInBeep, playClockOutBeep, playIdentityVerifiedBeep, 
  playSuccessBeep 
} from './lib/audio';
import { 
  INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_NOTIFICATIONS, 
  MOCK_ADMIN, MOCK_MANAGER 
} from './lib/constants';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('attendance');
  const [activeScanner, setActiveScanner] = useState<'FACE' | null>(null);
  const [scannerTarget, setScannerTarget] = useState<((data: string, matchedUser?: User) => void) | null>(null);
  const [addEmployeeData, setAddEmployeeData] = useState<{ faceEnrolled?: boolean, faceData?: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Auth & Sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) setUser(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !auth.currentUser) {
      if (!user) {
        setEmployees([]);
        setAttendance([]);
        setNotifications([]);
      }
      return;
    }

    const handleError = (collectionName: string) => (err: any) => {
      if (err.code === 'permission-denied') {
        console.warn(`Firestore: Access denied for ${collectionName}.`);
      } else {
        console.error(`Firestore error:`, err);
      }
    };

    let empsQuery = query(collection(db, 'users'));
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER' && auth.currentUser?.email !== 'staff@gmail.com') {
      empsQuery = query(collection(db, 'users'), where('id', '==', user.id));
    }

    const unsubEmployees = onSnapshot(empsQuery, (snapshot) => {
      const emps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      setEmployees(emps);
    });

    let attQuery = query(collection(db, 'attendance'), orderBy('clockIn', 'desc'));
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER' && auth.currentUser?.email !== 'staff@gmail.com') {
      attQuery = query(collection(db, 'attendance'), where('userId', '==', user.id), orderBy('clockIn', 'desc'));
    }

    const unsubAttendance = onSnapshot(attQuery, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id, clockIn: data.clockIn?.toDate(), clockOut: data.clockOut?.toDate() } as AttendanceRecord;
      }));
    });

    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AppNotification)));
    });

    return () => { unsubEmployees(); unsubAttendance(); unsubNotifs(); };
  }, [user]);

  // UI Lifecycle
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role: Role, backendUser?: User) => {
    if (backendUser) setUser(backendUser);
    else if (role === 'ADMIN') setUser(MOCK_ADMIN);
    else if (role === 'MANAGER') setUser(MOCK_MANAGER);
    setActiveTab(role === 'EMPLOYEE' ? 'attendance' : 'admin');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsLoaded(false);
    setTimeout(() => setIsLoaded(true), 500);
  };

  const handleInitializeDatasets = async () => {
     try {
       setSuccessMessage("Initializing global datasets...");
       const usersToSeed = [
         { id: 'adm_1', name: 'Robin Bosky', role: 'ADMIN', position: 'Factory Owner', department: 'Management', email: 'robinbosky.ops@gmail.com', shiftTiming: '09:00 - 18:00', faceEnrolled: false },
         { id: 'mgr_1', name: 'Sarah Connor', role: 'MANAGER', position: 'Site Manager', department: 'Operations', email: 'manager@gmail.com', shiftTiming: '08:00 - 16:00', faceEnrolled: false },
         { id: 'emp_1', name: 'John Doe', role: 'EMPLOYEE', position: 'Quality Specialist', department: 'Textiles', email: 'staff@gmail.com', shiftTiming: '09:00 - 18:00', faceEnrolled: false }
       ];
       for (const u of usersToSeed) await setDoc(doc(db, 'users', u.id), u);
       await addDoc(collection(db, 'notifications'), { title: 'Dataset Initialized', message: 'Master records provisioned.', time: 'Just now', type: 'info', read: false, createdAt: Timestamp.now() });
       setSuccessMessage("Seeding complete.");
       return true;
     } catch (err: any) {
       setErrorMessage("Seeding failed: " + err.message);
       return false;
     }
  };

  const handleMarkAttendance = async (employee: User | null, isFailure: boolean = false) => {
    if (isFailure || !employee) {
      setErrorMessage("Identity Mismatch Detected.");
      return;
    }
    const now = new Date();
    const activeRecord = attendance.find(r => r.userId === employee.id && !r.clockOut);
    try {
      if (activeRecord) {
        await updateDoc(doc(db, 'attendance', activeRecord.id), { clockOut: Timestamp.fromDate(now), synced: true });
        setSuccessMessage(`Clock-out recorded for ${employee.name}`);
        playClockOutBeep();
      } else {
        const newRef = doc(collection(db, 'attendance'));
        await setDoc(newRef, { id: newRef.id, userId: employee.id, userName: employee.name, clockIn: Timestamp.fromDate(now), status: 'PRESENT', synced: true, location: 'HQ Terminal' });
        setSuccessMessage(`Clock-in recorded for ${employee.name}`);
        playClockInBeep();
      }
    } catch (err) {
      setErrorMessage("Sync failed.");
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleExportCSV = (type: string) => {
    setSuccessMessage(`Generating ${type} report...`);
    setTimeout(() => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(type === 'PAYROLL' ? employees.map(e => ({ name: e.name, base: e.baseSalary })) : attendance);
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${type.toLowerCase()}_report.xlsx`);
      setSuccessMessage("Download complete.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1000);
  };

  if (!isLoaded) return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
      <Atmosphere />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-2 border-neon-primary border-t-transparent rounded-full mb-4" />
      <h1 className="font-display font-black tracking-widest text-gradient">ROBINBOSKY</h1>
    </div>
  );

  if (!user) return <LoginScreen onLogin={handleLogin} onFaceAuth={() => setActiveScanner('FACE')} onInitializeDatasets={handleInitializeDatasets} onError={setErrorMessage} />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative pb-24">
      <Atmosphere />
      
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-[10px] font-black uppercase text-neon-primary tracking-[0.4em]">Chronos OS v3</h2>
          <p className="text-xl font-display font-black uppercase tracking-tighter">Terminal: {activeTab.toUpperCase()}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsNotifOpen(true)} className="relative p-2 bg-white/5 rounded-full"><Bell size={20} /></button>
          <button onClick={handleLogout} className="p-2 bg-red-500/10 text-red-500 rounded-full"><LogOut size={20} /></button>
        </div>
      </div>

      <main className="relative z-10">
        {activeTab === 'attendance' && (
          <AttendanceModule 
            user={user} 
            employees={employees} 
            attendance={attendance} 
            onRequestBiometricAuth={(cb: any) => { setActiveScanner('FACE'); setScannerTarget(() => cb); }} 
            onMarkAttendance={handleMarkAttendance} 
          />
        )}
        {activeTab === 'admin' && (
          <AdminModule 
            employees={employees} 
            attendance={attendance} 
            onAddEmployee={(e: any) => setDoc(doc(db, 'users', e.id), e)}
            onUpdateEmployee={(e: any) => setDoc(doc(db, 'users', e.id), e)}
            onDeleteEmployee={(id: string) => deleteDoc(doc(db, 'users', id))}
            onExportCSV={handleExportCSV}
            onInitializeData={handleInitializeDatasets}
            onScanRequest={(s: any) => setActiveScanner(s)}
            scanData={addEmployeeData}
            onDirectScan={(e: any) => { setActiveScanner('FACE'); setScannerTarget(() => (d: any) => updateDoc(doc(db, 'users', e.id), { faceEnrolled: true, faceData: d })); }}
          />
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface-lowest/80 backdrop-blur-xl border-t border-white/5 flex justify-around p-4 z-50">
        <button onClick={() => setActiveTab('attendance')} className={`p-2 transition-colors ${activeTab === 'attendance' ? 'text-neon-primary' : 'text-white/20'}`}><PieChart /></button>
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <button onClick={() => setActiveTab('admin')} className={`p-2 transition-colors ${activeTab === 'admin' ? 'text-neon-primary' : 'text-white/20'}`}><Users /></button>
        )}
      </nav>

      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} notifications={notifications} onRead={(id: string) => updateDoc(doc(db, 'notifications', id), { read: true })} onAction={(id: string) => deleteDoc(doc(db, 'notifications', id))} />
      
      <BiometricOverlay 
        isActive={activeScanner === 'FACE'} 
        employees={employees} 
        onMatched={(img: string, match: any) => {
          if (scannerTarget) scannerTarget(img, match);
          else setAddEmployeeData({ faceEnrolled: true, faceData: img });
          setActiveScanner(null);
          setScannerTarget(null);
        }}
        onCancel={() => { setActiveScanner(null); setScannerTarget(null); }}
      />

      {/* Popups */}
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-24 left-6 right-6 z-50 p-4 bg-green-500 text-white rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 /> <span className="text-xs font-bold uppercase tracking-widest">{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-24 left-6 right-6 z-50 p-4 bg-red-500 text-white rounded-xl shadow-2xl flex items-center gap-3">
            <AlertCircle /> <span className="text-xs font-bold uppercase tracking-widest">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)}><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
