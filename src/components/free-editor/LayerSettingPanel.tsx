import type { DesignLayer } from '../../types/layer';

type Props = {
  layer?: DesignLayer;
  onChange: (layer: DesignLayer) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (layer: DesignLayer) => void;
  onBringForward?: (id: string) => void;
  onSendBackward?: (id: string) => void;
};

export default function LayerSettingPanel({ layer, onChange, onDelete, onDuplicate, onBringForward, onSendBackward }: Props) {
  if (!layer) {
    return <div className="rounded-2xl bg-white p-4 text-sm text-zinc-500 shadow-sm">Chọn một element trên ảnh để chỉnh chữ, màu, width, height.</div>;
  }

  function update<K extends keyof DesignLayer>(key: K, value: DesignLayer[K]) {
    if (!layer) return;
    onChange({ ...layer, [key]: value });
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Đang chỉnh</p>
        <h3 className="font-bold">{layer.name}</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onDuplicate?.(layer)} className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold hover:bg-zinc-200">Nhân đôi</button>
        <button type="button" onClick={() => onDelete?.(layer.id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">Xóa</button>
        <button type="button" onClick={() => onBringForward?.(layer.id)} className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold hover:bg-zinc-200">Lên trên</button>
        <button type="button" onClick={() => onSendBackward?.(layer.id)} className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold hover:bg-zinc-200">Xuống dưới</button>
      </div>

      {layer.type !== 'box' && (
        <>
          {layer.type === 'text' && (
            <div>
              <label className="mb-1 block text-xs font-bold">Nội dung</label>
              <textarea value={layer.text ?? ''} rows={3} onChange={(e) => update('text', e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950" />
            </div>
          )}

          {layer.type === 'service-list' && (
            <div>
              <label className="mb-1 block text-xs font-bold">Danh sách dịch vụ</label>
              <textarea
                value={(layer.services ?? []).join('\n')}
                rows={8}
                onChange={(e) =>
                  update(
                    'services',
                    e.target.value
                      .split('\n')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Font size" value={layer.fontSize ?? 16} onChange={(value) => update('fontSize', value)} />
            <NumberInput label="Font weight" value={layer.fontWeight ?? 400} step={100} onChange={(value) => update('fontWeight', value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Letter spacing" value={layer.letterSpacing ?? 0} onChange={(value) => update('letterSpacing', value)} />
            <NumberInput label="Line height" value={layer.lineHeight ?? 1.2} step={0.05} onChange={(value) => update('lineHeight', value)} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold">Căn chữ</label>
            <select value={layer.textAlign ?? 'left'} onChange={(e) => update('textAlign', e.target.value as DesignLayer['textAlign'])} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950">
              <option value="left">Trái</option>
              <option value="center">Giữa</option>
              <option value="right">Phải</option>
            </select>
          </div>

          <ColorInput label="Màu chữ" value={normalizeColor(layer.color)} onChange={(value) => update('color', value)} />
        </>
      )}

      <ColorInput label="Màu nền" value={normalizeColor(layer.background)} onChange={(value) => update('background', value)} />

      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Bo góc" value={layer.borderRadius ?? 0} onChange={(value) => update('borderRadius', value)} />
        <NumberInput label="Opacity" value={layer.opacity ?? 1} step={0.05} min={0} max={1} onChange={(value) => update('opacity', value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Width" value={layer.width} onChange={(value) => update('width', value)} />
        <NumberInput label="Height" value={layer.height} onChange={(value) => update('height', value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="X" value={layer.x} onChange={(value) => update('x', value)} />
        <NumberInput label="Y" value={layer.y} onChange={(value) => update('y', value)} />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, step = 1, min, max }: { label: string; value: number; step?: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold">{label}</label>
      <input type="number" value={value} step={step} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950" />
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold">{label}</label>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-xl border border-zinc-200" />
    </div>
  );
}

function normalizeColor(value?: string) {
  if (!value) return '#000000';
  if (value.startsWith('#')) return value;
  if (value.startsWith('rgb')) return '#000000';
  return '#000000';
}
