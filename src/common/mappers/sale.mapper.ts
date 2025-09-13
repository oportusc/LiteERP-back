export function mapSaleToGraphQL(sale: any) {
  if (!sale) return null;
  
  return {
    id: sale._id?.toString() || sale.id,
    customerId: sale.customerId?.toString(),
    saleDate: sale.saleDate,
    items: sale.items?.map((item: any) => ({
      productId: item.productId?.toString(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      product: item.productId // Será populado si está disponible
    })),
    subtotal: sale.subtotal,
    tax: sale.tax || 0,
    total: sale.total,
    isPaid: sale.isPaid,
    paidAmount: sale.paidAmount || 0,
    pendingAmount: sale.pendingAmount,
    paymentDate: sale.paymentDate,
    notes: sale.notes,
    paymentStatus: sale.paymentStatus,
    isActive: sale.isActive,
    companyId: sale.companyId?.toString(),
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
    customer: sale.customerId // Será populado si está disponible
  };
}
