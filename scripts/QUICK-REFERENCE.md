# ⚡ Quick Reference - Available Tools Scripts

## 🚀 Instalação em 1 Linha

```bash
cp -r scripts/ /novo/projeto/ && cd /novo/projeto && deno run --allow-all scripts/setup.ts
```

## 📋 Comandos Principais

```bash
# Gerar catálogo
deno run --allow-all scripts/generate-available-tools.ts

# Listar todas as tools
deno run --allow-all scripts/list-tools.ts

# Buscar por keyword
deno run --allow-all scripts/search-tools.ts <KEYWORD>

# Ver detalhes de uma tool
deno run --allow-all scripts/find-tool.ts <TOOL_NAME>

# Setup inicial (novo projeto)
deno run --allow-all scripts/setup.ts
```

## 🔧 Descobrir Workspace

⚠️ **`deco whoami` mostra workspace PESSOAL** (`/users/xxx`), não o do projeto!

**Como descobrir workspace correto:**
1. Abrir https://chat.deco.cx → ver URL: `chat.deco.cx/WORKSPACE-AQUI`
2. Perguntar ao admin do projeto
3. Testar acesso: `deco call-tool -w /workspace-teste -i i:integration-management INTEGRATIONS_LIST`

```bash
# ✅ Workspaces de projeto (o que você quer):
/empresa/default
/time-dev/producao

# ❌ Workspace pessoal (geralmente NÃO é o que você quer):
/users/abc-123-def-456

# Listar integrações disponíveis no workspace do projeto
deco call-tool -w /workspace-do-projeto \
  -i i:integration-management \
  INTEGRATIONS_LIST | jq '.items[] | {id, name, appName}'
```

## 📝 currentWorkspace.json Mínimo

```json
{
  "workspace": "/seu-workspace",
  "projectName": "Seu Projeto",
  "projectSlug": "projeto",
  "description": "Tools do projeto",
  "priorityIntegrations": [
    {"id": "i:ai-generation", "name": "ai", "category": "core"},
    {"id": "i:http", "name": "http", "category": "core"}
  ],
  "includePatterns": ["seu-projeto"],
  "outputFile": "available-tools.json"
}
```

## 🎯 Usar Tool via CLI

```bash
deco call-tool -w /workspace \
  -i i:integration-id \
  TOOL_NAME \
  -p '{"param": "value"}'
```

## 📦 Estrutura de Arquivos

```
projeto/
├── currentWorkspace.json       # Config
├── available-tools.json        # Catálogo gerado
└── scripts/
    ├── *.ts                    # Scripts
    ├── README.md               # Doc completa
    └── INSTALL.md              # Instalação
```

## 🔍 Exemplos de Busca

```bash
# Buscar tools de IA
deno run --allow-all scripts/search-tools.ts AI

# Buscar tools de banco de dados
deno run --allow-all scripts/search-tools.ts database

# Buscar tools de usuários
deno run --allow-all scripts/search-tools.ts user
```

## 💡 Dicas Rápidas

1. **Sempre rode generate primeiro** antes de usar list/find/search
2. **Use jq** para processar JSONs: `cat available-tools.json | jq '.integrations | keys'`
3. **Adicione ao gitignore**: `available-tools.json` se regenerado frequentemente
4. **Automatize**: Adicione ao pre-commit ou CI/CD

## 🆘 Troubleshooting Express

| Erro | Solução |
|------|---------|
| "Configuration not found" | Criar `currentWorkspace.json` na raiz |
| "Integration not found" | Verificar ID com `INTEGRATIONS_LIST` |
| "Tool not found" | Rodar `generate-available-tools.ts` novamente |

## 📚 Mais Info

- `scripts/INSTALL.md` - Instalação detalhada
- `scripts/README.md` - Documentação completa

