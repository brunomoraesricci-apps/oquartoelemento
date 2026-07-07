type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a>
      {items.map((item) => (
        <span key={item.label}>
          <i>›</i>
          {item.href ? <a href={item.href}>{item.label}</a> : <b>{item.label}</b>}
        </span>
      ))}
    </nav>
  );
}
