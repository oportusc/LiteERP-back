# 🥜 API de Negocio - Frutos Secos

## 📋 Resumen

API completa para gestión de inventario, ventas y control de stock especializada en frutos secos con soporte para productos mix.

## 🎯 Funcionalidades Principales

### ✅ **Productos**
- ✅ Gestión de materias primas (nueces, almendras, maní, pasas)
- ✅ Creación de productos mix con recetas automáticas
- ✅ Cálculo automático de costos para productos mix
- ✅ Cálculo de stock disponible basado en materias primas
- ✅ Control de unidades de medida (kg, g, lb, oz)

### ✅ **Proveedores**
- ✅ Gestión completa de proveedores
- ✅ Información de contacto y notas
- ✅ Asociación con materias primas

### ✅ **Clientes**
- ✅ Gestión de clientes
- ✅ Información de contacto

### ✅ **Ventas**
- ✅ Creación de órdenes de venta con múltiples productos
- ✅ Control automático de stock (productos simples y mix)
- ✅ Gestión de pagos (pendiente, parcial, pagado)
- ✅ Seguimiento de cuentas por cobrar
- ✅ Cancelación de ventas con reversión de stock

## 🚀 **Endpoints Principales**

### **GraphQL Playground**: `http://localhost:3000/graphql`

### **Productos**
```graphql
# Crear producto simple (materia prima)
mutation {
  createProduct(input: {
    name: "Nueces Premium"
    unitOfMeasure: "kg"
    costPerUnit: 25.50
    currentStock: 100
    supplierId: "supplier_id"
  }) {
    id
    name
    costPerUnit
    currentStock
  }
}

# Crear producto mix
mutation {
  createProduct(input: {
    name: "Mix Premium 250g"
    unitOfMeasure: "g"
    esMix: true
    receta: [
      { productId: "nueces_id", cantidad: 50, unidad: "g" }
      { productId: "almendras_id", cantidad: 50, unidad: "g" }
      { productId: "mani_id", cantidad: 100, unidad: "g" }
      { productId: "pasas_id", cantidad: 50, unidad: "g" }
    ]
  }) {
    id
    name
    calculatedCost
    availableStock
    receta {
      productId
      cantidad
      unidad
    }
  }
}

# Obtener todos los productos
query {
  products {
    id
    name
    esMix
    currentStock
    availableStock
    calculatedCost
  }
}

# Obtener solo materias primas
query {
  materiasPrimas {
    id
    name
    costPerUnit
    currentStock
  }
}

# Obtener solo productos mix
query {
  mixes {
    id
    name
    calculatedCost
    availableStock
    receta {
      cantidad
      unidad
      product {
        name
      }
    }
  }
}
```

### **Ventas**
```graphql
# Crear venta
mutation {
  createSale(input: {
    customerId: "customer_id"
    saleDate: "2024-01-15"
    items: [
      {
        productId: "mix_premium_id"
        quantity: 10
        unitPrice: 15.00
        total: 150.00
      }
    ]
    subtotal: 150.00
    tax: 15.00
    total: 165.00
    paidAmount: 100.00
  }) {
    id
    total
    paidAmount
    pendingAmount
    paymentStatus
  }
}

# Obtener ventas pendientes de pago
query {
  pendingPayments {
    id
    customer {
      name
    }
    total
    paidAmount
    pendingAmount
    saleDate
  }
}

# Agregar pago a una venta
mutation {
  addPayment(saleId: "sale_id", amount: 65.00) {
    id
    paidAmount
    pendingAmount
    paymentStatus
  }
}
```

### **Clientes y Proveedores**
```graphql
# Crear cliente
mutation {
  createCustomer(input: {
    name: "Distribuidora ABC"
    email: "ventas@distribuidoraabc.com"
    phone: "+1234567890"
  }) {
    id
    name
    email
  }
}

# Crear proveedor
mutation {
  createSupplier(input: {
    name: "Frutos del Valle"
    email: "ventas@frutosdelavalle.com"
    contactPerson: "Juan Pérez"
  }) {
    id
    name
    contactPerson
  }
}
```

## 🧮 **Lógica de Negocio Clave**

### **Cálculo de Costos para Mix**
```
Mix Premium 250g:
- 50g nueces ($25.50/kg) = $1.275
- 50g almendras ($30.00/kg) = $1.500  
- 100g maní ($18.00/kg) = $1.800
- 50g pasas ($22.00/kg) = $1.100
Total: $5.675
```

### **Cálculo de Stock Disponible para Mix**
```
Stock actual:
- Nueces: 5000g → 100 unidades de mix posibles
- Almendras: 3000g → 60 unidades de mix posibles
- Maní: 8000g → 80 unidades de mix posibles
- Pasas: 2000g → 40 unidades de mix posibles

Stock disponible del mix: 40 unidades (limitado por las pasas)
```

### **Control de Stock en Ventas**
- Al crear una venta, el stock se reduce automáticamente
- Para productos mix, se reduce el stock de cada materia prima
- Al cancelar una venta, el stock se restaura
- Validación de stock insuficiente antes de crear la venta

## 🔄 **REST Endpoints**

### **Productos**
- `GET /products` - Todos los productos
- `GET /products/materias-primas` - Solo materias primas
- `GET /products/mixes` - Solo productos mix
- `POST /products` - Crear producto
- `PATCH /products/:id` - Actualizar producto
- `PATCH /products/:id/stock` - Actualizar stock

### **Ventas**
- `GET /sales` - Todas las ventas
- `GET /sales/pending-payments` - Ventas pendientes de pago
- `GET /sales/stats` - Estadísticas de ventas
- `POST /sales` - Crear venta
- `PATCH /sales/:id/add-payment` - Agregar pago
- `PATCH /sales/:id/cancel` - Cancelar venta

## 📊 **Características Especiales**

### **Validaciones Automáticas**
- ✅ Stock insuficiente para ventas
- ✅ Productos mix no pueden tener costo manual
- ✅ Materias primas válidas en recetas
- ✅ Nombres únicos por empresa

### **Cálculos en Tiempo Real**
- ✅ Costo de productos mix
- ✅ Stock disponible de productos mix
- ✅ Estados de pago automáticos
- ✅ Montos pendientes

### **Gestión Multi-empresa**
- ✅ Todos los datos aislados por empresa
- ✅ Control de acceso por usuario/empresa
- ✅ Esquemas compartidos pero datos separados

## 🔐 **Autenticación**

Todas las APIs requieren JWT token en el header:
```
Authorization: Bearer <jwt_token>
```

El token incluye automáticamente el `companyId` del usuario autenticado.

## 🎯 **Próximos Pasos Sugeridos**

1. **Frontend**: Integrar estas APIs en el frontend React
2. **Reportes**: Módulo de reportes de ventas y stock
3. **Alertas**: Sistema de alertas por stock bajo
4. **Importación**: Carga masiva de productos desde Excel
5. **Facturación**: Generación de facturas PDF
