type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-10 text-center">
      <h3 className="text-lg font-medium text-slate-200">{title}</h3>
      {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
    </div>
  );
}
