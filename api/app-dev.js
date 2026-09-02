const fs=require('fs');
const path=require('path');
const attendanceCorrectionApi=require('../attendance-correction-api.js');
// Step 9C.1 Preview shell: stable Step 9B.1 plus FILTER CITY TRADING CO. branded theme.
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
    const injected=html.replace('</body>',`<script>\n${taskUi}\n</script>\n<script>\n${leaveUi}\n</script>\n<script>\n${payrollUi}\n</script>\n<script>\n${attendanceFix}\n</script>\n<script>\n${reminderUi}\n</script>\n<script>\n${attendanceReportUi}\n</script>\n<script>\n${currentMonthUi}\n</script>\n<script>\n${payrollPaymentUi}\n</script>\n<script>\n${workScheduleUi}\n</script>\n<script>\n${attendanceRulesUi}\n</script>\n<script>\n${attendanceCorrectionUi}\n</script>\n<script>\n${attendanceCorrectionSaveUi}\n</script>\n<script>\n${attendanceInspectionUi}\n</script>\n<script>\n${attendanceCorrectionReportUi}\n</script>\n<script>\n${themeUi}\n</script>\n</body>`);
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
