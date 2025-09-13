import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CompanyId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    let request;
    
    // Verificar si es GraphQL o REST
    if (context.getType().toString() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }
    
    // Priorizar el header x-company-id
    const headerCompanyId = request.headers['x-company-id'];
    if (headerCompanyId && headerCompanyId.trim() !== '') {
      return headerCompanyId;
    }
    
    // Fallback al companyId del JWT
    return request.user?.companyId || null;
  },
);
