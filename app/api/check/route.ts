import {authorized} from '../update/route';import {deliver} from '@/lib/notify';import {errorResponse} from '@/lib/store';
export async function POST(req:Request){if(!authorized(req))return Response.json({error:'无权访问'},{status:403});try{return Response.json(await deliver());}catch(e){return errorResponse(e,503);}}
