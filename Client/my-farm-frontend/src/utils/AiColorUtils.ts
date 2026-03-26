interface DiseaseColorConfig {
  bg: string;
  text: string;
}

export const getDiseaseColorConfig = (diseaseClass: string | null | undefined): DiseaseColorConfig => {
  // Handle null, undefined, or non-string cases
  if (!diseaseClass || typeof diseaseClass !== 'string') {
    return {
      bg: 'bg-gray-50',
      text: 'text-gray-700'
    };
  }

  const normalizedClass = diseaseClass.toLowerCase().trim();

  // Handle empty string after trim
  if (!normalizedClass) {
    return {
      bg: 'bg-gray-50',
      text: 'text-gray-700'
    };
  }

  // Healthy - Green
  if (normalizedClass.includes('healthy')) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700'
    };
  }

  // Warning - Yellow/Orange
  if (
    normalizedClass.includes('deficiency') ||
    normalizedClass.includes('dry')
  ) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700'
    };
  }

  // Danger - Red/Rose
  if (
    normalizedClass.includes('anthracnose') ||
    normalizedClass.includes('bacterial blight') ||
    normalizedClass.includes('citrus canker') ||
    normalizedClass.includes('curl virus') ||
    normalizedClass.includes('sooty mould') ||
    normalizedClass.includes('spider mites')
  ) {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700'
    };
  }

  // Default - Gray
  return {
    bg: 'bg-gray-50',
    text: 'text-gray-700'
  };
};
