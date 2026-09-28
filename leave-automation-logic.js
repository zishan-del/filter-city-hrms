const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dateKey(value) {
  const s = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '';
  const d = new Date(s + 'T00:00:00Z');
  return Number.isNaN(d.getTime()) ? '' : s;
}

function dateRange(startValue, endValue) {
  const start = dateKey(startValue);
  const end = dateKey(endValue);
  if (!start || !end) throw new Error('Start date and end date are required.');
  const startDate = new Date(start + 'T00:00:00Z');
  const endDate = new Date(end + 'T00:00:00Z');
  if (endDate < startDate) throw new Error('End date cannot be before start date.');
  const out = [];
  for (let t = startDate.getTime(); t <= endDate.getTime(); t += MS_PER_DAY) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

function calculateLeaveDays(startValue, endValue, holidayDates = [], weekendDays = [5, 6]) {
  const dates = dateRange(startValue, endValue);
  const holidaySet = new Set((holidayDates || []).map(dateKey).filter(Boolean));
  const weekendSet = new Set(weekendDays.map(Number));
  let holidayDays = 0;
  let weekendDaysCount = 0;
  let leaveDays = 0;

  for (const key of dates) {
    const day = new Date(key + 'T00:00:00Z').getUTCDay();
    if (holidaySet.has(key)) holidayDays += 1;
    else if (weekendSet.has(day)) weekendDaysCount += 1;
    else leaveDays += 1;
  }

  return {
    calendarDays: dates.length,
    holidayDays,
    weekendDays: weekendDaysCount,
    leaveDays
  };
}

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function employeeEntitlement(employee) {
  return Math.max(0, asNumber(employee && employee.planned_leave_days, 0));
}

function approvedUsedDays(leaves, employeeId, excludeId = null) {
  return (Array.isArray(leaves) ? leaves : [])
    .filter(l => String(l.employee_id) === String(employeeId))
    .filter(l => String(l.status || '').toLowerCase() === 'approved')
    .filter(l => excludeId == null || Number(l.id) !== Number(excludeId))
    .reduce((sum, l) => sum + Math.max(0, asNumber(l.days, 0)), 0);
}

function pendingRequestedDays(leaves, employeeId, excludeId = null) {
  return (Array.isArray(leaves) ? leaves : [])
    .filter(l => String(l.employee_id) === String(employeeId))
    .filter(l => String(l.status || '').toLowerCase() === 'pending')
    .filter(l => excludeId == null || Number(l.id) !== Number(excludeId))
    .reduce((sum, l) => sum + Math.max(0, asNumber(l.days, 0)), 0);
}

function leaveBalance(employee, leaves, excludeId = null) {
  const entitlement = employeeEntitlement(employee);
  const approved = approvedUsedDays(leaves, employee && employee.employee_id, excludeId);
  const pending = pendingRequestedDays(leaves, employee && employee.employee_id, excludeId);
  return {
    entitlement,
    approved,
    pending,
    remaining: Math.max(0, entitlement - approved)
  };
}

module.exports = {
  dateKey,
  dateRange,
  calculateLeaveDays,
  employeeEntitlement,
  approvedUsedDays,
  pendingRequestedDays,
  leaveBalance
};
