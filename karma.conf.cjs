module.exports = function(config) {
  config.set({
    // Base path que será usada para resolver todos los patrones (ej. archivos, exclude)
    basePath: '',

    // Frameworks a usar
    // Disponibles: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // Lista de archivos / patrones a cargar en el navegador
    files: [
      'tests/setup.js',
      'src/**/*.test.js',
      'src/**/*.spec.js',
      'tests/**/*.test.js',
      'tests/**/*.spec.js'
    ],

    // Lista de archivos / patrones a excluir
    exclude: [
      'node_modules/**/*'
    ],

    // Preprocesar archivos coincidentes antes de servirlos al navegador
    // Disponibles: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*.js': ['webpack', 'sourcemap'],
      'src/**/*.jsx': ['webpack', 'sourcemap'],
      'tests/**/*.js': ['webpack', 'sourcemap']
    },

    // Configuración de webpack
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react']
              }
            }
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx']
      },
      devtool: 'inline-source-map'
    },

    // Configuración del webpack-dev-middleware
    webpackMiddleware: {
      stats: 'errors-only'
    },

    // Test results reporter a usar
    // Posibles valores: 'dots', 'progress'
    // Disponibles: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // Puerto del servidor web
    port: 9876,

    // Habilitar / deshabilitar colores en la salida (reporters y logs)
    colors: true,

    // Nivel de logging
    // Posibles valores: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Habilitar / deshabilitar watching de archivos y ejecutar tests cuando cambien
    autoWatch: true,

    // Navegadores para iniciar
    // Disponibles: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Configuración del launcher de Chrome
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--headless'
        ]
      }
    },

    // Continuous Integration mode
    // Si es true, Karma captura navegadores, ejecuta tests y sale
    singleRun: false,

    // Concurrency level
    // Cuántos navegadores deben iniciarse simultáneamente
    concurrency: Infinity,

    // Timeout para capturar un navegador (en ms)
    captureTimeout: 60000,

    // Timeout para desconectar un navegador (en ms)
    browserDisconnectTimeout: 10000,

    // Timeout para reconectar un navegador (en ms)
    browserDisconnectTolerance: 3,

    // Timeout sin actividad (en ms)
    browserNoActivityTimeout: 60000
  })
}