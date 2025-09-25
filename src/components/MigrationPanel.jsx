import React, { useState, useEffect } from 'react';
import { Database, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import MigrationScript from '../utils/migrationScript.js';

const MigrationPanel = () => {
  const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, running, completed, error
  const [migrationResults, setMigrationResults] = useState(null);
  const [migrationScript, setMigrationScript] = useState(null);
  const [localStorageData, setLocalStorageData] = useState({
    users: 0,
    orders: 0,
    hasData: false
  });

  useEffect(() => {
    // Inicializar script de migración
    const script = new MigrationScript();
    setMigrationScript(script);

    // Verificar datos en localStorage
    checkLocalStorageData();
  }, []);

  const checkLocalStorageData = () => {
    try {
      const usersData = localStorage.getItem('users');
      const ordersData = localStorage.getItem('orders');
      
      const users = usersData ? JSON.parse(usersData) : [];
      const orders = ordersData ? JSON.parse(ordersData) : [];
      
      setLocalStorageData({
        users: users.length,
        orders: orders.length,
        hasData: users.length > 0 || orders.length > 0
      });
    } catch (error) {
      console.error('Error al verificar datos de localStorage:', error);
    }
  };

  const runMigration = async () => {
    if (!migrationScript) return;

    setMigrationStatus('running');
    setMigrationResults(null);

    try {
      const results = await migrationScript.runFullMigration();
      
      if (results.success) {
        setMigrationStatus('completed');
        setMigrationResults(results.results);
        
        // Actualizar datos de localStorage después de migración
        checkLocalStorageData();
      } else {
        setMigrationStatus('error');
        setMigrationResults({ error: results.error });
      }
    } catch (error) {
      setMigrationStatus('error');
      setMigrationResults({ error: error.message });
    }
  };

  const verifyMigration = async () => {
    if (!migrationScript) return;

    try {
      await migrationScript.init();
      const verification = await migrationScript.verifyMigration();
      
      if (verification.success) {
        alert(`Verificación exitosa:\n- Usuarios: ${verification.users}\n- Pedidos: ${verification.orders}`);
      } else {
        alert(`Error en verificación: ${verification.error}`);
      }
    } catch (error) {
      alert(`Error en verificación: ${error.message}`);
    }
  };

  const createBackup = () => {
    if (!migrationScript) return;
    migrationScript.createLocalStorageBackup();
  };

  const clearLocalStorage = () => {
    if (confirm('¿Estás seguro de que quieres limpiar localStorage? Esta acción no se puede deshacer.')) {
      migrationScript.clearLocalStorageAfterMigration();
      checkLocalStorageData();
      alert('localStorage limpiado exitosamente');
    }
  };

  const getStatusIcon = () => {
    switch (migrationStatus) {
      case 'running':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (migrationStatus) {
      case 'running':
        return 'Ejecutando migración...';
      case 'completed':
        return 'Migración completada exitosamente';
      case 'error':
        return 'Error en la migración';
      default:
        return 'Listo para migrar';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Panel de Migración de Datos</h2>
      </div>

      {/* Estado actual */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          {getStatusIcon()}
          <span className="font-medium text-gray-700">{getStatusText()}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded p-3">
            <h4 className="font-medium text-gray-700 mb-2">Datos en localStorage</h4>
            <div className="text-sm text-gray-600">
              <p>Usuarios: {localStorageData.users}</p>
              <p>Pedidos: {localStorageData.orders}</p>
              <p className={`font-medium ${localStorageData.hasData ? 'text-orange-600' : 'text-green-600'}`}>
                {localStorageData.hasData ? 'Datos pendientes de migrar' : 'Sin datos pendientes'}
              </p>
            </div>
          </div>
          
          {migrationResults && (
            <div className="bg-white rounded p-3">
              <h4 className="font-medium text-gray-700 mb-2">Resultados de Migración</h4>
              <div className="text-sm text-gray-600">
                {migrationResults.error ? (
                  <p className="text-red-600">Error: {migrationResults.error}</p>
                ) : (
                  <>
                    <p>Usuarios migrados: {migrationResults.users?.migrated || 0}</p>
                    <p>Pedidos migrados: {migrationResults.orders?.migrated || 0}</p>
                    <p>Configuraciones migradas: {migrationResults.settings?.migrated || 0}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={runMigration}
            disabled={migrationStatus === 'running' || !localStorageData.hasData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Database className="w-4 h-4" />
            Ejecutar Migración
          </button>

          <button
            onClick={verifyMigration}
            disabled={migrationStatus === 'running'}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Verificar Datos
          </button>

          <button
            onClick={createBackup}
            disabled={migrationStatus === 'running'}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Crear Backup
          </button>

          <button
            onClick={clearLocalStorage}
            disabled={migrationStatus === 'running' || localStorageData.hasData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            Limpiar localStorage
          </button>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Instrucciones de Migración</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Crear un backup de localStorage antes de migrar (recomendado)</li>
            <li>Ejecutar la migración para transferir datos a SQLite</li>
            <li>Verificar que los datos se migraron correctamente</li>
            <li>Limpiar localStorage una vez confirmada la migración exitosa</li>
          </ol>
        </div>

        {/* Advertencias */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Advertencias Importantes</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Asegúrate de tener una copia de seguridad antes de proceder</li>
            <li>La migración puede tomar varios minutos dependiendo de la cantidad de datos</li>
            <li>No cierres la aplicación durante el proceso de migración</li>
            <li>Verifica los datos después de la migración antes de limpiar localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MigrationPanel;