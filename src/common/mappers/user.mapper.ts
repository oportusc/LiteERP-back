import { User as MongooseUser } from '../../users/schemas/user.schema';
import { User as GraphQLUser } from '../../users/entities/user.entity';

export function mapUserToGraphQL(mongooseUser: MongooseUser): GraphQLUser {
  return {
    id: (mongooseUser as any)._id.toString(),
    email: mongooseUser.email,
    name: mongooseUser.name,
    role: mongooseUser.role || 'user', // Valor por defecto si role es null/undefined
    companies: mongooseUser.companies || [],
    isActive: mongooseUser.isActive,
    createdAt: (mongooseUser as any).createdAt,
    updatedAt: (mongooseUser as any).updatedAt,
  };
}
