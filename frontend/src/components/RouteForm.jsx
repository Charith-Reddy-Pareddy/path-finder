export default function RouteForm({ nodes, startId, endId, onStartChange, onEndChange, onSubmit, onSwap, loading }) {
  const sorted = [...nodes].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <form onSubmit={onSubmit}>
      <label>
        Start
        <select value={startId} onChange={(e) => onStartChange(e.target.value)} required>
          {sorted.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="swap-button" onClick={onSwap} aria-label="Swap start and end">
        ⇅ Swap
      </button>
      <label>
        End
        <select value={endId} onChange={(e) => onEndChange(e.target.value)} required>
          {sorted.map((node) => (
            <option key={node.id} value={node.id}>
              {node.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Calculating...' : 'Find shortest route'}
      </button>
    </form>
  );
}
