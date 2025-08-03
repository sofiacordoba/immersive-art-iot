"use client";

import { useState, useEffect } from 'react';
import { mqttService } from '@/lib/mqtt';

export default function MQTTMetrics() {
    // Fallback metrics en caso de que getConnectionMetrics no esté disponible
    const getDefaultMetrics = () => ({
        status: 'disconnected',
        uptime: '00:00:00',
        reconnectCount: 0,
        lastReconnect: null,
        isConnected: false
    });

    const [metrics, setMetrics] = useState(() => {
        try {
            return mqttService.getConnectionMetrics ? mqttService.getConnectionMetrics() : getDefaultMetrics();
        } catch (error) {
            console.warn('🔍 MQTTMetrics: getConnectionMetrics no disponible, usando valores por defecto');
            return getDefaultMetrics();
        }
    });

    useEffect(() => {
        // Actualizar métricas cada 2 segundos (menos frecuente para reducir logs)
        const interval = setInterval(() => {
            try {
                if (mqttService.getConnectionMetrics) {
                    const newMetrics = mqttService.getConnectionMetrics();
                    setMetrics(prev => {
                        // Solo actualizar si hay cambios reales
                        if (JSON.stringify(prev) !== JSON.stringify(newMetrics)) {
                            return newMetrics;
                        }
                        return prev;
                    });
                }
            } catch (error) {
                console.warn('🔍 MQTTMetrics: Error obteniendo métricas:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-600';
            case 'connecting': return 'text-yellow-600';
            case 'reconnecting': return 'text-orange-600';
            case 'disconnected': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return '🟢';
            case 'connecting': return '🟡';
            case 'reconnecting': return '🟠';
            case 'disconnected': return '🔴';
            default: return '⚪';
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📊 Métricas MQTT
            </h3>

            <div className="space-y-3">
                {/* Estado de conexión */}
                <div className="flex justify-between items-center">
                    <span className="font-medium">Estado:</span>
                    <span className={`flex items-center gap-2 ${getStatusColor(metrics.status)}`}>
                        <span>{getStatusIcon(metrics.status)}</span>
                        <span className="capitalize">{metrics.status}</span>
                    </span>
                </div>

                {/* Tiempo activo */}
                <div className="flex justify-between items-center">
                    <span className="font-medium">Tiempo activo:</span>
                    <span className="text-blue-600 font-mono">{metrics.uptime}</span>
                </div>

                {/* Número de reconexiones */}
                <div className="flex justify-between items-center">
                    <span className="font-medium">Reconexiones:</span>
                    <span className="text-purple-600 font-mono">{metrics.reconnectCount}</span>
                </div>

                {/* Última reconexión */}
                {metrics.lastReconnect && (
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Última reconexión:</span>
                        <span className="text-gray-600 text-sm">{metrics.lastReconnect}</span>
                    </div>
                )}

                {/* Botón de reconexión manual */}
                <div className="pt-2">
                    <button
                        onClick={() => {
                            try {
                                mqttService.disconnect();
                                setTimeout(() => mqttService.connect(), 1000);
                            } catch (error) {
                                console.warn('🔍 MQTTMetrics: Error en reconexión manual:', error);
                            }
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                    >
                        🔄 Reconectar manualmente
                    </button>
                </div>
            </div>
        </div>
    );
} 