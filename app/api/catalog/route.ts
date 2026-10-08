import {listEvents,errorResponse,runtime} from '@/lib/store';
export async function GET(){try{return Response.json({events:await listEvents(),emailReady:!!(runtime.RESEND_API_KEY&&runtime.MAIL_FROM),calendarSubscriptionReady:runtime.PUBLIC_CALENDAR_ENABLED==='true',timezone:'Europe/Paris'},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e,503);}}
