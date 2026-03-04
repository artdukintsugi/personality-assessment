// Helper to encode/decode compare payloads in URL-friendly base64
export function encodePayload(payload) {
  try {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    return null;
  }
}

export function decodePayload(b64) {
  try {
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function makeCompareLink(baseUrl, payload) {
  const enc = encodePayload(payload);
  if (!enc) return null;
  try {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('compare', enc);
    return url.toString();
  } catch (e) {
    return `${baseUrl}?compare=${enc}`;
  }
}

export function parseCompareFromUrl(urlString) {
  try {
    const url = new URL(urlString, window.location.origin);
    const p = url.searchParams.get('compare');
    if (!p) return null;
    return decodePayload(p);
  } catch (e) {
    return null;
  }
}
