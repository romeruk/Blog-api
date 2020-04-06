import * as CloudinaryLib from 'cloudinary';
import { Provider } from '@nestjs/common';

export const Cloudinary = 'lib:cloudinary';
/* eslint-disable @typescript-eslint/camelcase */
CloudinaryLib.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLUDINARY_API_SECRET,
});

export const cloudinaryProvider: Provider = {
  provide: Cloudinary,
  useValue: CloudinaryLib.v2,
};
