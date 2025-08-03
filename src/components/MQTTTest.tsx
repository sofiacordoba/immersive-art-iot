"use client";

import { useState, useEffect } from 'react';
import { mqttService, MQTT_TOPICS } from '@/lib/mqtt';
import MQTTMetrics from './MQTTMetrics';

export default function MQTTTest() {
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    // Verificar estado de conexión cada 2 segundos
    const interval = setInterval(() => {
      setConnectionStatus(mqttService.getConnectionStatus());
    }, 2000);

    // Conectar MQTT
    mqttService.connect();

    // Configurar handlers de prueba
    Object.values(MQTT_TOPICS).forEach(topic => {
      mqttService.onMessage(topic, (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setMessages(prev => [...prev, `${timestamp} - ${topic}: ${JSON.stringify(message)}`]);
      });
    });

    return () => {
      clearInterval(interval);
      mqttService.disconnect();
    };
  }, []);

  const sendTestMessage = () => {
    if (testMessage.trim()) {
      mqttService.publish('/sala/123/comando', testMessage);
      setTestMessage('');
    }
  };

  const sendSensorData = () => {
    // Simular datos de sensores
    mqttService.publish(MQTT_TOPICS.TEMPERATURA, 24.5);
    mqttService.publish(MQTT_TOPICS.HUMEDAD, 65);
    mqttService.publish(MQTT_TOPICS.PRESENCIA, true);
    mqttService.publish(MQTT_TOPICS.OBRA_ESTADO, false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🧪 Prueba de Conexión MQTT</h1>

        {/* Estado de conexión */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de Conexión</h2>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${connectionStatus ? 'text-green-600' : 'text-red-600'}`}>
              {connectionStatus ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Broker: {process.env.NEXT_PUBLIC_MQTT_HOST || 'broker.hivemq.com'}:{process.env.NEXT_PUBLIC_MQTT_PORT || '1883'}
          </p>
        </div>

        {/* Métricas MQTT */}
        <div className="mb-6">
          <MQTTMetrics />
        </div>

        {/* Panel de control */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Panel de Control</h2>

          {/* Enviar mensaje de prueba */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje de prueba:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Escribe un mensaje de prueba..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendTestMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Enviar
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={sendSensorData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              📊 Enviar datos de sensores
            </button>

            <button
              onClick={() => mqttService.controlarObra('iniciar')}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              ▶️ Iniciar obra
            </button>

            <button
              onClick={() => mqttService.controlarObra('detener')}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              ⏹️ Detener obra
            </button>

            <button
              onClick={() => setMessages([])}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              🗑️ Limpiar mensajes
            </button>
          </div>
        </div>

        {/* Mensajes recibidos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mensajes Recibidos</h2>
          <div className="bg-gray-50 rounded-md p-4 h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No hay mensajes recibidos aún...</p>
            ) : (
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                    {message}
                  </div>
                )).reverse()}
              </div>
            )}
          </div>
        </div>

        {/* Información de topics */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Topics Suscritos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(MQTT_TOPICS).map(([key, topic]) => (
              <div key={key} className="bg-gray-50 p-3 rounded">
                <span className="font-medium text-gray-700">{key}:</span>
                <span className="text-sm text-gray-600 ml-2">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 