import type { BubbleContent, BubbleTemplate } from '../types/bubble';

export const defaultBubbleContent: BubbleContent = {
  brand: 'SAM SKINLAB',
  subtitle: 'Chăm sóc da & thẩm mỹ',
  phone: '0817 199 996',
  facebook: 'Đào Thị Chúc',
  address: 'TDP Liên Sơn - P. Phổ Yên - T. Thái Nguyên',
  services: [
    'Triệt lông lạnh',
    'Chăm sóc da: Mụn - Nám - Tàn nhang',
    'Gội đầu dưỡng sinh',
    'Chăm sóc cổ vai gáy',
    'Chăm sóc body',
    'Thải độc KB.Pure - CO2',
    'Meso căng bóng - Trắng sáng',
    'Làm hồng vùng kín - nhũ hoa',
    'Điều trị thâm nách',
    'Filler - Botox - Meso - BAP',
    'Phun xăm thẩm mỹ',
  ],
};

export const bubbleTemplates: BubbleTemplate[] = [
  {
    id: 'luxury-card',
    name: 'Luxury Card',
    description: 'Khung đen vàng sang trọng.',
    defaultBox: { x: 46, y: 80, width: 360, height: 720 },
  },
  {
    id: 'left-service-panel',
    name: 'Left Panel',
    description: 'Panel dọc nhiều dịch vụ.',
    defaultBox: { x: 28, y: 72, width: 370, height: 750 },
  },
  {
    id: 'glass-top-banner',
    name: 'Glass Top',
    description: 'Banner kính nằm trên.',
    defaultBox: { x: 34, y: 40, width: 450, height: 260 },
  },
  {
    id: 'minimal-white-card',
    name: 'Minimal White',
    description: 'Card trắng tối giản.',
    defaultBox: { x: 44, y: 120, width: 360, height: 650 },
  },
  {
    id: 'gold-frame',
    name: 'Gold Frame',
    description: 'Khung vàng cao cấp.',
    defaultBox: { x: 48, y: 86, width: 360, height: 700 },
  },
  {
    id: 'split-contact',
    name: 'Split Contact',
    description: 'Chia thông tin và liên hệ.',
    defaultBox: { x: 40, y: 140, width: 430, height: 520 },
  },
  {
    id: 'rounded-dark',
    name: 'Rounded Dark',
    description: 'Bubble bo tròn mềm.',
    defaultBox: { x: 60, y: 110, width: 350, height: 660 },
  },
  {
    id: 'vertical-menu',
    name: 'Vertical Menu',
    description: 'Menu dọc hiện đại.',
    defaultBox: { x: 34, y: 90, width: 340, height: 720 },
  },
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    description: 'Tone hồng nhẹ nhàng.',
    defaultBox: { x: 42, y: 105, width: 370, height: 690 },
  },
  {
    id: 'premium-footer',
    name: 'Premium Footer',
    description: 'Thanh thông tin dưới ảnh.',
    defaultBox: { x: 24, y: 610, width: 470, height: 260 },
  },

  {
    id: 'top-luxury-bar',
    name: 'Top Luxury Bar',
    description: 'Header ngang cao cấp.',
    defaultBox: { x: 30, y: 38, width: 460, height: 310 },
  },
  {
    id: 'black-gold-sidebar',
    name: 'Black Gold Sidebar',
    description: 'Sidebar đen vàng gọn.',
    defaultBox: { x: 24, y: 70, width: 320, height: 760 },
  },
  {
    id: 'white-clean-sidebar',
    name: 'White Clean Sidebar',
    description: 'Sidebar trắng sạch.',
    defaultBox: { x: 28, y: 80, width: 340, height: 720 },
  },
  {
    id: 'rose-glass-card',
    name: 'Rose Glass Card',
    description: 'Glass hồng pastel.',
    defaultBox: { x: 50, y: 100, width: 370, height: 690 },
  },
  {
    id: 'center-title-list',
    name: 'Center Title List',
    description: 'Tiêu đề giữa, list cân đối.',
    defaultBox: { x: 50, y: 110, width: 390, height: 680 },
  },
  {
    id: 'corner-badge-list',
    name: 'Corner Badge List',
    description: 'Badge góc nổi bật.',
    defaultBox: { x: 32, y: 105, width: 385, height: 660 },
  },
  {
    id: 'full-width-bottom',
    name: 'Full Width Bottom',
    description: 'Panel ngang dưới rộng.',
    defaultBox: { x: 20, y: 560, width: 480, height: 310 },
  },
  {
    id: 'bento-beauty',
    name: 'Bento Beauty',
    description: 'Bố cục ô bento.',
    defaultBox: { x: 42, y: 110, width: 410, height: 660 },
  },
  {
    id: 'minimal-line',
    name: 'Minimal Line',
    description: 'Đường line tinh gọn.',
    defaultBox: { x: 48, y: 130, width: 380, height: 620 },
  },
  {
    id: 'magazine-cover',
    name: 'Magazine Cover',
    description: 'Poster kiểu bìa tạp chí.',
    defaultBox: { x: 36, y: 70, width: 410, height: 760 },
  },
];