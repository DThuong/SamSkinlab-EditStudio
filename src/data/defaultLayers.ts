import type { BubbleContent, BubbleTemplateId } from '../types/bubble';
import type { DesignLayer } from '../types/layer';
import { defaultBubbleContent } from './bubbleTemplates';

const gold = '#d8bd7f';
const cream = '#f5dfad';
const dark = 'rgba(0,0,0,0.74)';
const darkStrong = 'rgba(0,0,0,0.84)';
const whiteGlass = 'rgba(255,255,255,0.88)';
const pinkGlass = 'rgba(255,235,242,0.9)';

function box(
  id: string,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  background: string,
  zIndex: number,
  extra: Partial<DesignLayer> = {}
): DesignLayer {
  return {
    id,
    name,
    type: 'box',
    x,
    y,
    width,
    height,
    zIndex,
    background,
    borderRadius: 28,
    opacity: 1,
    ...extra,
  };
}

function text(
  id: string,
  name: string,
  textValue: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  extra: Partial<DesignLayer> = {}
): DesignLayer {
  return {
    id,
    name,
    type: 'text',
    x,
    y,
    width,
    height,
    zIndex,
    text: textValue,
    fontSize: 18,
    fontWeight: 500,
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 1.15,
    letterSpacing: 0,
    padding: 4,
    ...extra,
  };
}

function serviceList(
  content: BubbleContent,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  extra: Partial<DesignLayer> = {}
): DesignLayer {
  return {
    id: 'services',
    name: 'Danh sách dịch vụ',
    type: 'service-list',
    x,
    y,
    width,
    height,
    zIndex,
    services: content.services,
    fontSize: 14,
    fontWeight: 500,
    color: '#ffffff',
    lineHeight: 1.38,
    padding: 4,
    ...extra,
  };
}

function baseContactLayers(
  content: BubbleContent,
  x: number,
  y: number,
  width: number,
  zIndex: number,
  color = '#ffffff'
): DesignLayer[] {
  return [
    text('contact-title', 'Tiêu đề liên hệ', 'LIÊN HỆ', x, y, width, 30, zIndex, {
      fontSize: 18,
      fontWeight: 700,
      color: gold,
      textAlign: 'center',
      letterSpacing: 3,
    }),
    text(
      'facebook',
      'Facebook',
      `Facebook: ${content.facebook}`,
      x,
      y + 38,
      width,
      28,
      zIndex,
      {
        fontSize: 14,
        fontWeight: 500,
        color,
      }
    ),
    text(
      'phone-bottom',
      'Hotline cuối',
      `Hotline: ${content.phone}`,
      x,
      y + 70,
      width,
      28,
      zIndex,
      {
        fontSize: 15,
        fontWeight: 700,
        color,
      }
    ),
  ];
}

function commonLuxuryContent(
  content: BubbleContent,
  options: {
    panelX: number;
    panelY: number;
    panelW: number;
    panelH: number;
    brandY?: number;
    servicesY?: number;
    contactY?: number;
    darkBg?: string;
    brandColor?: string;
    serviceColor?: string;
  }
): DesignLayer[] {
  const {
    panelX,
    panelY,
    panelW,
    panelH,
    brandY = panelY + 44,
    servicesY = panelY + 285,
    contactY = panelY + panelH - 125,
    darkBg = dark,
    brandColor = cream,
    serviceColor = '#ffffff',
  } = options;

  return [
    box('panel-bg', 'Nền bubble', panelX, panelY, panelW, panelH, darkBg, 1, {
      borderColor: gold,
      borderWidth: 1,
      borderRadius: 34,
    }),
    text('welcome', 'Welcome nhỏ', 'WELCOME TO', panelX + 36, brandY - 26, panelW - 72, 20, 2, {
      fontSize: 11,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.6)',
      textAlign: 'left',
      letterSpacing: 5,
    }),
    text('brand', 'Tên thương hiệu', content.brand, panelX + 36, brandY, panelW - 72, 78, 2, {
      fontSize: 34,
      fontWeight: 500,
      color: brandColor,
      textAlign: 'center',
      letterSpacing: 7,
      lineHeight: 1.05,
    }),
    text('subtitle', 'Subtitle', content.subtitle, panelX + 40, brandY + 84, panelW - 80, 32, 2, {
      fontSize: 14,
      color: '#ffffff',
      textAlign: 'center',
      letterSpacing: 3,
    }),
    box('hotline-bg', 'Nền hotline', panelX + 38, brandY + 132, panelW - 76, 52, gold, 2, {
      borderRadius: 999,
      opacity: 0.95,
    }),
    text('hotline', 'Hotline', `Hotline: ${content.phone}`, panelX + 60, brandY + 143, panelW - 120, 30, 3, {
      fontSize: 18,
      fontWeight: 800,
      color: '#111111',
      textAlign: 'center',
    }),
    text('service-title', 'Tiêu đề dịch vụ', 'DỊCH VỤ NỔI BẬT', panelX + 44, servicesY - 48, panelW - 88, 38, 2, {
      fontSize: 20,
      fontWeight: 700,
      color: gold,
      textAlign: 'center',
      letterSpacing: 4,
    }),
    serviceList(content, panelX + 45, servicesY, panelW - 90, panelH - (servicesY - panelY) - 160, 2, {
      fontSize: 14,
      color: serviceColor,
    }),
    ...baseContactLayers(content, panelX + 50, contactY, panelW - 100, 2),
  ];
}

export function createDefaultDesignLayers(
  content: BubbleContent = defaultBubbleContent,
  templateId: BubbleTemplateId = 'left-service-panel'
): DesignLayer[] {
  switch (templateId) {
    case 'luxury-card':
      return commonLuxuryContent(content, {
        panelX: 48,
        panelY: 78,
        panelW: 365,
        panelH: 730,
        darkBg: 'rgba(0,0,0,0.78)',
      });

    case 'left-service-panel':
      return commonLuxuryContent(content, {
        panelX: 24,
        panelY: 70,
        panelW: 365,
        panelH: 760,
        darkBg: 'linear-gradient(180deg, rgba(0,0,0,0.82), rgba(20,20,20,0.78))',
      });

    case 'glass-top-banner':
      return [
        box('panel-bg', 'Nền kính trên', 30, 45, 460, 305, 'rgba(0,0,0,0.55)', 1, {
          borderColor: 'rgba(255,255,255,0.45)',
          borderWidth: 1,
          borderRadius: 34,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 62, 72, 395, 64, 2, {
          fontSize: 42,
          fontWeight: 500,
          color: cream,
          textAlign: 'center',
          letterSpacing: 8,
        }),
        text('subtitle', 'Subtitle', 'FILLER • BOTOX • MESO • BAP', 70, 145, 380, 30, 2, {
          fontSize: 15,
          color: '#ffffff',
          textAlign: 'center',
          letterSpacing: 4,
        }),
        box('hotline-bg', 'Nền hotline', 126, 190, 270, 48, 'rgba(255,255,255,0.08)', 2, {
          borderColor: gold,
          borderWidth: 1,
          borderRadius: 999,
        }),
        text('hotline', 'Hotline', content.phone, 155, 201, 210, 28, 3, {
          fontSize: 20,
          fontWeight: 800,
          color: '#ffffff',
          textAlign: 'center',
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 60, 270, 185, 34, 2, {
          fontSize: 14,
          color: '#ffffff',
        }),
        text('address', 'Địa chỉ', `Đc: ${content.address}`, 265, 260, 190, 52, 2, {
          fontSize: 13,
          color: '#ffffff',
        }),
      ];

    case 'minimal-white-card':
      return [
        box('panel-bg', 'Nền trắng', 46, 120, 365, 665, whiteGlass, 1, {
          borderRadius: 28,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 72, 150, 310, 64, 2, {
          fontSize: 32,
          color: '#111111',
          textAlign: 'left',
          letterSpacing: 3,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 75, 210, 300, 28, 2, {
          fontSize: 14,
          color: '#666666',
        }),
        box('hotline-bg', 'Nền hotline', 72, 260, 300, 52, '#111111', 2, {
          borderRadius: 18,
        }),
        text('hotline', 'Hotline', `Hotline: ${content.phone}`, 92, 272, 260, 28, 3, {
          fontSize: 18,
          fontWeight: 800,
          color: '#ffffff',
          textAlign: 'center',
        }),
        text('service-title', 'Tiêu đề dịch vụ', 'DỊCH VỤ', 76, 338, 280, 32, 2, {
          fontSize: 18,
          fontWeight: 800,
          color: '#111111',
          letterSpacing: 3,
        }),
        serviceList(content, 74, 382, 300, 300, 2, {
          color: '#111111',
          fontSize: 14,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 74, 705, 300, 25, 2, {
          color: '#333333',
          fontSize: 14,
        }),
        text('address', 'Địa chỉ', `Đc: ${content.address}`, 74, 735, 300, 42, 2, {
          color: '#555555',
          fontSize: 13,
        }),
      ];

    case 'gold-frame':
      return [
        box('panel-bg', 'Nền khung vàng', 48, 90, 370, 710, darkStrong, 1, {
          borderColor: gold,
          borderWidth: 3,
          borderRadius: 38,
        }),
        box('inner-frame', 'Khung trong', 64, 106, 338, 678, 'rgba(0,0,0,0)', 2, {
          borderColor: 'rgba(216,189,127,0.55)',
          borderWidth: 1,
          borderRadius: 30,
        }),
        ...commonLuxuryContent(content, {
          panelX: 62,
          panelY: 112,
          panelW: 340,
          panelH: 670,
          darkBg: 'rgba(0,0,0,0)',
          brandY: 160,
          servicesY: 400,
          contactY: 695,
        }).filter((layer) => layer.id !== 'panel-bg'),
      ];

    case 'split-contact':
      return [
        box('panel-bg', 'Nền trái trắng', 35, 155, 300, 520, whiteGlass, 1, {
          borderRadius: 28,
        }),
        box('contact-bg', 'Nền liên hệ phải', 335, 155, 140, 520, '#111111', 1, {
          borderRadius: 28,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 58, 180, 250, 62, 2, {
          fontSize: 30,
          color: '#111111',
          textAlign: 'left',
          letterSpacing: 3,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 60, 240, 240, 28, 2, {
          fontSize: 13,
          color: '#555555',
        }),
        serviceList(content, 58, 292, 245, 330, 2, {
          color: '#111111',
          fontSize: 13,
        }),
        text('contact-title', 'Liên hệ', 'LIÊN HỆ', 352, 205, 105, 38, 2, {
          fontSize: 18,
          fontWeight: 800,
          color: gold,
          textAlign: 'center',
        }),
        text('hotline', 'Hotline', content.phone, 350, 300, 108, 60, 2, {
          fontSize: 20,
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.1,
        }),
        text('facebook', 'Facebook', content.facebook, 350, 405, 108, 60, 2, {
          fontSize: 14,
          color: '#ffffff',
          textAlign: 'center',
        }),
        text('address', 'Địa chỉ', content.address, 348, 520, 112, 100, 2, {
          fontSize: 12,
          color: 'rgba(255,255,255,0.75)',
          textAlign: 'center',
          lineHeight: 1.25,
        }),
      ];

    case 'rounded-dark':
      return commonLuxuryContent(content, {
        panelX: 62,
        panelY: 105,
        panelW: 345,
        panelH: 680,
        darkBg: 'rgba(0,0,0,0.76)',
        brandY: 155,
        servicesY: 385,
        contactY: 690,
      }).map((layer) =>
        layer.id === 'panel-bg'
          ? { ...layer, borderRadius: 999 }
          : layer
      );

    case 'vertical-menu':
      return [
        box('panel-bg', 'Nền menu dọc', 28, 90, 330, 720, 'rgba(10,10,10,0.82)', 1, {
          borderRadius: 22,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 55, 120, 270, 60, 2, {
          fontSize: 28,
          color: cream,
          letterSpacing: 4,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 56, 178, 260, 28, 2, {
          fontSize: 13,
          color: '#ffffff',
        }),
        box('hotline-bg', 'Nền hotline', 55, 228, 250, 50, gold, 2, {
          borderRadius: 16,
        }),
        text('hotline', 'Hotline', content.phone, 75, 240, 210, 28, 3, {
          fontSize: 19,
          fontWeight: 900,
          color: '#111111',
          textAlign: 'center',
        }),
        serviceList(content, 56, 310, 260, 360, 2, {
          fontSize: 13,
          color: '#ffffff',
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 56, 700, 260, 26, 2, {
          fontSize: 13,
          color: '#ffffff',
        }),
        text('address', 'Địa chỉ', content.address, 56, 732, 260, 55, 2, {
          fontSize: 12,
          color: 'rgba(255,255,255,0.72)',
        }),
      ];

    case 'soft-pink':
      return [
        box('panel-bg', 'Nền hồng', 45, 108, 370, 695, pinkGlass, 1, {
          borderColor: '#f4a8bf',
          borderWidth: 1,
          borderRadius: 34,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 72, 142, 310, 58, 2, {
          fontSize: 31,
          color: '#9f2f57',
          textAlign: 'center',
          letterSpacing: 4,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 74, 202, 300, 30, 2, {
          fontSize: 14,
          color: '#b44b70',
          textAlign: 'center',
        }),
        box('hotline-bg', 'Nền hotline', 82, 254, 280, 48, '#ffffff', 2, {
          borderRadius: 999,
        }),
        text('hotline', 'Hotline', `Hotline: ${content.phone}`, 95, 265, 255, 28, 3, {
          fontSize: 17,
          fontWeight: 900,
          color: '#9f2f57',
          textAlign: 'center',
        }),
        serviceList(content, 75, 340, 300, 330, 2, {
          color: '#3f1f2b',
          fontSize: 14,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 76, 700, 300, 28, 2, {
          color: '#7a314a',
          fontSize: 14,
        }),
        text('address', 'Địa chỉ', content.address, 76, 732, 300, 48, 2, {
          color: '#7a314a',
          fontSize: 12,
        }),
      ];

    case 'premium-footer':
      return [
        box('panel-bg', 'Nền footer', 20, 605, 480, 270, 'rgba(0,0,0,0.82)', 1, {
          borderRadius: 34,
          borderColor: gold,
          borderWidth: 1,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 50, 630, 280, 55, 2, {
          fontSize: 30,
          color: cream,
          letterSpacing: 5,
        }),
        text('hotline', 'Hotline', content.phone, 345, 642, 125, 35, 2, {
          fontSize: 18,
          fontWeight: 900,
          color: '#111111',
          background: gold,
          textAlign: 'center',
          borderRadius: 999,
        }),
        serviceList(content, 50, 700, 405, 95, 2, {
          fontSize: 12,
          color: '#ffffff',
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 50, 815, 190, 26, 2, {
          fontSize: 13,
          color: '#ffffff',
        }),
        text('address', 'Địa chỉ', content.address, 250, 805, 210, 48, 2, {
          fontSize: 12,
          color: 'rgba(255,255,255,0.75)',
        }),
      ];

    case 'top-luxury-bar':
      return [
        box('panel-bg', 'Nền top luxury', 30, 42, 460, 315, 'rgba(0,0,0,0.72)', 1, {
          borderRadius: 42,
          borderColor: gold,
          borderWidth: 1,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 62, 78, 400, 72, 2, {
          fontSize: 40,
          color: cream,
          textAlign: 'center',
          letterSpacing: 8,
        }),
        text('hotline', 'Hotline', `☎ ${content.phone}`, 142, 160, 240, 42, 2, {
          fontSize: 22,
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
        }),
        text('service-title', 'Dịch vụ chính', 'FILLER • BOTOX • MESO • BAP', 66, 220, 390, 32, 2, {
          fontSize: 16,
          color: gold,
          textAlign: 'center',
          letterSpacing: 4,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 70, 285, 180, 34, 2, {
          fontSize: 13,
          color: '#ffffff',
        }),
        text('address', 'Địa chỉ', `Đc: ${content.address}`, 270, 275, 180, 55, 2, {
          fontSize: 12,
          color: '#ffffff',
        }),
      ];

    case 'black-gold-sidebar':
      return commonLuxuryContent(content, {
        panelX: 24,
        panelY: 80,
        panelW: 320,
        panelH: 740,
        darkBg: 'rgba(0,0,0,0.86)',
        brandY: 130,
        servicesY: 360,
        contactY: 720,
      });

    case 'white-clean-sidebar':
      return [
        box('panel-bg', 'Nền trắng clean', 28, 82, 345, 730, 'rgba(255,255,255,0.92)', 1, {
          borderRadius: 28,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 55, 118, 285, 62, 2, {
          fontSize: 31,
          color: '#111',
          letterSpacing: 4,
          textAlign: 'center',
        }),
        text('subtitle', 'Subtitle', content.subtitle, 60, 178, 275, 26, 2, {
          color: '#666',
          textAlign: 'center',
          fontSize: 13,
        }),
        text('hotline', 'Hotline', `Hotline: ${content.phone}`, 60, 230, 275, 42, 2, {
          background: '#111',
          color: '#fff',
          borderRadius: 999,
          textAlign: 'center',
          fontWeight: 900,
          fontSize: 17,
        }),
        text('service-title', 'Tiêu đề dịch vụ', 'SERVICES', 60, 305, 270, 32, 2, {
          color: '#111',
          fontWeight: 900,
          letterSpacing: 4,
          textAlign: 'center',
        }),
        serviceList(content, 58, 352, 280, 340, 2, {
          color: '#111',
          fontSize: 13,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 60, 720, 270, 26, 2, {
          color: '#111',
          fontSize: 13,
        }),
        text('address', 'Địa chỉ', content.address, 60, 752, 270, 50, 2, {
          color: '#555',
          fontSize: 12,
        }),
      ];

    case 'rose-glass-card':
      return [
        box('panel-bg', 'Nền rose glass', 50, 105, 370, 690, 'rgba(120,30,60,0.42)', 1, {
          borderColor: 'rgba(255,255,255,0.45)',
          borderWidth: 1,
          borderRadius: 38,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 78, 145, 310, 62, 2, {
          fontSize: 32,
          color: '#fff',
          textAlign: 'center',
          letterSpacing: 5,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 82, 205, 300, 28, 2, {
          color: 'rgba(255,255,255,0.82)',
          textAlign: 'center',
          fontSize: 14,
        }),
        text('hotline', 'Hotline', content.phone, 105, 255, 250, 44, 2, {
          background: 'rgba(255,255,255,0.9)',
          color: '#8a2448',
          textAlign: 'center',
          borderRadius: 999,
          fontWeight: 900,
          fontSize: 19,
        }),
        serviceList(content, 82, 345, 295, 330, 2, {
          color: '#ffffff',
          fontSize: 14,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 82, 705, 295, 28, 2, {
          color: '#fff',
          fontSize: 14,
        }),
        text('address', 'Địa chỉ', content.address, 82, 735, 295, 48, 2, {
          color: 'rgba(255,255,255,0.78)',
          fontSize: 12,
        }),
      ];

    case 'center-title-list':
      return [
        box('panel-bg', 'Nền center', 52, 115, 390, 680, 'rgba(0,0,0,0.62)', 1, {
          borderRadius: 26,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 80, 150, 335, 70, 2, {
          fontSize: 36,
          color: cream,
          textAlign: 'center',
          letterSpacing: 6,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 85, 220, 325, 28, 2, {
          fontSize: 14,
          color: '#fff',
          textAlign: 'center',
        }),
        text('hotline', 'Hotline', `Hotline: ${content.phone}`, 105, 270, 280, 42, 2, {
          fontSize: 18,
          fontWeight: 900,
          color: '#111',
          background: gold,
          borderRadius: 999,
          textAlign: 'center',
        }),
        serviceList(content, 88, 360, 315, 330, 2, {
          fontSize: 14,
          color: '#fff',
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 90, 712, 310, 30, 2, {
          textAlign: 'center',
          fontSize: 14,
          color: '#fff',
        }),
        text('address', 'Địa chỉ', content.address, 90, 742, 310, 42, 2, {
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(255,255,255,0.75)',
        }),
      ];

    case 'corner-badge-list':
      return [
        box('panel-bg', 'Nền badge', 35, 110, 385, 660, 'rgba(0,0,0,0.7)', 1, {
          borderRadius: 30,
        }),
        box('badge', 'Badge hotline', 270, 88, 140, 62, gold, 2, {
          borderRadius: 999,
        }),
        text('hotline', 'Hotline', content.phone, 282, 105, 115, 28, 3, {
          color: '#111',
          fontWeight: 900,
          fontSize: 16,
          textAlign: 'center',
        }),
        text('brand', 'Tên thương hiệu', content.brand, 62, 145, 300, 62, 2, {
          color: cream,
          fontSize: 34,
          letterSpacing: 5,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 64, 205, 285, 28, 2, {
          color: '#fff',
          fontSize: 13,
        }),
        serviceList(content, 62, 270, 305, 350, 2, {
          color: '#fff',
          fontSize: 14,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 62, 645, 300, 30, 2, {
          color: '#fff',
          fontSize: 14,
        }),
        text('address', 'Địa chỉ', content.address, 62, 680, 300, 52, 2, {
          color: 'rgba(255,255,255,0.75)',
          fontSize: 12,
        }),
      ];

    case 'full-width-bottom':
      return [
        box('panel-bg', 'Nền ngang dưới', 18, 560, 485, 315, 'rgba(0,0,0,0.78)', 1, {
          borderRadius: 30,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 45, 590, 275, 55, 2, {
          color: cream,
          fontSize: 30,
          letterSpacing: 5,
        }),
        text('hotline', 'Hotline', content.phone, 342, 600, 130, 38, 2, {
          color: '#111',
          background: gold,
          borderRadius: 999,
          fontWeight: 900,
          fontSize: 17,
          textAlign: 'center',
        }),
        serviceList(content, 45, 665, 420, 105, 2, {
          color: '#fff',
          fontSize: 12,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 45, 798, 190, 28, 2, {
          color: '#fff',
          fontSize: 13,
        }),
        text('address', 'Địa chỉ', content.address, 250, 785, 215, 55, 2, {
          color: 'rgba(255,255,255,0.76)',
          fontSize: 12,
        }),
      ];

    case 'bento-beauty':
      return [
        box('brand-card', 'Ô thương hiệu', 42, 112, 410, 135, 'rgba(0,0,0,0.75)', 1, {
          borderRadius: 28,
        }),
        text('brand', 'Tên thương hiệu', content.brand, 68, 140, 355, 60, 2, {
          color: cream,
          fontSize: 33,
          textAlign: 'center',
          letterSpacing: 5,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 75, 200, 340, 28, 2, {
          color: '#fff',
          textAlign: 'center',
          fontSize: 13,
        }),
        box('hotline-bg', 'Nền hotline', 42, 265, 198, 85, gold, 1, {
          borderRadius: 26,
        }),
        text('hotline', 'Hotline', content.phone, 62, 288, 160, 40, 2, {
          color: '#111',
          fontWeight: 900,
          fontSize: 18,
          textAlign: 'center',
        }),
        box('social-bg', 'Nền facebook', 254, 265, 198, 85, 'rgba(255,255,255,0.86)', 1, {
          borderRadius: 26,
        }),
        text('facebook', 'Facebook', content.facebook, 274, 288, 160, 40, 2, {
          color: '#111',
          fontWeight: 800,
          fontSize: 16,
          textAlign: 'center',
        }),
        box('service-bg', 'Nền dịch vụ', 42, 372, 410, 385, 'rgba(0,0,0,0.72)', 1, {
          borderRadius: 28,
        }),
        serviceList(content, 70, 402, 350, 290, 2, {
          color: '#fff',
          fontSize: 14,
        }),
        text('address', 'Địa chỉ', content.address, 70, 705, 350, 38, 2, {
          color: 'rgba(255,255,255,0.75)',
          fontSize: 12,
          textAlign: 'center',
        }),
      ];

    case 'minimal-line':
      return [
        text('brand', 'Tên thương hiệu', content.brand, 58, 135, 360, 65, 2, {
          color: '#111',
          fontSize: 38,
          letterSpacing: 7,
          textAlign: 'center',
        }),
        box('line-1', 'Line trên', 100, 215, 275, 2, '#111111', 1, {
          borderRadius: 0,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 72, 230, 330, 28, 2, {
          color: '#111',
          fontSize: 14,
          textAlign: 'center',
          letterSpacing: 2,
        }),
        text('hotline', 'Hotline', content.phone, 130, 285, 220, 42, 2, {
          color: '#111',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: 999,
          fontSize: 20,
          fontWeight: 900,
          textAlign: 'center',
        }),
        box('service-bg', 'Nền dịch vụ', 58, 360, 360, 310, 'rgba(255,255,255,0.78)', 1, {
          borderRadius: 20,
        }),
        serviceList(content, 78, 382, 320, 250, 2, {
          color: '#111',
          fontSize: 13,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 78, 700, 320, 28, 2, {
          color: '#111',
          textAlign: 'center',
          fontSize: 14,
        }),
        text('address', 'Địa chỉ', content.address, 78, 732, 320, 40, 2, {
          color: '#333',
          textAlign: 'center',
          fontSize: 12,
        }),
      ];

    case 'magazine-cover':
      return [
        text('brand', 'Tên thương hiệu', content.brand, 35, 70, 420, 82, 2, {
          color: cream,
          fontSize: 42,
          fontWeight: 500,
          textAlign: 'center',
          letterSpacing: 8,
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 18,
        }),
        text('subtitle', 'Subtitle', content.subtitle, 60, 160, 360, 34, 2, {
          color: '#fff',
          fontSize: 15,
          textAlign: 'center',
          letterSpacing: 3,
          background: 'rgba(0,0,0,0.45)',
          borderRadius: 999,
        }),
        text('hotline', 'Hotline', content.phone, 145, 218, 200, 44, 2, {
          color: '#111',
          background: gold,
          borderRadius: 999,
          fontSize: 20,
          fontWeight: 900,
          textAlign: 'center',
        }),
        box('service-bg', 'Nền dịch vụ', 38, 485, 420, 285, 'rgba(0,0,0,0.72)', 1, {
          borderRadius: 26,
        }),
        text('service-title', 'Tiêu đề dịch vụ', 'BEAUTY SERVICES', 70, 505, 350, 32, 2, {
          color: gold,
          fontSize: 17,
          fontWeight: 900,
          textAlign: 'center',
          letterSpacing: 3,
        }),
        serviceList(content, 70, 548, 350, 150, 2, {
          color: '#fff',
          fontSize: 12,
        }),
        text('facebook', 'Facebook', `Facebook: ${content.facebook}`, 68, 710, 180, 32, 2, {
          color: '#fff',
          fontSize: 13,
        }),
        text('address', 'Địa chỉ', content.address, 260, 702, 170, 52, 2, {
          color: 'rgba(255,255,255,0.75)',
          fontSize: 11,
        }),
      ];

    default:
      return commonLuxuryContent(content, {
        panelX: 24,
        panelY: 70,
        panelW: 365,
        panelH: 760,
      });
  }
}