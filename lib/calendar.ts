import type {EventRecord} from './catalog';
const escape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const stamp=(s:string)=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
export function calendar(events:EventRecord[],mode:'booking'|'visit'='booking'){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Paris Gratuit//Reminder//ZH','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:巴黎葛朗台 · '+(mode==='booking'?'开票提醒':'活动日期'),'X-WR-TIMEZONE:Europe/Paris'];
 for(const e of events){if(mode==='booking'&&!e.bookingOpensAt)continue;if(mode==='visit'&&(!e.startDate||!e.endDate||e.startDate!==e.endDate))continue;
 lines.push('BEGIN:VEVENT','UID:'+e.id+'-'+mode+'@paris-gratuit','DTSTAMP:'+stamp(e.verifiedAt),'LAST-MODIFIED:'+stamp(e.verifiedAt),'SEQUENCE:'+Math.floor(new Date(e.verifiedAt).getTime()/1000),'SUMMARY:'+escape((mode==='booking'?'开放预约 · ':'活动日期 · ')+e.title),'DESCRIPTION:'+escape(e.description+'\n'+e.freeNote+'\n'+(e.bookingUrl??e.sourceUrl)),'URL:'+(e.bookingUrl??e.sourceUrl),'LOCATION:'+escape(e.location));
 if(mode==='booking')lines.push('DTSTART:'+stamp(e.bookingOpensAt!),'DTEND:'+stamp(new Date(new Date(e.bookingOpensAt!).getTime()+15*60000).toISOString()),'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:'+escape('开放预约：'+e.title),'END:VALARM');else{const d=new Date(e.startDate+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);lines.push('DTSTART;VALUE=DATE:'+e.startDate!.replaceAll('-',''),'DTEND;VALUE=DATE:'+d.toISOString().slice(0,10).replaceAll('-',''));}lines.push('END:VEVENT');}
 lines.push('END:VCALENDAR');
 return lines.map(line=>{let chunks:string[]=[],chunk='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>73){chunks.push(chunk);chunk=' '+c;bytes=1+n;}else{chunk+=c;bytes+=n;}}chunks.push(chunk);return chunks.join('\r\n');}).join('\r\n')+'\r\n';
}
