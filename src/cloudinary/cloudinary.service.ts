import { Injectable, Inject } from '@nestjs/common';
import { Cloudinary } from './cloudinary.provider';
// import { FileUpload } from 'src/api/resolvers/post.resolver';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(Cloudinary) private cloudinary) {}

  // async UploadFile(file: FileUpload) {
  //   const { filename, createReadStream } = await file[0];

  //   /* eslint-disable @typescript-eslint/camelcase */
  //   this.cloudinary.config({
  //     cloud_name: 'blogapi',
  //     api_key: '567442435347886',
  //     api_secret: 'b8GnG6B46dUhUvuOV1lCMYHRYdY',
  //   });

  //   const stream = this.cloudinary.uploader.upload_stream(function(
  //     error,
  //     result,
  //   ) {
  //     if (error) console.log(error);

  //     console.log(result);
  //   });
  //   createReadStream(filename).pipe(stream);
  // }
}
