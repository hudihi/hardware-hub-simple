/**
 * Utility to generate Bootstrap Icons for categories based on their names
 */

export const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  // Tools category icons
  if (name.includes('tool') || name.includes('vifaa') || name.includes('chuma') || name.includes('nyundo')) {
    return 'bi-tools';
  }
  
  // Electrical category icons
  if (name.includes('electr') || name.includes('umeme') || name.includes('power') || name.includes('wiri') || name.includes('balbu')) {
    return 'bi-lightning';
  }
  
  // Plumbing category icons
  if (name.includes('plumb') || name.includes('bomb') || name.includes('mabomba') || name.includes('water') || name.includes('maji')) {
    return 'bi-droplet';
  }
  
  // Paint category icons
  if (name.includes('paint') || name.includes('rang') || name.includes('color') || name.includes('brush')) {
    return 'bi-palette';
  }
  
  // Building category icons
  if (name.includes('build') || name.includes('ujenz') || name.includes('saruj') || name.includes('brick') || name.includes('chuma')) {
    return 'bi-bricks';
  }
  
  // Garden category icons
  if (name.includes('gard') || name.includes('bustan') || name.includes('plant') || name.includes('flower')) {
    return 'bi-flower1';
  }
  
  // Safety category icons
  if (name.includes('safe') || name.includes('helmet') || name.includes('glov') || name.includes('protec')) {
    return 'bi-shield-check';
  }
  
  // Hardware category icons
  if (name.includes('hard') || name.includes('screw') || name.includes('bolt') || name.includes('nut')) {
    return 'bi-gear';
  }
  
  // Lighting category icons
  if (name.includes('light') || name.includes('lamp') || name.includes('torch')) {
    return 'bi-lightbulb';
  }
  
  // Cleaning category icons
  if (name.includes('clean') || name.includes('brush') || name.includes('mop')) {
    return 'bi-bucket';
  }
  
  // Default icon for unknown categories
  return 'bi-grid';
};

/**
 * Get icon color based on category
 */
export const getCategoryIconColor = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('electr') || name.includes('umeme')) return '#FFD700'; // Gold for electrical
  if (name.includes('plumb') || name.includes('mabomba')) return '#4169E1'; // Blue for plumbing
  if (name.includes('paint') || name.includes('rang')) return '#FF6347'; // Red for paint
  if (name.includes('build') || name.includes('ujenz')) return '#8B4513'; // Brown for building
  if (name.includes('gard') || name.includes('bustan')) return '#228B22'; // Green for garden
  if (name.includes('tool') || name.includes('vifaa')) return '#696969'; // Gray for tools
  
  return '#7C5A3C'; // Default brown color
};
