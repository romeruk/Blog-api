import { GqlModuleOptions } from '@nestjs/graphql';

export const graphqlOptions: GqlModuleOptions = {
  autoSchemaFile: 'schema.gql',
  context: ({ req, res }) => ({ req, res }),
};
