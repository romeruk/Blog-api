import * as CloudinaryLib from 'cloudinary';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const Cloudinary = 'lib:cloudinary';

/* eslint-disable @typescript-eslint/camelcase */
export const cloudinaryProvider: Provider = {
  provide: Cloudinary,
  useFactory: async (configService: ConfigService) => {
    CloudinaryLib.v2.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLUDINARY_API_SECRET'),
    });
    return CloudinaryLib.v2;
  },
  inject: [ConfigService],
};
