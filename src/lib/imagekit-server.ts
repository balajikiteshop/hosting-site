import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

export async function deleteImageFromImageKit(imageUrl: string) {
  try {
    // Extract file ID from the URL
    // ImageKit URLs look like: https://ik.imagekit.io/balajikitehouse/product-123456789
    const fileId = imageUrl.split('/').pop();
    if (!fileId) {
      throw new Error('Invalid ImageKit URL');
    }

    // Delete the file from ImageKit
    await imagekit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error('Error deleting image from ImageKit:', error);
    return false;
  }
}
