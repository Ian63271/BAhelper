// Lazy image loader - only loads images when needed
// Assumes image filenames follow a predictable pattern (e.g., character_45.png)

const imageCache: Record<string, any> = {};

export const loadCharacterImage = (imagePath: string) => {
  // Return cached image if already loaded
  if (imageCache[imagePath]) {
    return imageCache[imagePath];
  }

  try {
    // Dynamically require only the image being displayed
    const image = require(imagePath);
    imageCache[imagePath] = image;
    return image;
  } catch (error) {
    console.warn(`Failed to load image: ${imagePath}`);
    // Return a placeholder or null
    return null;
  }
};
