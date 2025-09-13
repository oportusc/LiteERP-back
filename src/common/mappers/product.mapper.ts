export function mapProductToGraphQL(product: any) {
  if (!product) return null;
  
  return {
    id: product._id?.toString() || product.id,
    name: product.name,
    description: product.description,
    unitOfMeasure: product.unitOfMeasure,
    costPerUnit: product.costPerUnit,
    currentStock: product.currentStock,
    supplierId: product.supplierId?.toString(),
    esMix: product.esMix || false,
    receta: product.receta?.map((r: any) => ({
      productId: r.productId?.toString(),
      cantidad: r.cantidad,
      unidad: r.unidad,
      product: r.productId // Será populado si está disponible
    })),
    isActive: product.isActive,
    companyId: product.companyId?.toString(),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    calculatedCost: product.calculatedCost,
    availableStock: product.availableStock
  };
}
