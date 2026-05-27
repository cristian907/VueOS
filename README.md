# 📱 VueOS: Simulador de Sistema Operativo Móvil (Hardware & P2P Edition)

**VueOS** es un simulador de sistema operativo móvil basado en web de alta fidelidad, diseñado y desarrollado como un proyecto académico universitario para la cátedra de **Sistemas de Operación** en la **Universidad de José Antonio Páez (UJAP)**. 

El simulador ofrece la ilusión perfecta de un sistema operativo nativo corriendo sobre el navegador web, implementando gestión de recursos de memoria (RAM) simulados, integración con hardware real (batería, cámara, micrófono), seguridad robusta, ventanas multitarea y una red descentralizada de comunicación en tiempo real.

---

## 🚀 Características Principales

### 🧠 1. Kernel y Gestión de Recursos
* **Simulación Realista de RAM:** El "Kernel" del sistema (gestionado a través de **Pinia State Store**) controla dinámicamente la memoria disponible, asignando espacio para cada proceso/app que se abre.
* **OOM Killer (Out-Of-Memory):** Monitoreo constante del consumo de memoria. Si la RAM excede el límite máximo del dispositivo, el Kernel ejecuta un algoritmo de eliminación de procesos en segundo plano para liberar recursos basándose en la prioridad de uso.
* **Multitarea Real:** Ventanas flotantes interactivas con persistencia de estado mediante `<KeepAlive>`, permitiendo minimizar, maximizar, mover y forzar el cierre de apps desde el panel de "Recientes".

### 🔒 2. Seguridad y Personalización
* **Pantalla de Bloqueo (LockScreen):** Inicio de sesión protegido con un código PIN personalizable desde la configuración.
* **Modo Claro / Oscuro Nativo:** Integración completa y fluida de temas de color a nivel de interfaz de usuario con Tailwind CSS.

### 🔋 3. Integración con Hardware Real
* **Battery Status API:** Lectura y visualización en tiempo real del porcentaje de batería, estado de carga e indicaciones visuales en la barra de estado superior.
* **Cámara de Video:** Acceso directo a la cámara física del dispositivo huésped utilizando la API `navigator.mediaDevices.getUserMedia`.

### 📞 4. Ecosistema P2P y Mensajería Concurrente
* **VueText (Mensajería Instantánea):** Aplicación de mensajería en tiempo real que se conecta a través de WebSockets con un backend concurrente en **Go**.
* **VueCall (Llamadas de Voz P2P):** Cliente de telefonía IP directo basado en **PeerJS (WebRTC)**. Permite emitir y recibir llamadas de audio reales entre navegadores utilizando números de teléfono ficticios configurados por cada usuario.

---

## 🛠️ Stack Tecnológico

### Frontend
* **Framework:** Vue 3 (Composition API) inicializado con Vite.
* **Estilos:** Tailwind CSS con soporte para temas dinámicos (`dark:`).
* **Manejador de Estado (Kernel):** Pinia.
* **Protocolos de Red:** WebSocket Client & PeerJS (WebRTC).
* **Persistencia:** Dexie (IndexedDB) para notas y configuraciones.

### Backend
* **Lenguaje:** Go (Golang).
* **Arquitectura:** Servidor concurrente de señalización con patrón Hub/Manager implementando `goroutines` y `channels` para el manejo seguro de WebSockets de alto rendimiento.

---

## 📁 Estructura del Proyecto

```bash
MobileOS/
├── README.md                 # Este documento de presentación y guía
├── package.json              # Configuración y dependencias del root
├── mobile-os-frontend/       # Código fuente de la interfaz del SO móvil (Vue 3)
│   ├── src/
│   │   ├── store/            # KernelStore (RAM, Batería, Procesos) y NetworkStore
│   │   ├── components/       # Componentes modulares (StatusBar, LockScreen, Desktop)
│   │   └── apps/             # Ecosistema de aplicaciones (Calculadora, Ajustes, Notas, Cámara, etc.)
│   └── package.json
└── mobile-os-backend/        # Código fuente del servidor de señalización (Go)
    ├── main.go               # Punto de entrada del servidor WebSocket
    ├── hub.go                # Gestor de conexiones de dispositivos y enrutamiento
    ├── client.go             # Abstracción de conexión de socket cliente
    └── message.go            # Estructuras de mensajería del sistema
```

---

## ⚙️ Instrucciones de Instalación y Uso

### Prerrequisitos
* Tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).
* Tener instalado [Go (Golang)](https://go.dev/) (versión 1.20 o superior).

---

### ⚡ Atajos Rápidos (Desde la Raíz del Proyecto)

Para máxima comodidad, puedes arrancar todo directamente desde la carpeta raíz del proyecto (`MobileOS/`) usando los siguientes scripts de npm:

* **Iniciar Frontend:**
  ```bash
  npm run dev:frontend
  ```
* **Iniciar Backend (Go):**
  ```bash
  npm run start:backend
  ```

---

### Paso 1: Configurar y Correr el Backend (Go) manualmente

1. Dirígete a la carpeta del backend:
   ```bash
   cd mobile-os-backend
   ```
2. Ejecuta el servidor en modo desarrollo:
   ```bash
   go run .
   ```
   *El servidor de señalización se iniciará en `ws://localhost:8080/ws`.*

---

### Paso 2: Configurar y Correr el Frontend (Vue 3)

1. Abre una nueva terminal y navega al frontend:
   ```bash
   cd mobile-os-frontend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
   *El frontend por defecto estará disponible en `http://localhost:5173`.*

---

### 🌐 Pruebas en Dispositivos Móviles Reales (Túnel HTTPS)

Debido a las políticas de seguridad de los navegadores modernos, **el acceso a la Cámara y al Micrófono requiere de una conexión HTTPS segura**. Para probar el simulador en teléfonos móviles reales de forma local:

1. Utiliza **Pinggy** para exponer tu puerto local `5173` a la red pública con HTTPS:
   ```bash
   ssh -p 443 -R0:localhost:5173 a.pinggy.io
   ```
2. Abre la URL con `https://...` provista por Pinggy en los navegadores de tus dispositivos móviles y disfruta de la experiencia nativa de **VueOS** con soporte completo de Cámara y llamadas P2P en tiempo real.