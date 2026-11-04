import { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SelectDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    isRTL?: boolean;
}

export function SelectDropdown({ options, value, onChange, label, isRTL }: SelectDropdownProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const current = options.find((o) => o.value === value) ?? options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center gap-3" ref={dropdownRef}>
            {label && <span className="text-sm text-slate-300">{label}</span>}
            <div className="relative">
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/70 backdrop-blur border border-slate-700/60 text-slate-200 text-sm hover:border-slate-600 transition-all min-w-[120px]"
                    onClick={() => setOpen(!open)}
                    type="button"
                >
                    <span className="flex-1 text-left">{current.label}</span>
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`transition-transform ${open ? 'rotate-180' : ''}`}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {open && (
                    <div className="absolute left-0 mt-2 w-full bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-xl overflow-hidden z-50">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                className={`w-full flex items-center px-4 py-2 text-sm hover:bg-slate-700/40 transition-colors ${value === opt.value ? 'bg-slate-700/30 text-blue-400' : 'text-slate-200'}`}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                type="button"
                            >
                                <span className="flex-1 text-left">{opt.label}</span>
                                {value === opt.value && (
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
