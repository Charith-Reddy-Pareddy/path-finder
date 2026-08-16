export default function RouteResult({ statusType, statusMessage, route, nodesById }) {
  return (
    <>
      <div className={statusType === 'error' ? 'status error' : 'status'}>{statusMessage}</div>
      {route && (
        <ol className="steps">
          {route.segments.map((segment, i) => {
            const from = nodesById.get(segment.from)?.name ?? segment.from;
            const to = nodesById.get(segment.to)?.name ?? segment.to;
            return (
              <li key={`${segment.from}-${segment.to}-${i}`}>
                {from} &rarr; {to} ({segment.miles} mi)
              </li>
            );
          })}
          <li className="total">Total distance: {route.totalMiles} mi</li>
        </ol>
      )}
    </>
  );
}
