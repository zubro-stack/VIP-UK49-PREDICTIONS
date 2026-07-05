import { Card } from '../components/ui/Card';

export function ComingSoon({ title, note }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>{title}</h1>
      <Card>
        <p style={{ color: 'var(--t2)', margin: 0 }}>
          {note ?? "Ce module fait partie du plan de migration mais n'a pas encore été porté sur la nouvelle architecture."}
        </p>
      </Card>
    </div>
  );
}
