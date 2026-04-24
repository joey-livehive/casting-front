import './redesign.css';

export default function NoirLayout({ children }: { children: React.ReactNode }) {
  return <div className="noir-scoped">{children}</div>;
}
