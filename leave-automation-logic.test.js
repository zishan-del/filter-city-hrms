const assert = require('assert');
const {
  calculateLeaveDays,
  leaveBalance,
  dateRange
} = require('./leave-automation-logic');

assert.deepStrictEqual(
  calculateLeaveDays('2026-09-27', '2026-10-03', []),
  { calendarDays: 7, holidayDays: 0, weekendDays: 1, leaveDays: 6 }
);

assert.deepStrictEqual(
  calculateLeaveDays('2026-09-27', '2026-10-03', ['2026-09-29']),
  { calendarDays: 7, holidayDays: 1, weekendDays: 1, leaveDays: 5 }
);

assert.strictEqual(dateRange('2026-09-28', '2026-09-28').length, 1);
assert.throws(() => dateRange('2026-09-29', '2026-09-28'), /End date/);

const employee = { employee_id: 'E001', planned_leave_days: 60 };
const leaves = [
  { id: 1, employee_id: 'E001', status: 'Approved', days: 6 },
  { id: 2, employee_id: 'E001', status: 'Approved', days: 15 },
  { id: 3, employee_id: 'E001', status: 'Pending', days: 5 },
  { id: 4, employee_id: 'E002', status: 'Approved', days: 10 }
];
assert.deepStrictEqual(
  leaveBalance(employee, leaves),
  { entitlement: 60, approved: 21, pending: 5, remaining: 39 }
);
assert.deepStrictEqual(
  leaveBalance(employee, leaves, 2),
  { entitlement: 60, approved: 6, pending: 5, remaining: 54 }
);

console.log('Leave automation logic tests passed');
