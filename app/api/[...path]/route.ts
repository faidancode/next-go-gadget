import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TARGET =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3000/api/v1";

function buildUpstreamUrl(pathname: string, search: string) {
  const base = DEFAULT_TARGET.replace(/\/$/, "");

  // Remove /api prefix from pathname
  const cleanPath = pathname.replace(/^\/api/, "");

  const finalUrl = `${base}${cleanPath}${search}`;

  return finalUrl;
}

async function forward(request: NextRequest, path: string[]) {
  const targetUrl = buildUpstreamUrl(
    request.nextUrl.pathname,
    request.nextUrl.search,
  );
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const method = request.method;
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
    credentials: "include",
  });

  const response = new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
  });

  const setCookie = upstreamResponse.headers.get("set-cookie");
  if (setCookie) {
    response.headers.append("set-cookie", setCookie);
  }
  return response;
}

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  const resolved = await context.params;
  const path = resolved.path || [];
  return forward(request, path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
