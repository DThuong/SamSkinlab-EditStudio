import type { DesignLayer } from '../../types/layer';

type Props = {
  layer: DesignLayer;
  selected?: boolean;
  exportMode?: boolean;
  showFrame?: boolean;
  onClick?: () => void;
};

export default function LayerRenderer({
  layer,
  selected,
  exportMode = false,
  showFrame = true,
  onClick,
}: Props) {
  const showEditorFrame = !exportMode && showFrame;

  const commonStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    opacity: layer.opacity ?? 1,
    borderRadius: layer.borderRadius,
    overflow: 'hidden',
    cursor: exportMode ? 'default' : 'move',

    outline: showEditorFrame
      ? selected
        ? '2px dashed #38bdf8'
        : '1.5px dashed rgba(255,255,255,0.82)'
      : 'none',

    outlineOffset: showEditorFrame ? '-2px' : undefined,

    boxShadow: showEditorFrame
      ? selected
        ? '0 0 0 3px rgba(56,189,248,0.32), 0 10px 28px rgba(0,0,0,0.22)'
        : '0 0 0 1px rgba(0,0,0,0.22)'
      : 'none',
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };

  if (layer.type === 'box') {
    return (
      <div onClick={onClick} style={wrapperStyle}>
        {showEditorFrame && selected && <LayerBadge name={layer.name} />}

        <div
          style={{
            ...commonStyle,
            background: layer.background,
            border: `${layer.borderWidth ?? 0}px solid ${
              layer.borderColor ?? 'transparent'
            }`,
          }}
        />
      </div>
    );
  }

  if (layer.type === 'service-list') {
    return (
      <div onClick={onClick} style={wrapperStyle}>
        {showEditorFrame && selected && <LayerBadge name={layer.name} />}

        <div
          style={{
            ...commonStyle,
            color: layer.color,
            background: layer.background,
            fontSize: layer.fontSize,
            fontWeight: layer.fontWeight,
            lineHeight: layer.lineHeight,
            padding: layer.padding ?? 4,
          }}
        >
          {(layer.services ?? []).map((service, index) => (
            <div
              key={`${service}-${index}`}
              style={{
                display: 'flex',
                gap: 8,
                paddingBottom: 5,
                marginBottom: 5,
                borderBottom: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <span style={{ color: '#d8bd7f', flex: '0 0 auto' }}>•</span>
              <span>{service}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} style={wrapperStyle}>
      {showEditorFrame && selected && <LayerBadge name={layer.name} />}

      <div
        style={{
          ...commonStyle,
          color: layer.color,
          background: layer.background,
          fontSize: layer.fontSize,
          fontWeight: layer.fontWeight,
          textAlign: layer.textAlign,
          letterSpacing: layer.letterSpacing,
          lineHeight: layer.lineHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            layer.textAlign === 'center'
              ? 'center'
              : layer.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
          padding: `0 ${layer.padding ?? 4}px`,
          whiteSpace: 'pre-wrap',
        }}
      >
        {layer.text}
      </div>
    </div>
  );
}

function LayerBadge({ name }: { name: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: -24,
        zIndex: 999,
        maxWidth: '100%',
        borderRadius: 999,
        background: '#38bdf8',
        color: '#020617',
        padding: '4px 9px',
        fontSize: 11,
        fontWeight: 800,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.28)',
      }}
    >
      {name}
    </div>
  );
}