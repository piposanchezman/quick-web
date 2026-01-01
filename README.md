# 🌟 QuickLand Network - Landing Page

Landing page oficial de QuickLand Network, un servidor de Minecraft en español con múltiples modalidades de juego.

![QuickLand](https://img.shields.io/badge/QuickLand-Network-55ffff?style=for-the-badge)
![Astro](https://img.shields.io/badge/Astro-5.16-ff5d01?style=for-the-badge&logo=astro)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)

## 🚀 Características

- ⚡ **Astro 5** - Framework web moderno y ultra rápido
- 🎨 **TailwindCSS 4** - Estilos utilitarios modernos
- 🌍 **i18n** - Soporte multiidioma (ES, EN, PT)
- 📱 **Responsive** - Diseño adaptativo para todos los dispositivos
- ♿ **Accesible** - Cumple con estándares de accesibilidad
- 🎭 **Animaciones** - Animaciones suaves y modernas
- 🔒 **SEO Optimizado** - Meta tags, Open Graph y Schema.org
- ⚙️ **TypeScript** - Tipado estático para mejor DX

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # Navbar, Footer, Background
│   ├── sections/        # Header, Features, About, etc.
│   └── ui/              # Componentes reutilizables
├── constants/           # Configuración del sitio
├── i18n/                # Traducciones
├── layouts/             # Layouts de Astro
├── pages/               # Páginas
├── scripts/             # Scripts TypeScript
└── styles/              # Estilos globales
```

Para más detalles sobre la estructura, consulta [STRUCTURE.md](./STRUCTURE.md).

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/quickland/quick-landing.git
cd quick-landing

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

## 📝 Comandos Disponibles

| Comando           | Acción                                         |
| :---------------- | :--------------------------------------------- |
| `pnpm install`    | Instala las dependencias                       |
| `pnpm dev`        | Inicia el servidor de desarrollo en `localhost:4321` |
| `pnpm build`      | Construye el sitio para producción en `./dist/` |
| `pnpm preview`    | Vista previa del build antes del deploy        |
| `pnpm astro ...`  | Ejecuta comandos de Astro CLI                  |

## 🎨 Configuración

### Configuración del Sitio

Edita `src/constants/site.ts` para cambiar:
- Nombre del sitio
- URL base
- Descripción
- Color del tema
- Idioma por defecto

### Enlaces y Redes Sociales

Edita `src/constants/links.ts` para actualizar:
- Discord
- Tienda
- Email de contacto
- API endpoints

### Navegación

Edita `src/constants/navigation.ts` para modificar el menú.

### Traducciones

Añade o modifica traducciones en `src/i18n/translations.ts`.

## 🚀 Despliegue

El proyecto está optimizado para ser desplegado en:

- **Netlify** - `pnpm build` + `dist/`
- **Vercel** - Detección automática de Astro
- **Cloudflare Pages** - Compatible out of the box
- **GitHub Pages** - Configura el adaptador estático

```bash
# Build para producción
pnpm build

# Vista previa local del build
pnpm preview
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a QuickLand Network.

## 🔗 Enlaces

- 🌐 [Sitio Web](https://quickland.net)
- 💬 [Discord](https://discord.quickland.net)
- 🛒 [Tienda](https://tienda.quickland.net)
- 📧 [Email](mailto:quickland36@gmail.com)

## 💻 Tecnologías

- [Astro](https://astro.build)
- [TailwindCSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [pnpm](https://pnpm.io)

---

Hecho con ❤️ para la comunidad de QuickLand
