import { Company as MongooseCompany } from '../../companies/schemas/company.schema';
import { Company as GraphQLCompany } from '../../companies/entities/company.entity';
import { mapUserToGraphQL } from './user.mapper';

export function mapCompanyToGraphQL(mongooseCompany: any): GraphQLCompany {
  return {
    id: mongooseCompany._id.toString(),
    name: mongooseCompany.name,
    owner: mongooseCompany.owner ? mapUserToGraphQL(mongooseCompany.owner) : null,
    members: mongooseCompany.members?.map((member: any) => {
      if (member) {
        return mapUserToGraphQL(member);
      }
      return null;
    }).filter(Boolean) || [], // Filtrar miembros nulos
    maxMembers: mongooseCompany.maxMembers,
    isActive: mongooseCompany.isActive,
    createdAt: mongooseCompany.createdAt,
    updatedAt: mongooseCompany.updatedAt,
  };
}
