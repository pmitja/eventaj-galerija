export function EventTrustBand({ items }: { items: readonly string[] }) {
  return (
    <div className="event-trust-band">
      <div className="event-trust-band__inner shell" role="list">
        {items.map((item) => (
          <span key={item} role="listitem">{item}</span>
        ))}
      </div>
    </div>
  );
}
