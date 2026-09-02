(function(){
  'use strict';
  if(window.__fcMobileResponsiveStep9C4)return;
  window.__fcMobileResponsiveStep9C4=true;

  const style=document.createElement('style');
  style.id='fc-mobile-9c4-style';
  style.textContent=`
    /* Step 9C.4 — presentation only. No HRMS/data logic changes. */
    @media(max-width:850px){
      html,body{max-width:100%;overflow-x:hidden}
      body.fc-mobile-menu-open{overflow:hidden!important;touch-action:none}
      .shell,html[dir="rtl"] .shell{display:block!important;min-height:100vh;direction:ltr!important}
      .main,html[dir="rtl"] .main{display:block!important;width:100%!important;min-width:0!important;direction:inherit}

      .sidebar,html[dir="rtl"] .sidebar{
        position:fixed!important;
        top:0!important;
        bottom:0!important;
        width:min(82vw,310px)!important;
        height:100dvh!important;
        z-index:60!important;
        overflow-y:auto!important;
        overscroll-behavior:contain;
        transition:transform .22s ease!important;
        box-shadow:0 12px 34px #001b3850!important;
        padding-top:max(12px,env(safe-area-inset-top))!important;
        padding-bottom:max(16px,env(safe-area-inset-bottom))!important;
      }
      html[dir="ltr"] .sidebar{left:0!important;right:auto!important;transform:translateX(-105%)!important}
      html[dir="rtl"] .sidebar{right:0!important;left:auto!important;transform:translateX(105%)!important;direction:rtl!important}
      html[dir="ltr"] .sidebar.open,html[dir="rtl"] .sidebar.open{transform:translateX(0)!important}

      .fc-mobile-backdrop{
        position:fixed;inset:0;z-index:55;background:#001b386e;
        opacity:0;pointer-events:none;transition:opacity .2s ease;
        -webkit-backdrop-filter:blur(1px);backdrop-filter:blur(1px)
      }
      .fc-mobile-backdrop.open{opacity:1;pointer-events:auto}

      .fc-brand-panel{padding:10px 8px!important;margin-bottom:12px!important}
      .fc-brand-mark{width:50px!important;height:50px!important;font-size:19px!important;margin-bottom:6px!important}
      .fc-brand-name{font-size:13px!important}
      .fc-brand-ar{font-size:12px!important}
      .fc-brand-sub{font-size:9px!important}
      .nav{gap:3px!important}
      .nav button{min-height:44px!important;padding:10px 12px!important;font-size:15px!important}
      .logout{min-height:44px!important;margin-top:18px!important}

      .top,html[dir="rtl"] .top{
        min-height:64px!important;height:auto!important;
        padding:9px 11px!important;
        gap:8px!important;
        position:sticky!important;top:0!important;z-index:30!important;
        flex-wrap:nowrap!important;
      }
      .top>div:first-child{min-width:0!important;gap:7px!important}
      .top h2{font-size:18px!important;line-height:1.15!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:42vw}
      .mobile-menu{
        display:inline-grid!important;place-items:center!important;
        width:40px!important;height:40px!important;min-width:40px!important;
        padding:0!important;border-radius:9px!important;
        background:#062b55!important;color:#fff!important;font-size:20px!important;
      }
      .mobile-menu:hover{background:#0a3c72!important}
      .fc-company-strip{display:none!important}
      .user{gap:7px!important;min-width:0!important;margin-inline-start:auto!important}
      .avatar{width:34px!important;height:34px!important;font-size:13px!important;flex:0 0 auto!important}
      .who{min-width:0!important;max-width:34vw!important}
      .who b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px!important}
      #roleText{font-size:9px!important}
      .fc-lang-switch{flex:0 0 auto!important}
      .fc-lang-switch button{min-width:42px!important;padding:7px 8px!important;font-size:12px!important}
      .fc-top-lang,html[dir="rtl"] .fc-top-lang{margin:0 2px!important}

      .content{padding:12px!important;width:100%!important;max-width:none!important}
      .hero{padding:17px!important;margin-bottom:12px!important;border-radius:10px!important}
      .hero h1{font-size:21px!important;overflow-wrap:anywhere}
      .hero>div{font-size:13px!important;line-height:1.45}

      .cards{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}
      .card{padding:13px!important;min-width:0!important;overflow-wrap:anywhere}
      .stat{font-size:24px!important}
      .section{margin-top:12px!important;border-radius:10px!important;max-width:100%!important;overflow:hidden!important}
      .section-head{padding:12px 13px!important;gap:8px!important;flex-wrap:wrap!important;align-items:center!important}
      .section-head>b{font-size:15px!important;line-height:1.35;min-width:0;overflow-wrap:anywhere}
      .section-head>.actions{margin-inline-start:auto}
      .muted{line-height:1.45}

      .form-grid{grid-template-columns:1fr!important;gap:8px!important;padding:13px!important}
      .form-grid .full{grid-column:auto!important}
      .field{min-width:0!important;margin:8px 0!important}
      .field input,.field select,.field textarea,input,select,textarea{max-width:100%!important;font-size:16px}
      input[type="date"],input[type="time"],input[type="month"],input[type="datetime-local"],input[type="number"]{min-height:44px}
      .fc-ar-month-select{max-width:100%!important;min-height:44px!important}

      .actions{gap:7px!important;max-width:100%!important;flex-wrap:wrap!important}
      button{min-height:42px}
      .table-wrap{width:100%!important;max-width:100%!important;overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-x:contain}
      .table{width:max-content!important;min-width:100%!important}
      .table th,.table td{padding:10px 11px!important;font-size:12px!important}
      .table th{font-size:11px!important}
      .table td[style*="min-width"]{min-width:180px!important}

      #fcStep6MonthToolbar>div:last-child{align-items:stretch!important}
      #fcStep6MonthToolbar label{align-self:center}
      #fcStep6MonthText{flex:1 1 100%!important;font-size:12px!important;line-height:1.45}
      #fcPayrollPaymentPanel .cards,#fc_r5_result .cards,#fc9_result .cards,#fc9b_result .cards{padding:10px!important}
      #fcPayrollPaymentPanel .section-head .actions{width:100%!important;margin:0!important}

      #fcAttendanceCorrection8A .form-grid,
      #fcAttendanceRules7BBox .actions,
      #fcAttendanceTestBox .actions{display:grid!important;grid-template-columns:1fr!important;width:100%!important}
      #fcAttendanceRules7BBox .field,#fcAttendanceTestBox select{min-width:0!important;width:100%!important}

      .login{padding:14px!important;min-height:100dvh!important}
      .login-card{width:min(100%,430px)!important;padding:22px 18px!important;border-radius:16px!important}
      .brand h1{font-size:21px!important}
      .login .logo{width:60px!important;height:60px!important}
      .tabs{margin:18px 0 14px!important}
      .fc-login-lang{margin-bottom:12px!important}
    }

    @media(max-width:560px){
      .top h2{max-width:34vw;font-size:17px!important}
      .who{display:none!important}
      .cards{grid-template-columns:1fr!important}
      .content{padding:9px!important}
      .hero{padding:15px!important}
      .hero h1{font-size:19px!important}
      .section-head{padding:11px!important}
      .section-head .actions{width:100%!important;margin:0!important;display:grid!important;grid-template-columns:1fr!important}
      .section-head .actions button,.actions>button{width:100%!important}
      .form-grid{padding:11px!important}
      #fcStep6MonthToolbar>div:last-child{display:grid!important;grid-template-columns:1fr!important}
      #fcStep6MonthToolbar input,#fcStep6MonthToolbar select{width:100%!important}
      #fcPayrollPaymentPanel .section-head .actions{display:grid!important;grid-template-columns:1fr!important}
      #fcPayrollPaymentPanel .section-head .actions button{width:100%!important}
      .login-card{padding:20px 15px!important}
    }

    @media(max-width:390px){
      .fc-lang-switch button{min-width:38px!important;padding:7px 6px!important}
      .avatar{display:none!important}
      .top h2{max-width:46vw!important}
      .mobile-menu{width:38px!important;height:38px!important;min-width:38px!important}
    }
  `;
  document.head.appendChild(style);

  let backdrop=null;
  function ensureBackdrop(){
    if(backdrop&&backdrop.isConnected)return backdrop;
    backdrop=document.querySelector('.fc-mobile-backdrop');
    if(!backdrop){
      backdrop=document.createElement('div');
      backdrop.className='fc-mobile-backdrop';
      backdrop.setAttribute('aria-hidden','true');
      backdrop.addEventListener('click',function(){
        const sidebar=document.getElementById('sidebar');
        if(sidebar)sidebar.classList.remove('open');
        syncMenu();
      });
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  function mobile(){return window.matchMedia('(max-width:850px)').matches;}
  function syncMenu(){
    const sidebar=document.getElementById('sidebar');
    const layer=ensureBackdrop();
    const open=!!(mobile()&&sidebar&&sidebar.classList.contains('open'));
    layer.classList.toggle('open',open);
    document.body.classList.toggle('fc-mobile-menu-open',open);
  }

  const sidebar=document.getElementById('sidebar');
  if(sidebar)new MutationObserver(syncMenu).observe(sidebar,{attributes:true,attributeFilter:['class']});

  window.addEventListener('resize',function(){
    const s=document.getElementById('sidebar');
    if(!mobile()&&s)s.classList.remove('open');
    syncMenu();
  },{passive:true});

  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      const s=document.getElementById('sidebar');
      if(s&&s.classList.contains('open')){s.classList.remove('open');syncMenu();}
    }
  });

  document.addEventListener('click',function(e){
    if(!mobile())return;
    const nav=e.target.closest&&e.target.closest('#nav button');
    if(nav)setTimeout(syncMenu,0);
  });

  ensureBackdrop();
  syncMenu();
})();
