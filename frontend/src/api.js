async function getJSON(url) {
  const resp = await fetch(url);
  const body = await resp.json();
  if (!resp.ok) {
    throw new Error(body.error || `request failed (${resp.status})`);
  }
  return body;
}

/** Fetches all intersections and roads, for populating the map and selects. */
export function getGraph() {
  return getJSON('/api/graph');
}

/** Fetches the shortest route between two intersection ids. */
export function getRoute(startId, endId) {
  const params = new URLSearchParams({ start: startId, end: endId });
  return getJSON(`/api/route?${params}`);
}
