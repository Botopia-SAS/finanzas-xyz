// components/verticals/index.ts
export { default as VerticalCard } from './VerticalCard';
export { default as VerticalsList } from './VerticalsList';
export { default as VerticalTemplateModal } from './VerticalTemplateModal';
export { default as VerticalTemplateCard } from './VerticalTemplateCard';
export { default as VerticalTemplatesList } from './VerticalTemplatesList';
export { default as ConfirmDeleteModal } from './ConfirmDeleteModal';
export { useVerticals } from './hooks/useVerticals';
export type { Vertical } from './hooks/useVerticals';
export { VERTICAL_TEMPLATES } from './constants/verticalTemplates';
export type { VerticalTemplate } from './constants/verticalTemplates';
export { getVerticalIcon } from './utils/verticalIcons';
