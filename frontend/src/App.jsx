import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGraph, getRoute } from './api';
import RouteForm from './components/RouteForm';
import RouteResult from './components/RouteResult';
import NetworkMap from './components/NetworkMap';

export default function App() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [graphError, setGraphError] = useState(null);
  const [startId, setStartId] = useState('');
  const [endId, setEndId] = useState('');
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);

  const findRoute = useCallback(async (start, end) => {
    setStatus({ type: 'loading', message: 'Calculating route...' });
    setRoute(null);
    try {
      const result = await getRoute(start, end);
      setRoute(result);
      setStatus({ type: 'success', message: `Shortest route found: ${result.path.length} stop(s).` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getGraph()
      .then((data) => {
        if (cancelled) return;
        setGraph(data);
        const sorted = [...data.nodes].sort((a, b) => a.name.localeCompare(b.name));
        if (sorted.length > 1) {
          setStartId(sorted[0].id);
          setEndId(sorted[1].id);
          findRoute(sorted[0].id, sorted[1].id);
        }
      })
      .catch((err) => {
        if (!cancelled) setGraphError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [findRoute]);

  function handleSubmit(e) {
    e.preventDefault();
    findRoute(startId, endId);
  }

  const networkLoaded = graph.nodes.length > 0;

  return (
    <>
      <header>
        <h1>Path Finder</h1>
        <p className="subtitle">Shortest-route planning over a small road network, powered by Dijkstra's algorithm.</p>
      </header>

      <main>
        <section className="panel controls-panel">
          <h2>Plan a route</h2>
          {graphError && <div className="status error">Failed to load network: {graphError}</div>}
          {!graphError && !networkLoaded && <div className="status">Loading network...</div>}
          {!graphError && networkLoaded && (
            <>
              <RouteForm
                nodes={graph.nodes}
                startId={startId}
                endId={endId}
                onStartChange={setStartId}
                onEndChange={setEndId}
                onSubmit={handleSubmit}
              />
              <RouteResult
                statusType={status.type}
                statusMessage={status.message}
                route={route}
                nodesById={nodesById}
              />
            </>
          )}
        </section>

        <section className="panel map-panel">
          <h2>Network map</h2>
          <NetworkMap nodes={graph.nodes} edges={graph.edges} path={route?.path.map((p) => p.id) ?? null} />
        </section>
      </main>

      <footer>
        <p>
          Graph algorithm: Dijkstra's shortest path (see <code>src/DijkstraGraph.java</code>). Java backend served
          over plain HTTP.
        </p>
      </footer>
    </>
  );
}
