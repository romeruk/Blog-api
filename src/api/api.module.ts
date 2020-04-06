import { Module } from '@nestjs/common';
import { UserResolver } from './resolvers/user.resolver';
import { UserService } from 'src/service/services/user.service';
import { VerificationTokenGenerator } from 'src/service/helpers/verification-token-generator';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthService } from 'src/service/services/auth.service';
import { ServiceModule } from 'src/service/service.module';
import { CategoryResolver } from './resolvers/category.resolver';
import { CategoryService } from 'src/service/services/category.service';
import { PostResolver } from './resolvers/post.resolver';
import { PostService } from 'src/service/services/post.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

const resolvers = [UserResolver, AuthResolver, CategoryResolver, PostResolver];
const services = [UserService, AuthService, CategoryService, PostService];
const modules = [ServiceModule, CloudinaryModule];

@Module({
  imports: [...modules],
  providers: [VerificationTokenGenerator, ...services, ...resolvers],
})
export class ApiModule {}
