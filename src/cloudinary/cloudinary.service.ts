import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Cloudinary } from './cloudinary.provider';
import { Post } from 'src/entity/post/post.entity';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(Cloudinary) private cloudinary) {}

  uploadImages(contentImages: string[]) {
    const promises: Promise<any>[] = contentImages.map(
      file =>
        new Promise((resolve, reject) => {
          this.cloudinary.uploader.upload(file, function(error, result) {
            if (error) {
              reject(
                new BadRequestException([
                  {
                    name: 'content',
                    message: 'Error uploading images',
                  },
                ]),
              );
            } else {
              resolve(result.url);
            }
          });
        }),
    );

    return promises;
  }

  removeCloudinaryImages(post: Post) {
    const promises: Promise<any>[] = post.images.map(
      image =>
        new Promise((resolve, reject) => {
          this.cloudinary.uploader.destroy(
            image.url.match(/([^\/.]+)\.[^.]*$/)[1],
            function(error, result) {
              if (error) {
                reject(new BadRequestException('Cannot remove image'));
              } else {
                resolve(result);
              }
            },
          );
        }),
    );

    return promises;
  }
}
