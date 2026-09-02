(function(){
  'use strict';
  if(window.__fcBilingualStep9C2)return;
  window.__fcBilingualStep9C2=true;

  const GENERIC_KEY='fc_hrms_language';
  const pages={Dashboard:'لوحة التحكم',Employees:'الموظفون',Attendance:'الحضور والانصراف',Tasks:'المهام',Leave:'الإجازات',Holidays:'العطلات',Payroll:'الرواتب',EOSB:'مكافأة نهاية الخدمة',Reports:'التقارير',Settings:'الإعدادات'};
  const exact={
    'Admin Login':'دخول المسؤول',
    'Employee Login':'دخول الموظف',
    'Username / Email':'اسم المستخدم / البريد الإلكتروني',
    'Password':'كلمة المرور',
    'Login':'تسجيل الدخول',
    'Logout':'تسجيل الخروج',
    'Human Resources Management System':'نظام إدارة الموارد البشرية',
    'Total Employees':'إجمالي الموظفين',
    'Present Today':'الحاضرون اليوم',
    'Pending Tasks':'المهام المعلقة',
    'Pending Leave':'طلبات الإجازة المعلقة',
    'Cloud connection':'الاتصال السحابي',
    'Connected to PostgreSQL':'متصل بقاعدة البيانات',
    'All information below is loaded from the cloud database.':'جميع المعلومات أدناه محملة من قاعدة البيانات السحابية.',
    'PC and mobile use the same API and database. Browser local storage is used only for the login token, never for HRMS records.':'يستخدم الكمبيوتر والجوال نفس واجهة النظام وقاعدة البيانات. يتم استخدام التخزين المحلي في المتصفح فقط لرمز تسجيل الدخول وليس لسجلات الموارد البشرية.',
    'Default admin: admin@filtercity.com / Admin@12345':'المسؤول الافتراضي: admin@filtercity.com / Admin@12345',
    'Employee credentials are created by Admin.':'يتم إنشاء بيانات دخول الموظف بواسطة المسؤول.'
  };

  const style=document.createElement('style');
  style.id='fc-bilingual-9c2-style';
  style.textContent=`
    .fc-lang-switch{display:flex;direction:ltr;align-items:center;border:1px solid #d7e0eb;border-radius:9px;overflow:hidden;background:#fff;flex:0 0 auto}
    .fc-lang-switch button{min-width:52px;padding:8px 12px!important;border-radius:0!important;background:#fff!important;color:#062b55!important;font-weight:800!important;border:0!important;box-shadow:none!important}
    .fc-lang-switch button.active{background:#e31b23!important;color:#fff!important}
    .fc-login-lang{justify-content:center;margin:0 auto 16px;width:max-content}
    .fc-top-lang{margin-left:14px}
    html[dir="rtl"] body{font-family:Tahoma,Arial,sans-serif}
    html[dir="rtl"] .shell{grid-template-columns:1fr 230px}
    html[dir="rtl"] .sidebar{grid-column:2;grid-row:1;text-align:right}
    html[dir="rtl"] .main{grid-column:1;grid-row:1}
    html[dir="rtl"] .nav button{text-align:right!important;border-left:0!important;border-right:3px solid transparent!important}
    html[dir="rtl"] .nav button.active{border-right-color:#fff!important}
    html[dir="rtl"] .top{direction:rtl}
    html[dir="rtl"] .top>div:first-child{direction:rtl}
    html[dir="rtl"] .fc-company-strip{margin-left:auto!important;margin-right:20px!important}
    html[dir="rtl"] .user{direction:rtl;text-align:right}
    html[dir="rtl"] .content{text-align:right}
    html[dir="rtl"] .section-head,html[dir="rtl"] .actions,html[dir="rtl"] .form-grid{direction:rtl}
    html[dir="rtl"] .table th,html[dir="rtl"] .table td{text-align:right}
    html[dir="rtl"] .field label{text-align:right}
    html[dir="rtl"] input,html[dir="rtl"] select,html[dir="rtl"] textarea{text-align:right}
    html[dir="rtl"] input[type="date"],html[dir="rtl"] input[type="time"],html[dir="rtl"] input[type="month"],html[dir="rtl"] input[type="datetime-local"],html[dir="rtl"] input[type="number"]{direction:ltr;text-align:right}
    html[dir="rtl"] .hero{border-left:1px solid var(--fc-line)!important;border-right:5px solid var(--fc-red)!important}
    html[dir="rtl"] .fc-top-lang{margin-left:0;margin-right:14px}
    @media(max-width:850px){
      html[dir="rtl"] .shell{grid-template-columns:1fr}
      html[dir="rtl"] .sidebar{grid-column:1;right:-250px;left:auto}
      html[dir="rtl"] .sidebar.open{right:0;left:auto}
    }
  `;
  document.head.appendChild(style);

  function user(){try{return JSON.parse(sessionStorage.getItem('fc_user')||'null');}catch(_){return null;}}
  function userKey(){const u=user();return u&&u.username?GENERIC_KEY+'_'+String(u.username).toLowerCase():null;}
  function savedLanguage(){const k=userKey();return (k&&localStorage.getItem(k))||localStorage.getItem(GENERIC_KEY)||'en';}
  function storeLanguage(lang){localStorage.setItem(GENERIC_KEY,lang);const k=userKey();if(k)localStorage.setItem(k,lang);}

  function switchHtml(location){return '<div class="fc-lang-switch '+(location==='login'?'fc-login-lang':'fc-top-lang')+'" data-fc-lang-switch="'+location+'"><button type="button" data-lang="en">EN</button><button type="button" data-lang="ar">عربي</button></div>';}
  function ensureSwitches(){
    const card=document.querySelector('.login-card');
    if(card&&!card.querySelector('[data-fc-lang-switch="login"]')){
      const brand=card.querySelector('.brand');
      if(brand)brand.insertAdjacentHTML('afterend',switchHtml('login'));
    }
    const top=document.querySelector('.top');
    const userBox=top&&top.querySelector('.user');
    if(top&&userBox&&!top.querySelector('[data-fc-lang-switch="top"]'))userBox.insertAdjacentHTML('beforebegin',switchHtml('top'));
    document.querySelectorAll('.fc-lang-switch button').forEach(btn=>{
      if(!btn.dataset.bound){btn.dataset.bound='1';btn.addEventListener('click',()=>setLanguage(btn.dataset.lang));}
    });
  }

  function translateExact(root,toArabic){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(n=>{
      const original=n.parentElement&&n.parentElement.dataset?n.parentElement.dataset.fcEnText:null;
      const raw=(original!=null?original:n.nodeValue).trim();
      if(!raw)return;
      if(toArabic){
        const ar=pages[raw]||exact[raw];
        if(ar){if(n.parentElement&&!n.parentElement.dataset.fcEnText)n.parentElement.dataset.fcEnText=raw;n.nodeValue=n.nodeValue.replace(raw,ar);}
      }else if(n.parentElement&&n.parentElement.dataset.fcEnText){
        const en=n.parentElement.dataset.fcEnText;
        n.nodeValue=n.nodeValue.replace(n.nodeValue.trim(),en);
        delete n.parentElement.dataset.fcEnText;
      }
    });
  }

  function translateDashboard(toArabic){
    const hero=document.querySelector('#content .hero h1');
    const u=user();
    if(hero&&u&&u.username){hero.textContent=toArabic?'مرحباً، '+u.username:'Welcome, '+u.username;}
  }

  function applyLanguage(lang){
    const ar=lang==='ar';
    const k=userKey();
    if(k&&!localStorage.getItem(k))localStorage.setItem(k,lang);
    document.documentElement.lang=ar?'ar':'en';
    document.documentElement.dir=ar?'rtl':'ltr';
    document.body.classList.toggle('fc-lang-ar',ar);
    ensureSwitches();
    document.querySelectorAll('.fc-lang-switch button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    translateExact(document.getElementById('login'),ar);
    translateExact(document.getElementById('app'),ar);
    translateDashboard(ar);
    document.title=ar?'فلتر سيتي للتجارة - نظام الموارد البشرية':'FILTER CITY TRADING CO. HRMS';
  }

  function setLanguage(lang){
    lang=lang==='ar'?'ar':'en';
    storeLanguage(lang);
    applyLanguage(lang);
  }
  window.fcSetLanguage=setLanguage;

  const previousRender=window.render;
  if(typeof previousRender==='function')window.render=function(page){const result=previousRender(page);setTimeout(()=>applyLanguage(savedLanguage()),0);return result;};

  const previousBoot=window.boot;
  if(typeof previousBoot==='function')window.boot=async function(u){const result=await previousBoot(u);setTimeout(()=>applyLanguage(savedLanguage()),0);return result;};

  const previousSetRole=window.setRole;
  if(typeof previousSetRole==='function')window.setRole=function(r){const result=previousSetRole(r);setTimeout(()=>applyLanguage(savedLanguage()),0);return result;};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>applyLanguage(savedLanguage()),{once:true});
  else applyLanguage(savedLanguage());
})();
