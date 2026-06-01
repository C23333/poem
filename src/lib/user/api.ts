export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers || {})
    }
  });
}

export function disabledFeatureResponse(feature: string) {
  return jsonResponse(
    {
      ok: false,
      error: `${feature} is disabled`
    },
    { status: 503 }
  );
}

export function missingImplementationResponse(feature: string) {
  return jsonResponse(
    {
      ok: false,
      error: `${feature} is not configured`
    },
    { status: 501 }
  );
}

export function requireFeature(enabled: boolean, feature: string) {
  return enabled ? undefined : disabledFeatureResponse(feature);
}
