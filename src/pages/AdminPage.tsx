import { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react';
import { defaultBubbleContent } from '../data/bubbleTemplates';
import { loadContent, resetContent, saveContent } from '../utils/storage';
import type { BubbleContent } from '../types/bubble';

export default function AdminPage() {
  const [content, setContent] = useState<BubbleContent>(() => loadContent());
  const serviceText = useMemo(() => content.services.join('\n'), [content.services]);
  const [message, setMessage] = useState('');

  function updateContent<K extends keyof BubbleContent>(key: K, value: BubbleContent[K]) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    saveContent(content);
    setMessage('Đã lưu nội dung. Quay lại trang thiết kế để dùng nội dung mới.');
    window.setTimeout(() => setMessage(''), 2800);
  }

  function handleReset() {
    resetContent();
    setContent(defaultBubbleContent);
    setMessage('Đã reset về nội dung mặc định.');
    window.setTimeout(() => setMessage(''), 2800);
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] px-3 py-5 text-zinc-950 lg:px-6 lg:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-sm"><ArrowLeft size={17} /> Về trang thiết kế</a>
          <button onClick={handleReset} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-sm"><RotateCcw size={17} /> Reset</button>
        </div>

        <section className="rounded-[30px] bg-white p-4 shadow-sm lg:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">Admin content</p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">Quản lý nội dung bubble</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">Trang này dùng để đổi nội dung mặc định cho toàn bộ template. Hiện tại lưu bằng localStorage để dễ chạy demo. Khi có backend, bạn chỉ cần thay phần save/load trong <b>src/utils/storage.ts</b>.</p>

          {message && <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}

          <div className="mt-6 grid gap-4">
            <Input label="Tên thương hiệu" value={content.brand} onChange={(value) => updateContent('brand', value)} />
            <Input label="Subtitle" value={content.subtitle} onChange={(value) => updateContent('subtitle', value)} />
            <Input label="Số điện thoại" value={content.phone} onChange={(value) => updateContent('phone', value)} />
            <Input label="Facebook" value={content.facebook} onChange={(value) => updateContent('facebook', value)} />
            <Input label="Địa chỉ" value={content.address} onChange={(value) => updateContent('address', value)} />
            <div>
              <label className="mb-2 block text-sm font-bold">Danh sách dịch vụ</label>
              <textarea
                value={serviceText}
                rows={13}
                onChange={(e) => updateContent('services', e.target.value.split('\n').map((item) => item.trim()).filter(Boolean))}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-950"
              />
              <p className="mt-2 text-xs text-zinc-500">Mỗi dòng là một dịch vụ. Các template sẽ tự lấy danh sách này để hiển thị.</p>
            </div>
          </div>

          <button onClick={handleSave} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-black text-white hover:bg-zinc-800">
            <Save size={18} /> Lưu nội dung
          </button>
        </section>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-950" />
    </div>
  );
}
