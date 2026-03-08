# App Base - Expo React Native Blueprint

Boilerplate configurado para aplicaciones Expo + React Native con las siguientes tecnologías:

## Tecnologías

| Tecnología | Propósito |
|------------|-----------|
| **React Native** | Framework principal para desarrollo móvil nativo |
| **Expo** | Herramientas y plataforma para simplificar el desarrollo React Native |
| **Uniwind** | Implementación de TailwindCSS para React Native |
| **HeroUI Native** | Componentes UI modernos y accesibles |
| **Bun** | Gestor de paquetes y runtime JavaScript |

## Estructura del Proyecto

```
app-base/
├── src/
│   ├── app/              # File-based routing (Expo Router)
│   │   ├── _layout.tsx   # Layout raíz
│   │   └── index.tsx     # Pantalla principal
│   ├── integrations/    # Configuraciones de librerías
│   │   ├── hero-ui/      # Provider de HeroUI
│   │   └── index.ts      # Exports de integraciones
│   ├── assets/           # Imágenes y recursos estáticos
│   └── global.css        # Estilos globales (Uniwind)
├── app.json              # Configuración de Expo
├── package.json          # Dependencias del proyecto
├── tsconfig.json         # Configuración de TypeScript
└── eslint.config.js      # Configuración de ESLint
```

## Getting Started

### Instalación de dependencias

```bash
bun install
```

### Ejecutar en desarrollo

```bash
# Iniciar servidor Metro
bun start

# Ejecutar en Android
bun android

# Ejecutar en iOS
bun ios

# Ejecutar en Web
bun web
```

### Comandos disponibles

- `bun start` - Inicia el servidor de desarrollo
- `bun android` - Ejecuta la app en Android
- `bun ios` - Ejecuta la app en iOS
- `bun web` - Ejecuta la app en web
- `bun lint` - Ejecuta ESLint

## Características Configuradas

- **File-based Routing**: Expo Router para navegación basada en archivos
- **Styling**: Uniwind (TailwindCSS) configurado y listo para usar
- **UI Components**: HeroUI Native integrado con su provider
- **TypeScript**: Configuración completa de tipos
- **ESLint**: Linting configurado con eslint-config-expo
