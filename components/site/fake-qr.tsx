/** Deterministic pseudo-random in [0, 1) so server and client agree. */
const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

/** A decorative 21×21 QR-like pattern with the three finder squares. Not scannable. */
function qrCells(): boolean[] {
  const size = 21;
  const cells: boolean[] = [];
  const finder = (r: number, c: number) => {
    for (const [or, oc] of [[0, 0], [0, 14], [14, 0]]) {
      const y = r - or, x = c - oc;
      if (y >= 0 && y < 7 && x >= 0 && x < 7) return y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4) ? 1 : 0;
      if (y >= -1 && y <= 7 && x >= -1 && x <= 7) return 0;
    }
    return -1;
  };
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const f = finder(r, c);
      cells.push(f === -1 ? (r === 6 || c === 6 ? (r + c) % 2 === 0 : rnd(r * 21 + c, 3) > 0.52) : f === 1);
    }
  }
  return cells;
}

const CELLS = qrCells();

export function FakeQr({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`grid grid-cols-[repeat(21,1fr)] ${className ?? ""}`}
    >
      {CELLS.map((on, index) => <span key={index} className={on ? "bg-gm-ink" : "bg-transparent"} />)}
    </div>
  );
}
