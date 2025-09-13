export function mapCustomerToGraphQL(customer: any) {
  if (!customer) return null;
  
  return {
    id: customer._id?.toString() || customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    contactPerson: customer.contactPerson,
    notes: customer.notes,
    isActive: customer.isActive,
    companyId: customer.companyId?.toString(),
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt
  };
}
