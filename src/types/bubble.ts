export type BubbleTemplateId =
  | 'luxury-card'
  | 'left-service-panel'
  | 'glass-top-banner'
  | 'minimal-white-card'
  | 'gold-frame'
  | 'split-contact'
  | 'rounded-dark'
  | 'vertical-menu'
  | 'soft-pink'
  | 'premium-footer'
  | 'top-luxury-bar'
  | 'black-gold-sidebar'
  | 'white-clean-sidebar'
  | 'rose-glass-card'
  | 'center-title-list'
  | 'corner-badge-list'
  | 'full-width-bottom'
  | 'bento-beauty'
  | 'minimal-line'
  | 'magazine-cover';

export type BubbleBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BubbleContent = {
  brand: string;
  subtitle: string;
  phone: string;
  facebook: string;
  address: string;
  services: string[];
};

export type BubbleTemplate = {
  id: BubbleTemplateId;
  name: string;
  description: string;
  defaultBox: BubbleBox;
};