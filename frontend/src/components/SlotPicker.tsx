import { format } from 'date-fns';
import type { Slot } from '../types';

type SlotPickerProps = {
  slots: Slot[];
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
  loading?: boolean;
};

export function SlotPicker({ slots, selected, onSelect, loading }: SlotPickerProps) {
  if (loading) {
    return <p className="text-sm text-slate-400">Loading available slots…</p>;
  }

  if (!slots.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-400">
        No available slots for this date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selected?.startTime === slot.startTime;
        return (
          <button
            key={slot.startTime}
            type="button"
            onClick={() => onSelect(slot)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              isSelected
                ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-500/50'
            }`}
          >
            {format(new Date(slot.startTime), 'p')}
          </button>
        );
      })}
    </div>
  );
}
