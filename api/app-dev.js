const fs=require('fs');
const path=require('path');
const attendanceCorrectionApi=require('../attendance-correction-api.js');
// Step 9D.2 Preview shell: tested Step 9D.1 plus Saudi leave terminology/presentation wording only.
module.exports=async(req,res)=>{
  if(String(req.url||'').includes('fc_mode=attendance-correction'))return attendanceCorrectionApi(req,res);
  try{
    const html=fs.readFileSync(path.join(process.cwd(),'index.html'),'utf8').replaceAll('admin@company.com','admin@filtercity.com');
    const taskUi=fs.readFileSync(path.join(process.cwd(),'task-photo-ui.js'),'utf8');
    const leaveUi=fs.readFileSync(path.join(process.cwd(),'leave-reason-ui.js'),'utf8');
    const payrollUi=fs.readFileSync(path.join(process.cwd(),'payroll-ui.js'),'utf8');
    const attendanceFix=fs.readFileSync(path.join(process.cwd(),'employee-attendance-fix.js'),'utf8');
    const reminderUi=fs.readFileSync(path.join(process.cwd(),'attendance-reminder-test-ui.js'),'utf8');
    const attendanceReportUi=fs.readFileSync(path.join(process.cwd(),'attendance-monthly-report-ui.js'),'utf8');
    const currentMonthUi=fs.readFileSync(path.join(process.cwd(),'current-month-view-ui.js'),'utf8');
    const payrollPaymentUi=fs.readFileSync(path.join(process.cwd(),'payroll-payment-ui.js'),'utf8');
    const workScheduleUi=fs.readFileSync(path.join(process.cwd(),'work-schedule-ui.js'),'utf8');
    const attendanceRulesUi=fs.readFileSync(path.join(process.cwd(),'attendance-rules-preview-ui.js'),'utf8');
    const attendanceCorrectionUi=fs.readFileSync(path.join(process.cwd(),'attendance-correction-preview-ui.js'),'utf8');
    const attendanceCorrectionSaveUi=fs.readFileSync(path.join(process.cwd(),'attendance-correction-save-ui.js'),'utf8');
    const attendanceInspectionUi=fs.readFileSync(path.join(process.cwd(),'attendance-inspection-report-ui.js'),'utf8');
    const attendanceCorrectionReportUi=fs.readFileSync(path.join(process.cwd(),'attendance-correction-report-ui.js'),'utf8');
    const themeUi=fs.readFileSync(path.join(process.cwd(),'theme-branding-ui.js'),'utf8');
    const bilingualUi=fs.readFileSync(path.join(process.cwd(),'bilingual-framework-ui.js'),'utf8');
    const bilingualPolishUi=fs.readFileSync(path.join(process.cwd(),'bilingual-arabic-polish-ui.js'),'utf8');
    const payrollArabicPolishUi=fs.readFileSync(path.join(process.cwd(),'payroll-arabic-polish-ui.js'),'utf8');
    const mobileResponsiveUi=fs.readFileSync(path.join(process.cwd(),'mobile-responsive-ui.js'),'utf8');
    const dashboardRedesignUi=fs.readFileSync(path.join(process.cwd(),'dashboard-redesign-ui.js'),'utf8');
    const dashboardRedesignFixUi=fs.readFileSync(path.join(process.cwd(),'dashboard-redesign-fix-ui.js'),'utf8');
    const dashboardRedesignPolishUi=fs.readFileSync(path.join(process.cwd(),'dashboard-redesign-polish-ui.js'),'utf8');
    const attendanceInspectionPrint9C5Ui=fs.readFileSync(path.join(process.cwd(),'attendance-inspection-print-9c5-ui.js'),'utf8');
    const attendanceAuditPrint9C6Ui=fs.readFileSync(path.join(process.cwd(),'attendance-audit-print-9c6-ui.js'),'utf8');
    const saudiHrTerminology9D1Ui=fs.readFileSync(path.join(process.cwd(),'saudi-hr-terminology-9d1-ui.js'),'utf8');
    const saudiLeaveTerminology9D2Ui=fs.readFileSync(path.join(process.cwd(),'saudi-leave-terminology-9d2-ui.js'),'utf8');
    const injected=html.replace('</body>',`<script>\n${taskUi}\n</script>\n<script>\n${leaveUi}\n</script>\n<script>\n${payrollUi}\n</script>\n<script>\n${attendanceFix}\n</script>\n<script>\n${reminderUi}\n</script>\n<script>\n${attendanceReportUi}\n</script>\n<script>\n${currentMonthUi}\n</script>\n<script>\n${payrollPaymentUi}\n</script>\n<script>\n${workScheduleUi}\n</script>\n<script>\n${attendanceRulesUi}\n</script>\n<script>\n${attendanceCorrectionUi}\n</script>\n<script>\n${attendanceCorrectionSaveUi}\n</script>\n<script>\n${attendanceInspectionUi}\n</script>\n<script>\n${attendanceCorrectionReportUi}\n</script>\n<script>\n${themeUi}\n</script>\n<script>\n${bilingualUi}\n</script>\n<script>\n${bilingualPolishUi}\n</script>\n<script>\n${payrollArabicPolishUi}\n</script>\n<script>\n${mobileResponsiveUi}\n</script>\n<script>\n${dashboardRedesignUi}\n</script>\n<script>\n${dashboardRedesignFixUi}\n</script>\n<script>\n${dashboardRedesignPolishUi}\n</script>\n<script>\n${attendanceInspectionPrint9C5Ui}\n</script>\n<script>\n${attendanceAuditPrint9C6Ui}\n</script>\n<script>\n${saudiHrTerminology9D1Ui}\n</script>\n<script>\n${saudiLeaveTerminology9D2Ui}\n</script>\n</body>`);
    res.statusCode=200;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.end(injected);
  }catch(e){
    console.error('Development app shell error',e);
    res.statusCode=500;
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.end('Unable to load development HRMS');
  }
};
