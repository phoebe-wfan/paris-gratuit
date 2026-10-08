import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    const origin=request.headers.get('origin');
    const permitted=origin==='https://phoebe-wfan.github.io';
    const cors=new Headers();
    if(permitted){cors.set('Access-Control-Allow-Origin',origin!);cors.set('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');cors.set('Access-Control-Allow-Headers','Content-Type,X-Visitor-Key,Authorization');cors.set('Vary','Origin');}
    if(request.method==='OPTIONS')return new Response(null,{status:permitted?204:403,headers:cors});
    return runWithConnectorBinding(binding, async () => {const response=await handler.fetch(request,env,ctx);const headers=new Headers(response.headers);cors.forEach((value,key)=>headers.set(key,value));return new Response(response.body,{status:response.status,statusText:response.statusText,headers});});
  },
};
