#!/usr/bin/env -S deno run --allow-all

/**
 * List all available tools in a formatted view
 * Workspace-agnostic - reads from generated available-tools.json
 */

import { loadConfig, loadJson, printHeader } from "./config.ts";

interface AvailableTools {
  workspace: string;
  projectName: string;
  integrations: Record<string, {
    name: string;
    id: string;
    toolCount: number;
    tools: Array<{ name: string; description: string }>;
  }>;
}

async function main() {
  const config = await loadConfig();
  const data = await loadJson<AvailableTools>(config.outputFile);

  printHeader(`📋 AVAILABLE TOOLS - ${data.projectName.toUpperCase()}`);

  // Sort by number of tools
  const integrations = Object.entries(data.integrations)
    .sort((a, b) => b[1].toolCount - a[1].toolCount);

  for (const [id, integration] of integrations) {
    console.log(`\n🔧 ${integration.name} (${integration.toolCount} tools)`);
    console.log(`   ID: ${id}`);
    console.log(`   ${"─".repeat(76)}`);
    
    for (const tool of integration.tools) {
      const desc = tool.description.length > 70 
        ? tool.description.substring(0, 67) + "..."
        : tool.description;
      console.log(`   • ${tool.name}`);
      console.log(`     ${desc}`);
    }
  }

  console.log("\n" + "=".repeat(80));
  
  const totalTools = Object.values(data.integrations)
    .reduce((sum, int) => sum + int.toolCount, 0);
  
  console.log(`\n📊 Total: ${Object.keys(data.integrations).length} integrations, ${totalTools} tools`);
  console.log(`🏢 Workspace: ${data.workspace}\n`);
}

try {
  await main();
} catch (error) {
  console.error("❌ Error:", error.message);
  console.error(`\nMake sure to run 'deno run --allow-all scripts/generate-available-tools.ts' first!`);
  Deno.exit(1);
}
