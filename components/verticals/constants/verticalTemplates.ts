// components/verticals/constants/verticalTemplates.ts
export interface VerticalTemplate {
  name: string;
  description: string;
  price: number;
  icon: string;
  isActive: boolean;
  isComingSoon?: boolean;
}

export const VERTICAL_TEMPLATES: VerticalTemplate[] = [
  // Verticales activas
  {
    name: "Lechería",
    description: "Gestión de producción de leche, control de vacas y registros diarios.",
    price: 0,
    icon: "🥛",
    isActive: true
  },
  {
    name: "Ceba de Ganado",
    description: "Control de engorde de ganado, manejo de peso y alimentación.",
    price: 0,
    icon: "🐄",
    isActive: true
  },
  {
    name: "Embriones",
    description: "Gestión de transferencia embrionaria, control de receptoras y donantes.",
    price: 0,
    icon: "🧬",
    isActive: true
  },
  {
    name: "Cría",
    description: "Manejo de reproducción, control de montas y partos.",
    price: 0,
    icon: "�",
    isActive: true
  },
  
  // Verticales próximamente (bloqueadas)
  {
    name: "Agricultura",
    description: "Gestión de cultivos, control de siembras y cosechas.",
    price: 0,
    icon: "🌾",
    isActive: false,
    isComingSoon: true
  },
  {
    name: "Avicultura",
    description: "Manejo de aves, producción de huevos y registros sanitarios.",
    price: 0,
    icon: "🐔",
    isActive: false,
    isComingSoon: true
  },
  {
    name: "Porcicultura",
    description: "Manejo de cerdos, control de alimentación y registros sanitarios.",
    price: 0,
    icon: "🐷",
    isActive: false,
    isComingSoon: true
  },
  {
    name: "Apicultura",
    description: "Manejo de colmenas, producción de miel y cuidado de abejas.",
    price: 0,
    icon: "🐝",
    isActive: false,
    isComingSoon: true
  },
];
