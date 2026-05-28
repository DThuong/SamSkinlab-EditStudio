import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { toBlob } from "html-to-image";
import { ImagePlus, Menu, Plus, Trash2, Type, X } from "lucide-react";
import BubbleRenderer from "../components/BubbleRenderer";
import EditorControls from "../components/EditorControls";
import TemplatePicker from "../components/TemplatePicker";
import { bubbleTemplates } from "../data/bubbleTemplates";
import { createDefaultDesignLayers } from "../data/defaultLayers";
import { loadContent } from "../utils/storage";
import type {
  BubbleBox,
  BubbleContent,
  BubbleTemplateId,
} from "../types/bubble";
import type { DesignLayer } from "../types/layer";
import LayerRenderer from "../components/free-editor/LayerRenderer";
import LayerSettingPanel from "../components/free-editor/LayerSettingPanel";

type CanvasRatioId =
  | "9:16"
  | "16:9"
  | "1:1"
  | "4:5"
  | "5:4"
  | "3:4"
  | "4:3"
  | "original";

type ImageFit = "contain" | "cover";

type BubblePinchState = {
  startDistance: number;
  startWidth: number;
  startHeight: number;
};

type PinchState = {
  layerId: string;
  startDistance: number;
  startLayer: DesignLayer;
};

type LayerResizeState = {
  layerId: string;
  startLayer: DesignLayer;
};

type ImageTransform = {
  x: number;
  y: number;
  scale: number;
};

type BackgroundGesture =
  | {
      mode: "pan";
      startX: number;
      startY: number;
      startTransform: ImageTransform;
    }
  | {
      mode: "pinch";
      startDistance: number;
      startTransform: ImageTransform;
    };

const ratioOptions: {
  id: CanvasRatioId;
  label: string;
  value: number | null;
  description: string;
}[] = [
  { id: "9:16", label: "9:16", value: 9 / 16, description: "Story/Reels" },
  { id: "16:9", label: "16:9", value: 16 / 9, description: "Ảnh ngang" },
  { id: "1:1", label: "1:1", value: 1, description: "Vuông" },
  { id: "4:5", label: "4:5", value: 4 / 5, description: "Facebook/IG" },
  { id: "5:4", label: "5:4", value: 5 / 4, description: "Ngang nhẹ" },
  { id: "3:4", label: "3:4", value: 3 / 4, description: "Ảnh dọc" },
  { id: "4:3", label: "4:3", value: 4 / 3, description: "Ngang cổ điển" },
  {
    id: "original",
    label: "Gốc",
    value: null,
    description: "Theo ảnh upload",
  },
];

const MIN_IMAGE_SCALE = 0.3;
const MAX_IMAGE_SCALE = 5;
const SAVED_DESIGN_KEY = "sam-bubble-studio-last-design";

const FONT_OPTIONS = [
  { label: "Mặc định", value: "inherit" },
  {
    label: "Sans hiện đại",
    value:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Serif sang", value: "Georgia, 'Times New Roman', serif" },
  { label: "Cormorant", value: "'Cormorant Garamond', Georgia, serif" },
  { label: "Josefin", value: "'Josefin Sans', Arial, sans-serif" },
  {
    label: "Mono",
    value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
] as const;

function getLayerFontFamily(layer?: DesignLayer) {
  if (!layer || layer.type === "box") return "inherit";

  const value = (layer as DesignLayer & { fontFamily?: string }).fontFamily;
  return typeof value === "string" && value.trim() ? value : "inherit";
}

type SavedDesignState = {
  imageUrl: string;
  imageNaturalRatio: number;
  imageTransform: ImageTransform;
  canvasRatioId: CanvasRatioId;
  imageFit: ImageFit;
  canvasBgColor: string;
  templateId: BubbleTemplateId;
  content: BubbleContent;
  opacity: number;
  accentColor: string;
  freeEdit: boolean;
  backgroundEditMode: boolean;
  showLayerFrames: boolean;
  layers: DesignLayer[];
  selectedLayerId: string;
  bubbleBox: BubbleBox;
  parentEditBaseBox?: BubbleBox | null;
  savedAt: string;
};

type MarqueeBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type MarqueeDragState = {
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  moved: boolean;
};

type GroupDragState = {
  startX: number;
  startY: number;
  layerStartPositions: Record<string, { x: number; y: number }>;
};

function readSavedDesign(): SavedDesignState | null {
  try {
    const raw = localStorage.getItem(SAVED_DESIGN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedDesignState;
  } catch (error) {
    console.warn("Cannot read saved design:", error);
    return null;
  }
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Cannot load image for export"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Không tạo được PNG từ canvas."));
      },
      "image/png",
      1,
    );
  });
}

export default function DesignPage() {
  const captureRef = useRef<HTMLDivElement | null>(null);
  const pinchRef = useRef<PinchState | null>(null);
  const layerResizeRef = useRef<LayerResizeState | null>(null);
  const backgroundGestureRef = useRef<BackgroundGesture | null>(null);
  const layerDragRef = useRef(false);
  const layerDragPositionRef = useRef<Record<string, { x: number; y: number }>>(
    {},
  );
  const inlineEditorRefs = useRef<Record<string, HTMLTextAreaElement | null>>(
    {},
  );
  const marqueeDragRef = useRef<MarqueeDragState | null>(null);
  const groupDragRef = useRef<GroupDragState | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [imageNaturalRatio, setImageNaturalRatio] = useState<number>(9 / 16);
  const [imageTransform, setImageTransform] = useState<ImageTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [freeEditScale, setFreeEditScale] = useState(1);
  const freeEditScaleRef = useRef(1);

  const [canvasRatioId, setCanvasRatioId] = useState<CanvasRatioId>("9:16");
  const [imageFit, setImageFit] = useState<ImageFit>("contain");
  const [canvasBgColor, setCanvasBgColor] = useState("#ffffff");

  const [templateId, setTemplateId] =
    useState<BubbleTemplateId>("left-service-panel");

  const [content, setContent] = useState<BubbleContent>(() => loadContent());
  const [opacity, setOpacity] = useState(0.92);
  const [accentColor, setAccentColor] = useState("#d8bd7f");

  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [mobileCanvasFullscreen, setMobileCanvasFullscreen] = useState(false);
  const [mobileTextEditorOpen, setMobileTextEditorOpen] = useState(false);
  const [mobileTextDraft, setMobileTextDraft] = useState("");

  const [freeEdit, setFreeEdit] = useState(false);
  const [parentEditBaseBox, setParentEditBaseBox] = useState<BubbleBox | null>(
    null,
  );
  const [backgroundEditMode, setBackgroundEditMode] = useState(false);
  const [showLayerFrames, setShowLayerFrames] = useState(true);
  const [layers, setLayers] = useState<DesignLayer[]>(() =>
    createDefaultDesignLayers(loadContent(), "left-service-panel"),
  );
  const [selectedLayerId, setSelectedLayerId] = useState("brand");
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(["brand"]);
  const [marqueeBox, setMarqueeBox] = useState<MarqueeBox | null>(null);
  const [exportMode, setExportMode] = useState(false);
  const [pinchingLayerId, setPinchingLayerId] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);

  const [exportPreviewUrl, setExportPreviewUrl] = useState("");
  const [exportFileName, setExportFileName] = useState("");
  const bubblePinchRef = useRef<BubblePinchState | null>(null);

  const activeTemplate = useMemo(
    () =>
      bubbleTemplates.find((item) => item.id === templateId) ??
      bubbleTemplates[0],
    [templateId],
  );

  const selectedRatio = useMemo(
    () =>
      ratioOptions.find((item) => item.id === canvasRatioId) ?? ratioOptions[0],
    [canvasRatioId],
  );

  const canvasAspectRatio = selectedRatio.value ?? imageNaturalRatio;

  const [bubbleBox, setBubbleBox] = useState<BubbleBox>(
    activeTemplate.defaultBox,
  );

  useEffect(() => {
    const saved = readSavedDesign();
    if (!saved) return;

    setImageUrl(saved.imageUrl ?? "");
    setImageNaturalRatio(saved.imageNaturalRatio || 9 / 16);
    setImageTransform(saved.imageTransform ?? { x: 0, y: 0, scale: 1 });
    setCanvasRatioId(saved.canvasRatioId ?? "9:16");
    setImageFit(saved.imageFit ?? "contain");
    setCanvasBgColor(saved.canvasBgColor ?? "#ffffff");
    setTemplateId(saved.templateId ?? "left-service-panel");
    setContent(saved.content ?? loadContent());
    setOpacity(typeof saved.opacity === "number" ? saved.opacity : 0.92);
    setAccentColor(saved.accentColor ?? "#d8bd7f");
    setFreeEdit(Boolean(saved.freeEdit));
    setBackgroundEditMode(Boolean(saved.backgroundEditMode));
    setShowLayerFrames(saved.showLayerFrames ?? true);
    setLayers(
      Array.isArray(saved.layers) && saved.layers.length > 0
        ? saved.layers
        : createDefaultDesignLayers(
            saved.content ?? loadContent(),
            saved.templateId ?? "left-service-panel",
          ),
    );
    setSelectedLayerId(saved.selectedLayerId ?? "brand");
    setSelectedLayerIds(
      saved.selectedLayerId ? [saved.selectedLayerId] : ["brand"],
    );
    setBubbleBox(saved.bubbleBox ?? activeTemplate.defaultBox);
    setParentEditBaseBox(saved.parentEditBaseBox ?? null);
  }, []);

  const selectedLayer = layers.find((item) => item.id === selectedLayerId);
  const selectedLayerFontFamily = getLayerFontFamily(selectedLayer);
  const canDeleteSelectedLayers =
    freeEdit &&
    selectedLayerIds.length > 0 &&
    layers.length > selectedLayerIds.length;
  const editingLayer = layers.find((item) => item.id === editingLayerId);
  const selectedGroupLayers = layers.filter((item) =>
    selectedLayerIds.includes(item.id),
  );
  const selectedGroupBox =
    selectedGroupLayers.length > 1
      ? getLayersBoundingBox(selectedGroupLayers)
      : null;

  // Base size của template cha. Khi resize/zoom template cha, toàn bộ nội dung
  // bên trong sẽ được scale theo base này để chữ, icon, padding và layout
  // không bị lệch khỏi khung trên mobile.
  const parentBubbleBaseBox = activeTemplate.defaultBox;
  const parentBubbleAspectRatio =
    parentBubbleBaseBox.width / Math.max(parentBubbleBaseBox.height, 1);
  const parentBubbleScaleX =
    bubbleBox.width / Math.max(parentBubbleBaseBox.width, 1);
  const parentBubbleScaleY =
    bubbleBox.height / Math.max(parentBubbleBaseBox.height, 1);
  const parentBubbleMinWidth = 170;
  const parentBubbleMinHeight = Math.max(
    120,
    Math.round(parentBubbleMinWidth / parentBubbleAspectRatio),
  );

  function readPixelValue(value: string) {
    const parsed = Number.parseFloat(value.replace("px", ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function waitForImages(node: HTMLElement) {
    const images = Array.from(node.querySelectorAll("img"));

    return Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete && image.naturalWidth > 0) {
              resolve();
              return;
            }

            image.onload = () => resolve();
            image.onerror = () => resolve();
          }),
      ),
    );
  }

  const editorFrameStyle: React.CSSProperties = {
    outline: exportMode ? "none" : "2px dashed rgba(56,189,248,0.95)",
    outlineOffset: exportMode ? undefined : "-2px",
    boxShadow: exportMode
      ? "none"
      : "0 0 0 3px rgba(56,189,248,0.24), 0 12px 30px rgba(0,0,0,0.25)",
  };

  const parentBubbleFrameStyle: React.CSSProperties = {
    ...editorFrameStyle,
    borderRadius: 28,
  };

  const transparentHandleStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    boxShadow: "none",
    zIndex: 80,
  };

  function getDashedResizeHandleStyles(selected: boolean) {
    if (!selected || exportMode || backgroundEditMode) {
      return {
        top: { ...transparentHandleStyle, height: 0 },
        right: { ...transparentHandleStyle, width: 0 },
        bottom: { ...transparentHandleStyle, height: 0 },
        left: { ...transparentHandleStyle, width: 0 },
        topLeft: { ...transparentHandleStyle, width: 0, height: 0 },
        topRight: { ...transparentHandleStyle, width: 0, height: 0 },
        bottomLeft: { ...transparentHandleStyle, width: 0, height: 0 },
        bottomRight: { ...transparentHandleStyle, width: 0, height: 0 },
      };
    }

    return {
      top: {
        ...transparentHandleStyle,
        height: 18,
        top: -9,
        left: 14,
        right: 14,
        cursor: "ns-resize",
      },
      bottom: {
        ...transparentHandleStyle,
        height: 18,
        bottom: -9,
        left: 14,
        right: 14,
        cursor: "ns-resize",
      },
      left: {
        ...transparentHandleStyle,
        width: 18,
        left: -9,
        top: 14,
        bottom: 14,
        cursor: "ew-resize",
      },
      right: {
        ...transparentHandleStyle,
        width: 18,
        right: -9,
        top: 14,
        bottom: 14,
        cursor: "ew-resize",
      },
      topLeft: {
        ...transparentHandleStyle,
        width: 28,
        height: 28,
        left: -10,
        top: -10,
        cursor: "nwse-resize",
      },
      topRight: {
        ...transparentHandleStyle,
        width: 28,
        height: 28,
        right: -10,
        top: -10,
        cursor: "nesw-resize",
      },
      bottomLeft: {
        ...transparentHandleStyle,
        width: 28,
        height: 28,
        left: -10,
        bottom: -10,
        cursor: "nesw-resize",
      },
      bottomRight: {
        ...transparentHandleStyle,
        width: 28,
        height: 28,
        right: -10,
        bottom: -10,
        cursor: "nwse-resize",
      },
    };
  }

  async function waitForFonts() {
    const fonts = document.fonts;

    if (!fonts?.ready) return;

    try {
      await fonts.ready;
    } catch (error) {
      console.warn("Font ready check failed:", error);
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return;

      const image = new Image();

      image.onload = () => {
        if (image.width > 0 && image.height > 0) {
          setImageNaturalRatio(image.width / image.height);
        }

        setImageTransform({ x: 0, y: 0, scale: 1 });
        setImageUrl(result);
        setMobileControlsOpen(false);
      };

      image.onerror = () => {
        setImageTransform({ x: 0, y: 0, scale: 1 });
        setImageUrl(result);
        setMobileControlsOpen(false);
      };

      image.src = result;
    };

    reader.onerror = () => {
      alert("Không đọc được ảnh. Bạn thử chọn lại ảnh khác.");
    };

    reader.readAsDataURL(file);
  }

  function updateContent<K extends keyof BubbleContent>(
    key: K,
    value: BubbleContent[K],
  ) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function handleTemplateChange(nextTemplateId: BubbleTemplateId) {
    const nextTemplate =
      bubbleTemplates.find((item) => item.id === nextTemplateId) ??
      bubbleTemplates[0];

    setTemplateId(nextTemplateId);
    setBubbleBox(nextTemplate.defaultBox);

    const nextLayers = createDefaultDesignLayers(content, nextTemplateId);
    setLayers(nextLayers);

    const brandLayer = nextLayers.find((item) => item.id === "brand");
    const nextSelectedId = brandLayer?.id ?? nextLayers[0]?.id ?? "";
    setSelectedLayerId(nextSelectedId);
    setSelectedLayerIds(nextSelectedId ? [nextSelectedId] : []);

    setFreeEdit(true);
    setBackgroundEditMode(false);
  }

  function updateLayer(nextLayer: DesignLayer) {
    setLayers((prev) =>
      prev.map((item) => (item.id === nextLayer.id ? nextLayer : item)),
    );
  }

  function resetBubblePosition() {
    setImageTransform({ x: 0, y: 0, scale: 1 });

    if (freeEdit) {
      const nextLayers = createDefaultDesignLayers(content, templateId);
      setLayers(nextLayers);

      const brandLayer = nextLayers.find((item) => item.id === "brand");
      const nextSelectedId = brandLayer?.id ?? nextLayers[0]?.id ?? "";
      setSelectedLayerId(nextSelectedId);
      setSelectedLayerIds(nextSelectedId ? [nextSelectedId] : []);

      return;
    }

    setBubbleBox(activeTemplate.defaultBox);
  }

  function addTextLayer() {
    const id = `text-${Date.now()}`;
    const maxZ = Math.max(...layers.map((item) => item.zIndex ?? 1), 1);

    setLayers((prev) => [
      ...prev,
      {
        id,
        name: "Chữ mới",
        type: "text",
        x: 80,
        y: 120,
        width: 260,
        height: 52,
        zIndex: maxZ + 1,
        text: "Nhập nội dung",
        fontSize: 24,
        fontWeight: 700,
        color: "#ffffff",
        textAlign: "center",
        lineHeight: 1.15,
        padding: 4,
        fontFamily: "inherit",
      } as DesignLayer & { fontFamily: string },
    ]);

    setSelectedLayerId(id);
    setSelectedLayerIds([id]);
    setFreeEdit(true);
    setBackgroundEditMode(false);
  }

  function addBoxLayer() {
    const id = `box-${Date.now()}`;
    const maxZ = Math.max(...layers.map((item) => item.zIndex ?? 1), 1);

    setLayers((prev) => [
      ...prev,
      {
        id,
        name: "Nền mới",
        type: "box",
        x: 70,
        y: 100,
        width: 280,
        height: 90,
        zIndex: maxZ + 1,
        background: "rgba(0,0,0,0.55)",
        borderRadius: 22,
        opacity: 1,
      },
    ]);

    setSelectedLayerId(id);
    setSelectedLayerIds([id]);
    setFreeEdit(true);
    setBackgroundEditMode(false);
  }

  function duplicateLayer(layer: DesignLayer) {
    const id = `${layer.id}-copy-${Date.now()}`;
    const maxZ = Math.max(...layers.map((item) => item.zIndex ?? 1), 1);

    setLayers((prev) => [
      ...prev,
      {
        ...layer,
        id,
        name: `${layer.name} copy`,
        x: layer.x + 18,
        y: layer.y + 18,
        zIndex: maxZ + 1,
      },
    ]);

    setSelectedLayerId(id);
    setSelectedLayerIds([id]);
  }

  function deleteLayer(id: string) {
    if (layers.length <= 1) return;

    const fallback = layers.find((item) => item.id !== id);

    setLayers((prev) => prev.filter((item) => item.id !== id));

    if (fallback) {
      setSelectedLayerId(fallback.id);
      setSelectedLayerIds([fallback.id]);
    }

    if (editingLayerId === id) {
      setEditingLayerId(null);
      setMobileTextEditorOpen(false);
    }
  }

  function deleteSelectedLayers() {
    if (!freeEdit || selectedLayerIds.length === 0) return;

    const deleteSet = new Set(selectedLayerIds);
    const nextLayers = layers.filter((layer) => !deleteSet.has(layer.id));

    if (nextLayers.length === layers.length) return;

    if (nextLayers.length === 0) {
      alert(
        "Không thể xóa hết toàn bộ element. Cần giữ lại ít nhất 1 element.",
      );
      return;
    }

    const nextSelectedId = nextLayers[0]?.id ?? "";
    setLayers(nextLayers);
    setSelectedLayerId(nextSelectedId);
    setSelectedLayerIds(nextSelectedId ? [nextSelectedId] : []);

    if (editingLayerId && deleteSet.has(editingLayerId)) {
      setEditingLayerId(null);
      setMobileTextEditorOpen(false);
    }
  }

  function updateSelectedLayerFont(fontFamily: string) {
    if (!freeEdit || selectedLayerIds.length === 0) return;

    const selectedSet = new Set(selectedLayerIds);

    setLayers((prev) =>
      prev.map((layer) => {
        if (!selectedSet.has(layer.id) || layer.type === "box") return layer;

        return {
          ...layer,
          fontFamily,
        } as DesignLayer & { fontFamily: string };
      }),
    );
  }

  function bringForward(id: string) {
    setLayers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, zIndex: (item.zIndex ?? 1) + 1 } : item,
      ),
    );
  }

  function sendBackward(id: string) {
    setLayers((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, zIndex: Math.max(1, (item.zIndex ?? 1) - 1) }
          : item,
      ),
    );
  }

  function getTouchDistance(touches: React.TouchList) {
    if (touches.length < 2) return 0;

    const first = touches[0];
    const second = touches[1];

    return Math.hypot(
      second.clientX - first.clientX,
      second.clientY - first.clientY,
    );
  }

  function handleBubbleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (backgroundEditMode) return;
    if (event.touches.length !== 2) return;

    event.preventDefault();
    event.stopPropagation();

    bubblePinchRef.current = {
      startDistance: getTouchDistance(event.touches),
      startWidth: bubbleBox.width,
      startHeight: bubbleBox.height,
    };
  }

  function handleBubbleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (backgroundEditMode) return;

    const pinch = bubblePinchRef.current;
    if (!pinch || event.touches.length !== 2) return;

    event.preventDefault();
    event.stopPropagation();

    const currentDistance = getTouchDistance(event.touches);
    if (!currentDistance || !pinch.startDistance) return;

    const scale = currentDistance / pinch.startDistance;

    if (freeEdit) {
      // Trong freeEdit: scale toàn bộ wrapper div thay vì từng layer
      const nextScale = Math.max(0.3, Math.min(3, scale));
      freeEditScaleRef.current = nextScale;
      setFreeEditScale(nextScale);
    } else {
      setBubbleBox((prev) => ({
        ...prev,
        width: Math.max(170, Math.round(pinch.startWidth * scale)),
        height: Math.max(160, Math.round(pinch.startHeight * scale)),
      }));
    }
  }
  function handleBubbleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length < 2) {
      // Commit scale vào tọa độ thực của từng layer rồi reset scale về 1
      if (freeEdit && freeEditScaleRef.current !== 1) {
        const s = freeEditScaleRef.current;
        setLayers((prev) =>
          prev.map((layer) => ({
            ...layer,
            x: Math.round(layer.x * s),
            y: Math.round(layer.y * s),
            width: Math.max(8, Math.round(layer.width * s)),
            height: Math.max(8, Math.round(layer.height * s)),
            fontSize: layer.fontSize
              ? Math.max(6, Math.round(layer.fontSize * s))
              : layer.fontSize,
            padding: layer.padding
              ? Math.max(0, Math.round(layer.padding * s))
              : layer.padding,
            borderRadius: layer.borderRadius
              ? Math.max(0, Math.round(layer.borderRadius * s))
              : layer.borderRadius,
          })),
        );
        freeEditScaleRef.current = 1;
        setFreeEditScale(1);
      }

      bubblePinchRef.current = null;
    }
  }
  function handleLayerTouchStart(
    event: React.TouchEvent<HTMLDivElement>,
    layer: DesignLayer,
  ) {
    if (backgroundEditMode) return;

    selectSingleLayer(layer.id);

    if (event.touches.length !== 2) return;

    event.preventDefault();
    event.stopPropagation();

    pinchRef.current = {
      layerId: layer.id,
      startDistance: getTouchDistance(event.touches),
      startLayer: layer,
    };

    setPinchingLayerId(layer.id);
  }

  function handleLayerTouchMove(
    event: React.TouchEvent<HTMLDivElement>,
    layer: DesignLayer,
  ) {
    if (backgroundEditMode) return;

    const pinch = pinchRef.current;

    if (!pinch || pinch.layerId !== layer.id || event.touches.length !== 2) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const currentDistance = getTouchDistance(event.touches);
    if (!currentDistance || !pinch.startDistance) return;

    const scale = currentDistance / pinch.startDistance;
    const startLayer = pinch.startLayer;

    updateLayer(
      scaleLayerFromResize(
        startLayer,
        Math.max(28, Math.round(startLayer.width * scale)),
        Math.max(14, Math.round(startLayer.height * scale)),
        { x: startLayer.x, y: startLayer.y },
      ),
    );
  }

  function handleLayerTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length < 2) {
      pinchRef.current = null;
      setPinchingLayerId(null);
    }
  }

  function handleBackgroundTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (!backgroundEditMode) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.touches.length === 1) {
      backgroundGestureRef.current = {
        mode: "pan",
        startX: event.touches[0].clientX,
        startY: event.touches[0].clientY,
        startTransform: imageTransform,
      };
    }

    if (event.touches.length === 2) {
      backgroundGestureRef.current = {
        mode: "pinch",
        startDistance: getTouchDistance(event.touches),
        startTransform: imageTransform,
      };
    }
  }

  function handleBackgroundTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (!backgroundEditMode || !backgroundGestureRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    const gesture = backgroundGestureRef.current;

    if (gesture.mode === "pan" && event.touches.length === 1) {
      const dx = event.touches[0].clientX - gesture.startX;
      const dy = event.touches[0].clientY - gesture.startY;

      setImageTransform({
        ...gesture.startTransform,
        x: gesture.startTransform.x + dx,
        y: gesture.startTransform.y + dy,
      });
    }

    if (gesture.mode === "pinch" && event.touches.length === 2) {
      const currentDistance = getTouchDistance(event.touches);
      if (!currentDistance || !gesture.startDistance) return;

      const scale = currentDistance / gesture.startDistance;

      setImageTransform({
        ...gesture.startTransform,
        scale: clampImageScale(gesture.startTransform.scale * scale),
      });
    }
  }

  function handleBackgroundTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length === 0) {
      backgroundGestureRef.current = null;
    }
  }

  function clampImageScale(value: number) {
    return Math.max(MIN_IMAGE_SCALE, Math.min(MAX_IMAGE_SCALE, value));
  }

  function resetImageTransform() {
    setImageTransform({ x: 0, y: 0, scale: 1 });
  }

  function getLayersBoundingBox(sourceLayers = layers): BubbleBox {
    if (!sourceLayers.length) return activeTemplate.defaultBox;

    const minX = Math.min(...sourceLayers.map((layer) => layer.x));
    const minY = Math.min(...sourceLayers.map((layer) => layer.y));
    const maxX = Math.max(
      ...sourceLayers.map((layer) => layer.x + layer.width),
    );
    const maxY = Math.max(
      ...sourceLayers.map((layer) => layer.y + layer.height),
    );

    return {
      x: Math.round(minX),
      y: Math.round(minY),
      width: Math.max(40, Math.round(maxX - minX)),
      height: Math.max(40, Math.round(maxY - minY)),
    };
  }

  function scaleLayerFromBaseBox(
    layer: DesignLayer,
    baseBox: BubbleBox,
    targetBox: BubbleBox,
    absolutePosition = true,
  ): DesignLayer {
    const scaleX = targetBox.width / Math.max(baseBox.width, 1);
    const scaleY = targetBox.height / Math.max(baseBox.height, 1);
    const fontScale = (scaleX + scaleY) / 2;

    return {
      ...layer,
      x: Math.round(
        (absolutePosition ? targetBox.x : 0) + (layer.x - baseBox.x) * scaleX,
      ),
      y: Math.round(
        (absolutePosition ? targetBox.y : 0) + (layer.y - baseBox.y) * scaleY,
      ),
      width: Math.max(8, Math.round(layer.width * scaleX)),
      height: Math.max(8, Math.round(layer.height * scaleY)),
      fontSize: layer.fontSize
        ? Math.max(6, Math.round(layer.fontSize * fontScale))
        : layer.fontSize,
      padding: layer.padding
        ? Math.max(0, Math.round(layer.padding * fontScale))
        : layer.padding,
      borderRadius: layer.borderRadius
        ? Math.max(0, Math.round(layer.borderRadius * fontScale))
        : layer.borderRadius,
    };
  }

  function scaleOptionalPixelValue(
    value: number | undefined,
    scale: number,
    min = 0,
  ) {
    if (typeof value !== "number") return value;
    return Math.max(min, Math.round(value * scale));
  }

  function scaleLayerFromResize(
    startLayer: DesignLayer,
    nextWidth: number,
    nextHeight: number,
    position: { x: number; y: number },
  ): DesignLayer {
    const scaleX = nextWidth / Math.max(startLayer.width, 1);
    const scaleY = nextHeight / Math.max(startLayer.height, 1);
    const contentScale = (scaleX + scaleY) / 2;

    return {
      ...startLayer,
      x: Math.round(position.x),
      y: Math.round(position.y),
      width: Math.max(8, Math.round(nextWidth)),
      height: Math.max(8, Math.round(nextHeight)),
      fontSize: scaleOptionalPixelValue(startLayer.fontSize, contentScale, 6),
      padding: scaleOptionalPixelValue(startLayer.padding, contentScale, 0),
      borderRadius: scaleOptionalPixelValue(
        startLayer.borderRadius,
        contentScale,
        0,
      ),
      borderWidth: scaleOptionalPixelValue(
        startLayer.borderWidth,
        contentScale,
        0,
      ),
      letterSpacing:
        typeof startLayer.letterSpacing === "number"
          ? Number((startLayer.letterSpacing * contentScale).toFixed(2))
          : startLayer.letterSpacing,
    };
  }

  function commitParentBoxToLayers() {
    if (!parentEditBaseBox) return;

    setLayers((prev) =>
      prev.map((layer) =>
        scaleLayerFromBaseBox(layer, parentEditBaseBox, bubbleBox, true),
      ),
    );

    setParentEditBaseBox(null);
  }

  function handleFreeEditModeChange(nextValue: boolean) {
    setEditingLayerId(null);
    setMarqueeBox(null);

    if (nextValue) {
      commitParentBoxToLayers();
      setFreeEdit(true);
      setBackgroundEditMode(false);
      return;
    }

    const nextBaseBox = getLayersBoundingBox();
    setParentEditBaseBox(nextBaseBox);
    setBubbleBox(nextBaseBox);
    setFreeEdit(false);
    setBackgroundEditMode(false);
  }

  function openMobileTextEditor(layerId = selectedLayerId) {
    const layer = layers.find((item) => item.id === layerId);

    if (!layer) {
      alert("Bạn hãy chọn một element chữ trước.");
      return;
    }

    if (layer.type === "box") {
      alert("Layer nền không có nội dung chữ để sửa.");
      return;
    }

    setEditingLayerId(layer.id);
    setSelectedLayerId(layer.id);

    if (layer.type === "service-list") {
      setMobileTextDraft((layer.services ?? []).join("\n"));
    } else {
      setMobileTextDraft(layer.text ?? "");
    }

    setMobileTextEditorOpen(true);

    requestAnimationFrame(() => {
      const textarea = document.getElementById("mobile-text-editor-textarea");
      textarea?.focus();
    });
  }

  function closeMobileTextEditor() {
    setMobileTextEditorOpen(false);
    setEditingLayerId(null);
  }

  function applyMobileTextEdit() {
    if (!editingLayerId) return;

    const targetLayer = layers.find((layer) => layer.id === editingLayerId);
    if (targetLayer) {
      syncContentFromLayerText(targetLayer, mobileTextDraft);
    }

    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== editingLayerId) return layer;

        if (layer.type === "service-list") {
          return {
            ...layer,
            services: mobileTextDraft
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          };
        }

        if (layer.type === "box") return layer;

        return {
          ...layer,
          text: mobileTextDraft,
        };
      }),
    );

    closeMobileTextEditor();
  }

  function updateLayerText(layer: DesignLayer, value: string) {
    if (layer.type === "box") return;

    if (layer.type === "service-list") {
      updateLayer({
        ...layer,
        services: value.split("\n"),
      });
      syncContentFromLayerText(layer, value);
      return;
    }

    updateLayer({
      ...layer,
      text: value,
    });
    syncContentFromLayerText(layer, value);
  }

  function getLayerTextValue(layer: DesignLayer) {
    if (layer.type === "service-list") {
      return (layer.services ?? []).join("\n");
    }

    return layer.text ?? "";
  }

  function cleanContactValue(value: string) {
    return value
      .replace(/^\s*(facebook|fb)\s*:\s*/i, "")
      .replace(/^\s*(hotline|phone|sđt|sdt)\s*:\s*/i, "")
      .replace(/^\s*(đc|địa chỉ|dia chi)\s*:\s*/i, "")
      .replace(/^\s*☎\s*/, "")
      .trim();
  }

  function syncContentFromLayerText(layer: DesignLayer, value: string) {
    if (layer.type === "service-list") {
      updateContent(
        "services",
        value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      );
      return;
    }

    const cleanValue = cleanContactValue(value);

    switch (layer.id) {
      case "brand":
        updateContent("brand", value);
        break;
      case "subtitle":
        updateContent("subtitle", value);
        break;
      case "facebook":
        updateContent("facebook", cleanValue);
        break;
      case "address":
        updateContent("address", cleanValue);
        break;
      case "hotline":
      case "phone-bottom":
        updateContent("phone", cleanValue);
        break;
      default:
        break;
    }
  }

  function selectSingleLayer(layerId: string) {
    setSelectedLayerId(layerId);
    setSelectedLayerIds([layerId]);
  }

  function normalizeMarqueeBox(box: MarqueeDragState): MarqueeBox {
    const x = Math.min(box.startX, box.currentX);
    const y = Math.min(box.startY, box.currentY);

    return {
      x,
      y,
      width: Math.abs(box.currentX - box.startX),
      height: Math.abs(box.currentY - box.startY),
    };
  }

  function intersectsBox(layer: DesignLayer, box: MarqueeBox) {
    const layerRight = layer.x + layer.width;
    const layerBottom = layer.y + layer.height;
    const boxRight = box.x + box.width;
    const boxBottom = box.y + box.height;

    return !(
      layerRight < box.x ||
      layer.x > boxRight ||
      layerBottom < box.y ||
      layer.y > boxBottom
    );
  }

  function handleCanvasPointerDown(event: any) {
    const target = event.target as HTMLElement;

    // Khi đang sửa text, click ra vùng trống thì thoát editor.
    // Nếu click vào layer khác, layer đó sẽ tự xử lý ở handleLayerPointerDown.
    if (editingLayerId) {
      const clickedEditor = target.closest(
        ".inline-layer-text-editor,.inline-layer-edit-done",
      );
      const clickedLayer = target.closest("[data-design-layer]");

      if (!clickedEditor && !clickedLayer) {
        stopInlineTextEdit();
        setSelectedLayerIds([]);
        setSelectedLayerId("");
      }

      return;
    }

    if (
      !freeEdit ||
      backgroundEditMode ||
      exportMode ||
      event.pointerType !== "mouse" ||
      event.button !== 0
    ) {
      return;
    }

    if (target.closest("[data-design-layer], [data-export-hidden='true']")) {
      return;
    }

    const node = captureRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    marqueeDragRef.current = {
      pointerId: event.pointerId,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      moved: false,
    };

    setMarqueeBox({ x: startX, y: startY, width: 0, height: 0 });
    setSelectedLayerIds([]);
    setEditingLayerId(null);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleCanvasPointerMove(event: any) {
    const drag = marqueeDragRef.current;
    const node = captureRef.current;
    if (!drag || !node || drag.pointerId !== event.pointerId) return;

    const rect = node.getBoundingClientRect();
    drag.currentX = Math.max(
      0,
      Math.min(rect.width, event.clientX - rect.left),
    );
    drag.currentY = Math.max(
      0,
      Math.min(rect.height, event.clientY - rect.top),
    );
    drag.moved =
      drag.moved ||
      Math.hypot(drag.currentX - drag.startX, drag.currentY - drag.startY) > 5;

    setMarqueeBox(normalizeMarqueeBox(drag));
  }

  function handleCanvasPointerUp(event: any) {
    const drag = marqueeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const finalBox = normalizeMarqueeBox(drag);
    const nextSelectedIds = drag.moved
      ? layers
          .filter((layer) => intersectsBox(layer, finalBox))
          .map((layer) => layer.id)
      : [];

    setSelectedLayerIds(nextSelectedIds);
    setSelectedLayerId(nextSelectedIds[0] ?? "");
    setMarqueeBox(null);
    marqueeDragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function startGroupDrag(data: { x: number; y: number }) {
    if (!selectedGroupBox) return;

    const layerStartPositions = Object.fromEntries(
      selectedGroupLayers.map((layer) => [
        layer.id,
        { x: layer.x, y: layer.y },
      ]),
    );

    groupDragRef.current = {
      startX: data.x,
      startY: data.y,
      layerStartPositions,
    };
  }

  function moveSelectedGroup(data: { x: number; y: number }) {
    const drag = groupDragRef.current;
    if (!drag) return;

    const dx = data.x - drag.startX;
    const dy = data.y - drag.startY;
    const selectedSet = new Set(selectedLayerIds);

    setLayers((prev) =>
      prev.map((layer) => {
        if (!selectedSet.has(layer.id)) return layer;
        const startPosition = drag.layerStartPositions[layer.id];
        if (!startPosition) return layer;

        return {
          ...layer,
          x: Math.round(startPosition.x + dx),
          y: Math.round(startPosition.y + dy),
        };
      }),
    );
  }

  function stopGroupDrag() {
    groupDragRef.current = null;
  }

  function startInlineTextEdit(layer: DesignLayer) {
    if (layer.type === "box") {
      selectSingleLayer(layer.id);
      setEditingLayerId(null);
      return;
    }

    if (layerDragRef.current || backgroundEditMode || exportMode) return;

    selectSingleLayer(layer.id);
    setEditingLayerId(layer.id);

    requestAnimationFrame(() => {
      inlineEditorRefs.current[layer.id]?.focus();
      inlineEditorRefs.current[layer.id]?.setSelectionRange(
        inlineEditorRefs.current[layer.id]?.value.length ?? 0,
        inlineEditorRefs.current[layer.id]?.value.length ?? 0,
      );
    });
  }

  function stopInlineTextEdit() {
    setEditingLayerId(null);
  }

  function handleLayerPointerDown(layer: DesignLayer) {
    // CapCut-like behavior:
    // - 1 click/tap: select layer only.
    // - drag/press-hold: move layer with react-rnd.
    // - double click/tap: edit text.
    // - while editing one text layer, clicking another text layer switches editor to it.
    if (editingLayerId && editingLayerId !== layer.id) {
      if (layer.type === "box") {
        stopInlineTextEdit();
        selectSingleLayer(layer.id);
        return;
      }

      startInlineTextEdit(layer);
      return;
    }

    selectSingleLayer(layer.id);
  }

  function handleLayerDoubleClick(
    event: React.MouseEvent<HTMLDivElement>,
    layer: DesignLayer,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (layer.type === "box") {
      selectSingleLayer(layer.id);
      return;
    }

    startInlineTextEdit(layer);
  }

  function saveDesignToLocalStorage(showToast = true) {
    const payload: SavedDesignState = {
      imageUrl,
      imageNaturalRatio,
      imageTransform,
      canvasRatioId,
      imageFit,
      canvasBgColor,
      templateId,
      content,
      opacity,
      accentColor,
      freeEdit,
      backgroundEditMode,
      showLayerFrames,
      layers,
      selectedLayerId,
      bubbleBox,
      parentEditBaseBox,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(SAVED_DESIGN_KEY, JSON.stringify(payload));
      if (showToast)
        alert("Đã lưu bản chỉnh sửa gần nhất trên trình duyệt này.");
      return true;
    } catch (error) {
      console.error("Save design failed:", error);
      alert(
        "Không lưu được vào localStorage. Ảnh upload có thể quá nặng, bạn thử dùng ảnh nhẹ hơn hoặc chụp màn hình nén lại rồi upload lại.",
      );
      return false;
    }
  }

  async function exportCompositedImage(node: HTMLElement, pixelRatio: number) {
    const rect = node.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    function hasExportFlagInsideCapture(target: HTMLElement, selector: string) {
      let current: HTMLElement | null = target;

      while (current && current !== node) {
        if (current.matches(selector)) return true;
        current = current.parentElement;
      }

      return false;
    }

    const overlayBlob = await toBlob(node, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: "rgba(255,255,255,0)",
      filter: (targetNode) => {
        if (targetNode instanceof HTMLElement) {
          return (
            !hasExportFlagInsideCapture(
              targetNode,
              '[data-export-hidden="true"]',
            ) &&
            !hasExportFlagInsideCapture(targetNode, '[data-export-bg="true"]')
          );
        }

        return true;
      },
    });

    if (!overlayBlob) throw new Error("Không tạo được layer template.");

    const overlayUrl = URL.createObjectURL(overlayBlob);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(cssWidth * pixelRatio);
      canvas.height = Math.round(cssHeight * pixelRatio);

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas.");

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.fillStyle = canvasBgColor;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      if (imageUrl) {
        const bgImage = await loadImageElement(imageUrl);
        const imageRatio = bgImage.width / bgImage.height;
        const canvasRatio = cssWidth / cssHeight;
        const fitScale =
          imageFit === "cover"
            ? imageRatio > canvasRatio
              ? cssHeight / bgImage.height
              : cssWidth / bgImage.width
            : imageRatio > canvasRatio
              ? cssWidth / bgImage.width
              : cssHeight / bgImage.height;

        const drawWidth = bgImage.width * fitScale;
        const drawHeight = bgImage.height * fitScale;
        const baseX = (cssWidth - drawWidth) / 2;
        const baseY = (cssHeight - drawHeight) / 2;

        ctx.save();
        ctx.translate(
          cssWidth / 2 + imageTransform.x,
          cssHeight / 2 + imageTransform.y,
        );
        ctx.scale(imageTransform.scale, imageTransform.scale);
        ctx.drawImage(
          bgImage,
          baseX - cssWidth / 2,
          baseY - cssHeight / 2,
          drawWidth,
          drawHeight,
        );
        ctx.restore();
      }

      const overlayImage = await loadImageElement(overlayUrl);
      ctx.drawImage(overlayImage, 0, 0, cssWidth, cssHeight);

      return await canvasToBlob(canvas);
    } finally {
      URL.revokeObjectURL(overlayUrl);
    }
  }

  async function exportImage() {
    if (!captureRef.current) {
      alert("Không tìm thấy khu vực thiết kế để tải ảnh.");
      return;
    }

    try {
      saveDesignToLocalStorage(false);
      setEditingLayerId(null);
      setExportMode(true);
      setMobileTextEditorOpen(false);
      setMobileControlsOpen(false);

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 260);
        });
      });

      const node = captureRef.current;
      await waitForFonts();
      await waitForImages(node);

      const currentWidth = node.getBoundingClientRect().width;
      const pixelRatio = Math.min(
        4,
        Math.max(2, 2160 / Math.max(currentWidth, 1)),
      );
      const blob = await exportCompositedImage(node, pixelRatio);

      await downloadOrPreviewBlob(blob, "sam-bubble-studio-2k.png");
    } catch (error) {
      console.error("Export image failed:", error);
      alert(
        "Không tải được ảnh. Trên iPhone bạn thử dùng ảnh nhẹ hơn hoặc giảm số layer.",
      );
    } finally {
      setExportMode(false);
    }
  }

  function isMobileDevice() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  async function downloadOrPreviewBlob(blob: Blob, fileName: string) {
    const objectUrl = URL.createObjectURL(blob);

    if (!isMobileDevice()) {
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
      return;
    }

    setExportPreviewUrl(objectUrl);
    setExportFileName(fileName);

    try {
      const file = new File([blob], fileName, { type: "image/png" });

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          files: [file],
          title: fileName,
          text: "Ảnh thiết kế từ SAM Bubble Studio",
        });
      }
    } catch (error) {
      console.warn("Share cancelled or failed:", error);
    }
  }

  const canvasEditor = (
    <div
      ref={captureRef}
      className="relative mx-auto w-full overflow-hidden shadow-2xl"
      onPointerDownCapture={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onPointerCancel={handleCanvasPointerUp}
      style={{
        maxWidth: mobileCanvasFullscreen
          ? canvasAspectRatio >= 1
            ? "100vw"
            : "min(100vw, 620px)"
          : canvasAspectRatio >= 1
            ? 960
            : 620,
        aspectRatio: `${canvasAspectRatio}`,
        backgroundColor: canvasBgColor,
        touchAction: "none",
      }}
    >
      {imageUrl ? (
        <div
          data-export-bg="true"
          className="absolute inset-0"
          style={{
            touchAction: backgroundEditMode ? "none" : "auto",
            cursor: backgroundEditMode ? "grab" : "default",
          }}
          onTouchStart={handleBackgroundTouchStart}
          onTouchMove={handleBackgroundTouchMove}
          onTouchEnd={handleBackgroundTouchEnd}
          onTouchCancel={handleBackgroundTouchEnd}
        >
          <img
            src={imageUrl}
            alt="Uploaded"
            className="h-full w-full select-none"
            draggable={false}
            style={{
              display: "block",
              objectFit: imageFit,
              transform: `translate3d(${imageTransform.x}px, ${imageTransform.y}px, 0) scale(${imageTransform.scale})`,
              transformOrigin: "center center",
              willChange: "transform",
              pointerEvents: backgroundEditMode ? "auto" : "none",
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-200 to-zinc-400 p-8 text-center text-zinc-700">
          <div>
            <ImagePlus className="mx-auto mb-3" size={46} />
            <p className="font-bold">Upload ảnh để bắt đầu</p>
            <p className="mt-1 text-sm">
              Chọn 9:16, 16:9, 1:1 hoặc dùng tỉ lệ gốc của ảnh.
            </p>
          </div>
        </div>
      )}

      {backgroundEditMode && !exportMode && (
        <div
          data-export-hidden="true"
          className="pointer-events-none absolute inset-0 z-[60]"
          style={{
            outline: "2px dashed rgba(52,211,153,0.95)",
            outlineOffset: "-4px",
            boxShadow: "inset 0 0 0 9999px rgba(16,185,129,0.035)",
          }}
        />
      )}

      {freeEdit ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${freeEditScale})`,
            transformOrigin: "top left",
            pointerEvents: backgroundEditMode ? "none" : "auto",
          }}
        >
          {[...layers]
            .sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1))
            .map((layer) => {
              const selected = selectedLayerIds.includes(layer.id);
              const canEditText = layer.type !== "box";
              const isInlineEditing =
                canEditText &&
                selected &&
                editingLayerId === layer.id &&
                !exportMode;

              return (
                <Rnd
                  key={layer.id}
                  bounds={freeEditScale === 1 ? "parent" : undefined}
                  size={{
                    width: layer.width,
                    height: layer.height,
                  }}
                  position={{
                    x: layer.x,
                    y: layer.y,
                  }}
                  onMouseDown={() => handleLayerPointerDown(layer)}
                  onPointerDown={() => handleLayerPointerDown(layer)}
                  onDoubleClick={(event: React.MouseEvent<HTMLDivElement>) =>
                    handleLayerDoubleClick(event, layer)
                  }
                  onTouchStart={(event: any) => {
                    if (editingLayerId && editingLayerId !== layer.id) {
                      handleLayerPointerDown(layer);
                      return;
                    }
                    handleLayerTouchStart(event, layer);
                  }}
                  onTouchMove={(event: any) =>
                    handleLayerTouchMove(event, layer)
                  }
                  onTouchEnd={handleLayerTouchEnd}
                  onTouchCancel={handleLayerTouchEnd}
                  onDragStart={() => {
                    layerDragRef.current = true;
                    setEditingLayerId(null);
                    selectSingleLayer(layer.id);
                  }}
                  onDrag={(_, data) => {
                    layerDragPositionRef.current[layer.id] = {
                      x: data.x,
                      y: data.y,
                    };
                  }}
                  onDragStop={(_, data) => {
                    updateLayer({
                      ...layer,
                      x: data.x,
                      y: data.y,
                    });
                    window.setTimeout(() => {
                      layerDragRef.current = false;
                    }, 80);
                  }}
                  onResizeStart={() => {
                    setEditingLayerId(null);
                    selectSingleLayer(layer.id);
                    layerResizeRef.current = {
                      layerId: layer.id,
                      startLayer: layer,
                    };
                  }}
                  onResize={(_, __, ref, ___, position) => {
                    const resizeState = layerResizeRef.current;
                    const baseLayer =
                      resizeState?.layerId === layer.id
                        ? resizeState.startLayer
                        : layer;

                    updateLayer(
                      scaleLayerFromResize(
                        baseLayer,
                        readPixelValue(ref.style.width),
                        readPixelValue(ref.style.height),
                        position,
                      ),
                    );
                  }}
                  onResizeStop={(_, __, ref, ___, position) => {
                    const resizeState = layerResizeRef.current;
                    const baseLayer =
                      resizeState?.layerId === layer.id
                        ? resizeState.startLayer
                        : layer;

                    updateLayer(
                      scaleLayerFromResize(
                        baseLayer,
                        readPixelValue(ref.style.width),
                        readPixelValue(ref.style.height),
                        position,
                      ),
                    );
                    layerResizeRef.current = null;
                  }}
                  minWidth={28}
                  minHeight={14}
                  enableUserSelectHack={true}
                  disableDragging={
                    backgroundEditMode ||
                    pinchingLayerId === layer.id ||
                    isInlineEditing
                  }
                  className="select-none"
                  data-design-layer="true"
                  style={{
                    zIndex: layer.zIndex ?? 1,
                    touchAction: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    pointerEvents: backgroundEditMode ? "none" : "auto",
                    overflow: exportMode ? "visible" : undefined,
                    fontFamily: getLayerFontFamily(layer),
                  }}
                  enableResizing={
                    selected && !backgroundEditMode && !isInlineEditing
                      ? {
                          top: true,
                          right: true,
                          bottom: true,
                          left: true,
                          topLeft: true,
                          topRight: true,
                          bottomLeft: true,
                          bottomRight: true,
                        }
                      : false
                  }
                  resizeHandleStyles={getDashedResizeHandleStyles(
                    selected && !isInlineEditing,
                  )}
                  cancel=".inline-layer-text-editor,.inline-layer-edit-done"
                >
                  {isInlineEditing ? (
                    <InlineLayerTextEditor
                      layer={layer}
                      value={getLayerTextValue(layer)}
                      inputRef={(element) => {
                        inlineEditorRefs.current[layer.id] = element;
                      }}
                      onChange={(value) => updateLayerText(layer, value)}
                      onDone={stopInlineTextEdit}
                    />
                  ) : (
                    <SafeLayerRenderer
                      layer={layer}
                      selected={selected}
                      exportMode={exportMode}
                      showFrame={showLayerFrames}
                      onClick={() => handleLayerPointerDown(layer)}
                    />
                  )}
                </Rnd>
              );
            })}

          {freeEdit && selectedGroupBox && !exportMode && !editingLayerId && (
            <Rnd
              bounds="parent"
              position={{ x: selectedGroupBox.x, y: selectedGroupBox.y }}
              size={{
                width: selectedGroupBox.width,
                height: selectedGroupBox.height,
              }}
              enableResizing={false}
              enableUserSelectHack={true}
              onDragStart={(_, data) => startGroupDrag(data)}
              onDrag={(_, data) => moveSelectedGroup(data)}
              onDragStop={(_, data) => {
                moveSelectedGroup(data);
                stopGroupDrag();
              }}
              className="select-none"
              data-export-hidden="true"
              style={{
                zIndex: 999,
                touchAction: "none",
                border: "2px dashed rgba(168,85,247,0.95)",
                boxShadow: "0 0 0 3px rgba(168,85,247,0.22)",
                background: "rgba(168,85,247,0.04)",
                cursor: "move",
              }}
            >
              <div className="pointer-events-none absolute -top-7 left-0 rounded-full bg-purple-500 px-2 py-1 text-[11px] font-black leading-none text-white shadow-lg">
                Đã chọn {selectedLayerIds.length} element · kéo để di chuyển
                nhóm
              </div>
            </Rnd>
          )}

          {marqueeBox && !exportMode && (
            <div
              data-export-hidden="true"
              className="pointer-events-none absolute z-[1000]"
              style={{
                left: marqueeBox.x,
                top: marqueeBox.y,
                width: marqueeBox.width,
                height: marqueeBox.height,
                border: "2px dashed rgba(14,165,233,0.95)",
                background: "rgba(14,165,233,0.12)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.85) inset",
              }}
            />
          )}
        </div>
      ) : (
        <Rnd
          bounds="parent"
          size={{
            width: bubbleBox.width,
            height: bubbleBox.height,
          }}
          position={{
            x: bubbleBox.x,
            y: bubbleBox.y,
          }}
          onTouchStart={handleBubbleTouchStart}
          onTouchMove={handleBubbleTouchMove}
          onTouchEnd={handleBubbleTouchEnd}
          onTouchCancel={handleBubbleTouchEnd}
          onDrag={(_, data) =>
            setBubbleBox((prev) => ({
              ...prev,
              x: data.x,
              y: data.y,
            }))
          }
          onDragStop={(_, data) =>
            setBubbleBox((prev) => ({
              ...prev,
              x: data.x,
              y: data.y,
            }))
          }
          onResize={(_, __, ref, ___, position) => {
            setBubbleBox({
              width: readPixelValue(ref.style.width),
              height: readPixelValue(ref.style.height),
              x: position.x,
              y: position.y,
            });
          }}
          onResizeStop={(_, __, ref, ___, position) => {
            setBubbleBox({
              width: readPixelValue(ref.style.width),
              height: readPixelValue(ref.style.height),
              x: position.x,
              y: position.y,
            });
          }}
          minWidth={parentBubbleMinWidth}
          minHeight={parentBubbleMinHeight}
          lockAspectRatio={parentBubbleAspectRatio}
          enableUserSelectHack={true}
          className="select-none"
          style={{
            touchAction: "none",
            pointerEvents: backgroundEditMode ? "none" : "auto",
            overflow: "hidden",
            ...(!backgroundEditMode ? parentBubbleFrameStyle : {}),
          }}
          enableResizing={
            backgroundEditMode
              ? false
              : {
                  top: true,
                  right: true,
                  bottom: true,
                  left: true,
                  topLeft: true,
                  topRight: true,
                  bottomLeft: true,
                  bottomRight: true,
                }
          }
          resizeHandleStyles={getDashedResizeHandleStyles(!backgroundEditMode)}
        >
          <div
            className="relative h-full w-full"
            style={{ pointerEvents: "none" }}
          >
            {[...layers]
              .sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1))
              .map((layer) => {
                const baseBox =
                  parentEditBaseBox ?? getLayersBoundingBox(layers);
                const previewLayer = scaleLayerFromBaseBox(
                  layer,
                  baseBox,
                  bubbleBox,
                  false,
                );

                return (
                  <div
                    key={layer.id}
                    className="absolute"
                    style={{
                      left: previewLayer.x,
                      top: previewLayer.y,
                      width: previewLayer.width,
                      height: previewLayer.height,
                      zIndex: previewLayer.zIndex ?? 1,
                      overflow: exportMode ? "visible" : undefined,
                      fontFamily: getLayerFontFamily(previewLayer),
                    }}
                  >
                    <SafeLayerRenderer
                      layer={previewLayer}
                      selected={false}
                      exportMode={exportMode}
                      showFrame={false}
                      onClick={() => undefined}
                    />
                  </div>
                );
              })}
          </div>
        </Rnd>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-zinc-950">
      <div className="mx-auto max-w-[1800px] px-3 py-4 pb-24 lg:px-6 lg:py-8 lg:pb-10">
        <header className="mb-4 rounded-[28px] bg-white/80 p-4 shadow-sm backdrop-blur lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">
                SAM Bubble Studio
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight md:text-5xl">
                Thiết kế bubble quảng cáo trên ảnh
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 md:text-base">
                Upload ảnh, chọn template, chỉnh từng element, zoom ảnh nền và
                tải ảnh 2K.
              </p>
            </div>

            <a
              href="/admin"
              className="hidden rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 md:block"
            >
              Admin nội dung
            </a>
          </div>
        </header>

        <div className="mb-4 rounded-[28px] bg-white p-3 shadow-sm lg:p-4">
          <TemplatePicker
            activeTemplate={templateId}
            onChange={handleTemplateChange}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(520px,1fr)_380px]">
          <aside className="hidden xl:block">
            <div className="sticky top-4 space-y-4">
              <EditorControls
                content={content}
                opacity={opacity}
                accentColor={accentColor}
                onImageUpload={handleImageUpload}
                onExport={exportImage}
                onResetBox={resetBubblePosition}
                onOpacityChange={setOpacity}
                onAccentColorChange={setAccentColor}
                onContentChange={updateContent}
              />

              <CanvasSettingPanel
                canvasRatioId={canvasRatioId}
                imageFit={imageFit}
                canvasBgColor={canvasBgColor}
                imageTransform={imageTransform}
                backgroundEditMode={backgroundEditMode}
                onCanvasRatioChange={setCanvasRatioId}
                onImageFitChange={setImageFit}
                onCanvasBgColorChange={setCanvasBgColor}
                onImageScaleChange={(scale) =>
                  setImageTransform((prev) => ({
                    ...prev,
                    scale: clampImageScale(scale),
                  }))
                }
                onBackgroundEditModeChange={setBackgroundEditMode}
                onResetImageTransform={resetImageTransform}
                onExport2K={exportImage}
              />
            </div>
          </aside>

          <main className="min-w-0 rounded-[28px] bg-white p-3 shadow-sm lg:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">Khu vực thiết kế</p>
                <p className="text-xs text-zinc-500">
                  {backgroundEditMode
                    ? "Đang chỉnh ảnh nền: kéo ảnh hoặc chụm 2 ngón để zoom."
                    : freeEdit
                      ? "Đang chỉnh element: kéo layer, kéo mép dashed để resize."
                      : "Kéo bubble để đổi vị trí, kéo mép dashed để resize."}
                </p>
              </div>

              <button
                onClick={() => setMobileControlsOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-xs font-bold text-white lg:hidden"
              >
                <Menu size={16} /> Công cụ
              </button>
            </div>

            <div className="overflow-auto rounded-[24px] bg-zinc-950 p-2 sm:p-4">
              {!mobileCanvasFullscreen && canvasEditor}
            </div>
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-4 max-h-[calc(100vh-32px)] overflow-y-auto pr-1">
              <FreeEditTools
                freeEdit={freeEdit}
                showLayerFrames={showLayerFrames}
                onFreeEditChange={handleFreeEditModeChange}
                onShowLayerFramesChange={setShowLayerFrames}
                layers={layers}
                selectedLayerId={selectedLayerId}
                selectedLayerIds={selectedLayerIds}
                selectedLayer={selectedLayer}
                selectedLayerFontFamily={selectedLayerFontFamily}
                onSelectLayer={selectSingleLayer}
                onAddText={addTextLayer}
                onAddBox={addBoxLayer}
                onDeleteSelectedLayers={deleteSelectedLayers}
                onSelectedFontChange={updateSelectedLayerFont}
                onUpdateLayer={updateLayer}
                onDeleteLayer={deleteLayer}
                onDuplicateLayer={duplicateLayer}
                onBringForward={bringForward}
                onSendBackward={sendBackward}
              />
            </div>
          </aside>
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-3 shadow-2xl backdrop-blur lg:hidden"
        data-export-hidden="true"
      >
        <div className="mx-auto flex max-w-[720px] gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <label className="flex shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-zinc-100 px-4 py-3">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          <button
            onClick={() => {
              setFreeEdit(true);
              setBackgroundEditMode(false);
              addTextLayer();
            }}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-zinc-100 px-4 py-3"
          >
            <Type size={14} /> Chữ
          </button>

          <button
            onClick={() => {
              setFreeEdit(true);
              setBackgroundEditMode(false);
              addBoxLayer();
            }}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-zinc-100 px-4 py-3"
          >
            <Plus size={14} /> Nền
          </button>

          <select
            value={selectedLayerFontFamily}
            disabled={
              !freeEdit || !selectedLayer || selectedLayer.type === "box"
            }
            onChange={(event) => updateSelectedLayerFont(event.target.value)}
            className="shrink-0 rounded-2xl bg-zinc-100 px-3 py-3 text-xs font-bold outline-none disabled:opacity-40"
            aria-label="Đổi font chữ"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>

          <button
            onClick={deleteSelectedLayers}
            disabled={!canDeleteSelectedLayers}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-rose-100 px-4 py-3 text-rose-700 disabled:opacity-40"
          >
            <Trash2 size={14} /> Xóa
          </button>

          <button
            onClick={resetBubblePosition}
            className="shrink-0 rounded-2xl bg-zinc-100 px-4 py-3"
          >
            Reset
          </button>

          <button
            onClick={() => setMobileCanvasFullscreen(true)}
            className="shrink-0 rounded-2xl bg-zinc-100 px-4 py-3"
          >
            Zoom
          </button>

          <button
            onClick={() => saveDesignToLocalStorage(true)}
            className="shrink-0 rounded-2xl bg-amber-100 px-4 py-3 text-amber-950"
          >
            Lưu
          </button>

          <button
            onClick={exportImage}
            className="shrink-0 rounded-2xl bg-zinc-950 px-4 py-3 text-white"
          >
            Tải
          </button>
        </div>
      </div>

      {mobileCanvasFullscreen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 lg:hidden"
          data-export-hidden="true"
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-zinc-950 px-3 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Chỉnh sửa fullscreen</p>
              <p className="text-[11px] text-white/55">
                Element: kéo/chụm layer. Ảnh nền: kéo/chụm ảnh phía sau.
              </p>
            </div>

            <button
              onClick={() => setMobileCanvasFullscreen(false)}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold"
            >
              Đóng
            </button>
          </div>

          <div className="flex-1 overflow-auto p-2">
            <div className="flex min-h-full items-center justify-center">
              {canvasEditor}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-zinc-950 p-2 text-xs font-bold">
            <button
              onClick={() => {
                setFreeEdit(true);
                setBackgroundEditMode(false);
              }}
              className={[
                "shrink-0 rounded-xl px-4 py-3",
                freeEdit && !backgroundEditMode
                  ? "bg-[#d8bd7f] text-black"
                  : "bg-white/10 text-white",
              ].join(" ")}
            >
              Element
            </button>

            <button
              onClick={() => {
                setBackgroundEditMode((prev) => !prev);
                setFreeEdit(true);
              }}
              className={[
                "shrink-0 rounded-xl px-4 py-3",
                backgroundEditMode
                  ? "bg-emerald-400 text-black"
                  : "bg-white/10 text-white",
              ].join(" ")}
            >
              Ảnh nền
            </button>

            <button
              onClick={addTextLayer}
              className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-white"
            >
              + Chữ
            </button>

            <button
              onClick={addBoxLayer}
              className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-white"
            >
              + Nền
            </button>

            <select
              value={selectedLayerFontFamily}
              disabled={
                !freeEdit || !selectedLayer || selectedLayer.type === "box"
              }
              onChange={(event) => updateSelectedLayerFont(event.target.value)}
              className="shrink-0 rounded-xl bg-white/10 px-3 py-3 text-white outline-none disabled:opacity-40"
              aria-label="Đổi font chữ"
            >
              {FONT_OPTIONS.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  className="text-black"
                >
                  {font.label}
                </option>
              ))}
            </select>

            <button
              onClick={deleteSelectedLayers}
              disabled={!canDeleteSelectedLayers}
              className="shrink-0 rounded-xl bg-rose-500 px-4 py-3 text-white disabled:opacity-40"
            >
              Xóa
            </button>

            <button
              onClick={() => openMobileTextEditor()}
              className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-white"
            >
              Sửa chữ
            </button>

            <button
              onClick={() => setShowLayerFrames((prev) => !prev)}
              className={[
                "shrink-0 rounded-xl px-4 py-3",
                showLayerFrames
                  ? "bg-sky-400 text-black"
                  : "bg-white/10 text-white",
              ].join(" ")}
            >
              Khung
            </button>

            <button
              onClick={() => setMobileControlsOpen(true)}
              className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-white"
            >
              Công cụ
            </button>

            <button
              onClick={() => saveDesignToLocalStorage(true)}
              className="shrink-0 rounded-xl bg-amber-300 px-4 py-3 text-black"
            >
              Lưu
            </button>

            <button
              onClick={exportImage}
              className="shrink-0 rounded-xl bg-white px-4 py-3 text-black"
            >
              Tải 2K
            </button>
          </div>
        </div>
      )}

      {mobileControlsOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/45 p-3 lg:hidden"
          data-export-hidden="true"
        >
          <div className="ml-auto flex h-full max-w-[420px] flex-col rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <p className="font-bold">Công cụ chỉnh sửa</p>

              <button
                onClick={() => setMobileControlsOpen(false)}
                className="rounded-xl bg-zinc-100 p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-auto p-3">
              <EditorControls
                content={content}
                opacity={opacity}
                accentColor={accentColor}
                onImageUpload={handleImageUpload}
                onExport={exportImage}
                onResetBox={resetBubblePosition}
                onOpacityChange={setOpacity}
                onAccentColorChange={setAccentColor}
                onContentChange={updateContent}
              />

              <CanvasSettingPanel
                canvasRatioId={canvasRatioId}
                imageFit={imageFit}
                canvasBgColor={canvasBgColor}
                imageTransform={imageTransform}
                backgroundEditMode={backgroundEditMode}
                onCanvasRatioChange={setCanvasRatioId}
                onImageFitChange={setImageFit}
                onCanvasBgColorChange={setCanvasBgColor}
                onImageScaleChange={(scale) =>
                  setImageTransform((prev) => ({
                    ...prev,
                    scale: clampImageScale(scale),
                  }))
                }
                onBackgroundEditModeChange={setBackgroundEditMode}
                onResetImageTransform={resetImageTransform}
                onExport2K={exportImage}
              />

              <FreeEditTools
                freeEdit={freeEdit}
                showLayerFrames={showLayerFrames}
                onFreeEditChange={handleFreeEditModeChange}
                onShowLayerFramesChange={setShowLayerFrames}
                layers={layers}
                selectedLayerId={selectedLayerId}
                selectedLayerIds={selectedLayerIds}
                selectedLayer={selectedLayer}
                selectedLayerFontFamily={selectedLayerFontFamily}
                onSelectLayer={selectSingleLayer}
                onAddText={addTextLayer}
                onAddBox={addBoxLayer}
                onDeleteSelectedLayers={deleteSelectedLayers}
                onSelectedFontChange={updateSelectedLayerFont}
                onUpdateLayer={updateLayer}
                onDeleteLayer={deleteLayer}
                onDuplicateLayer={duplicateLayer}
                onBringForward={bringForward}
                onSendBackward={sendBackward}
              />
            </div>
          </div>
        </div>
      )}

      {mobileTextEditorOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-end bg-black/50 p-3 lg:hidden"
          data-export-hidden="true"
        >
          <div className="w-full rounded-[28px] bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-bold">Sửa nội dung</p>
                <p className="text-xs text-zinc-500">
                  {editingLayer?.name ?? "Element đang sửa"}
                </p>
              </div>

              <button
                onClick={closeMobileTextEditor}
                className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            <textarea
              id="mobile-text-editor-textarea"
              value={mobileTextDraft}
              onChange={(event) => setMobileTextDraft(event.target.value)}
              onBlur={applyMobileTextEdit}
              rows={8}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-zinc-950"
              placeholder="Nhập nội dung..."
            />

            <button
              onClick={applyMobileTextEdit}
              className="mt-3 w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {exportPreviewUrl && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
          data-export-hidden="true"
        >
          <div className="flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <p className="font-bold">Ảnh đã tạo xong</p>
                <p className="text-xs text-zinc-500">{exportFileName}</p>
              </div>

              <button
                onClick={() => {
                  URL.revokeObjectURL(exportPreviewUrl);
                  setExportPreviewUrl("");
                  setExportFileName("");
                }}
                className="rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-zinc-950 p-3">
              <img
                src={exportPreviewUrl}
                alt="Export preview"
                className="mx-auto h-auto max-w-full rounded-xl"
              />
            </div>

            <div className="space-y-3 border-t p-4">
              <p className="text-sm leading-relaxed text-zinc-600">
                Trên iPhone, nếu ảnh chưa tự lưu, hãy nhấn giữ vào ảnh rồi chọn
                <b> Lưu vào Ảnh</b> hoặc <b>Save Image</b>.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={exportPreviewUrl}
                  download={exportFileName}
                  className="rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-bold"
                >
                  Tải lại
                </a>

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(exportPreviewUrl);
                      const blob = await response.blob();
                      const file = new File(
                        [blob],
                        exportFileName || "design.png",
                        { type: "image/png" },
                      );

                      if (
                        navigator.canShare &&
                        navigator.canShare({ files: [file] }) &&
                        navigator.share
                      ) {
                        await navigator.share({
                          files: [file],
                          title: exportFileName,
                        });
                      } else {
                        alert(
                          "Trình duyệt không hỗ trợ chia sẻ trực tiếp. Bạn nhấn giữ ảnh để lưu.",
                        );
                      }
                    } catch (error) {
                      console.error(error);
                      alert("Không mở được chia sẻ. Bạn nhấn giữ ảnh để lưu.");
                    }
                  }}
                  className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white"
                >
                  Chia sẻ/Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isSingleLineTextLayer(layer: DesignLayer) {
  if (layer.type === "box" || layer.type === "service-list") return false;

  const text = layer.text ?? "";
  return text.trim().length > 0 && !text.includes("\n");
}

function SafeLayerRenderer({
  layer,
  selected,
  exportMode,
  showFrame,
  onClick,
}: {
  layer: DesignLayer;
  selected: boolean;
  exportMode: boolean;
  showFrame: boolean;
  onClick: () => void;
}) {
  if (exportMode && isSingleLineTextLayer(layer)) {
    return <ExportSingleLineTextLayer layer={layer} />;
  }

  return (
    <LayerRenderer
      layer={layer}
      selected={selected}
      exportMode={exportMode}
      showFrame={showFrame}
      onClick={onClick}
    />
  );
}

function ExportSingleLineTextLayer({ layer }: { layer: DesignLayer }) {
  const layerAny = layer as DesignLayer & Record<string, unknown>;

  return (
    <div
      className="h-full w-full"
      data-export-nowrap="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          layer.textAlign === "center"
            ? "center"
            : layer.textAlign === "right"
              ? "flex-end"
              : "flex-start",
        color: layer.color ?? "inherit",
        fontSize: layer.fontSize,
        fontWeight: layer.fontWeight,
        textAlign: layer.textAlign ?? "left",
        letterSpacing: layer.letterSpacing,
        lineHeight: layer.lineHeight ?? 1.15,
        padding: `0 ${layer.padding ?? 0}px`,
        fontFamily:
          typeof layerAny.fontFamily === "string"
            ? layerAny.fontFamily
            : "inherit",
        opacity: layer.opacity ?? 1,
        WebkitTextFillColor: layer.color ?? "inherit",
        textShadow:
          typeof layerAny.textShadow === "string"
            ? layerAny.textShadow
            : undefined,
        textTransform:
          typeof layerAny.textTransform === "string"
            ? (layerAny.textTransform as React.CSSProperties["textTransform"])
            : undefined,
        whiteSpace: "pre",
        wordBreak: "keep-all",
        overflowWrap: "normal",
        overflow: "visible",
        background: layer.background ?? "transparent",
        borderRadius: layer.borderRadius,
        border:
          typeof layerAny.borderWidth === "number" &&
          typeof layerAny.borderColor === "string"
            ? `${layerAny.borderWidth}px solid ${layerAny.borderColor}`
            : undefined,
      }}
    >
      <span
        style={{
          display: "inline-block",
          maxWidth: "none",
          whiteSpace: "pre",
          wordBreak: "keep-all",
          overflowWrap: "normal",
          overflow: "visible",
        }}
      >
        {layer.text}
      </span>
    </div>
  );
}

function InlineLayerTextEditor({
  layer,
  value,
  inputRef,
  onChange,
  onDone,
}: {
  layer: DesignLayer;
  value: string;
  inputRef: (element: HTMLTextAreaElement | null) => void;
  onChange: (value: string) => void;
  onDone: () => void;
}) {
  return (
    <div
      className="relative h-full w-full"
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      style={{
        borderRadius: layer.borderRadius,
        outline: "2px dashed #38bdf8",
        outlineOffset: "-2px",
        boxShadow:
          "0 0 0 3px rgba(56,189,248,0.32), 0 10px 28px rgba(0,0,0,0.22)",
        background: layer.background ?? "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      <div className="pointer-events-none absolute left-0 top-[-24px] z-[99] max-w-full rounded-full bg-sky-400 px-2 py-1 text-[11px] font-black leading-none text-slate-950 shadow-lg">
        {layer.name}
      </div>

      <textarea
        ref={inputRef}
        className="inline-layer-text-editor h-full w-full resize-none border-0 bg-transparent outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          event.currentTarget.focus();
        }}
        style={{
          color: layer.color ?? "inherit",
          touchAction: "auto",
          userSelect: "text",
          fontSize: layer.fontSize,
          fontWeight: layer.fontWeight,
          textAlign: layer.textAlign ?? "left",
          letterSpacing: layer.letterSpacing,
          lineHeight: layer.lineHeight ?? 1.2,
          padding:
            layer.type === "service-list"
              ? (layer.padding ?? 4)
              : `0 ${layer.padding ?? 4}px`,
          fontFamily: getLayerFontFamily(layer),
          opacity: layer.opacity ?? 1,
          WebkitTextFillColor: layer.color ?? "inherit",
          caretColor: layer.color ?? "#111827",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
        }}
        aria-label={`Sửa ${layer.name}`}
      />

      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onDone();
        }}
        className="inline-layer-edit-done absolute bottom-1 right-1 z-[100] rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-black text-white shadow-lg"
      >
        Xong
      </button>
    </div>
  );
}

function CanvasSettingPanel({
  canvasRatioId,
  imageFit,
  canvasBgColor,
  imageTransform,
  backgroundEditMode,
  onCanvasRatioChange,
  onImageFitChange,
  onCanvasBgColorChange,
  onImageScaleChange,
  onBackgroundEditModeChange,
  onResetImageTransform,
  onExport2K,
}: {
  canvasRatioId: CanvasRatioId;
  imageFit: ImageFit;
  canvasBgColor: string;
  imageTransform: ImageTransform;
  backgroundEditMode: boolean;
  onCanvasRatioChange: (value: CanvasRatioId) => void;
  onImageFitChange: (value: ImageFit) => void;
  onCanvasBgColorChange: (value: string) => void;
  onImageScaleChange: (value: number) => void;
  onBackgroundEditModeChange: (value: boolean) => void;
  onResetImageTransform: () => void;
  onExport2K: () => void;
}) {
  return (
    <div className="space-y-4 rounded-[28px] bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-bold">Tỉ lệ & ảnh nền</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Chọn tỉ lệ canvas, chỉnh ảnh nền, zoom/pan ảnh upload.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ratioOptions.map((item) => {
          const active = canvasRatioId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onCanvasRatioChange(item.id)}
              className={[
                "rounded-2xl border px-3 py-2 text-left transition",
                active
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-zinc-50 hover:border-zinc-950",
              ].join(" ")}
            >
              <p className="text-sm font-black">{item.label}</p>
              <p
                className={[
                  "mt-0.5 text-[11px]",
                  active ? "text-white/65" : "text-zinc-500",
                ].join(" ")}
              >
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold">Hiển thị ảnh</label>

        <select
          value={imageFit}
          onChange={(event) => onImageFitChange(event.target.value as ImageFit)}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950"
        >
          <option value="contain">Không cắt ảnh - hiển thị đầy đủ</option>
          <option value="cover">Phủ kín khung - có thể bị crop</option>
        </select>
      </div>

      <label className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950">
        <span>Chỉnh ảnh nền</span>

        <input
          type="checkbox"
          checked={backgroundEditMode}
          onChange={(event) => onBackgroundEditModeChange(event.target.checked)}
          className="h-5 w-5 accent-emerald-500"
        />
      </label>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-bold">Zoom ảnh nền</label>
          <span className="text-xs text-zinc-500">
            {imageTransform.scale.toFixed(2)}x
          </span>
        </div>

        <input
          type="range"
          min={MIN_IMAGE_SCALE}
          max={MAX_IMAGE_SCALE}
          step={0.01}
          value={imageTransform.scale}
          onChange={(event) => onImageScaleChange(Number(event.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold">Màu nền canvas</label>

        <input
          type="color"
          value={canvasBgColor}
          onChange={(event) => onCanvasBgColorChange(event.target.value)}
          className="h-10 w-full rounded-xl border"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onResetImageTransform}
          className="rounded-xl bg-zinc-100 px-3 py-3 text-xs font-bold text-zinc-950"
        >
          Reset ảnh nền
        </button>

        <button
          type="button"
          onClick={onExport2K}
          className="rounded-xl bg-zinc-950 px-3 py-3 text-xs font-bold text-white"
        >
          Tải 2K
        </button>
      </div>
    </div>
  );
}

function FreeEditTools({
  freeEdit,
  showLayerFrames,
  onFreeEditChange,
  onShowLayerFramesChange,
  layers,
  selectedLayerId,
  selectedLayerIds,
  selectedLayer,
  selectedLayerFontFamily,
  onSelectLayer,
  onAddText,
  onAddBox,
  onDeleteSelectedLayers,
  onSelectedFontChange,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onBringForward,
  onSendBackward,
}: {
  freeEdit: boolean;
  showLayerFrames: boolean;
  onFreeEditChange: (value: boolean) => void;
  onShowLayerFramesChange: (value: boolean) => void;
  layers: DesignLayer[];
  selectedLayerId: string;
  selectedLayerIds: string[];
  selectedLayer?: DesignLayer;
  selectedLayerFontFamily: string;
  onSelectLayer: (id: string) => void;
  onAddText: () => void;
  onAddBox: () => void;
  onDeleteSelectedLayers: () => void;
  onSelectedFontChange: (fontFamily: string) => void;
  onUpdateLayer: (layer: DesignLayer) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (layer: DesignLayer) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-[28px] bg-white p-4 shadow-sm lg:sticky lg:top-4">
      <div className="rounded-2xl bg-zinc-950 p-4 text-white">
        <label className="flex items-center justify-between gap-3 text-sm font-bold">
          <span>Chỉnh từng element</span>

          <input
            type="checkbox"
            checked={freeEdit}
            onChange={(event) => onFreeEditChange(event.target.checked)}
            className="h-5 w-5 accent-[#d8bd7f]"
          />
        </label>

        <p className="mt-2 text-xs leading-relaxed text-white/65">
          Bật để kéo từng chữ/nền/dịch vụ. Resize bằng mép khung dashed, không
          dùng chấm xanh.
        </p>
      </div>

      {freeEdit && (
        <>
          <label className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-950">
            <span>Hiện khung element</span>

            <input
              type="checkbox"
              checked={showLayerFrames}
              onChange={(event) =>
                onShowLayerFramesChange(event.target.checked)
              }
              className="h-5 w-5 accent-sky-500"
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onAddText}
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-3 py-3 text-xs font-bold hover:bg-zinc-200"
            >
              <Type size={15} /> Thêm chữ
            </button>

            <button
              type="button"
              onClick={onAddBox}
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-3 py-3 text-xs font-bold hover:bg-zinc-200"
            >
              <Plus size={15} /> Thêm nền
            </button>

            <button
              type="button"
              onClick={onDeleteSelectedLayers}
              disabled={
                selectedLayerIds.length === 0 ||
                selectedLayerIds.length >= layers.length
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={15} /> Xóa
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold">Font chữ</label>
            <select
              value={selectedLayerFontFamily}
              disabled={!selectedLayer || selectedLayer.type === "box"}
              onChange={(event) => onSelectedFontChange(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold outline-none focus:border-zinc-950 disabled:opacity-40"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
              Chọn một hoặc quét nhiều element chữ rồi đổi font, chữ sẽ đổi
              ngay.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold">Chọn layer</label>

            <select
              value={selectedLayerId}
              onChange={(event) => onSelectLayer(event.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            >
              {[...layers]
                .sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1))
                .map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {layer.name}
                  </option>
                ))}
            </select>
          </div>

          <LayerSettingPanel
            layer={selectedLayer}
            onChange={onUpdateLayer}
            onDelete={onDeleteLayer}
            onDuplicate={onDuplicateLayer}
            onBringForward={onBringForward}
            onSendBackward={onSendBackward}
          />
        </>
      )}
    </div>
  );
}
