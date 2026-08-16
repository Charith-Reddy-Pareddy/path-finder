const SVG_NS = "http://www.w3.org/2000/svg";
const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 520;
const PADDING = 40;

let graphData = { nodes: [], edges: [] };
let nodesById = new Map();

async function getJSON(url) {
  const resp = await fetch(url);
  const body = await resp.json();
  if (!resp.ok) {
    const err = new Error(body.error || `request failed (${resp.status})`);
    err.status = resp.status;
    throw err;
  }
  return body;
}

function project(lat, lon, bounds) {
  const { latMin, latMax, lonMin, lonMax } = bounds;
  const x = PADDING + ((lon - lonMin) / (lonMax - lonMin || 1)) * (VIEW_WIDTH - 2 * PADDING);
  // Higher latitude is north; SVG y grows downward, so invert.
  const y = PADDING + ((latMax - lat) / (latMax - latMin || 1)) * (VIEW_HEIGHT - 2 * PADDING);
  return { x, y };
}

function computeBounds(nodes) {
  const lats = nodes.map((n) => n.lat);
  const lons = nodes.map((n) => n.lon);
  return {
    latMin: Math.min(...lats),
    latMax: Math.max(...lats),
    lonMin: Math.min(...lons),
    lonMax: Math.max(...lons),
  };
}

function el(tag, attrs, ns = SVG_NS) {
  const node = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
  return node;
}

function renderMap(pathIds) {
  const svg = document.getElementById("map");
  svg.innerHTML = "";
  const bounds = computeBounds(graphData.nodes);
  const positions = new Map(graphData.nodes.map((n) => [n.id, project(n.lat, n.lon, bounds)]));

  const pathSet = new Set(pathIds || []);
  const pathEdgeSet = new Set();
  for (let i = 0; pathIds && i < pathIds.length - 1; i++) {
    pathEdgeSet.add(pathIds[i] + "->" + pathIds[i + 1]);
  }

  // Edges first, so nodes draw on top.
  for (const edge of graphData.edges) {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) continue;
    const onPath = pathEdgeSet.has(edge.from + "->" + edge.to);
    const line = el("line", {
      x1: from.x, y1: from.y, x2: to.x, y2: to.y,
      class: "map-edge" + (onPath ? " on-path" : ""),
    });
    svg.appendChild(line);
  }

  for (const node of graphData.nodes) {
    const pos = positions.get(node.id);
    if (!pos) continue;
    const isOnPath = pathSet.has(node.id);
    const isEndpoint = pathIds && (node.id === pathIds[0] || node.id === pathIds[pathIds.length - 1]);
    const group = el("g", { class: "map-node" + (isOnPath ? " on-path" : "") + (isEndpoint ? " endpoint" : "") });
    group.appendChild(el("circle", { cx: pos.x, cy: pos.y, r: isEndpoint ? 8 : 6 }));
    const nearRightEdge = pos.x > VIEW_WIDTH - 110;
    const label = el("text", {
      x: pos.x + (nearRightEdge ? -10 : 10),
      y: pos.y + 4,
      "text-anchor": nearRightEdge ? "end" : "start",
    });
    label.textContent = node.name;
    group.appendChild(label);
    const title = el("title", {});
    title.textContent = node.name;
    group.appendChild(title);
    svg.appendChild(group);
  }
}

function populateSelects() {
  const startSelect = document.getElementById("start-select");
  const endSelect = document.getElementById("end-select");
  const sorted = [...graphData.nodes].sort((a, b) => a.name.localeCompare(b.name));
  for (const select of [startSelect, endSelect]) {
    select.innerHTML = "";
    for (const node of sorted) {
      const option = document.createElement("option");
      option.value = node.id;
      option.textContent = node.name;
      select.appendChild(option);
    }
  }
  // Default to two different intersections so the first search is meaningful.
  if (sorted.length > 1) endSelect.selectedIndex = 1;
}

function renderSteps(route) {
  const list = document.getElementById("route-steps");
  list.innerHTML = "";
  for (const segment of route.segments) {
    const from = nodesById.get(segment.from)?.name || segment.from;
    const to = nodesById.get(segment.to)?.name || segment.to;
    const li = document.createElement("li");
    li.textContent = `${from} → ${to} (${segment.miles} mi)`;
    list.appendChild(li);
  }
  const total = document.createElement("li");
  total.className = "total";
  total.textContent = `Total distance: ${route.totalMiles} mi`;
  list.appendChild(total);
}

async function findRoute(startId, endId) {
  const statusEl = document.getElementById("route-status");
  const stepsEl = document.getElementById("route-steps");
  statusEl.className = "status";
  statusEl.textContent = "Calculating route...";
  stepsEl.innerHTML = "";
  try {
    const route = await getJSON(`/api/route?start=${encodeURIComponent(startId)}&end=${encodeURIComponent(endId)}`);
    statusEl.textContent = `Shortest route found: ${route.path.length} stop(s).`;
    renderSteps(route);
    renderMap(route.path.map((p) => p.id));
  } catch (err) {
    statusEl.className = "status error";
    statusEl.textContent = err.message;
    renderMap(null);
  }
}

async function init() {
  graphData = await getJSON("/api/graph");
  nodesById = new Map(graphData.nodes.map((n) => [n.id, n]));
  populateSelects();
  renderMap(null);

  document.getElementById("route-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const startId = document.getElementById("start-select").value;
    const endId = document.getElementById("end-select").value;
    findRoute(startId, endId);
  });

  // Show a route immediately so the map isn't empty on first load.
  const startSelect = document.getElementById("start-select");
  const endSelect = document.getElementById("end-select");
  if (startSelect.value && endSelect.value) {
    findRoute(startSelect.value, endSelect.value);
  }
}

init().catch((err) => {
  document.getElementById("route-status").textContent = "Failed to load network: " + err.message;
});
