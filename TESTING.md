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

## ✅ Test Básico Funcionando

El test básico (`tests/example.test.js`) incluye 5 tests funcionando correctamente:

```javascript
describe("Ejemplo de Tests Básicos", function () {
  it("debería sumar dos números correctamente", function () {
    const resultado = 2 + 3;
    expect(resultado).toBe(5);
  });

  it("debería verificar que un string contiene texto", function () {
    const texto = "Menu Burger App";
    expect(texto).toContain("Burger");
  });

  it("debería verificar que un array contiene elementos", function () {
    const categorias = ["burgers", "papas", "bebidas"];
    expect(categorias).toContain("burgers");
    expect(categorias.length).toBe(3);
  });

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

  it("debería verificar valores booleanos", function () {
    const isAvailable = true;
    const isOutOfStock = false;

    expect(isAvailable).toBe(true);
    expect(isOutOfStock).toBe(false);
    expect(isAvailable).toBeTruthy();
    expect(isOutOfStock).toBeFalsy();
  });
});
```

**Resultado:**

```
Chrome Headless: Executed 5 of 5 SUCCESS (0.002 secs / 0.001 secs)
TOTAL: 5 SUCCESS
```

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

### Matchers Más Usados

```javascript
expect(value).toBe(expected); // Igualdad estricta
expect(value).toEqual(expected); // Igualdad profunda
expect(value).toContain(item); // Contiene elemento
expect(value).toBeGreaterThan(5); // Mayor que
expect(value).toBeLessThan(10); // Menor que
expect(array).toHaveLength(3); // Longitud del array
expect(obj).toHaveProperty("prop"); // Tiene propiedad
expect(fn).toThrow(); // Lanza excepción
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

## 🔧 Configuración Técnica

### Archivos de Configuración

- `karma.simple.conf.cjs` - Configuración básica de Karma (funcionando)
- `karma.conf.cjs` - Configuración completa con Webpack (para desarrollo futuro)
- `.babelrc` - Configuración de Babel para transpilación
- `jasmine.json` - Configuración de Jasmine

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

## 💡 Consejos

1. **Empezar simple**: Usa `tests/example.test.js` como referencia
2. **Tests pequeños**: Cada test debe verificar una sola cosa
3. **Nombres descriptivos**: `it('debería calcular el total correctamente', ...)`
4. **Arrange-Act-Assert**: Estructura clara en cada test

---

**¡El sistema de testing está listo para usar!** 🎉

Ejecuta `npm run test:example` para ver los tests en acción.
