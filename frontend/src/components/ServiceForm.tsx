import { useState } from 'react';
import type { Service } from '../types';
import { buttonPrimaryClass, buttonSecondaryClass, formClass, inputClass, labelClass } from '../utils/formStyles';

type ServiceFormProps = {
  initial?: Service;
  onSubmit: (data: {
    name: string;
    description?: string;
    durationMin: number;
    price: number;
  }) => Promise<void>;
  onCancel: () => void;
};

export function ServiceForm({ initial, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [durationMin, setDurationMin] = useState(String(initial?.durationMin ?? 30));
  const [price, setPrice] = useState(String(initial?.price ?? 25));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        description: description || undefined,
        durationMin: Number(durationMin),
        price: Number(price),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <div>
        <label className={labelClass}>Name</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Duration (min)</label>
          <input
            type="number"
            min={5}
            className={inputClass}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Price ($)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className={buttonPrimaryClass}>
          {loading ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className={buttonSecondaryClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}
