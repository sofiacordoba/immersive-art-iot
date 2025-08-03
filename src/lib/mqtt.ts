import mqtt, { MqttClient } from 'mqtt';

// Configuración MQTT
const MQTT_CONFIG = {
    host: process.env.NEXT_PUBLIC_MQTT_HOST || 'broker.hivemq.com',
    port: parseInt(process.env.NEXT_PUBLIC_MQTT_PORT || '8884'), // Puerto WebSocket SSL
    username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
    clientId: `immersive-art-web-${Date.now()}-${Math.random().toString(16).slice(3)}`,
    protocol: 'wss', // Usar WebSocket Secure
    path: '/mqtt', // Basepath para WebSocket
};

// Topics MQTT
export const MQTT_TOPICS = {
    // Valores actuales de sensores
    TEMPERATURA: '/sala/123/tempActual',
    HUMEDAD: '/sala/123/humActual',
    PRESENCIA: '/sala/123/presencia',
    OBRA_ESTADO: '/sala/123/comando',

    // Comandos de control
    OBRA_CONTROL: '/sala/123/comando',
    OBRA_ALERTA: '/sala/123/alerta',

    // Configuración de umbrales
    SET_TEMP_MIN: '/sala/123/setTempMin',
    SET_TEMP_MAX: '/sala/123/setTempMax',
    SET_HUM_MIN: '/sala/123/setHumMin',
    SET_HUM_MAX: '/sala/123/setHumMax',
    MULTIMEDIA: '/sala/123/multimedia'
    //SALA_ID: '/casa/sala/id',
};

class MQTTService {
    private client: MqttClient | null = null;
    private isConnected = false;
    private messageHandlers: { [topic: string]: (message: any) => void } = {};
    private connectionStartTime: number = 0;
    private reconnectCount: number = 0;
    private lastReconnectTime: number = 0;
    private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';

    connect() {
        try {
            const url = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`;
            console.log('🔌 Conectando a MQTT:', url);

            this.connectionStatus = 'connecting';
            this.connectionStartTime = Date.now();

            this.client = mqtt.connect(url, {
                username: MQTT_CONFIG.username,
                password: MQTT_CONFIG.password,
                clientId: MQTT_CONFIG.clientId,
                clean: true,
                reconnectPeriod: 5000,
                connectTimeout: 30000,
                rejectUnauthorized: false, // Para desarrollo
            });

            this.client.on('connect', () => {
                console.log('✅ MQTT conectado');
                this.isConnected = true;
                this.connectionStatus = 'connected';
                this.subscribeToTopics();
            });

            this.client.on('message', (topic: string, message: Buffer) => {
                this.handleMessage(topic, message);
            });

            this.client.on('error', (error: Error) => {
                console.error('❌ Error MQTT:', error);
                this.isConnected = false;
                this.connectionStatus = 'disconnected';
            });

            this.client.on('close', () => {
                console.log('🔌 MQTT desconectado');
                this.isConnected = false;
                this.connectionStatus = 'disconnected';
            });

            this.client.on('reconnect', () => {
                console.log('🔄 MQTT reconectando...');
                this.connectionStatus = 'reconnecting';
                this.reconnectCount++;
                this.lastReconnectTime = Date.now();
            });

            this.client.on('offline', () => {
                this.isConnected = false;
                this.connectionStatus = 'disconnected';
            });

        } catch (error) {
            console.error('❌ Error al conectar MQTT:', error);
            this.connectionStatus = 'disconnected';
        }
    }

    private subscribeToTopics() {
        if (!this.client) return;

        Object.values(MQTT_TOPICS).forEach(topic => {
            this.client!.subscribe(topic, (err: Error | null) => {
                if (err) {
                    console.error(`❌ Error suscribiéndose a ${topic}:`, err);
                }
            });
        });
    }

    private handleMessage(topic: string, message: Buffer) {
        const messageStr = message.toString();

        // Parsear mensaje según el topic
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(messageStr);
        } catch {
            parsedMessage = messageStr;
        }

        // Ejecutar handler registrado
        if (this.messageHandlers[topic]) {
            this.messageHandlers[topic](parsedMessage);
        }
    }

    // Registrar handlers para diferentes topics
    onMessage(topic: string, handler: (message: any) => void) {
        this.messageHandlers[topic] = handler;
    }

    // Publicar mensaje
    publish(topic: string, message: any) {
        if (!this.client || !this.isConnected) {
            console.warn('⚠️ MQTT no conectado');
            return;
        }

        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);

        this.client.publish(topic, messageStr, (err: any) => {
            if (err) {
                console.error(`❌ Error publicando en ${topic}:`, err);
            }
            // Solo loguear en desarrollo o para comandos importantes
            if (topic.includes('comando') || topic.includes('set')) {
                console.log(`📤 Publicado en ${topic}: ${messageStr}`);
            }
        });
    }

    // Controlar obra
    controlarObra(accion: 'iniciar' | 'detener') {
        this.publish(MQTT_TOPICS.OBRA_CONTROL, { accion, timestamp: Date.now() });
    }

    // Obtener estado de conexión
    getConnectionStatus() {
        return this.isConnected;
    }

    // Obtener métricas de conexión
    getConnectionMetrics() {
        const now = Date.now();
        const uptime = this.connectionStartTime > 0 ? now - this.connectionStartTime : 0;

        return {
            status: this.connectionStatus,
            uptime: this.formatUptime(uptime),
            reconnectCount: this.reconnectCount,
            lastReconnect: this.lastReconnectTime > 0 ? new Date(this.lastReconnectTime).toLocaleTimeString() : null,
            isConnected: this.isConnected
        };
    }

    // Formatear tiempo activo
    private formatUptime(ms: number): string {
        if (ms === 0) return '00:00:00';

        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const h = hours.toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');

        return `${h}:${m}:${s}`;
    }

    // Desconectar
    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.isConnected = false;
            this.connectionStatus = 'disconnected';
        }
    }
}

// Instancia singleton
export const mqttService = new MQTTService(); 