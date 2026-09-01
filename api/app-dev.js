const fs=require('fs');
const path=require('path');
module.exports=async(req,res)=>{
  try{
    const html=fs.readFileSync(path.join(process.cwd(),'index.html'),'utf8');
    const taskUi=fs.readFileSync(path.join(process.cwd(),'task-photo-ui.js'),'utf8');
    const leaveUi=fs.readFileSync(path.join(process.cwd(),'leave-reason-ui.js'),'utf8');
    const payrollUi=fs.readFileSync(path.join(process.cwd(),'payroll-ui.js'),'utf8');
    const reminderUi=fs.readFileSync(path.join(process.cwd(),'attendance-reminder-test-ui.js'),'utf8');
    const injected=html.replace('</body>',`<script>\n${taskUi}\n</script>\n<script>\n${leaveUi}\n</script>\n<script>\n${payrollUi}\n</script>\n<script>\n${reminderUi}\n</script>\n</body>`);
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
