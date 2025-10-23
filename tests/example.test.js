// Ejemplo básico de test con Jasmine
describe('Ejemplo de Tests Básicos', function() {
  
  it('debería sumar dos números correctamente', function() {
    const resultado = 2 + 3;
    expect(resultado).toBe(5);
  });

  it('debería verificar que un string contiene texto', function() {
    const texto = 'Menu Burger App';
    expect(texto).toContain('Burger');
  });

  it('debería verificar que un array contiene elementos', function() {
    const categorias = ['burgers', 'papas', 'bebidas'];
    expect(categorias).toContain('burgers');
    expect(categorias.length).toBe(3);
  });

  it('debería verificar objetos', function() {
    const producto = {
      id: 1,
      name: 'Hamburguesa Clásica',
      price: 12.99,
      category: 'burgers'
    };
    
    expect(producto.name).toBe('Hamburguesa Clásica');
    expect(producto.price).toBeGreaterThan(10);
  });

  it('debería verificar valores booleanos', function() {
    const isAvailable = true;
    const isOutOfStock = false;
    
    expect(isAvailable).toBe(true);
    expect(isOutOfStock).toBe(false);
    expect(isAvailable).toBeTruthy();
    expect(isOutOfStock).toBeFalsy();
  });

});