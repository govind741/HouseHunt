// Property Images Configuration
// You can easily change these images by replacing the files in the assets/images folder

export const PROPERTY_IMAGES = [
  {
    id: 'property_1',
    image: require('./cardImage.jpg'), // Using existing image
  },
  {
    id: 'property_2',
    image: require('./cardImage2.jpg'), // Using existing image
  },
  {
    id: 'property_3',
    image: require('./reviewProfile1.jpg'), // Using existing image
  },
  {
    id: 'property_4',
    image: require('./reviewProfile2.jpg'), // Using existing image
  },
];

// Alternative: You can also add more images by placing them in the assets/images folder
// and adding them here like:
// {
//   id: 'property_5',
//   image: require('./your-new-image.jpg'),
// },

export default PROPERTY_IMAGES;
