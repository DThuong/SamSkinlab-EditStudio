import { bubbleTemplates } from '../data/bubbleTemplates';
import type { BubbleTemplateId } from '../types/bubble';

type Props = {
  activeTemplate: BubbleTemplateId;
  onChange: (id: BubbleTemplateId) => void;
};

export default function TemplatePicker({ activeTemplate, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {bubbleTemplates.map((template) => {
        const active = activeTemplate === template.id;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={[
              'rounded-2xl border p-3 text-left transition active:scale-[0.98]',
              active ? 'border-zinc-950 bg-zinc-950 text-white shadow-lg' : 'border-zinc-200 bg-white hover:border-zinc-950',
            ].join(' ')}
          >
            <p className="text-sm font-bold">{template.name}</p>
            <p className={['mt-1 line-clamp-2 text-[11px] leading-relaxed', active ? 'text-white/65' : 'text-zinc-500'].join(' ')}>
              {template.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
