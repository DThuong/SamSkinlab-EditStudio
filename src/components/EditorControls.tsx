import { Download, ImagePlus, RotateCcw } from 'lucide-react';
import type { BubbleContent } from '../types/bubble';

type Props = {
  content: BubbleContent;
  opacity: number;
  accentColor: string;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onResetBox: () => void;
  onOpacityChange: (value: number) => void;
  onAccentColorChange: (value: string) => void;
  onContentChange: <K extends keyof BubbleContent>(key: K, value: BubbleContent[K]) => void;
};

export default function EditorControls({
  content,
  opacity,
  accentColor,
  onImageUpload,
  onExport,
  onResetBox,
  onOpacityChange,
  onAccentColorChange,
  onContentChange,
}: Props) {
  const serviceText = content.services.join('\n');

  return (
    <div className="space-y-4 rounded-[28px] bg-white p-4 shadow-sm lg:sticky lg:top-4">
      <div>
        <label className="mb-2 block text-sm font-bold">Upload hình ảnh</label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm font-semibold hover:bg-zinc-100">
          <ImagePlus size={18} />
          <span>Chọn ảnh từ máy</span>
          <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onResetBox} type="button" className="flex items-center justify-center gap-2 rounded-xl bg-zinc-200 px-3 py-3 text-sm font-bold hover:bg-zinc-300">
          <RotateCcw size={16} /> Reset
        </button>
        <button onClick={onExport} type="button" className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 py-3 text-sm font-bold text-white hover:bg-zinc-800">
          <Download size={16} /> Tải PNG
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-3">
        <div>
          <label className="mb-1 block text-xs font-bold">Độ trong</label>
          <input type="range" min="0.45" max="1" step="0.01" value={opacity} onChange={(e) => onOpacityChange(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold">Màu nhấn</label>
          <input type="color" value={accentColor} onChange={(e) => onAccentColorChange(e.target.value)} className="h-9 w-full rounded-lg border" />
        </div>
      </div>

      <details className="group rounded-2xl border border-zinc-200 p-3" open>
        <summary className="cursor-pointer select-none text-sm font-bold">Chỉnh nội dung nhanh</summary>
        <div className="mt-3 space-y-3">
          <Input label="Tên thương hiệu" value={content.brand} onChange={(value) => onContentChange('brand', value)} />
          <Input label="Subtitle" value={content.subtitle} onChange={(value) => onContentChange('subtitle', value)} />
          <Input label="Số điện thoại" value={content.phone} onChange={(value) => onContentChange('phone', value)} />
          <Input label="Facebook" value={content.facebook} onChange={(value) => onContentChange('facebook', value)} />
          <Input label="Địa chỉ" value={content.address} onChange={(value) => onContentChange('address', value)} />
          <div>
            <label className="mb-1 block text-xs font-bold">Danh sách dịch vụ</label>
            <textarea
              value={serviceText}
              rows={8}
              onChange={(e) =>
                onContentChange(
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
        </div>
      </details>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950" />
    </div>
  );
}
