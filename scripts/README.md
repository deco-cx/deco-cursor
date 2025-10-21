# 🛠️ Available Tools Scripts

Scripts reutilizáveis para gerar e consultar catálogo de tools disponíveis em qualquer workspace Deco.

## 📦 O Que Está Incluído

- **`config.ts`** - Módulo compartilhado com funções utilitárias
- **`generate-available-tools.ts`** - Gera o catálogo completo de tools
- **`list-tools.ts`** - Lista todas as tools formatadas
- **`find-tool.ts`** - Busca tool específica com schemas completos
- **`search-tools.ts`** - Busca tools por palavra-chave

## 🚀 Como Usar em Outro Projeto

### 1. Copiar Scripts

Copie a pasta `scripts/` completa para o seu projeto:

```bash
# Do projeto de origem
cp -r scripts/ /caminho/do/seu/projeto/

# Ou se preferir copiar apenas os arquivos necessários
mkdir -p /caminho/do/seu/projeto/scripts/
cp scripts/*.ts /caminho/do/seu/projeto/scripts/
```

### 2. Criar Arquivo de Configuração

Na raiz do seu projeto, crie um arquivo `currentWorkspace.json`:

```json
{
  "workspace": "/seu-workspace/caminho",
  "projectName": "Seu Projeto",
  "projectSlug": "seu-projeto",
  "description": "Descrição do seu projeto",
  "priorityIntegrations": [
    {
      "id": "i:ai-generation",
      "name": "ai-generation",
      "category": "core"
    },
    {
      "id": "i:databases-management",
      "name": "databases",
      "category": "core"
    },
    {
      "id": "i:workflows-management",
      "name": "workflows",
      "category": "core"
    },
    {
      "id": "i:http",
      "name": "http",
      "category": "core"
    }
  ],
  "includePatterns": [
    "seu-projeto",
    "custom-pattern"
  ],
  "outputFile": "available-tools.json"
}
```

#### Campos do `currentWorkspace.json`

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `workspace` | Caminho do workspace Deco | `"/deco/default"` |
| `projectName` | Nome do projeto | `"Meu Projeto"` |
| `projectSlug` | Slug do projeto | `"meu-projeto"` |
| `description` | Descrição breve | `"Tools do meu workspace"` |
| `priorityIntegrations` | Lista de integrações a incluir | Ver exemplo acima |
| `includePatterns` | Padrões para filtrar integrações por appName | `["meu-app", "custom"]` |
| `outputFile` | Nome do arquivo de saída | `"available-tools.json"` |

### 3. Descobrir Seu Workspace

⚠️ **ATENÇÃO:** `deco whoami` mostra apenas seu workspace **PESSOAL** (`/users/{id}`).  
Para projetos de time/empresa, você precisa descobrir o workspace correto de outra forma.

**Como Descobrir o Workspace do Projeto:**

1. **Via Deco Chat (recomendado)**
   - Abra https://chat.deco.cx no navegador
   - Veja a URL: `chat.deco.cx/WORKSPACE-AQUI`
   - Esse é o workspace que você deve usar!

2. **Perguntar ao Admin**
   - Pergunte ao administrador do projeto qual é o workspace
   - Normalmente é algo como `/empresa/default` ou `/time/producao`

3. **Testar Acesso**
   ```bash
   # Testar se você tem acesso a um workspace
   deco call-tool -w /workspace-do-projeto \
     -i i:integration-management \
     INTEGRATIONS_LIST
   
   # Se retornar lista de integrações, você tem acesso!
   ```

**Exemplos de Workspaces:**
- ✅ `/sua-empresa/default` (workspace do projeto)
- ✅ `/time-dev/producao` (workspace do time)
- ❌ `/users/abc-123` (workspace pessoal - geralmente não é o que você quer!)

### 4. Listar Integrações Disponíveis

Para descobrir quais integrações você tem acesso:

```bash
deco call-tool -w /seu-workspace \
  -i i:integration-management \
  INTEGRATIONS_LIST | jq '.items | map({id, name, appName})'
```

Copie os IDs das integrações que você quer incluir para o `priorityIntegrations`.

### 5. Executar Scripts

```bash
# 1. Gerar catálogo
deno run --allow-all scripts/generate-available-tools.ts

# 2. Listar todas as tools
deno run --allow-all scripts/list-tools.ts

# 3. Buscar por keyword
deno run --allow-all scripts/search-tools.ts <KEYWORD>

# 4. Ver detalhes de uma tool
deno run --allow-all scripts/find-tool.ts <TOOL_NAME>
```

## 📝 Exemplos de Configuração

### Exemplo 1: Workspace Pessoal Simples

```json
{
  "workspace": "/users/abc123-def456-ghi789",
  "projectName": "Meu Workspace",
  "projectSlug": "meu-workspace",
  "description": "Tools do meu workspace pessoal",
  "priorityIntegrations": [
    { "id": "i:ai-generation", "name": "ai-generation", "category": "core" },
    { "id": "i:http", "name": "http", "category": "core" },
    { "id": "i:workflows-management", "name": "workflows", "category": "core" }
  ],
  "includePatterns": [],
  "outputFile": "available-tools.json"
}
```

### Exemplo 2: Projeto Empresarial com Custom Apps

```json
{
  "workspace": "/minha-empresa/producao",
  "projectName": "Empresa XYZ",
  "projectSlug": "empresa-xyz",
  "description": "Tools corporativas da Empresa XYZ",
  "priorityIntegrations": [
    { "id": "i:ai-generation", "name": "ai", "category": "core" },
    { "id": "i:databases-management", "name": "db", "category": "core" },
    { "id": "i:custom-integration-123", "name": "erp-integration", "category": "custom" }
  ],
  "includePatterns": [
    "empresa-xyz",
    "internal",
    "custom"
  ],
  "outputFile": "available-tools.json"
}
```

### Exemplo 3: Projeto com Foco em IA

```json
{
  "workspace": "/ai-team/research",
  "projectName": "AI Research Tools",
  "projectSlug": "ai-research",
  "description": "Ferramentas de IA e ML",
  "priorityIntegrations": [
    { "id": "i:ai-generation", "name": "ai-generation", "category": "ai" },
    { "id": "i:model-management", "name": "models", "category": "ai" },
    { "id": "i:databases-management", "name": "databases", "category": "core" },
    { "id": "i:http", "name": "http", "category": "core" }
  ],
  "includePatterns": [
    "ai",
    "ml",
    "openai",
    "anthropic"
  ],
  "outputFile": "ai-tools.json"
}
```

## 🔧 Customização

### Filtrar Integrações

O script filtra integrações de duas formas:

1. **Por ID** - Se estiver em `priorityIntegrations`
2. **Por padrão** - Se o `appName` conter algum dos `includePatterns`

Exemplo: Se você tem `"includePatterns": ["minha-empresa"]`, todas as integrações com appName contendo "minha-empresa" serão incluídas.

### Mudar Nome do Arquivo de Saída

```json
{
  "outputFile": "meu-catalogo-custom.json"
}
```

Depois ajuste os outros scripts para ler deste arquivo (ou use o padrão `available-tools.json`).

## 📊 Estrutura do Catálogo Gerado

O arquivo `available-tools.json` terá esta estrutura:

```json
{
  "workspace": "/seu-workspace",
  "projectName": "Seu Projeto",
  "projectSlug": "seu-projeto",
  "generatedAt": "2025-10-21T15:30:00.000Z",
  "description": "Descrição do projeto",
  "integrations": {
    "i:integration-id": {
      "name": "Integration Name",
      "appName": "@org/app-name",
      "id": "i:integration-id",
      "category": "core",
      "toolCount": 10,
      "tools": [
        {
          "name": "TOOL_NAME",
          "description": "Tool description",
          "inputSchema": { /* JSON Schema */ },
          "outputSchema": { /* JSON Schema */ }
        }
      ]
    }
  }
}
```

## 🎯 Use Cases

### 1. Documentação de API Interna

Gere documentação completa das tools disponíveis no seu workspace:

```bash
deno run --allow-all scripts/generate-available-tools.ts
# Use available-tools.json como fonte de verdade para documentação
```

### 2. Descoberta de Tools

Desenvolvedores podem rapidamente encontrar tools:

```bash
# Buscar tools relacionadas a usuários
deno run --allow-all scripts/search-tools.ts user

# Ver schema completo de uma tool
deno run --allow-all scripts/find-tool.ts CREATE_USER
```

### 3. Geração de Código

Use o catálogo para gerar boilerplate de workflows:

```typescript
import { loadJson } from "./scripts/config.ts";

const catalog = await loadJson("available-tools.json");
// Gere código baseado nos schemas...
```

### 4. Validação de Workflows

Valide que workflows usam tools existentes:

```typescript
import { loadJson } from "./scripts/config.ts";

const catalog = await loadJson("available-tools.json");
const allToolNames = Object.values(catalog.integrations)
  .flatMap(int => int.tools.map(t => t.name));

// Valide seus workflows contra allToolNames
```

## 🔄 Atualização

Sempre que novas tools forem adicionadas ao workspace:

```bash
deno run --allow-all scripts/generate-available-tools.ts
```

Considere adicionar ao seu CI/CD ou pre-commit hooks.

## 📦 Dependências

- **Deno** - Runtime para executar os scripts
- **deco CLI** - Para acessar as tools (`deco call-tool`)
- **jq** (opcional) - Para processar JSON na linha de comando

## 🆘 Troubleshooting

### "Configuration file not found"

Certifique-se de criar `currentWorkspace.json` na **raiz** do projeto (não dentro de `scripts/`).

### "Integration not found"

O ID da integração está incorreto. Liste todas as integrações:

```bash
deco call-tool -w /seu-workspace \
  -i i:integration-management \
  INTEGRATIONS_LIST | jq '.items[].id'
```

### "Permission denied"

Dê permissão de execução aos scripts:

```bash
chmod +x scripts/*.ts
```

### Scripts não encontram workspace

Verifique o campo `workspace` no `currentWorkspace.json`:

```bash
deco whoami
# Use o valor exato de "Current Workspace"
```

## 📖 Documentação Adicional

- [Deco CLI Documentation](https://docs.deco.cx)
- [Deno Runtime](https://deno.land)
- [JSON Schema](https://json-schema.org)

## 🤝 Contribuindo

Estes scripts são genéricos e reutilizáveis. Sugestões de melhorias:

1. Adicionar cache de resultados
2. Suporte a múltiplos workspaces
3. Geração de documentação em Markdown
4. Export para outros formatos (YAML, CSV, etc.)

## 📄 Licença

Scripts podem ser copiados e adaptados livremente para seus projetos.

