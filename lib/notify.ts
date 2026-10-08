import {db,runtime,allEvents,follows,type Prefs} from './store';
export async function deliver(){if(!runtime.RESEND_API_KEY||!runtime.MAIL_FROM)return {enabled:false,sent:0,reason:'邮件服务尚未连接'};
 const users=await db().prepare('SELECT user_id,email,data FROM preferences').all<{user_id:string;email:string;data:string}>();const events=await allEvents();let sent=0;
 for(const u of users.results){const p=JSON.parse(u.data) as Prefs;if(!p.emailEnabled)continue;for(const e of events){if(!follows(p,e)||p.booked.includes(e.id)||e.status!=='open'||(e.bookingOpensAt&&new Date(e.bookingOpensAt)>new Date())||(e.endDate&&e.endDate<new Date().toISOString().slice(0,10)))continue;
 const id=u.user_id+':'+e.id+':'+(e.bookingOpensAt??'open');if(await db().prepare('SELECT id FROM deliveries WHERE id=?').bind(id).first())continue;
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+runtime.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({from:runtime.MAIL_FROM,to:[u.email],subject:'巴黎葛朗台 · 可以预约了：'+e.title,text:e.title+'\n'+e.dateLabel+'\n'+e.freeNote+'\n官方预约：'+(e.bookingUrl??e.sourceUrl)+'\n余票以官方页面为准。\n在巴黎葛朗台的提醒设置中关闭邮件即可停止提醒。'})});
 if(!response.ok)throw new Error('邮件发送失败：'+response.status);await db().prepare('INSERT OR IGNORE INTO deliveries(id,user_id,event_id,sent_at) VALUES(?,?,?,?)').bind(id,u.user_id,e.id,new Date().toISOString()).run();sent++;}}
 return {enabled:true,sent};}
