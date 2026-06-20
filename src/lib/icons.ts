export const getIconSymbol = (iconName: string): string => {
  switch (iconName) {
    case 'house': return '🏠';
    case 'directions_car': return '🚗';
    case 'laptop_mac': return '💻';
    case 'flight_takeoff': return '✈️';
    case 'school': return '🎓';
    case 'trending_up': return '📈';
    case 'payments': return '💵';
    case 'shopping_bag': return '🛍️';
    default: return iconName || '🎯';
  }
};
