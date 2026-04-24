import { User, AttendanceRecord } from '../types';

export const calculateDailyRate = (salary = 0) => salary / 25;
export const calculateHourlyRate = (salary = 0) => calculateDailyRate(salary) / 8;

export const getGranularPayroll = (emp: User, attendance: AttendanceRecord[]) => {
  const empLogs = attendance.filter((a: AttendanceRecord) => a.userId === emp.id);
  let totalWorkedHours = 0;
  let totalOvertimeHours = 0;
  let totalPenalties = 0;
  let daysPresent = 0;

  empLogs.forEach((log: AttendanceRecord) => {
    daysPresent++;
    totalPenalties += log.penalty || 0;

    if (log.clockIn && log.clockOut) {
      const diff = new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime();
      const hours = diff / (1000 * 60 * 60);
      totalWorkedHours += Math.min(hours, 8);
      totalOvertimeHours += Math.max(0, hours - 8);
    } else if (log.clockIn) {
      totalWorkedHours += 8;
    }
  });

  const dailyRate = calculateDailyRate(emp.baseSalary);
  const regularPay = daysPresent * dailyRate;
  
  const otMultiplier = emp.shiftType === 'NIGHT' ? 2.0 : emp.shiftType === 'SHIFT' ? 1.75 : 1.5;
  const overtimePay = totalOvertimeHours * calculateHourlyRate(emp.baseSalary) * otMultiplier;
  
  const advanceAmount = emp.advanceAmount || 0;
  const netPayout = regularPay + overtimePay - totalPenalties - advanceAmount;

  return {
    totalWorkedHours: totalWorkedHours.toFixed(1),
    totalOvertimeHours: totalOvertimeHours.toFixed(1),
    totalPenalties,
    grossSalary: regularPay + overtimePay,
    advanceAmount,
    netPayout: netPayout > 0 ? netPayout : 0,
    daysPresent,
    dailyRate,
    regularPay
  };
};
