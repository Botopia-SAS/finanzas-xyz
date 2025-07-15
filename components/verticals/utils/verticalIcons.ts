// components/verticals/utils/verticalIcons.ts
export const getVerticalIcon = (verticalName: string): string => {
  const iconMap: Record<string, string> = {
    "Lechería": "🥛",
    "Ceba de Ganado": "🐄",
    "Embriones": "🧬",
    "Cría": "🐮",
    "Ganadería": "🐄",
    "Agricultura": "🌾",
    "Avicultura": "🐔",
    "Porcicultura": "🐷",
    "Apicultura": "🐝",
  };

  return iconMap[verticalName] || "📊";
};
