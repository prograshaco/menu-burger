import React, { useState, useEffect } from 'react';
import weatherService from '../services/weatherService';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWeather();
    // Actualizar cada 10 minutos
    const interval = setInterval(loadWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weatherService.getWeather();
      setWeather(data);
    } catch (err) {
      console.error('Error cargando clima:', err);
      setError('No se pudo cargar el clima');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-lg p-4 border border-blue-700/50">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🌤️</div>
          <div className="text-white text-sm">Cargando clima...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // No mostrar nada si hay error
  }

  if (!weather) return null;

  const weatherIcon = weatherService.getWeatherIcon(weather.icon);
  const deliveryMessage = weatherService.getDeliveryMessage(weather.temperature, weather.description);

  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-lg p-4 border border-blue-700/50 hover:border-blue-600/70 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Información del clima */}
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{weatherIcon}</div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{weather.temperature}°</span>
              <span className="text-sm text-blue-200">C</span>
            </div>
            <div className="text-sm text-blue-200 capitalize">{weather.description}</div>
            <div className="text-xs text-blue-300 mt-1">
              📍 {weather.city}, {weather.country}
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="hidden md:flex flex-col items-end space-y-1 text-xs text-blue-200">
          <div className="flex items-center space-x-2">
            <span>Sensación:</span>
            <span className="font-semibold text-white">{weather.feelsLike}°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>💧 Humedad:</span>
            <span className="font-semibold text-white">{weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>💨 Viento:</span>
            <span className="font-semibold text-white">{weather.windSpeed} m/s</span>
          </div>
        </div>
      </div>

      {/* Mensaje de delivery */}
      <div className="mt-3 pt-3 border-t border-blue-700/50">
        <div className="text-sm text-blue-100 flex items-center space-x-2">
          <span>🚚</span>
          <span>{deliveryMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
