import { useState, useEffect } from 'react';
import { mqttService, MQTT_TOPICS } from '@/lib/mqtt';

interface SensorData {
    temperatura: number;
    humedad: number;
    setTemperatura: number;
    setHumedad: number;
    setTempMin: number;
    setTempMax: number;
    setHumMin: number;
    setHumMax: number;
    presencia: boolean;
    obraActiva: boolean;
    mqttOnline: boolean;
    enlaceMultimedia: string;
}

export function useMQTT() {
    const [sensorData, setSensorData] = useState<SensorData>({
        temperatura: 22.5,
        humedad: 55,
        setTemperatura: 25,
        setHumedad: 60,
        setTempMin: 18,
        setTempMax: 30,
        setHumMin: 40,
        setHumMax: 70,
        presencia: false,
        obraActiva: false,
        mqttOnline: false,
        enlaceMultimedia: '',
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Conectar MQTT al montar el componente
        mqttService.connect();

        // Configurar handlers para cada topic
        mqttService.onMessage(MQTT_TOPICS.TEMPERATURA, (message) => { //temperatura actual
            const temp = typeof message === 'number' ? message : parseFloat(message);
            if (!isNaN(temp)) {
                setSensorData(prev => ({ ...prev, temperatura: temp }));
            }
        });

        mqttService.onMessage(MQTT_TOPICS.HUMEDAD, (message) => {
            const hum = typeof message === 'number' ? message : parseFloat(message);
            if (!isNaN(hum)) {
                setSensorData(prev => ({ ...prev, humedad: hum }));
            }
        });

        // Handlers para configuración de umbrales
        mqttService.onMessage(MQTT_TOPICS.SET_TEMP_MIN, (message) => {
            const setTempMin = typeof message === 'number' ? message : parseFloat(message);
            if (!isNaN(setTempMin)) {
                setSensorData(prev => {
                    if (prev.setTempMin !== setTempMin) {
                        console.log(`🌡️ Set Temp Min cambiada: ${prev.setTempMin}°C → ${setTempMin}°C`);
                        return { ...prev, setTempMin: setTempMin };
                    }
                    return prev;
                });
            }
        });

        mqttService.onMessage(MQTT_TOPICS.SET_TEMP_MAX, (message) => {
            const setTempMax = typeof message === 'number' ? message : parseFloat(message);
            if (!isNaN(setTempMax)) {
                setSensorData(prev => {
                    if (prev.setTempMax !== setTempMax) {
                        console.log(`🌡️ Set Temp Max cambiada: ${prev.setTempMax}°C → ${setTempMax}°C`);
                        return { ...prev, setTempMax: setTempMax };
                    }
                    return prev;
                });
            }
        });

        mqttService.onMessage(MQTT_TOPICS.SET_HUM_MIN, (message) => {
            const setHumMin = typeof message === 'number' ? message : parseFloat(message);
            if (!isNaN(setHumMin)) {
                setSensorData(prev => {
                    if (prev.setHumMin !== setHumMin) {
                        console.log(`💧 Set Hum Min cambiada: ${prev.setHumMin}% → ${setHumMin}%`);
                        return { ...prev, setHumMin: setHumMin };
                    }
                    return prev;
                });
            }
        });

        mqttService.onMessage(MQTT_TOPICS.SET_HUM_MAX, (message) => {
            const setHumMax = typeof message === 'number' ? message : parseFloat(message);
            if (!isNaN(setHumMax)) {
                setSensorData(prev => {
                    if (prev.setHumMax !== setHumMax) {
                        console.log(`💧 Set Hum Max cambiada: ${prev.setHumMax}% → ${setHumMax}%`);
                        return { ...prev, setHumMax: setHumMax };
                    }
                    return prev;
                });
            }
        });

        mqttService.onMessage(MQTT_TOPICS.PRESENCIA, (message) => {
            // Manejar tanto booleanos como strings "ON"/"OFF"
            let pres = false;
            if (typeof message === 'boolean') {
                pres = message;
            } else if (typeof message === 'string') {
                pres = message.toUpperCase() === 'ON' || message === 'true';
            }
            setSensorData(prev => {
                if (prev.presencia !== pres) {
                    console.log(`👤 Presencia cambiada: ${prev.presencia ? 'ON' : 'OFF'} → ${pres ? 'ON' : 'OFF'}`);
                    return { ...prev, presencia: pres };
                }
                return prev;
            });
        });

        // Handler para estado de obra (ON/OFF)
        mqttService.onMessage(MQTT_TOPICS.OBRA_CONTROL, (message) => {
            // Manejar tanto booleanos como strings "ON"/"OFF"
            let activa = false;
            if (typeof message === 'boolean') {
                activa = message;
            } else if (typeof message === 'string') {
                activa = message.toUpperCase() === 'ON' || message === 'true';
            }
            setSensorData(prev => ({ ...prev, obraActiva: activa }));
        });

        // Handler para enlace multimedia
        mqttService.onMessage(MQTT_TOPICS.MULTIMEDIA, (message) => {
            const enlace = typeof message === 'string' ? message : String(message);
            setSensorData(prev => {
                if (prev.enlaceMultimedia !== enlace) {
                    console.log(`🎬 Enlace multimedia cambiado: ${enlace}`);
                    return { ...prev, enlaceMultimedia: enlace };
                }
                return prev;
            });
        });

        // Actualizar estado de conexión
        const updateConnectionStatus = () => {
            setSensorData(prev => ({ ...prev, mqttOnline: mqttService.getConnectionStatus() }));
        };

        // Verificar conexión cada 2 segundos
        const interval = setInterval(updateConnectionStatus, 2000);
        updateConnectionStatus(); // Verificación inicial

        // Cleanup al desmontar
        return () => {
            clearInterval(interval);
            mqttService.disconnect();
        };
    }, []);

    // Funciones para controlar la obra
    const iniciarObra = () => {
        mqttService.controlarObra('iniciar');
    };

    const detenerObra = () => {
        mqttService.controlarObra('detener');
    };

    // Evitar problemas de hidratación
    if (!mounted) {
        return {
            temperatura: 22.5,
            humedad: 55,
            setTempMin: 18,
            setTempMax: 30,
            setHumMin: 40,
            setHumMax: 70,
            presencia: false,
            obraActiva: false,
            mqttOnline: false,
            enlaceMultimedia: '',
            iniciarObra: () => { },
            detenerObra: () => { },
        };
    }

    return {
        ...sensorData,
        iniciarObra,
        detenerObra,
    };
} 