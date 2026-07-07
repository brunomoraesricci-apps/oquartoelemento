type TimelineItem = {
  year: string;
  title: string;
  text: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <section id="timeline" className="section timeline terminalPanel">
      <h2><span>+</span> Linha do tempo</h2>
      <div className="timelineGrid">
        {items.map((item) => (
          <div key={`${item.year}-${item.title}`}>
            <strong>{item.year}</strong>
            <b>{item.title}</b>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
