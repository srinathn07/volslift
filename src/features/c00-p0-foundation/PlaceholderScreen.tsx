interface PlaceholderScreenProps {
  title: string;
}

export default function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        paddingTop: 'var(--space-6)',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--text-22)',
          fontWeight: 600,
          color: 'var(--ink)',
        }}
      >
        {title}
      </h1>
    </div>
  );
}
