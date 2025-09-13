export function mapSupplierToGraphQL(supplier: any) {
  if (!supplier) return null;
  
  return {
    id: supplier._id?.toString() || supplier.id,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    contactPerson: supplier.contactPerson,
    notes: supplier.notes,
    isActive: supplier.isActive,
    companyId: supplier.companyId?.toString(),
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt
  };
}
