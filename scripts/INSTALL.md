# 📦 Instalação Rápida - Available Tools Scripts

Guia de 3 passos para usar estes scripts em qualquer projeto Deco.

## 🚀 Instalação Rápida

### Opção 1: Setup Interativo (Recomendado)

```bash
# 1. Copiar pasta scripts para seu projeto
cp -r /caminho/deste/projeto/scripts /seu/projeto/

# 2. Entrar no seu projeto
cd /seu/projeto

# 3. Executar setup interativo
deno run --allow-all scripts/setup.ts

# 4. Gerar catálogo
deno run --allow-all scripts/generate-available-tools.ts
```

Pronto! ✅

### Opção 2: Setup Manual

```bash
# 1. Copiar pasta scripts
cp -r /caminho/deste/projeto/scripts /seu/projeto/

# 2. Copiar e editar template
cd /seu/projeto
cp scripts/currentWorkspace.template.json currentWorkspace.json

# 3. Editar currentWorkspace.json
# Mudar workspace, projectName, etc.

# 4. Gerar catálogo
deno run --allow-all scripts/generate-available-tools.ts
```

## 📋 Estrutura Mínima

Depois da instalação, seu projeto terá:

```
seu-projeto/
├── currentWorkspace.json     # ⚙️ Configuração
├── available-tools.json      # 📊 Catálogo gerado
└── scripts/
    ├── config.ts             # Módulo compartilhado
    ├── generate-available-tools.ts
    ├── list-tools.ts
    ├── find-tool.ts
    └── search-tools.ts
```

## 🔑 Descobrir Seu Workspace

⚠️ **IMPORTANTE:** `deco whoami` mostra seu workspace **PESSOAL**, não o workspace do projeto!

### Workspace Correto (Projeto/Time):
```
/nome-da-empresa/default
/nome-do-time/producao  
/projeto-especifico/workspace
```

### Workspace Pessoal (❌ Geralmente NÃO é o que você quer):
```
/users/abc-123-def-456
```

### Como Descobrir o Workspace Correto:

**Opção 1: Via Deco Chat (mais fácil)**
1. Abra https://chat.deco.cx no navegador
2. A URL mostrará: `chat.deco.cx/WORKSPACE-AQUI`
3. Use esse valor no `currentWorkspace.json`

**Opção 2: Perguntar ao Admin**
- Peça ao administrador do projeto qual é o workspace

**Opção 3: Listar workspaces disponíveis**
```bash
# Ver todos os workspaces que você tem acesso
deco whoami
# Isso mostra SEU workspace pessoal, mas você pode ter acesso a outros

# Se souber o workspace, teste se tem acesso
deco call-tool -w /workspace-do-projeto -i i:integration-management INTEGRATIONS_LIST
# Se funcionar, você tem acesso!
```

## 📖 Usar os Scripts

```bash
# Listar todas as tools
deno run --allow-all scripts/list-tools.ts

# Buscar tools
deno run --allow-all scripts/search-tools.ts user

# Ver detalhes
deno run --allow-all scripts/find-tool.ts CREATE_USER
```

## 🆘 Problemas Comuns

### "Configuration file not found"

Certifique-se de que `currentWorkspace.json` está na **raiz** do projeto:

```bash
# Verificar
ls -la currentWorkspace.json

# Se não existir, criar do template
cp scripts/currentWorkspace.template.json currentWorkspace.json
# Depois editar o arquivo
```

### "Integration not found"

Liste suas integrações disponíveis:

```bash
deco call-tool -w /seu-workspace \
  -i i:integration-management \
  INTEGRATIONS_LIST | jq '.items[] | {id, name}'
```

Adicione os IDs corretos no `currentWorkspace.json`.

## 📚 Documentação Completa

Ver `scripts/README.md` para documentação completa, exemplos avançados e customizações.

## ✅ Checklist de Instalação

- [ ] Scripts copiados para `scripts/`
- [ ] `currentWorkspace.json` criado na raiz
- [ ] Workspace configurado corretamente
- [ ] `deno run --allow-all scripts/generate-available-tools.ts` executado com sucesso
- [ ] `available-tools.json` gerado

## 🎯 Próximos Passos

1. Explorar tools disponíveis:
   ```bash
   deno run --allow-all scripts/list-tools.ts
   ```

2. Buscar tools específicas:
   ```bash
   deno run --allow-all scripts/search-tools.ts AI
   ```

3. Começar a usar em workflows! 🚀

