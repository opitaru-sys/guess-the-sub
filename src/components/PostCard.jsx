export default function PostCard({ title }) {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3 text-text-muted text-sm">
        <div className="w-6 h-6 rounded-full bg-bg-elevated" />
        <span>u/???</span>
        <span>in</span>
        <span className="font-semibold text-accent">r/???</span>
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-text-primary leading-snug text-left">
        {title}
      </h2>
    </div>
  )
}
