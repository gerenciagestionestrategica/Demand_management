# Frontend - Gestión de la Demanda

Frontend desarrollado en Angular para el sistema de Gestión de la Demanda. Esta aplicación permite gestionar anteproyectos, radicaciones y el seguimiento de solicitudes, con un sistema de roles y permisos robusto.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Roles y Permisos](#roles-y-permisos)
- [Docker](#docker)
- [Scripts Disponibles](#scripts-disponibles)
- [Desarrollo](#desarrollo)

## 📝 Descripción

Sistema de gestión de demanda diseñado para mejorar el rendimiento, organización y colaboración en el proceso de radicación de anteproyectos. La aplicación permite:

- Reducir tiempos y automatizar tareas repetitivas
- Visualizar el estado de las actividades sin retrasos
- Acceso rápido y seguro a la información de los radicados
- Comunicación y coordinación centralizada

## ✨ Características

### Funcionalidades Principales

- **Autenticación con Google One Tap**: Login seguro mediante Google OAuth
- **Gestión de Anteproyectos**: Crear, editar y consultar anteproyectos radicados
- **Historial de Radicaciones**: Consultar el historial completo de solicitudes enviadas
- **Gestión de Usuarios**: Administración de usuarios del sistema (solo administradores)
- **Configuración de Formularios**: Personalización de formularios (solo administradores)
- **Sistema de Roles**: Control de acceso basado en roles
- **Interfaz Responsiva**: Diseño adaptable con Bootstrap 5
- **Server-Side Rendering (SSR)**: Mejora en SEO y rendimiento inicial

## 🛠 Tecnologías

### Framework y Librerías Principales

- **Angular** 20.3.6
- **Bootstrap** 5.3.8
- **Bootstrap Icons** 1.13.1
- **RxJS** 7.8.0
- **TypeScript** 5.9.2

### Dependencias Adicionales

- `@ng-select/ng-select`: Componentes de selección avanzados
- `google-one-tap`: Integración con Google One Tap
- `jwt-decode`: Decodificación de tokens JWT
- `ngx-cookie-service`: Gestión de cookies
- `express`: Servidor para SSR
- `multer`: Manejo de archivos


## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 20 o superior recomendada)
- **npm** (incluido con Node.js)
- **Angular CLI** (se instalará globalmente o se usará via npm scripts)

## 🚀 Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd Demand-Management--Front-1
```

2. **Instalar dependencias**

```bash
npm install --legacy-peer-deps
```

> **Nota**: Se usa `--legacy-peer-deps` debido a posibles conflictos de dependencias. Si encuentras problemas, intenta primero con `npm install`.

3. **Configurar variables de entorno**



Se debes configurar `src/environments/environment.ts`:

```env
# Configuración del Servidor
FRONT_PORT= Puerto
API_URL= API Url
```

Ademas, se debe de configurar tambien el archivo .envque esta en la raíz donde se ejecuta `Dockerfile` del frontend (Solo incluye frontend):

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000/api",
  clienIdGoogle: "tu-client-id-de-google.apps.googleusercontent.com"
};
```

## ⚙️ Configuración

### Variables de Entorno

#### `environment.ts`

Configura las siguientes variables en `src/environments/environment.ts`:

- `apiUrl`: URL del backend API
- `clienIdGoogle`: Client ID de Google OAuth

#### `.env`

Configura las siguientes variables en el archivo .env:

- `FRONT_PORT`: Puesto del Frontend
- `API_URL`: Url del backend


### Backend

Asegúrate de que el backend esté corriendo y accesible en la URL configurada en `apiUrl`. El backend debe exponer los siguientes endpoints:

- `POST /api/validateLogin`: Validación de login
- `GET /api/checkSession`: Verificación de sesión
- `POST /api/logout`: Cerrar sesión

## 🏃 Ejecución
### Modo Producción

```bash
npm start
```

Esto ejecutará el servidor usando `node src/app.js`.

**Nota**: Asegúrate de tener todas las variables de entorno configuradas correctamente antes de ejecutar en producción.

### Modo de produccion

Para iniciar el servidor de desarrollo:

```bash
npm start
# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`. El servidor recargará automáticamente cuando modifiques archivos fuente.





## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── access-denied/          # Componente de acceso denegado
│   ├── edit-form/              # Componente de edición de radicados
│   ├── form/                   # Componente de creación de anteproyectos
│   ├── guard/                  # Guards y servicios de autenticación
│   │   ├── auth.guard.ts       # Guard de autenticación
│   │   ├── auth.service.ts     # Servicio de autenticación
│   │   └── guard.service.ts    # Servicio de comunicación con backend
│   ├── history/                # Componente de historial
│   ├── home/                   # Componente de inicio
│   ├── info-form/              # Configuración de formularios (admin)
│   ├── loading/                # Componente de carga
│   ├── login/                  # Componente de login
│   ├── usuario/                # Gestión de usuarios (admin)
│   ├── app.component.ts        # Componente principal
│   └── app.routes.ts           # Configuración de rutas
├── assets/
│   └── config/                 # Archivos de configuración
├── environments/
│   └── environment.ts          # Variables de entorno
├── index.html                  # HTML principal
├── main.ts                     # Punto de entrada
└── styles.css                  # Estilos globales
```

## 🔐 Roles y Permisos

El sistema utiliza un sistema de roles basado en permisos. Los roles disponibles son:

| Rol | Permisos |
|-----|----------|
| **Radicador** | Crear anteproyectos, editar radicados propios, ver historial |
| **Gerente** | Ver historial, acceder a calculadora |
| **Vicepresidente** | Ver historial, acceder a calculadora |
| **Administrador** | Acceso completo: gestión de usuarios, configuración de formularios, ver historial |
| **Metodos** | Ver historial, acceder a calculadora |
| **Visitante** | Solo lectura: ver historial |

### Rutas Protegidas

- `/home`: Todos los roles autenticados
- `/form`: Solo Radicador
- `/editar-radicado/:id`: Solo Radicador
- `/history`: Radicador, Gerente, Vicepresidente, Administrador, Metodos, Visitante
- `/usuario`: Solo Administrador
- `/info-form`: Solo Administrador


## 🐳 Docker

El proyecto incluye soporte completo para Docker y Docker Compose.

### Construir la Imagen

```bash
cd Demand-management--front
docker build -t demand-management-frontend .
```

### Ejecutar el Contenedor

```bash
docker run -p 3000:3000 --env-file .env demand-management-frontend
```

**Nota**: 
- Asegúrate de tener un archivo `.env` configurado antes de ejecutar los contenedores.
- El archivo `.env` debe estar en la raíz donde se ejecuta `Dockerfile` del frontend (Solo incluye frontend)


### Docker Compose

Si tienes un archivo `docker-compose.yml` en la raíz del proyecto (que incluye frontend y backend):

```bash
# Desde la raíz del proyecto (donde está docker-compose.yml)
docker-compose up --build
```

Esto construirá y ejecutará tanto el backend como el frontend en contenedores separados.

**Nota**: 
- Asegúrate de tener un archivo `.env` configurado antes de ejecutar los contenedores
- El archivo `.env` debe estar en la raíz donde se ejecuta `docker-compose`
- Las variables de entorno se pasan al contenedor según la configuración en `docker-compose.yml`


## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo |


## 💻 Desarrollo

### Generar Componentes

Angular CLI incluye herramientas de scaffolding:

```bash
ng generate component component-name
```

Para más opciones:

```bash
ng generate --help
```

## 👥 Contribución

Para contribuir a este proyecto, por favor contacta al equipo de desarrollo.

---

