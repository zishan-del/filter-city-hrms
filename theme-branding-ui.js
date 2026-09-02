(function(){
  'use strict';
  if(window.__fcThemeStep9C1)return;
  window.__fcThemeStep9C1=true;

  const COMPANY_EN='FILTER CITY TRADING CO.';
  const COMPANY_AR='شركة مدينة الفلاتر للتجارة';

  const style=document.createElement('style');
  style.id='fc-theme-9c1-style';
  style.textContent=`
    :root{
      --fc-navy:#062b55;
      --fc-navy-2:#0a3c72;
      --fc-red:#e31b23;
      --fc-red-dark:#bd1118;
      --fc-bg:#f4f7fb;
      --fc-card:#ffffff;
      --fc-line:#dfe5ee;
      --fc-text:#122033;
      --fc-muted:#66758a;
    }
    body.fc-theme-9c1{background:var(--fc-bg);color:var(--fc-text)}
    body.fc-theme-9c1 .login{background:linear-gradient(135deg,var(--fc-navy),#0b477f)}
    body.fc-theme-9c1 .login-card{border-radius:18px;border:1px solid #ffffff55;box-shadow:0 22px 70px #001b382e}
    body.fc-theme-9c1 .brand .logo{background:var(--fc-navy);border:3px solid var(--fc-red);box-shadow:0 0 0 4px #edf3fa;color:#fff}
    body.fc-theme-9c1 .brand h1{color:var(--fc-red);letter-spacing:.2px}
    body.fc-theme-9c1 .tabs{background:#eef2f7}
    body.fc-theme-9c1 .tabs button.active{color:var(--fc-navy);box-shadow:0 2px 10px #001b3814}
    body.fc-theme-9c1 button{background:var(--fc-red);border-radius:8px;font-weight:700;box-shadow:none}
    body.fc-theme-9c1 button:hover{background:var(--fc-red-dark)}
    body.fc-theme-9c1 button.secondary{background:#eef3f9;color:var(--fc-navy);border:1px solid #d7e0eb}
    body.fc-theme-9c1 button.secondary:hover{background:#e3ebf5}
    body.fc-theme-9c1 button.success{background:#087443}
    body.fc-theme-9c1 button.danger{background:#b42318}
    body.fc-theme-9c1 .sidebar{
      background:linear-gradient(180deg,#062b55 0%,#073868 55%,#062b55 100%);
      padding:14px 12px 18px;
      box-shadow:4px 0 18px #001b3814;
      overflow-y:auto;
    }
    body.fc-theme-9c1 .fc-brand-panel{
      border:1px solid #ffffff2e;border-radius:12px;padding:12px 10px;margin-bottom:18px;
      background:#ffffff0d;text-align:center;
    }
    body.fc-theme-9c1 .fc-brand-mark{
      width:58px;height:58px;margin:0 auto 8px;border-radius:12px;
      background:#fff;color:var(--fc-navy);border:3px solid var(--fc-red);
      display:grid;place-items:center;font-weight:900;font-size:22px;letter-spacing:-1px;
      box-shadow:0 5px 18px #001b3830;
    }
    body.fc-theme-9c1 .fc-brand-name{color:#fff;font-size:14px;font-weight:900;line-height:1.25}
    body.fc-theme-9c1 .fc-brand-ar{color:#fff;font-size:13px;font-weight:700;margin-top:5px;line-height:1.35}
    body.fc-theme-9c1 .fc-brand-sub{color:#b9cbe0;font-size:10px;margin-top:6px;text-transform:uppercase;letter-spacing:.8px}
    body.fc-theme-9c1 .side-title,body.fc-theme-9c1 .side-sub{display:none}
    body.fc-theme-9c1 .nav{gap:4px}
    body.fc-theme-9c1 .nav button{
      text-align:left;background:transparent;color:#fff;border-radius:8px;padding:11px 12px;font-weight:600;
      border-left:3px solid transparent;
    }
    body.fc-theme-9c1 .nav button:hover{background:#ffffff12;border-left-color:#ffffff70}
    body.fc-theme-9c1 .nav button.active{
      background:linear-gradient(90deg,var(--fc-red),#ef2930);border-left-color:#fff;box-shadow:0 7px 16px #001b3830;
    }
    body.fc-theme-9c1 .logout{background:#ffffff18!important;border:1px solid #ffffff36;color:#fff;margin-top:24px}
    body.fc-theme-9c1 .logout:hover{background:#ffffff25!important}
    body.fc-theme-9c1 .top{
      height:72px;border-bottom:1px solid var(--fc-line);background:#fff;padding:0 24px;box-shadow:0 2px 10px #001b3808;
    }
    body.fc-theme-9c1 .top h2{color:var(--fc-navy);font-weight:800}
    body.fc-theme-9c1 .avatar{background:var(--fc-navy);box-shadow:0 0 0 3px #edf3fa}
    body.fc-theme-9c1 #roleText{color:var(--fc-red);font-size:11px;font-weight:700}
    body.fc-theme-9c1 .content{padding:22px;max-width:1500px}
    body.fc-theme-9c1 .hero{
      background:#fff;color:var(--fc-navy);border:1px solid var(--fc-line);border-left:5px solid var(--fc-red);
      box-shadow:0 5px 18px #001b3809;border-radius:12px;
    }
    body.fc-theme-9c1 .hero h1{font-weight:900}
    body.fc-theme-9c1 .hero>div{color:var(--fc-muted)}
    body.fc-theme-9c1 .card{
      border:1px solid var(--fc-line);border-radius:12px;background:#fff;box-shadow:0 4px 14px #001b3808;
    }
    body.fc-theme-9c1 .cards>.card:nth-child(odd){border-top:3px solid var(--fc-navy)}
    body.fc-theme-9c1 .cards>.card:nth-child(even){border-top:3px solid var(--fc-red)}
    body.fc-theme-9c1 .stat{color:var(--fc-navy)}
    body.fc-theme-9c1 .section{
      border:1px solid var(--fc-line);border-radius:12px;background:#fff;box-shadow:0 4px 16px #001b3808;
    }
    body.fc-theme-9c1 .section-head{background:#fff;border-bottom:1px solid var(--fc-line)}
    body.fc-theme-9c1 .section-head b{color:var(--fc-navy)}
    body.fc-theme-9c1 .badge{background:#edf3f9;color:var(--fc-navy);border:1px solid #dde6f0}
    body.fc-theme-9c1 .table th{background:#f6f8fb;color:var(--fc-navy);border-bottom:1px solid var(--fc-line)}
    body.fc-theme-9c1 .table td{border-bottom:1px solid #edf1f5}
    body.fc-theme-9c1 .table tbody tr:hover{background:#fbfcfe}
    body.fc-theme-9c1 .field input,body.fc-theme-9c1 .field select,body.fc-theme-9c1 .field textarea,
    body.fc-theme-9c1 input,body.fc-theme-9c1 select,body.fc-theme-9c1 textarea{border-color:#cfd9e5}
    body.fc-theme-9c1 .field input:focus,body.fc-theme-9c1 .field select:focus,body.fc-theme-9c1 .field textarea:focus{
      outline:2px solid #e31b2320;border-color:var(--fc-red)
    }
    body.fc-theme-9c1 .toast{background:var(--fc-navy);border-left:4px solid var(--fc-red)}
    body.fc-theme-9c1 .fc-company-strip{
      display:flex;align-items:center;gap:12px;margin-right:auto;margin-left:20px;color:var(--fc-navy);min-width:0;
    }
    body.fc-theme-9c1 .fc-company-strip .fc-mini-mark{
      width:32px;height:32px;border-radius:8px;background:#fff;color:var(--fc-navy);border:2px solid var(--fc-red);display:grid;place-items:center;font-weight:900;font-size:12px;flex:0 0 auto;
    }
    body.fc-theme-9c1 .fc-company-strip .fc-mini-name{font-size:12px;font-weight:900;white-space:nowrap}
    body.fc-theme-9c1 .fc-company-strip .fc-mini-ar{font-size:11px;color:var(--fc-red);font-weight:700;white-space:nowrap}
    @media(max-width:1100px){body.fc-theme-9c1 .fc-company-strip{display:none}}
    @media(max-width:850px){
      body.fc-theme-9c1 .sidebar{padding-top:12px}
      body.fc-theme-9c1 .top{padding:0 12px}
      body.fc-theme-9c1 .content{padding:14px}
      body.fc-theme-9c1 .fc-brand-panel{margin-bottom:12px}
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('fc-theme-9c1');

  function applyBranding(){
    document.title='FILTER CITY TRADING CO. HRMS';

    const sidebar=document.getElementById('sidebar');
    if(sidebar&&!sidebar.querySelector('.fc-brand-panel')){
      const panel=document.createElement('div');
      panel.className='fc-brand-panel';
      panel.innerHTML='<div class="fc-brand-mark">FC</div><div class="fc-brand-name">'+COMPANY_EN+'</div><div class="fc-brand-ar" dir="rtl">'+COMPANY_AR+'</div><div class="fc-brand-sub">Human Resources Management System</div>';
      sidebar.prepend(panel);
    }

    const brandH1=document.querySelector('.brand h1');
    if(brandH1)brandH1.textContent=COMPANY_EN+' HRMS';
    const brandMuted=document.querySelector('.brand .muted');
    if(brandMuted&&brandMuted.textContent.includes('Human Resources'))brandMuted.innerHTML='Human Resources Management System<br><span dir="rtl" style="color:#e31b23;font-weight:700">'+COMPANY_AR+'</span>';

    const top=document.querySelector('.top');
    const pageTitle=document.getElementById('pageTitle');
    if(top&&pageTitle&&!top.querySelector('.fc-company-strip')){
      const strip=document.createElement('div');
      strip.className='fc-company-strip';
      strip.innerHTML='<div class="fc-mini-mark">FC</div><div><div class="fc-mini-name">'+COMPANY_EN+'</div><div class="fc-mini-ar" dir="rtl">'+COMPANY_AR+'</div></div>';
      pageTitle.parentElement.insertAdjacentElement('afterend',strip);
    }
  }

  applyBranding();
  document.addEventListener('DOMContentLoaded',applyBranding,{once:true});
  new MutationObserver(applyBranding).observe(document.documentElement,{childList:true,subtree:true});
})();
