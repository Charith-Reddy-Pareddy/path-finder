export default function RouteForm({ nodes, startId, endId, onStartChange, onEndChange, onSubmit }) {
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
      <button type="submit">Find shortest route</button>
    </form>
  );
}
