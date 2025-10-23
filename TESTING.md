# 🧪 Testing - Menu Burger

## ✅ Configuración Completada

Jasmine y Karma han sido configurados exitosamente en el proyecto.

## 🚀 Ejecutar Tests

```bash
# Ejecutar tests básicos (recomendado para empezar)
npm run test:example

# Ejecutar todos los tests
npm test

# Ejecutar tests una sola vez
npm run test:single

# Ejecutar tests sin abrir navegador
npm run test:headless

# Ejecutar tests en modo watch
npm run test:watch
```

## 📁 Estructura de Tests

```
tests/
├── example.test.js             ✅ Tests básicos (funcionando)
├── setup.js                   ✅ Configuración global
├── services/                   📝 Tests de servicios (preparados)
│   ├── apiService.test.js
│   └── orderManager.test.js
├── components/                 📝 Tests de componentes (preparados)
│   └── ProductCard.test.js
├── utils/                      📝 Tests de utilidades (preparados)
│   └── helpers.test.js
└── integration/                📝 Tests de integración (preparados)
    └── orderFlow.test.js
```

## ✅ Tests Básicos Funcionando

El archivo `tests/example.test.js` incluye **5 tests** que demuestran diferentes tipos de validaciones:

### 📋 **Descripción Detallada de Cada Test:**

#### **Test 1: Operaciones Matemáticas**
```javascript
it("debería sumar dos números correctamente", function () {
  const resultado = 2 + 3;
  expect(resultado).toBe(5);
});
```
**Propósito:** Verificar operaciones aritméticas básicas  
**Valida:** Cálculos numéricos (útil para totales de pedidos, precios)  
**Matcher:** `toBe()` - Igualdad estricta

#### **Test 2: Validación de Strings**
```javascript
it("debería verificar que un string contiene texto", function () {
  const texto = "Menu Burger App";
  expect(texto).toContain("Burger");
});
```
**Propósito:** Verificar contenido de texto  
**Valida:** Búsquedas, filtros, nombres de productos  
**Matcher:** `toContain()` - Contiene substring

#### **Test 3: Validación de Arrays**
```javascript
it("debería verificar que un array contiene elementos", function () {
  const categorias = ["burgers", "papas", "bebidas"];
  expect(categorias).toContain("burgers");
  expect(categorias.length).toBe(3);
});
```
**Propósito:** Verificar listas y colecciones  
**Valida:** Categorías de productos, items del carrito, listas de pedidos  
**Matchers:** `toContain()` para elementos, `toBe()` para longitud

#### **Test 4: Validación de Objetos**
```javascript
it("debería verificar objetos", function () {
  const producto = {
    id: 1,
    name: "Hamburguesa Clásica",
    price: 12.99,
    category: "burgers",
  };

  expect(producto.name).toBe("Hamburguesa Clásica");
  expect(producto.price).toBeGreaterThan(10);
});
```
**Propósito:** Verificar estructuras de datos complejas  
**Valida:** Productos, usuarios, pedidos (objetos del sistema)  
**Matchers:** `toBe()` para propiedades, `toBeGreaterThan()` para comparaciones

#### **Test 5: Validación de Booleanos**
```javascript
it("debería verificar valores booleanos", function () {
  const isAvailable = true;
  const isOutOfStock = false;

  expect(isAvailable).toBe(true);
  expect(isOutOfStock).toBe(false);
  expect(isAvailable).toBeTruthy();
  expect(isOutOfStock).toBeFalsy();
});
```
**Propósito:** Verificar estados y flags  
**Valida:** Disponibilidad de productos, estados de pedidos, permisos  
**Matchers:** `toBe()` para valores exactos, `toBeTruthy()`/`toBeFalsy()` para evaluación

### 🎯 **Resultado de Ejecución:**
```
Chrome Headless: Executed 5 of 5 SUCCESS (0.002 secs / 0.001 secs)
TOTAL: 5 SUCCESS
```

### 💡 **Aplicación en el Proyecto:**
Estos tests básicos demuestran patrones que se usan en:
- **Cálculo de totales** de pedidos (matemáticas)
- **Búsqueda de productos** (strings)
- **Gestión de categorías** (arrays)
- **Validación de datos** (objetos)
- **Estados del sistema** (booleanos)

## 📝 Cómo Escribir Tests

### Estructura Básica

```javascript
describe("Nombre del Componente/Función", function () {
  it("debería hacer algo específico", function () {
    // Arrange (preparar)
    const input = "valor de prueba";

    // Act (ejecutar)
    const result = miFuncion(input);

    // Assert (verificar)
    expect(result).toBe("resultado esperado");
  });
});
```

### 🎯 **Matchers de Jasmine - Guía Completa**

#### **Matchers de Igualdad**
```javascript
expect(value).toBe(expected);           // Igualdad estricta (===)
expect(value).toEqual(expected);        // Igualdad profunda (objetos/arrays)
expect(value).not.toBe(expected);       // Negación
```
**Uso en el proyecto:** Comparar IDs, precios exactos, estados

#### **Matchers de Contenido**
```javascript
expect(string).toContain(substring);    // String contiene texto
expect(array).toContain(item);          // Array contiene elemento
expect(string).toMatch(/regex/);        // Coincide con regex
```
**Uso en el proyecto:** Búsqueda de productos, validación de emails

#### **Matchers Numéricos**
```javascript
expect(value).toBeGreaterThan(5);       // Mayor que
expect(value).toBeLessThan(10);         // Menor que
expect(value).toBeCloseTo(3.14, 2);     // Aproximadamente igual
expect(value).toBeNaN();                // Es NaN
```
**Uso en el proyecto:** Validar precios, cantidades, totales

#### **Matchers de Tipo**
```javascript
expect(value).toBeDefined();            // Está definido
expect(value).toBeUndefined();          // Es undefined
expect(value).toBeNull();               // Es null
expect(value).toBeTruthy();             // Es truthy
expect(value).toBeFalsy();              // Es falsy
```
**Uso en el proyecto:** Validar disponibilidad, estados de carga

#### **Matchers de Objetos y Arrays**
```javascript
expect(array).toHaveLength(3);          // Longitud específica
expect(obj).toHaveProperty('prop');     // Tiene propiedad
expect(obj).toHaveProperty('prop', val); // Propiedad con valor
expect(array).toBeInstanceOf(Array);    // Es instancia de
```
**Uso en el proyecto:** Validar estructura de productos, pedidos

#### **Matchers de Funciones**
```javascript
expect(fn).toThrow();                   // Lanza excepción
expect(fn).toThrowError('message');     // Lanza error específico
expect(spy).toHaveBeenCalled();         // Spy fue llamado
expect(spy).toHaveBeenCalledWith(args); // Spy llamado con argumentos
```
**Uso en el proyecto:** Validar llamadas a API, manejo de errores

### 🔍 **Ejemplos Específicos del Proyecto**

#### **Validación de Productos**
```javascript
it('debería validar estructura de producto', function() {
  const producto = {
    id: 1,
    name: 'Burger Clásica',
    price: 12.99,
    category: 'burgers',
    available: true
  };
  
  expect(producto).toHaveProperty('id');
  expect(producto.price).toBeGreaterThan(0);
  expect(producto.name).toContain('Burger');
  expect(producto.available).toBeTruthy();
});
```

#### **Validación de Carrito**
```javascript
it('debería calcular total del carrito', function() {
  const items = [
    { price: 12.99, quantity: 2 },
    { price: 5.50, quantity: 1 }
  ];
  
  const total = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  
  expect(total).toBeCloseTo(31.48, 2);
  expect(items).toHaveLength(2);
});
```

### Ejemplo de Test para Función

```javascript
describe("Función formatPrice", function () {
  function formatPrice(price) {
    return `$${price.toFixed(2)}`;
  }

  it("debería formatear precios correctamente", function () {
    expect(formatPrice(12.99)).toBe("$12.99");
    expect(formatPrice(10)).toBe("$10.00");
  });
});
```

## 🔧 Configuración Técnica Detallada

### 🎯 **¿Qué es Karma y Jasmine?**

#### **Jasmine** - Framework de Testing
- **Propósito:** Proporciona la sintaxis para escribir tests
- **Características:**
  - BDD (Behavior Driven Development) syntax
  - No requiere DOM ni framework específico
  - Incluye matchers integrados
  - Soporte para spies y mocks

#### **Karma** - Test Runner
- **Propósito:** Ejecuta tests en navegadores reales
- **Características:**
  - Ejecuta tests en múltiples navegadores
  - Watch mode para desarrollo
  - Integración con CI/CD
  - Plugins para diferentes frameworks

### 📄 **Archivos de Configuración**

#### **`karma.simple.conf.cjs`** - Configuración Principal (Funcionando)
```javascript
module.exports = function(config) {
  config.set({
    basePath: '',                    // Directorio base
    frameworks: ['jasmine'],         // Framework de testing
    files: ['tests/example.test.js'], // Archivos de test
    browsers: ['ChromeHeadless'],    // Navegador para tests
    singleRun: true,                 // Ejecutar una vez y salir
    colors: true,                    // Colores en output
    logLevel: config.LOG_INFO        // Nivel de logging
  });
};
```

#### **`karma.conf.cjs`** - Configuración Completa (Con Webpack)
```javascript
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'tests/setup.js',              // Setup global
      'tests/**/*.test.js'           // Todos los tests
    ],
    preprocessors: {
      'tests/**/*.js': ['webpack', 'sourcemap']  // Transpilación
    },
    webpack: {
      // Configuración de Webpack para ES6/React
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            use: 'babel-loader'        // Transpilación con Babel
          }
        ]
      }
    }
  });
};
```

#### **`jasmine.json`** - Configuración de Jasmine
```json
{
  "spec_dir": "tests",              // Directorio de tests
  "spec_files": [
    "**/*[sS]pec.js",              // Archivos *spec.js
    "**/*[tT]est.js"               // Archivos *test.js
  ],
  "helpers": ["helpers/**/*.js"],   // Archivos helper
  "stopSpecOnExpectationFailure": false,
  "random": true                    // Ejecutar tests en orden aleatorio
}
```

#### **`.babelrc`** - Transpilación de ES6/React
```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "browsers": ["last 2 versions"]
      }
    }],
    ["@babel/preset-react", {
      "runtime": "automatic"
    }]
  ]
}
```

### ⚙️ **Configuración Específica del Proyecto**

#### **Scripts NPM Configurados:**
```json
{
  "scripts": {
    "test": "karma start karma.simple.conf.cjs",
    "test:single": "karma start karma.simple.conf.cjs --single-run",
    "test:headless": "karma start karma.simple.conf.cjs --browsers ChromeHeadless --single-run",
    "test:watch": "karma start karma.simple.conf.cjs --auto-watch",
    "test:example": "karma start karma.simple.conf.cjs --single-run"
  }
}
```

#### **Navegadores Configurados:**
- **ChromeHeadless:** Navegador sin interfaz gráfica (para CI/CD)
- **Chrome:** Navegador completo (para debugging)

#### **Configuración de Chrome Headless:**
```javascript
customLaunchers: {
  ChromeHeadless: {
    base: 'Chrome',
    flags: [
      '--no-sandbox',              // Sin sandbox (para CI)
      '--disable-setuid-sandbox',  // Deshabilitar setuid sandbox
      '--disable-gpu',             // Sin aceleración GPU
      '--disable-web-security',    // Sin restricciones de seguridad
      '--headless'                 // Modo sin cabeza
    ]
  }
}
```

### Dependencias Instaladas

```json
{
  "devDependencies": {
    "jasmine": "^5.12.0",
    "karma": "^6.4.4",
    "karma-jasmine": "^5.1.0",
    "karma-chrome-launcher": "^3.2.0",
    "karma-webpack": "^5.0.1",
    "karma-sourcemap-loader": "^0.4.0",
    "@babel/core": "^7.28.4",
    "@babel/preset-env": "^7.28.3",
    "@babel/preset-react": "^7.27.1",
    "babel-loader": "^10.0.0"
  }
}
```

## 🎯 Próximos Pasos

1. **Empezar con tests básicos**: Usar `npm run test:example`
2. **Crear tests para funciones específicas**: Agregar tests en `tests/utils/`
3. **Tests de servicios**: Expandir tests en `tests/services/`
4. **Tests de componentes**: Configurar testing de React (futuro)

## 🚨 Notas Importantes

- ✅ **Tests básicos funcionando** - Puedes empezar a escribir tests simples
- 📝 **Configuración completa preparada** - Para tests más avanzados
- 🔧 **Webpack configurado** - Para testing de módulos ES6/React (necesita ajustes)
- 🌐 **Chrome Headless** - Tests se ejecutan sin abrir navegador

## 🎯 **Configuración Avanzada**

### 🔧 **Setup Global (`tests/setup.js`)**
```javascript
// Mock de localStorage para tests
if (typeof window !== 'undefined' && !window.localStorage) {
  window.localStorage = {
    getItem: jasmine.createSpy('getItem').and.returnValue(null),
    setItem: jasmine.createSpy('setItem'),
    removeItem: jasmine.createSpy('removeItem'),
    clear: jasmine.createSpy('clear')
  };
}

// Helper functions globales
window.testHelpers = {
  createMockProduct: function(overrides = {}) {
    return {
      id: 1,
      name: 'Producto Test',
      price: 10.99,
      category: 'burgers',
      available: true,
      ...overrides
    };
  }
};
```

### 🕵️ **Spies y Mocks con Jasmine**
```javascript
describe('API Service', function() {
  let mockApiService;
  
  beforeEach(function() {
    // Crear spy
    mockApiService = jasmine.createSpy('apiCall')
      .and.returnValue(Promise.resolve({ success: true }));
  });
  
  it('debería llamar a la API', function() {
    mockApiService('test-data');
    
    expect(mockApiService).toHaveBeenCalled();
    expect(mockApiService).toHaveBeenCalledWith('test-data');
  });
});
```

### ⏱️ **Tests Asíncronos**
```javascript
describe('Operaciones Asíncronas', function() {
  it('debería manejar promesas', async function() {
    const result = await apiService.getProducts();
    expect(result).toBeDefined();
  });
  
  it('debería usar done callback', function(done) {
    setTimeout(function() {
      expect(true).toBe(true);
      done();
    }, 100);
  });
});
```

## 💡 **Mejores Prácticas**

### 📋 **Estructura de Tests**
1. **Arrange-Act-Assert**: Preparar → Ejecutar → Verificar
2. **Un concepto por test**: Cada `it()` debe probar una sola cosa
3. **Nombres descriptivos**: `it('debería calcular el total correctamente')`
4. **Setup y teardown**: Usar `beforeEach()` y `afterEach()`

### 🎯 **Consejos Específicos**
- **Empezar simple**: Usa `tests/example.test.js` como referencia
- **Tests independientes**: Cada test debe poder ejecutarse solo
- **Datos de prueba**: Usar datos consistentes y predecibles
- **Mocks apropiados**: Mockear dependencias externas (APIs, localStorage)

### 🚀 **Flujo de Desarrollo con Tests**
1. **Red**: Escribir test que falle
2. **Green**: Escribir código mínimo para que pase
3. **Refactor**: Mejorar el código manteniendo tests verdes
4. **Repeat**: Continuar el ciclo

### 🔍 **Debugging Tests**
```bash
# Ejecutar tests con más información
npm test -- --log-level debug

# Ejecutar un solo test
npm test -- --grep "nombre del test"

# Ejecutar tests en modo watch para desarrollo
npm run test:watch
```

---

**¡El sistema de testing está listo para usar!** 🎉

Ejecuta `npm run test:example` para ver los tests en acción.
