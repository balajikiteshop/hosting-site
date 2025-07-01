import ImageKit from 'imagekit-javascript';

// Using type assertion to handle the missing type definition
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
  authenticationEndpoint: '/api/imagekit/auth'
} as {
  publicKey: string;
  urlEndpoint: string;
  authenticationEndpoint: string;
});
