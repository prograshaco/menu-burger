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

});