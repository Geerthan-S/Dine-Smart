export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-white/10 border-t-orange-400 shadow-[0_0_34px_rgba(249,115,22,0.24)]`}
        role="status"
        aria-label={text || 'Loading'}
      />
      {text && <p className="text-sm font-medium text-slate-400">{text}</p>}
    </div>
  );
}
