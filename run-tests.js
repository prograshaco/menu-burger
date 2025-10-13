#!/usr/bin/env node

// Script para ejecutar tests específicos
const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0] || 'help';

const commands = {
  help: () => {
    console.log(`
🧪 Menu Burger - Test Runner

Comandos disponibles:
  npm test                    - Ejecutar todos los tests (interactivo)
  npm run test:single         - Ejecutar tests una vez
  npm run test:headless       - Ejecutar tests sin navegador
  npm run test:watch          - Ejecutar tests en modo watch
  
  node run-tests.js services  - Solo tests de servicios
  node run-tests.js components - Solo tests de componentes
  node run-tests.js utils     - Solo tests de utilidades
  node run-tests.js integration - Solo tests de integración
  node run-tests.js example   - Solo tests de ejemplo

Ejemplos:
  npm test                    # Todos los tests
  npm run test:headless       # Tests sin abrir navegador
  node run-tests.js services  # Solo servicios
    `);
  },

  services: () => runSpecificTests('tests/services/**/*.test.js'),
  components: () => runSpecificTests('tests/components/**/*.test.js'),
  utils: () => runSpecificTests('tests/utils/**/*.test.js'),
  integration: () => runSpecificTests('tests/integration/**/*.test.js'),
  example: () => runSpecificTests('tests/example.test.js')
};

function runSpecificTests(pattern) {
  console.log(`🧪 Ejecutando tests: ${pattern}`);
  
  // Crear configuración temporal de Karma
  const karmaConfig = `
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'tests/setup.js',
      '${pattern}'
    ],
    exclude: [],
    preprocessors: {
      'tests/**/*.js': ['webpack', 'sourcemap']
    },
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      },
      devtool: 'inline-source-map'
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity
  });
};
  `;

  // Escribir configuración temporal
  const fs = require('fs');
  const tempConfigPath = path.join(__dirname, 'karma.temp.conf.js');
  fs.writeFileSync(tempConfigPath, karmaConfig);

  // Ejecutar Karma con configuración temporal
  const karma = spawn('npx', ['karma', 'start', tempConfigPath], {
    stdio: 'inherit',
    shell: true
  });

  karma.on('close', (code) => {
    // Limpiar archivo temporal
    try {
      fs.unlinkSync(tempConfigPath);
    } catch (e) {
      // Ignorar errores de limpieza
    }
    
    if (code === 0) {
      console.log('✅ Tests completados exitosamente');
    } else {
      console.log('❌ Tests fallaron');
      process.exit(code);
    }
  });
}

// Ejecutar comando
if (commands[command]) {
  commands[command]();
} else {
  console.log(`❌ Comando desconocido: ${command}`);
  commands.help();
  process.exit(1);
}