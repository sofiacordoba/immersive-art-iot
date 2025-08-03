# 🎨 Immersive Art IoT - Sistema de Monitoreo y Control

Sistema web para monitoreo y control de salas de arte inmersivo mediante IoT, con autenticación de usuarios y comunicación MQTT en tiempo real.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [MQTT Topics](#-mqtt-topics)
- [Roles de Usuario](#-roles-de-usuario)
- [Testing](#-testing)
- [Configuración Avanzada](#-configuración-avanzada)
- [Troubleshooting](#-troubleshooting)
- [Contribución](#-contribución)

## ✨ Características

### 🔐 Autenticación y Autorización
- **Sistema de Login Mock**: Autenticación simulada para desarrollo
- **Roles de Usuario**: Admin y User con diferentes permisos
- **Protección de Rutas**: Acceso controlado por roles
- **Contexto de Autenticación**: Estado global de usuario

### 📊 Monitoreo en Tiempo Real
- **Sensores IoT**: Temperatura, humedad y presencia
- **Visualización**: Dials animados y gráficos interactivos
- **Alertas**: Notificaciones cuando los valores exceden umbrales
- **Estado de Conexión**: Métricas de conectividad MQTT

### 🎛️ Control de Salas
- **Control de Obras**: Iniciar/detener presentaciones multimedia
- **Configuración de Umbrales**: Temperatura y humedad mín/máx
- **Gestión de Salas**: Múltiples salas con configuración independiente
- **Enlaces Multimedia**: URLs para contenido de las salas

### 📱 Interfaz de Usuario
- **Dashboard de Usuario**: Vista simplificada con datos de sensores
- **Panel de Administración**: Configuración avanzada y gestión de usuarios
- **Diseño Responsivo**: Compatible con móviles y tablets
- **Animaciones**: Transiciones suaves con Framer Motion

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de estilos
- **Framer Motion**: Animaciones

### Comunicación
- **MQTT**: Protocolo de mensajería para IoT
- **WebSocket**: Conexión en tiempo real

### Visualización
- **Chart.js**: Gráficos interactivos
- **React Chart.js 2**: Integración con React
- **SVG Animations**: Dials personalizados

### UI/UX
- **Heroicons**: Iconografía
- **Lucide React**: Iconos adicionales
- **Responsive Design**: Diseño adaptativo

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd immersive-art-iot
```

2. **Instalar dependencias del proyecto web**
```bash
cd web
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env.local` en el directorio `web/`:

```env
# MQTT Configuration
NEXT_PUBLIC_MQTT_HOST=broker.hivemq.com
NEXT_PUBLIC_MQTT_PORT=8884
NEXT_PUBLIC_MQTT_USERNAME=your_username
NEXT_PUBLIC_MQTT_PASSWORD=your_password

# Firebase (Opcional - Actualmente deshabilitado)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Configuración MQTT

El sistema está configurado para conectarse a un broker MQTT público por defecto. Para producción, se recomienda usar un broker privado.

## 📖 Uso

### Acceso al Sistema

1. **Página Principal** (`/`): Formulario de login
2. **Dashboard Usuario** (`/usuario`): Vista de sensores y control básico
3. **Panel Admin** (`/admin`): Configuración avanzada y gestión

### Credenciales de Prueba

El sistema incluye un usuario mock para desarrollo:
- **Email**: `admin@test.com`
- **Contraseña**: Cualquier valor
- **Rol**: Administrador

### Funcionalidades por Rol

#### 👤 Usuario Regular
- Ver datos de sensores en tiempo real
- Controlar obras multimedia
- Recibir alertas de umbrales
- Acceso a dashboard simplificado

#### 👨‍💼 Administrador
- Todas las funciones de usuario
- Configurar umbrales de sensores
- Gestionar usuarios y roles
- Configurar enlaces multimedia
- Monitorear métricas de conexión

## 📁 Estructura del Proyecto

```
immersive-art-iot/
├── firmware/              # Código para dispositivos IoT (ESP32 + sensores)
├── web/                   # Aplicación web Next.js
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   │   ├── admin/    # Panel de administración
│   │   │   ├── usuario/  # Dashboard de usuario
│   │   │   ├── mqtt-test/# Página de pruebas MQTT
│   │   │   └── api/      # API routes
│   │   ├── components/   # Componentes React reutilizables
│   │   ├── contexts/     # Contextos de React
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilidades y configuraciones
│   ├── public/           # Archivos estáticos
│   └── package.json      # Dependencias del proyecto web
├── diagrams/             # Diagramas y documentación técnica
└── README.md            # Documentación del proyecto
```

## 🔌 MQTT Topics

### Topics de Lectura (Sensores)
```bash
/sala/123/tempActual     # Temperatura actual
/sala/123/humActual      # Humedad actual
/sala/123/presencia      # Estado de presencia
```

### Topics de Control
```bash
/sala/123/comando        # Control de obra multimedia(ON/OFF)
/sala/123/setTempMin     # Temperatura mínima
/sala/123/setTempMax     # Temperatura máxima
/sala/123/setHumMin      # Humedad mínima
/sala/123/setHumMax      # Humedad máxima
/sala/123/multimedia     # Enlace multimedia
```

### Topics de Alertas
```bash
/sala/123/alerta         # Alertas del sistema
```

## 👥 Roles de Usuario

### Admin
- **Acceso**: `/`, `/admin`, `/usuario`
- **Funciones**: Configuración completa, gestión de usuarios
- **Permisos**: Control total del sistema

### User
- **Acceso**: `/`, `/usuario`
- **Funciones**: Monitoreo básico, control de obras
- **Permisos**: Vista limitada

## 🧪 Testing

### Página de Pruebas MQTT
Acceder a `/mqtt-test` para:
- Probar conexión MQTT
- Ver métricas de conexión
- Enviar mensajes de prueba
- Monitorear topics

### Comandos de Desarrollo

**Desde la raíz del proyecto:**
```bash
# Instalar dependencias
npm run install-web

# Desarrollo con Turbopack
npm run dev            # Puerto 3000

# Build de producción
npm run build

# Linting
npm run lint
```

**O desde el directorio web:**
```bash
cd web

# Desarrollo con puerto específico
npm run local          # Puerto 3001

# Desarrollo con Turbopack
npm run dev            # Puerto 3000

# Build de producción
npm run build

# Linting
npm run lint
```

## 🔧 Configuración Avanzada

### Personalización de Topics
Editar `web/src/lib/mqtt.ts` para cambiar los topics MQTT:

```typescript
export const MQTT_TOPICS = {
    TEMPERATURA: '/sala/123/tempActual',
    HUMEDAD: '/sala/123/humActual',
    // ... más topics
};
```

### Configuración de Umbrales
Los umbrales se configuran desde el panel de administración y se envían via MQTT a los dispositivos IoT.

### Gestión de Usuarios
Actualmente implementado como mock. Para producción, integrar con Firebase Auth o similar.

## 🚨 Troubleshooting

### Problemas Comunes

1. **MQTT no conecta**
   - Verificar configuración en `web/.env.local`
   - Comprobar que el broker esté disponible
   - Revisar logs en consola del navegador

2. **Datos no se actualizan**
   - Verificar topics MQTT
   - Comprobar conexión en `/mqtt-test`
   - Revisar handlers en `useMQTT.ts`

3. **Problemas de autenticación**
   - El sistema usa mock auth para desarrollo
   - Verificar configuración en `web/src/contexts/AuthContext.tsx`

### Logs de Debug
Los logs importantes aparecen en la consola del navegador con prefijos:
- `🔌` - Conexión MQTT
- `📤` - Mensajes enviados
- `📥` - Mensajes recibidos
- `🔍` - Debug de autenticación

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Desarrollador**: Sofía Córdoba - soficordoba@live.com
- **Proyecto**: Immersive Art IoT System

---

**Nota**: Este sistema está configurado para desarrollo con autenticación mock. Para producción, se recomienda implementar autenticación real y configurar un broker MQTT privado.

