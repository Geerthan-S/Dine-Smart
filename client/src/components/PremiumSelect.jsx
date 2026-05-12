import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export default function PremiumSelect({ label, value, onChange, options, placeholder = 'Select option' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const choose = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="premium-select">
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgb(var(--faint))' }}>{label}</label>
      <button
        type="button"
        className={`premium-select-trigger ${open ? 'premium-select-trigger-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} style={{ color: open ? 'rgb(var(--accent))' : 'rgb(var(--faint))' }} aria-hidden="true" />
      </button>

      {open && (
        <div id={listboxId} role="listbox" className="premium-select-menu">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value || option.label}
                type="button"
                role="option"
                aria-selected={active}
                className={`premium-select-option ${active ? 'premium-select-option-active' : ''}`}
                onClick={() => choose(option.value)}
              >
                <span>{option.label}</span>
                {active && <Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
