# 🛡️ FortiGate IoC Manager

<div align="center">
  <img src="https://img.shields.io/badge/FortiGate-IoC_Manager-red?style=for-the-badge&logo=fortinet" alt="FortiGate IoC Manager">
  <img src="https://img.shields.io/badge/Versión-1.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Estado-Producción-green?style=for-the-badge" alt="Status">
</div>

## 📋 Descripción

**FortiGate IoC Manager** es una aplicación web moderna diseñada para gestionar y enviar **Indicadores de Compromiso (IoC)** al sistema FortiGate de su empresa. Esta herramienta permite a los equipos de seguridad centralizar, validar y exportar amenazas de ciberseguridad de manera eficiente.

### 🎯 Objetivos Principales

- **Centralizar** la gestión de indicadores de compromiso
- **Validar** y aprobar IoCs antes de su implementación en FortiGate
- **Exportar** automáticamente los IoCs en formatos compatibles con FortiGate
- **Monitorear** las tendencias de amenazas en tiempo real
- **Colaborar** entre equipos de seguridad con un flujo de trabajo estructurado

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 18.17.0
- **npm** >= 9.0.0
- Navegador web moderno

### Instalación Local

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-empresa/fortigate-ioc-manager.git
cd fortigate-ioc-manager
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

4. **Abrir en el navegador**

```
http://localhost:3000
```

### Scripts Disponibles

```bash
# Desarrollo con Turbopack
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm start

# Verificar código con ESLint
npm run lint

# Corregir problemas de ESLint automáticamente
npm run lint:fix

# Verificar tipos de TypeScript
npm run type-check

# Limpiar cache y archivos temporales
npm run clean
```

---

## 👥 Cuentas de Demostración

| Rol | Usuario | Contraseña | Permisos |
|-----|---------|------------|----------|
| **Administrador** | `admin` | `admin123` | Acceso completo, gestión de usuarios |
| **Analista** | `analista` | `analista123` | Crear, editar y exportar IoCs |
| **Seguridad** | `seguridad` | `seguridad123` | Ver y reportar IoCs |

---

## 📚 Guía de Uso

### 🏠 Dashboard Principal

El dashboard proporciona una vista general del sistema con:

- **📊 Estadísticas en tiempo real**: Total de IoCs, pendientes, aprobados
- **📈 Gráficos interactivos**:
  - Distribución por tipos (IP, Dominios, URLs, Hashes)
  - Severidad de amenazas (Pie chart)
  - Tendencia semanal (Gráfico de barras)
- **🎯 Actividad reciente**: Últimos IoCs reportados
- **👑 Top reportadores**: Usuarios más activos
- **⚡ Acciones rápidas**: Botones para agregar nuevos IoCs

**Funcionalidades:**

- Toggle de tema claro/oscuro
- Actualización automática de estadísticas
- Navegación intuitiva a otras secciones

### ➕ Agregar IoCs

Sistema de formulario en **3 pasos** para cada tipo de IoC:

#### 🌐 Agregar Dirección IP

**Paso 1: Información Básica**

- Dirección IP (validación automática)
- Nivel de severidad (Baja, Media, Alta, Crítica)
- Descripción detallada de la amenaza

**Paso 2: Información del Reportador**

- Nombre completo del reportador
- Email corporativo
- Fuente de detección (SIEM, EDR, etc.)
- Nivel de confianza (0-100%)

**Paso 3: Información Adicional**

- Etiquetas para categorización
- Clasificación TLP (Traffic Light Protocol)
- **Opciones avanzadas:**
  - Fechas de primera/última observación
  - Notas adicionales
  - Referencias externas

#### 🏷️ Agregar Dominio

Similar al flujo de IP con validación específica de dominios.

#### 🔗 Agregar URL

Incluye validación de formato URL completo.

#### #️⃣ Agregar Hash

Soporte para MD5, SHA1, SHA256 y otros formatos de hash.

### 📋 Lista de IoCs

**Funcionalidades principales:**

- **🔍 Búsqueda avanzada**: Por valor, descripción o reportador
- **🗂️ Filtros múltiples**: Tipo, severidad, estado
- **📊 Ordenamiento**: Por cualquier columna (ascendente/descendente)
- **✏️ Edición inline**: Cambio de estado directamente en la tabla
- **🗑️ Eliminación**: Con confirmación de seguridad

**Estados de IoC:**

- **🟡 Pendiente**: Esperando revisión
- **🟢 Aprobado**: Listo para exportar a FortiGate
- **🔴 Rechazado**: No válido o duplicado

### 📤 Exportación

Sistema de exportación multi-formato para integración con FortiGate:

#### Formatos Disponibles

**📄 TXT (Text)**

- Lista simple de valores IoC
- Una entrada por línea
- Compatible con la mayoría de sistemas
- Ideal para importación rápida

**🗂️ JSON (JavaScript Object Notation)**

- Formato estructurado completo
- Incluye todos los metadatos
- Perfecto para API de FortiGate
- Contiene: severidad, etiquetas, reportador, fechas, etc.

**📊 CSV (Comma Separated Values)**

- Formato tabular para análisis
- Compatible con Excel y bases de datos
- Ideal para reportes y auditorías

#### Proceso de Exportación

1. **Seleccionar formato** deseado
2. **Generar exportación** (vista previa incluida)
3. **Descargar archivo** con nomenclatura automática
4. **Integrar en FortiGate** siguiendo las instrucciones

#### Instrucciones de Integración FortiGate

**Para formato TXT:**

```
Security Fabric → Threat Feeds → External Block List
```

**Para formato JSON:**

```
API FortiGate o FortiManager para despliegue automatizado
```

**Para formato CSV:**

```
Conversión a formato FortiGate o análisis en herramientas externas
```

---

## 🎨 Características Técnicas

### 🌙 Modo Oscuro/Claro

- Toggle instantáneo entre temas
- Persistencia en localStorage
- Transiciones suaves
- Optimizado para uso prolongado

### 📱 Diseño Responsivo

- Compatible con dispositivos móviles
- Adaptación automática de interfaz
- Navegación táctil optimizada

### 🔔 Sistema de Notificaciones

- Toast notifications en tiempo real
- Confirmaciones de acciones
- Alertas de errores
- Feedback visual inmediato

### ⚡ Animaciones y Transiciones

- Animaciones CSS personalizadas
- Transiciones fluidas entre páginas
- Efectos hover interactivos
- Carga progresiva de elementos

### 🔒 Seguridad

- Autenticación por roles
- Validación de formularios
- Sanitización de datos
- Protección contra inyecciones

---

## 🛠️ Tech Stack

<div align="center">

### Frontend Framework

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### Styling & UI

![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white)

### Data Visualization

![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge&logo=chartdotjs&logoColor=white)

### Development Tools

![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)

### Build & Deployment

![Turbopack](https://img.shields.io/badge/Turbopack-000000?style=for-the-badge&logo=vercel&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white)

### Libraries & Utilities

![Date-fns](https://img.shields.io/badge/Date--fns-770C56?style=for-the-badge&logo=javascript&logoColor=white)
![UUID](https://img.shields.io/badge/UUID-326CE5?style=for-the-badge&logo=javascript&logoColor=white)
![Clsx](https://img.shields.io/badge/Clsx-FF4785?style=for-the-badge&logo=javascript&logoColor=white)

</div>

---

## 📁 Estructura del Proyecto

```
fortigate-ioc-manager/
├── 📂 app/                    # App Router de Next.js
│   ├── 📄 layout.tsx         # Layout principal
│   ├── 📄 page.tsx           # Página principal
│   └── 📄 globals.css        # Estilos globales
├── 📂 components/            # Componentes React
│   ├── 📄 Dashboard.tsx      # Dashboard principal
│   ├── 📄 IoCForm.tsx        # Formulario de IoCs
│   ├── 📄 IoCList.tsx        # Lista de IoCs
│   ├── 📄 ExportSection.tsx  # Sección de exportación
│   ├── 📄 LoginForm.tsx      # Formulario de login
│   ├── 📄 Layout.tsx         # Layout de la aplicación
│   └── 📄 ToastContainer.tsx # Sistema de notificaciones
├── 📂 lib/                   # Lógica de negocio
│   ├── 📄 auth.ts           # Servicio de autenticación
│   └── 📄 ioc.ts            # Servicio de IoCs
├── 📂 types/                 # Definiciones TypeScript
│   └── 📄 index.ts          # Tipos principales
├── 📂 public/                # Archivos estáticos
└── 📄 package.json          # Dependencias del proyecto
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME="FortiGate IoC Manager"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# URLs de API (para integración futura)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
FORTIGATE_API_URL="https://your-fortigate.company.com/api"

# Configuración de tema
NEXT_PUBLIC_DEFAULT_THEME="light"
```

### Configuración de FortiGate

Para integrar con un FortiGate real:

1. **Configurar API Access**
2. **Crear certificados SSL**
3. **Configurar Threat Intelligence Feeds**
4. **Establecer políticas de actualización**

---

## 🤝 Contribución

### Reportar Problemas

1. Verificar que el problema no existe en [Issues](../../issues)
2. Crear un nuevo issue con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Capturas de pantalla si es necesario
   - Información del entorno (browser, OS, etc.)

### Proponer Mejoras

1. Fork del repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

---

## 📞 Soporte

- **📧 Email**: <soporte@empresa.com>
- **💬 Slack**: #fortigate-ioc-manager
- **📖 Wiki**: [Documentación interna](../../wiki)
- **🎯 Issues**: [GitHub Issues](../../issues)

---

## 🔄 Changelog

### Versión 1.0.0 (2024-07-10)

- ✅ Lanzamiento inicial
- ✅ Gestión completa de IoCs
- ✅ Sistema de exportación multi-formato
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Modo oscuro/claro
- ✅ Sistema de autenticación por roles

---

<div align="center">
  <p><strong>Desarrollo por Raffy Casso y Charles Lantigua Jorge</strong></p>
  <p><em>Departamento de Seguridad Logica, Altice Dominicana</em></p>
</div>
