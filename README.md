# 🚀 Deco Cursor - The Powerhorse Tool for Workflows & Tools Development

**A Cursor-powered repository for rapid development of Deco tools and workflows with just-in-time validation.**

Deco Cursor is your ultimate companion for building, testing, and deploying automation workflows and tools directly from your IDE. It bridges the gap between your local development environment and your Deco workspace with seamless synchronization and real-time validation.

## ✨ What Makes This Special

- 🎯 **Just-In-Time Validation** - Instantly validate tools and workflows before deployment
- 🔄 **Auto-Sync** - Changes are automatically pushed to your workspace while you work
- 🛠️ **Tool Discovery** - Built-in scripts to explore and catalog all available tools in your workspace
- 📝 **Workflow Orchestration** - Create complex multi-step workflows with integrated debugging
- 🧠 **AI-Powered** - Leverage Deco's AI generation tools to create intelligent automations
- 💻 **Cursor Integration** - Perfect for use with Cursor AI editor for optimal developer experience

## 🚀 Quick Start

### 1. Clone This Repository

```bash
git clone <repository-url>
cd deco-cursor
```

### 2. ⚠️ CRITICAL: Verify Your Workspace Path

**This is the most important step!** Many users make mistakes here.

```bash
# ❌ DO NOT use deco whoami to find your workspace
# It shows your PERSONAL workspace, which is usually NOT what you want

# ✅ INSTEAD, find your workspace from the Deco Chat URL:
# 1. Go to https://chat.deco.cx
# 2. Look at the URL bar
# 3. It shows: chat.deco.cx/YOUR-WORKSPACE-HERE
# 4. Copy that path exactly

# Examples of correct workspace paths:
/company/default          # ✅ Company project workspace
/team-name/production     # ✅ Team workspace
/users/abc-123-def-456    # ❌ Personal workspace (usually NOT for projects!)
```

**Question: What workspace are you developing for?**
- 💼 A company/organization? → Use their workspace (e.g., `/company/default`)
- 👥 A team? → Use team workspace (e.g., `/myteam/production`)
- 🧪 Just experimenting? → Use your personal workspace (e.g., `/users/your-id`)

### 3. Pull Your Workspace Configuration

Replace `/my-workspace/default` with your **actual** Deco workspace path (from step 2):

```bash
deco deconfig pull -w /my-workspace/default --path deconfig
```

This downloads your workspace's tools, views, and workflows to the `deconfig` directory.

### 4. Enable Auto-Sync for Development

**BEFORE running this, verify one more time that the workspace path is correct!**

Keep your changes synchronized with your Deco workspace in real-time:

```bash
# ⚠️ TRIPLE CHECK: Is /my-workspace/default correct?
# Don't use deco whoami - use the path from https://chat.deco.cx

deco deconfig push -w /my-workspace/default --path deconfig --watch
```

**Important:** Leave this command running in a terminal window while you develop. The `--watch` flag automatically uploads changes whenever you save files.

### 5. Start Building!

Now all your changes will be:
- ✅ Automatically sent to your workspace
- ✅ Instantly available in your Deco environment
- ✅ Version controlled in this repository

## 📁 Project Structure

```
deco-cursor/
├── README.md                          # This file
├── currentWorkspace.json              # Your workspace configuration
├── available-tools.json               # Catalog of available tools (generated)
│
├── scripts/                           # Utility scripts for tool discovery
│   ├── setup.ts                       # Initial setup wizard
│   ├── generate-available-tools.ts    # Generate tool catalog
│   ├── list-tools.ts                  # List all available tools
│   ├── find-tool.ts                   # Find specific tool with details
│   ├── search-tools.ts                # Search tools by keyword
│   ├── config.ts                      # Shared configuration module
│   ├── README.md                      # Scripts documentation
│   └── QUICK-REFERENCE.md             # Quick reference guide
│
├── tmp/                               # Temporary files (gitignored)
│   └── *.json                         # Workflow results and debugging data
│
└── workflows/                         # Your workflows
    └── (created as you develop)
```

## 🔍 Discovering Available Tools

Before creating workflows, discover what tools are available in your workspace:

### List All Tools

```bash
deno run --allow-all scripts/generate-available-tools.ts
deno run --allow-all scripts/list-tools.ts
```

This generates `available-tools.json` with a complete catalog.

### Search for Specific Tools

```bash
# Search for AI-related tools
deno run --allow-all scripts/search-tools.ts "AI"

# Search for database tools
deno run --allow-all scripts/search-tools.ts "database"

# Get full details of a specific tool
deno run --allow-all scripts/find-tool.ts "AI_GENERATE_OBJECT"
```

### View Tool Schemas

The scripts output includes:
- Tool name and description
- Input schema (what parameters it accepts)
- Output schema (what it returns)
- Integration ID (needed for workflow execution)

## 🎨 Creating Your First Workflow

Ready to create a workflow? **Ask Cursor to build one for you!**

Here's an example prompt you can use:

### 📝 Example: City Poetry Workflow

**Prompt for Cursor:**

> Create a new Deco workflow called `generate-city-poem` that:
> 1. Takes a `cityName` as input (string)
> 2. Uses the AI generation tool to create a poem about that city
> 3. Returns the poem as output
>
> The workflow should use the AI_GENERATE_OBJECT tool from the AI Gateway integration to generate a structured response with a poem field. Make sure to include proper error handling and match the output schema correctly.

When you ask Cursor, it will:
1. Discover available tools using the scripts
2. Create the workflow step by step
3. Test each step individually
4. Generate the complete workflow file

### What the Workflow Will Do

```bash
# After the workflow is created and synced:
deco call-tool -w /my-workspace/default \
  -i i:workflows-management \
  DECO_WORKFLOW_START \
  -p '{
    "uri": "rsc://workflow/generate-city-poem",
    "input": {
      "cityName": "Paris"
    }
  }'
```

This will return a poem about Paris generated by AI!

## 📚 Workflow Development Guide

The repository includes comprehensive guides for workflow creation:

- **`scripts/README.md`** - Complete tools discovery guide
- **`scripts/QUICK-REFERENCE.md`** - Quick command reference
- **`scripts/INSTALL.md`** - Detailed installation guide

### Key Workflow Concepts

#### Step Structure
Each workflow consists of **steps** that execute sequentially:

```typescript
// Each step is an async function that:
// 1. Receives input (with @refs resolved to actual values)
// 2. Can call tools via ctx.env
// 3. Returns output for next steps

export default async function(input, ctx) {
  const result = await ctx.env['i:ai-generation'].AI_GENERATE_OBJECT({
    schema: { /* ... */ },
    messages: [ /* ... */ ]
  });
  
  return { 
    poem: result.object?.poem || '',
    error: null
  };
}
```

#### Referencing Previous Steps
Use `@refs` to pass data between steps:

```json
{
  "name": "step-2",
  "input": {
    "poem": "@step-1.poem",
    "cityName": "@step-1.cityName"
  }
}
```

#### Error Handling
Always include try/catch and return all output schema properties:

```typescript
try {
  const result = await /* tool call */;
  return { poem: result.object?.poem || '' };
} catch (error) {
  return { 
    poem: '',
    error: String(error)
  };
}
```

## 🔧 Development Workflow

### 1. Discover Tools
```bash
deno run --allow-all scripts/search-tools.ts "keyword"
deno run --allow-all scripts/find-tool.ts "TOOL_NAME"
```

### 2. Create Workflow (Ask Cursor)
```
"Create a workflow that uses [TOOL_NAME] to do [TASK]"
```

### 3. Watch Auto-Sync
```bash
deco deconfig push -w /my-workspace/default --path deconfig --watch
```

### 4. Test Workflow
```bash
deco call-tool -w /my-workspace/default \
  -i i:workflows-management \
  DECO_WORKFLOW_START \
  -p '{"uri": "rsc://workflow/my-workflow", "input": {...}}'
```

### 5. Monitor Execution
```bash
deco call-tool -w /my-workspace/default \
  -i i:workflows-management \
  DECO_RESOURCE_WORKFLOW_RUN_READ \
  -p '{"uri": "rsc://i:workflows-management/workflow_run/{runId}"}'
```

## 💡 Common Patterns

### Pattern 1: Data Transformation
Create a workflow that transforms input through multiple steps:

```typescript
// Step 1: Fetch data
// Step 2: Transform/filter
// Step 3: Enrich with AI
// Step 4: Return formatted result
```

### Pattern 2: Multi-Step Validation
Validate data at each step before proceeding:

```typescript
export default async function(input, ctx) {
  if (!input.data) {
    return { valid: false, error: 'Missing data' };
  }
  
  // Process...
  return { valid: true, result };
}
```

### Pattern 3: Conditional Execution
Use stopAfter for debugging specific steps:

```bash
# Run only up to step 2 for debugging
deco call-tool -w /workspace \
  -i i:workflows-management \
  DECO_WORKFLOW_START \
  -p '{
    "uri": "rsc://workflow/my-workflow",
    "input": {...},
    "stopAfter": "step-2"
  }'
```

## 📊 Saving Workflow Results

The repository includes a `tmp/` directory for storing intermediate results:

```typescript
// Save results in your scripts
const results = { /* your data */ };
await Deno.writeTextFile(
  './tmp/workflow-results.json',
  JSON.stringify(results, null, 2)
);
```

Use these for:
- ✅ Debugging failed workflows
- ✅ Tracking execution history
- ✅ Sharing results with team
- ✅ Building reports

## 🚨 Important Notes

### ⚠️ Keep Sync Running
Always keep `deco deconfig push --watch` running during development:
- Your changes won't be uploaded without it
- Open it in a separate terminal window
- The process watches for file changes automatically

### ⚠️ Workspace Path
Make sure you use the **correct** workspace path:
- ❌ Don't use personal workspace: `/users/your-id`
- ✅ Use project/team workspace: `/company/default` or `/team/production`

### ⚠️ Auto-Generated Files
Don't manually edit these files (they're generated):
- `available-tools.json` - Regenerate with scripts
- Files in `tmp/` - Temporary, safe to delete

## 🆘 Troubleshooting

### "Configuration file not found"
```bash
# Create currentWorkspace.json if it doesn't exist
deno run --allow-all scripts/setup.ts
```

### "Integration not found"
```bash
# List all available integrations
deco call-tool -w /my-workspace/default \
  -i i:integration-management \
  INTEGRATIONS_LIST | jq '.items[] | {id, name}'
```

### Changes not syncing
```bash
# Make sure push --watch is running
# Check the terminal where you ran the command
# Restart it if needed:
deco deconfig push -w /my-workspace/default --path deconfig --watch
```

### Workflow execution fails
```bash
# Check the workflow run status
deco call-tool -w /my-workspace/default \
  -i i:workflows-management \
  DECO_RESOURCE_WORKFLOW_RUN_READ \
  -p '{"uri": "rsc://i:workflows-management/workflow_run/{runId}"}'
```

## 📖 Next Steps

1. ✅ Clone and setup this repository
2. ✅ Run `deco deconfig pull` to download your workspace
3. ✅ Start `deco deconfig push --watch` in a terminal
4. ✅ Ask Cursor to create your first workflow
5. ✅ Test and iterate with auto-sync enabled
6. ✅ Explore other tools with the discovery scripts
7. ✅ Build complex workflows by chaining multiple steps

## 🤝 Need Help?

- 📚 **Tool Discovery**: See `scripts/README.md` and `scripts/QUICK-REFERENCE.md`
- 🛠️ **Workflow Guides**: Check the rules section at the top of this guide
- 💬 **Ask Cursor**: Use natural language to request workflow creation
- 🔗 **Deco Docs**: Visit [docs.deco.cx](https://docs.deco.cx)

## 🎯 Pro Tips

1. **Use Cursor AI**: Ask Cursor to create workflows, test them, and iterate
2. **Keep Scripts Handy**: Tool discovery scripts are your best friends
3. **Test Incrementally**: Test each step before creating the full workflow
4. **Save Results**: Store workflow outputs in `tmp/` for debugging
5. **Read Tool Schemas**: Understanding input/output schemas is key to success
6. **Error Handling**: Always include try/catch blocks in workflow steps
7. **Use jq**: Process JSON outputs with jq for better visibility

## 📄 License

This repository is part of the Deco ecosystem and follows the same licensing terms.

---

**Happy coding! 🚀 Build amazing workflows with Deco and Cursor.**
