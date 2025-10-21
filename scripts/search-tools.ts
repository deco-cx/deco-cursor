#!/usr/bin/env -S deno run --allow-all

/**
 * Search tools by keyword in name or description
 * Usage: deno run --allow-all scripts/search-tools.ts <keyword>
 * Workspace-agnostic - reads from generated available-tools.json
 */

import { loadConfig, loadJson, printHeader } from "./config.ts";

interface Tool {
  name: string;
  description: string;
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
  const keyword = Deno.args[0];
  
  if (!keyword) {
    console.error("❌ Usage: deno run --allow-all scripts/search-tools.ts <keyword>");
    console.error("\nExamples:");
    console.error("  deno run --allow-all scripts/search-tools.ts SOCIAL");
    console.error("  deno run --allow-all scripts/search-tools.ts municipio");
    console.error("  deno run --allow-all scripts/search-tools.ts AI");
    Deno.exit(1);
  }

  const config = await loadConfig();
  const data = await loadJson<AvailableTools>(config.outputFile);

  const results: Array<{
    tool: Tool;
    integration: string;
    integrationId: string;
    matchType: "name" | "description";
  }> = [];

  const searchLower = keyword.toLowerCase();

  // Search in all tools
  for (const [id, integration] of Object.entries(data.integrations)) {
    for (const tool of integration.tools) {
      if (tool.name.toLowerCase().includes(searchLower)) {
        results.push({
          tool,
          integration: integration.name,
          integrationId: id,
          matchType: "name"
        });
      } else if (tool.description.toLowerCase().includes(searchLower)) {
        results.push({
          tool,
          integration: integration.name,
          integrationId: id,
          matchType: "description"
        });
      }
    }
  }

  if (results.length === 0) {
    console.log(`\n❌ No tools found matching "${keyword}"\n`);
    console.log("💡 Try:\n");
    console.log("  - A different keyword");
    console.log("  - Partial matches (e.g., 'IBGE' instead of 'IBGE_LIST')");
    console.log("  - English terms (e.g., 'candidate' instead of 'candidato')");
    Deno.exit(1);
  }

  printHeader(`🔍 Search results for "${keyword}" (${results.length} tools found)`);

  // Group by integration
  const byIntegration = results.reduce((acc, r) => {
    if (!acc[r.integration]) {
      acc[r.integration] = [];
    }
    acc[r.integration].push(r);
    return acc;
  }, {} as Record<string, typeof results>);

  for (const [integration, tools] of Object.entries(byIntegration)) {
    const integrationId = tools[0].integrationId;
    console.log(`\n📦 ${integration} (${tools.length} tools)`);
    console.log(`   ID: ${integrationId}`);
    console.log(`   ${"─".repeat(76)}\n`);
    
    for (const { tool, matchType } of tools) {
      const matchIcon = matchType === "name" ? "🎯" : "📝";
      console.log(`   ${matchIcon} ${tool.name}`);
      
      const desc = tool.description.length > 70 
        ? tool.description.substring(0, 67) + "..."
        : tool.description;
      console.log(`      ${desc}`);
      
      if (matchType === "description") {
        // Highlight where match occurred
        const index = tool.description.toLowerCase().indexOf(searchLower);
        if (index !== -1) {
          const start = Math.max(0, index - 30);
          const end = Math.min(tool.description.length, index + searchLower.length + 30);
          let snippet = tool.description.substring(start, end);
          if (start > 0) snippet = "..." + snippet;
          if (end < tool.description.length) snippet = snippet + "...";
          console.log(`      Match: "${snippet}"`);
        }
      }
      console.log();
    }
  }

  console.log("=".repeat(80));
  console.log("\n💡 To see full details of a tool:");
  console.log(`   deno run --allow-all scripts/find-tool.ts <TOOL_NAME>`);
  
  console.log("\n💡 To use a tool via CLI:");
  console.log(`   deco call-tool -w ${data.workspace} \\`);
  console.log(`     -i <INTEGRATION_ID> \\`);
  console.log(`     <TOOL_NAME> \\`);
  console.log(`     -p '{ ... }'`);
  console.log();
}

try {
  await main();
} catch (error) {
  console.error("❌ Error:", error.message);
  Deno.exit(1);
}
