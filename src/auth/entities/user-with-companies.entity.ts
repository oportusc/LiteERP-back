import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@ObjectType()
export class UserWithCompanies extends User {
  @Field(() => [Company], { nullable: true })
  companiesDetails?: Company[];
}

