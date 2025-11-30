# Guía de Contribución - SmashRank Argentina

¡Gracias por tu interés en contribuir a SmashRank Argentina! 🎮🇦🇷

## 🤝 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug:

1. **Verifica** que no esté ya reportado en [Issues](https://github.com/tu-usuario/smashrank-argentina/issues)
2. **Crea un nuevo issue** con:
   - Título descriptivo
   - Pasos para reproducir el bug
   - Comportamiento esperado vs actual
   - Screenshots si es posible
   - Tu entorno (SO, navegador, versión)

**Ejemplo:**
```
Título: Error al inscribirse en torneos desde móvil

Descripción:
Al intentar inscribirme en un torneo desde Chrome móvil (Android),
el selector de personajes no aparece.

Pasos:
1. Abrir torneo desde móvil
2. Click en "Inscribirse"
3. Nada sucede

Esperado: Debería abrirse el selector de personajes
Actual: No aparece nada

Ambiente: Android 13, Chrome 120
```

### Sugerir Features

Para sugerir nuevas características:

1. **Abre un issue** con el tag `enhancement`
2. Describe:
   - Qué problema resuelve
   - Cómo funcionaría
   - Por qué es útil para la comunidad

### Contribuir Código

#### 1. Fork & Clone

```bash
# Fork el repositorio en GitHub, luego:
git clone https://github.com/TU-USUARIO/smashrank-argentina.git
cd smashrank-argentina
git remote add upstream https://github.com/USUARIO-ORIGINAL/smashrank-argentina.git
```

#### 2. Crear una Rama

```bash
# Actualiza tu main
git checkout main
git pull upstream main

# Crea tu rama
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/nombre-del-bug
```

**Convención de nombres:**
- `feature/` - Nueva funcionalidad
- `fix/` - Corrección de bugs
- `docs/` - Cambios en documentación
- `style/` - Cambios de estilo (formato, etc)
- `refactor/` - Refactorización de código
- `test/` - Añadir tests

#### 3. Hacer Cambios

```bash
# Edita los archivos necesarios
# Prueba tus cambios localmente
npm run dev

# Verifica que no haya errores
npm run build
npm run lint
```

#### 4. Commit

Usa commits descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>(<scope>): <descripción corta>

# Ejemplos
git commit -m "feat(tournaments): add swiss format support"
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "style(ui): improve button animations"
```

**Tipos de commit:**
- `feat` - Nueva característica
- `fix` - Corrección de bug
- `docs` - Documentación
- `style` - Formato, estilos
- `refactor` - Refactorización
- `test` - Tests
- `chore` - Tareas de mantenimiento

#### 5. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-de-tu-feature
```

Luego en GitHub:
1. Ve a tu fork
2. Click en "Compare & pull request"
3. Completa la descripción del PR
4. Espera revisión

### Template de Pull Request

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Mi código sigue el estilo del proyecto
- [ ] He probado mis cambios localmente
- [ ] He actualizado la documentación
- [ ] He añadido tests si es necesario
- [ ] Todos los tests pasan

## Screenshots (si aplica)
[Añade screenshots aquí]

## Relacionado con
Closes #[número de issue]
```

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ BIEN - Tipos explícitos
interface User {
  id: string;
  username: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ MAL - Sin tipos
function getUser(id) {
  // ...
}
```

### React Components

```typescript
// ✅ BIEN - Componente tipado y documentado
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

/**
 * Botón reutilizable con estilo manga
 */
export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ MAL - Props sin tipo
export function Button({ label, onClick, variant }) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Naming Conventions

```typescript
// Componentes: PascalCase
export function TournamentCard() {}

// Funciones: camelCase
function fetchTournaments() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_PARTICIPANTS = 64;

// Archivos:
// - Componentes: PascalCase.tsx
// - Utilidades: camelCase.ts
// - Tipos: camelCase.types.ts
```

### Estructura de Archivos

```
feature/
├── components/          # Componentes específicos
│   ├── FeatureCard.tsx
│   └── FeatureList.tsx
├── hooks/              # Custom hooks
│   └── useFeature.ts
├── types/              # Tipos TypeScript
│   └── feature.types.ts
├── utils/              # Funciones auxiliares
│   └── featureUtils.ts
└── page.tsx            # Página principal
```

### Comentarios

```typescript
// ✅ BIEN - Comentarios útiles
/**
 * Calcula el seeding basado en fecha de inscripción
 * Los primeros inscritos obtienen mejor seed
 */
function calculateSeeding(registrations: Registration[]): SeededRegistration[] {
  return registrations
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((reg, index) => ({ ...reg, seed: index + 1 }));
}

// ❌ MAL - Comentario obvio
// Esta función ordena las inscripciones
function calculateSeeding(registrations) {
  // ...
}
```

## 🎨 Estilos y UI

### Tailwind CSS

```tsx
// ✅ BIEN - Usar clases de utilidad
<button className="btn-manga px-6 py-3 rounded-lg">
  Click me
</button>

// ❌ MAL - Estilos inline
<button style={{ padding: '12px 24px', borderRadius: '8px' }}>
  Click me
</button>
```

### Responsividad

```tsx
// ✅ BIEN - Mobile first con breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Animaciones

```tsx
// ✅ BIEN - Usar clases de animación predefinidas
<div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
  Content
</div>

// ✅ BIEN - Framer Motion para animaciones complejas
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## 🧪 Testing (Próximamente)

```typescript
// Ejemplo de test básico
describe('Tournament Registration', () => {
  it('should register user successfully', async () => {
    const result = await registerToTournament({
      userId: 'user-1',
      tournamentId: 'tournament-1',
      characterId: 'mario',
      skinId: 'mario-skin-1',
    });

    expect(result.success).toBe(true);
  });
});
```

## 📋 Checklist antes de PR

- [ ] El código compila sin errores (`npm run build`)
- [ ] No hay errores de linting (`npm run lint`)
- [ ] Probado en Chrome, Firefox y Safari
- [ ] Probado en móvil (responsive)
- [ ] Comentarios añadidos donde sea necesario
- [ ] Documentación actualizada si es necesario
- [ ] Commits descriptivos siguiendo convenciones
- [ ] Branch actualizado con `main` latest

## 🏆 Reconocimientos

Los contribuidores aparecerán en:
- README.md (sección de contribuidores)
- Release notes
- Twitter/redes sociales del proyecto

## 📞 Contacto

- **Discord:** [Link al servidor]
- **Email:** contributors@smashrank.ar
- **GitHub Discussions:** Para preguntas generales

## 📜 Código de Conducta

### Nuestro Compromiso

SmashRank Argentina es un proyecto inclusivo y respetuoso. Esperamos:

✅ **SÍ:**
- Ser respetuoso con todos
- Aceptar críticas constructivas
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía

❌ **NO:**
- Lenguaje ofensivo o ataques personales
- Trolling o comentarios despectivos
- Acoso de cualquier tipo
- Compartir información privada de otros

### Consecuencias

Las violaciones pueden resultar en:
1. Advertencia
2. Suspensión temporal
3. Ban permanente

---

¡Gracias por hacer de SmashRank Argentina un proyecto mejor! 🎮💪
