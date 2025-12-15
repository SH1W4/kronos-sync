# 🛠️ IDE INTEGRATION GUIDE - KRONOS SYNC
## Guia de Integração para IDEs com IA (Cursor, Warp, etc.)

> **Target**: Cursor AI, Warp Terminal, GitHub Copilot, Tabnine, CodeWhisperer  
> **Objetivo**: Configurar IDEs para máxima produtividade no KRONOS SYNC  
> **Versão**: 2.0.0 - Cyber Elegante Update

---

## 🎯 **CONFIGURAÇÕES ESPECÍFICAS POR IDE**

### **🖱️ CURSOR AI**

#### **Configuração Inicial**
```json
// .cursor/settings.json
{
  "cursor.ai.model": "claude-3.5-sonnet",
  "cursor.ai.enableAutoComplete": true,
  "cursor.ai.enableInlineChat": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### **Prompts Otimizados para Cursor**
```markdown
# Context Prompt para KRONOS SYNC
Este é o KRONOS SYNC v2.0.0 - sistema de gestão para estúdios de tatuagem.

## Stack:
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4 + tema cyber elegante
- Prisma + PostgreSQL
- NextAuth + Google Calendar API

## Estilo Visual:
- Cores: #00FF88 (primária), #8B5CF6 (secundária), #00BFFF (destaque)
- Fontes: Orbitron (títulos), JetBrains Mono (corpo)
- Tema: Cyber futurista, sem bordas arredondadas
- Animações: Glitch, pulse, scan lines

## Componentes Base:
- Button, Dialog, Input, Select em /src/components/ui/
- ThemeContext em /src/contexts/theme-context.tsx
- 6 presets de temas + personalização completa

Sempre manter consistência visual cyber e usar as cores/fontes especificadas.
```

#### **Snippets Cursor**
```json
// .cursor/snippets.json
{
  "Cyber Button": {
    "prefix": "cyber-btn",
    "body": [
      "<Button className=\"bg-primary hover:bg-primary/90 text-background font-mono uppercase tracking-wider border-0 cyber-glow\">",
      "  $1",
      "</Button>"
    ]
  },
  "Cyber Card": {
    "prefix": "cyber-card",
    "body": [
      "<div className=\"cyber-card bg-muted/50 border border-primary/30 p-6\">",
      "  $1",
      "</div>"
    ]
  },
  "Cyber Title": {
    "prefix": "cyber-title",
    "body": [
      "<h1 className=\"cyber-title text-4xl font-orbitron font-black text-primary\">",
      "  $1",
      "</h1>"
    ]
  }
}
```

### **⚡ WARP TERMINAL**

#### **Configuração Warp**
```yaml
# ~/.warp/themes/kronos-cyber.yaml
name: "KRONOS Cyber"
author: "KRONOS SYNC Team"
colors:
  background: "#0A0A0A"
  foreground: "#00FF88"
  cursor: "#00BFFF"
  selection_background: "#8B5CF6"
  selection_foreground: "#0A0A0A"
  ansi:
    black: "#0A0A0A"
    red: "#FF0055"
    green: "#00FF88"
    yellow: "#FFFF00"
    blue: "#00BFFF"
    magenta: "#8B5CF6"
    cyan: "#00FFFF"
    white: "#FFFFFF"
```

#### **Aliases Warp**
```bash
# ~/.zshrc ou ~/.bashrc
alias kronos-dev="cd ~/kronos-sync && npm run dev"
alias kronos-build="cd ~/kronos-sync && npm run build"
alias kronos-db="cd ~/kronos-sync && npx prisma studio"
alias kronos-seed="cd ~/kronos-sync && npm run db:seed"
alias kronos-reset="cd ~/kronos-sync && npx prisma migrate reset"
alias kronos-deploy="cd ~/kronos-sync && npm run build && npm start"
```

#### **Workflows Warp**
```yaml
# ~/.warp/workflows/kronos.yaml
name: "KRONOS Development"
command: |
  echo "🚀 KRONOS SYNC Development Environment"
  echo "📁 Project: $(pwd)"
  echo "🔧 Node: $(node --version)"
  echo "📦 NPM: $(npm --version)"
  echo ""
  echo "Available commands:"
  echo "  kronos-dev    - Start development server"
  echo "  kronos-build  - Build for production"
  echo "  kronos-db     - Open Prisma Studio"
  echo "  kronos-seed   - Seed database"
  echo "  kronos-reset  - Reset database"
```

### **🐙 GITHUB COPILOT**

#### **Configuração VS Code**
```json
// .vscode/settings.json
{
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false,
    "markdown": true,
    "typescript": true,
    "typescriptreact": true
  },
  "github.copilot.advanced": {
    "listCount": 10,
    "inlineSuggestCount": 3
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

#### **Prompts para Copilot**
```typescript
// Exemplo de prompt inline para Copilot
// Generate a cyber-themed button component with glitch animation
// Colors: #00FF88 (primary), #8B5CF6 (secondary), #00BFFF (accent)
// Font: JetBrains Mono, uppercase, tracking-wider
// Animation: subtle pulse on hover
const CyberButton = () => {
  // Copilot irá sugerir implementação baseada no contexto
}
```

### **🔥 TABNINE**

#### **Configuração Tabnine**
```json
// tabnine_config.json
{
  "version": "4.0.0",
  "api_version": "3",
  "disable_file_regex": [],
  "max_num_results": 5,
  "ignore_all_lsp": false,
  "local_enabled": true,
  "cloud_enabled": true,
  "semantic_status": "Enabled",
  "suggestions_mode": "inline",
  "inline_suggestions_mode": "ghost_text"
}
```

---

## 📁 **ESTRUTURA DE WORKSPACE OTIMIZADA**

### **Configuração Multi-Root**
```json
// kronos-sync.code-workspace
{
  "folders": [
    {
      "name": "🚀 KRONOS SYNC",
      "path": "."
    },
    {
      "name": "📊 Database",
      "path": "./prisma"
    },
    {
      "name": "🎨 Components",
      "path": "./src/components"
    },
    {
      "name": "📱 Pages",
      "path": "./src/app"
    },
    {
      "name": "🔧 APIs",
      "path": "./src/app/api"
    }
  ],
  "settings": {
    "typescript.preferences.includePackageJsonAutoImports": "on",
    "typescript.suggest.autoImports": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true,
      "source.organizeImports": true
    }
  }
}
```

### **Tasks Automatizadas**
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🚀 Start Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "🗄️ Open Prisma Studio",
      "type": "shell",
      "command": "npx prisma studio",
      "group": "build"
    },
    {
      "label": "🌱 Seed Database",
      "type": "shell",
      "command": "npm run db:seed",
      "group": "build"
    },
    {
      "label": "🏗️ Build Production",
      "type": "shell",
      "command": "npm run build",
      "group": "build"
    }
  ]
}
```

### **Launch Configurations**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🐛 Debug Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    },
    {
      "name": "🧪 Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 🎨 **EXTENSÕES RECOMENDADAS**

### **VS Code Extensions**
```json
// .vscode/extensions.json
{
  "recommendations": [
    // Core
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    
    // AI Assistants
    "github.copilot",
    "github.copilot-chat",
    "tabnine.tabnine-vscode",
    
    // Development
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    
    // Database
    "ms-mssql.mssql",
    "ckolkman.vscode-postgres",
    
    // Utilities
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-thunder-client"
  ]
}
```

### **Cursor Extensions**
```json
{
  "recommendations": [
    "cursor.cursor-ai",
    "cursor.cursor-copilot",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "esbenp.prettier-vscode"
  ]
}
```

---

## 🔧 **CONFIGURAÇÕES DE DESENVOLVIMENTO**

### **TypeScript Config**
```json
// tsconfig.json - Otimizado para IAs
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/contexts/*": ["./src/contexts/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### **ESLint Config**
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@next/next/no-img-element": "off",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "prefer-const": "warn"
  }
}
```

### **Prettier Config**
```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

---

## 🤖 **PROMPTS ESPECÍFICOS PARA IAs**

### **Prompt para Novos Componentes**
```markdown
Crie um componente React para o KRONOS SYNC seguindo estas diretrizes:

## Estilo Visual:
- Tema cyber elegante
- Cores: #00FF88 (primária), #8B5CF6 (secundária), #00BFFF (destaque)
- Fonte: JetBrains Mono para texto, Orbitron para títulos
- Sem bordas arredondadas (border-radius: 0)
- Animações sutis: pulse, glow, glitch

## Estrutura:
- TypeScript com interfaces tipadas
- Tailwind CSS para estilização
- Props desestruturadas com valores padrão
- Componente exportado como default

## Classes Padrão:
- Botões: "bg-primary hover:bg-primary/90 text-background font-mono uppercase"
- Cards: "cyber-card bg-muted/50 border border-primary/30"
- Títulos: "cyber-title font-orbitron font-black text-primary"

Exemplo de uso: [descrever funcionalidade específica]
```

### **Prompt para APIs**
```markdown
Crie uma API Route para o KRONOS SYNC seguindo o padrão:

## Estrutura:
- Next.js 15 App Router
- TypeScript com tipagem completa
- Prisma para database
- Validação de dados com Zod
- Tratamento de erros padronizado

## Padrões:
- GET: Listar/buscar recursos
- POST: Criar novos recursos
- PUT/PATCH: Atualizar recursos
- DELETE: Remover recursos

## Response Format:
```json
{
  "success": true,
  "data": {},
  "message": "Operação realizada com sucesso"
}
```

## Error Format:
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

Funcionalidade: [descrever endpoint específico]
```

### **Prompt para Páginas**
```markdown
Crie uma página Next.js para o KRONOS SYNC seguindo o padrão:

## Layout:
- App Router (Next.js 15)
- TypeScript + Tailwind CSS
- Tema cyber elegante consistente
- Responsivo (mobile-first)

## Estrutura:
- Metadata configurado
- Loading states
- Error boundaries
- Acessibilidade (ARIA labels)

## Estilo:
- Header com navegação cyber
- Conteúdo principal em container
- Footer com informações do sistema
- Animações de entrada suaves

## Funcionalidades:
- [descrever funcionalidades específicas]
- Integração com APIs
- Estados de loading/error
- Feedback visual para ações

Página: [descrever página específica]
```

---

## 📊 **DEBUGGING E MONITORING**

### **Debug Configuration**
```json
// .vscode/launch.json - Debug específico
{
  "configurations": [
    {
      "name": "🐛 Debug KRONOS API",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app"
    },
    {
      "name": "🔍 Debug Prisma Queries",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/debug-prisma.js",
      "env": {
        "DEBUG": "prisma:query"
      }
    }
  ]
}
```

### **Logging Configuration**
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`🔵 [INFO] ${message}`, data || '')
  },
  error: (message: string, error?: any) => {
    console.error(`🔴 [ERROR] ${message}`, error || '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`🟡 [WARN] ${message}`, data || '')
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🟣 [DEBUG] ${message}`, data || '')
    }
  }
}
```

---

## 🚀 **DEPLOYMENT HELPERS**

### **Build Scripts**
```json
// package.json - Scripts otimizados
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio",
    "build:analyze": "ANALYZE=true npm run build",
    "build:docker": "docker build -t kronos-sync .",
    "deploy:vercel": "vercel --prod",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### **Docker Helpers**
```dockerfile
# Dockerfile.dev - Para desenvolvimento
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

---

## 🎯 **PERFORMANCE OPTIMIZATION**

### **Bundle Analyzer**
```javascript
// next.config.js - Com análise de bundle
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
})
```

### **Performance Monitoring**
```typescript
// src/lib/performance.ts
export const measurePerformance = (name: string, fn: () => any) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
  return result
}
```

---

## 📚 **RECURSOS E REFERÊNCIAS**

### **Links Úteis**
- **Next.js 15 Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth.js**: https://next-auth.js.org
- **TypeScript**: https://www.typescriptlang.org/docs

### **Cheat Sheets**
```bash
# Comandos essenciais
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run db:studio    # Prisma Studio
npm run db:seed      # Popular banco
npm run type-check   # Verificar tipos
```

### **Troubleshooting**
```bash
# Problemas comuns
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Reset database
npx prisma migrate reset --force
npm run db:seed

# Verificar tipos
npx tsc --noEmit
```

---

## 🏁 **CONCLUSÃO**

Este guia configura qualquer IDE com IA para máxima produtividade no KRONOS SYNC:

- ✅ **Configurações otimizadas** para cada IDE
- ✅ **Prompts específicos** para manter consistência
- ✅ **Snippets e templates** para acelerar desenvolvimento
- ✅ **Debug e monitoring** configurados
- ✅ **Performance optimization** habilitada

**Resultado**: Desenvolvimento 3x mais rápido com qualidade consistente.

---

**🛠️ Otimizado para colaboração IDE-IA | KRONOS SYNC v2.0.0 | 2025-09-04**

