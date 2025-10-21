#!/usr/bin/env -S deno run --allow-all

/**
 * Find and display detailed information about a specific tool
 * Usage: deno run --allow-all scripts/find-tool.ts <TOOL_NAME>
 * Workspace-agnostic - reads from generated available-tools.json and currentWorkspace.json
 */

import { loadConfig, loadJson, formatSchema, printHeader, printSubheader } from "./config.ts";

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
}

interface AvailableTools {
  workspace: string;
  projectName: string;
  integrations: Record<string, {
    name: string;
    id: string;
    tools: Tool[];
  }>;
}

async function main() {
  const toolName = Deno.args[0];
  
  if (!toolName) {
    console.error("❌ Usage: deno run --allow-all scripts/find-tool.ts <TOOL_NAME>");
    console.error("\nExample: deno run --allow-all scripts/find-tool.ts AI_GENERATE");
    Deno.exit(1);
  }

  const config = await loadConfig();
  const data = await loadJson<AvailableTools>(config.outputFile);

  // Search for tool
  let foundTool: Tool | null = null;
  let foundIntegration: { name: string; id: string } | null = null;

  for (const [id, integration] of Object.entries(data.integrations)) {
    const tool = integration.tools.find(t => t.name === toolName);
    if (tool) {
      foundTool = tool;
      foundIntegration = { name: integration.name, id };
      break;
    }
  }

  if (!foundTool || !foundIntegration) {
    console.error(`\n❌ Tool "${toolName}" not found!`);
    console.error("\nSearching for similar tools...\n");
    
    // Search for similar tools
    const similar: Array<{ name: string; integration: string }> = [];
    for (const integration of Object.values(data.integrations)) {
      for (const tool of integration.tools) {
        if (tool.name.toLowerCase().includes(toolName.toLowerCase())) {
          similar.push({ name: tool.name, integration: integration.name });
        }
      }
    }
    
    if (similar.length > 0) {
      console.log("Did you mean:");
      similar.forEach(s => console.log(`  • ${s.name} (${s.integration})`));
    } else {
      console.log("No similar tools found.");
    }
    
    Deno.exit(1);
  }

  // Display information
  printHeader(`🔧 ${foundTool.name}`);
  
  console.log(`📦 Integration: ${foundIntegration.name}`);
  console.log(`   ID: ${foundIntegration.id}`);
  
  printSubheader("📝 Description:");
  console.log(`   ${foundTool.description}`);
  
  printSubheader("📥 INPUT SCHEMA:");
  console.log(formatSchema(foundTool.inputSchema));
  console.log(`   (* = required field)`);
  
  printSubheader("📤 OUTPUT SCHEMA:");
  console.log(formatSchema(foundTool.outputSchema));
  
  console.log("\n" + "─".repeat(80));
  
  console.log(`\n💡 Usage in workflow:`);
  console.log(`
  {
    "def": {
      "name": "my-step",
      "execute": "export default async function(input, ctx) {
        const result = await ctx.env['${foundIntegration.id}'].${foundTool.name}({
          // your input here
        });
        return result;
      }",
      "dependencies": [
        { "integrationId": "${foundIntegration.id}", "toolNames": ["${foundTool.name}"] }
      ]
    }
  }`);
  
  console.log(`\n💡 Usage via CLI:`);
  console.log(`
  deco call-tool -w ${data.workspace} \\
    -i ${foundIntegration.id} \\
    ${foundTool.name} \\
    -p '{
      // your input here
    }'
  `);
  
  console.log("=".repeat(80) + "\n");
}

try {
  await main();
} catch (error) {
  console.error("❌ Error:", error.message);
  Deno.exit(1);
}
