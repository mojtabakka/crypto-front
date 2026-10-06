/**
 * Diverging colour scale: blue for negative, red for positive, with a
 * neutral midpoint. A single-hue scale would hide the sign, which is the
 * whole point of a correlation matrix.
 */
function correlationColor(value: number): string {
  const clamped = Math.max(-1, Math.min(1, value));

  if (clamped >= 0) {
    const intensity = Math.round(255 - clamped * 200);
    return `rgb(${intensity}, ${Math.max(40, intensity - 60)}, ${Math.max(40, intensity - 90)})`;
  }

  const intensity = Math.round(255 - Math.abs(clamped) * 200);
  return `rgb(${Math.max(40, intensity - 90)}, ${Math.max(40, intensity - 60)}, ${intensity})`;
}

function textColor(value: number): string {
  return Math.abs(value) > 0.55 ? '#0a0a0a' : 'rgba(255,255,255,0.92)';
}

interface Props {
  symbols: string[];
  matrix: number[][];
  benchmark?: string;
}

export function CorrelationMatrix({ symbols, matrix, benchmark }: Props) {
  if (!symbols.length || !matrix.length) return null;

  // Cap the rendered grid so a large universe stays readable on screen.
  const MAX = 22;
  const shown = symbols.slice(0, MAX);
  const truncated = symbols.length > MAX;

  return (
    <div className="matrix-wrap">
      {truncated && (
        <p className="matrix-note">
          Showing the first {MAX} of {symbols.length} assets.
        </p>
      )}

      <div className="matrix-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="corner-cell" />
              {shown.map((symbol) => (
                <th
                  key={symbol}
                  className={`matrix-header ${
                    symbol === benchmark ? 'is-benchmark' : ''
                  }`}
                >
                  {symbol.replace(/USDT$/, '')}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shown.map((rowSymbol, i) => (
              <tr key={rowSymbol}>
                <th
                  className={`matrix-row-header ${
                    rowSymbol === benchmark ? 'is-benchmark' : ''
                  }`}
                >
                  {rowSymbol.replace(/USDT$/, '')}
                </th>

                {shown.map((colSymbol, j) => {
                  const value = matrix[i]?.[j];

                  if (value === undefined || value === null) {
                    return (
                      <td key={colSymbol} className="matrix-cell empty">
                        -
                      </td>
                    );
                  }

                  const isSelf = i === j;

                  return (
                    <td
                      key={colSymbol}
                      className={`matrix-cell ${isSelf ? 'diagonal' : ''}`}
                      style={{
                        background: isSelf ? 'rgba(255,255,255,0.05)' : correlationColor(value),
                        color: isSelf ? 'rgba(255,255,255,0.35)' : textColor(value),
                      }}
                      title={`${rowSymbol} / ${colSymbol}: ${Number(value).toFixed(3)}`}
                    >
                      {isSelf ? '1.00' : Number(value).toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="matrix-legend">
        <span className="legend-label">-1</span>
        <div className="legend-gradient" />
        <span className="legend-label">+1</span>
      </div>
    </div>
  );
}