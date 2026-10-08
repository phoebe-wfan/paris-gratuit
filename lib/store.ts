import {env} from 'cloudflare:workers';
import {seedEvents,type EventRecord,activeEvents} from './catalog';
export function db(){if(!env.DB)throw new Error('活动数据暂时不可用，请稍后重试。');return env.DB;}
export async function allEvents(){const r=await db().prepare('SELECT data FROM events').all<{data:string}>();const map=new Map(seedEvents.map(e=>[e.id,e]));for(const row of r.results) {const e=JSON.parse(row.data) as EventRecord;map.set(e.id,e);}return [...map.values()];}
export async function listEvents(){return activeEvents(await allEvents());}
export function identity(req:Request){const key=req.headers.get('x-visitor-key');if(key&&/^[a-f0-9]{64}$/.test(key))return {id:'visitor:'+key,email:''};throw new Error('访客凭证无效，请刷新页面后重试。');}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin&&origin!=='https://phoebe-wfan.github.io')throw new Error('请求来源无效。');}
export type Prefs={events:string[];providers:string[];categories:string[];booked:string[];emailEnabled:boolean};
export const defaults:Prefs={events:[],providers:[],categories:[],booked:[],emailEnabled:false};
export async function getPrefs(userId:string){return await db().prepare('SELECT * FROM preferences WHERE user_id=?').bind(userId).first<{data:string,email:string,calendar_token:string}>();}
export function follows(p:Prefs,e:EventRecord){return p.events.includes(e.id)||p.providers.includes(e.provider)||p.categories.includes(e.category);}
export const runtime=env as unknown as {RESEND_API_KEY?:string;MAIL_FROM?:string;PUBLIC_CALENDAR_ENABLED?:string;UPDATE_SECRET?:string};
export function errorResponse(e:unknown,status=400){console.error(e);return Response.json({error:e instanceof Error?e.message:'操作失败，请重试。'},{status});}
