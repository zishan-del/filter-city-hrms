(function(){
  'use strict';
  if(window.__fcLeaveReasonUi) return;
  window.__fcLeaveReasonUi = true;

  const leaveRows = () => {
    const me = JSON.parse(sessionStorage.getItem('fc_user') || '{}');
    const all = Array.isArray(state && state.leaves) ? state.leaves : [];
    return String(role || '').toUpperCase() === 'EMPLOYEE'
      ? all.filter(x => x.employee_id === me.employeeId)
      : all;
  };

  const escReason = value => String(value ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));

  function addReasonColumn(){
    const tables = document.querySelectorAll('#content .table');
    if(!tables.length) return;
    const table = tables[tables.length - 1];
    const head = table.querySelector('thead tr');
    if(!head || head.querySelector('[data-leave-reason]')) return;

    const rows = leaveRows();
    const reasonHead = document.createElement('th');
    reasonHead.textContent = 'Reason';
    reasonHead.dataset.leaveReason = '1';
    head.appendChild(reasonHead);

    table.querySelectorAll('tbody tr').forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      const cell = document.createElement('td');
      if(!cells.length || cells.length === 1) {
        cell.innerHTML = '<span class="muted">—</span>';
      } else {
        const reason = rows[index] && rows[index].reason ? String(rows[index].reason) : '';
        cell.innerHTML = reason
          ? `<div style="white-space:normal;min-width:220px;max-width:360px;line-height:1.4">${escReason(reason)}</div>`
          : '<span class="muted">—</span>';
      }
      row.appendChild(cell);
    });
  }

  const originalRender = window.render;
  if(typeof originalRender === 'function'){
    window.render = function(page){
      originalRender(page);
      if(page === 'Leave') requestAnimationFrame(addReasonColumn);
    };
  }
})();
