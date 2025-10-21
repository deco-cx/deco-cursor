#!/usr/bin/env -S deno run --allow-all

/**
 * Generate available-tools.json with all available tools
 * This script is workspace-agnostic and reads configuration from currentWorkspace.json
 */

import { loadConfig, callTool, saveJson, printHeader } from "./config.ts";

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
}

interface Integration {
  id: string;
  name: string;
  appName: string | null;
  tools?: Tool[];
}

async function fetchIntegrations(workspace: string): Promise<Integration[]> {
  console.log("📥 Fetching integrations...");
  
  const result = await callTool(workspace, "i:integration-management", "INTEGRATIONS_LIST");
  return result.items;
}

function shouldIncludeIntegration(
  integration: Integration,
  priorityIds: string[],
  includePatterns: string[]
): boolean {
  // Include if in priority list
  if (priorityIds.includes(integration.id)) {
    return true;
  }
  
  // Include if matches any pattern
  if (integration.appName) {
    for (const pattern of includePatterns) {
      if (integration.appName.toLowerCase().includes(pattern.toLowerCase())) {
        return true;
      }
    }
  }
  
  return false;
}

async function main() {
  printHeader("🚀 Generating Available Tools");
  
  // Load configuration
  const config = await loadConfig();
  console.log(`📦 Project: ${config.projectName}`);
  console.log(`🏢 Workspace: ${config.workspace}\n`);
  
  // Fetch all integrations
  const allIntegrations = await fetchIntegrations(config.workspace);
  console.log(`✓ Found ${allIntegrations.length} total integrations\n`);
  
  // Filter relevant integrations
  const priorityIds = config.priorityIntegrations.map(p => p.id);
  const relevantIntegrations = allIntegrations.filter(int => 
    shouldIncludeIntegration(int, priorityIds, config.includePatterns)
  );
  
  console.log(`📦 Processing ${relevantIntegrations.length} relevant integrations:\n`);
  
  // Build output structure
  const output: Record<string, any> = {
    workspace: config.workspace,
    projectName: config.projectName,
    projectSlug: config.projectSlug,
    generatedAt: new Date().toISOString(),
    description: config.description,
    integrations: {}
  };
  
  for (const integration of relevantIntegrations) {
    const priorityInfo = config.priorityIntegrations.find(p => p.id === integration.id);
    const displayName = priorityInfo?.name || integration.name;
    
    console.log(`  Processing: ${displayName} (${integration.id})`);
    
    if (integration.tools && integration.tools.length > 0) {
      output.integrations[integration.id] = {
        name: integration.name,
        appName: integration.appName,
        id: integration.id,
        category: priorityInfo?.category || "other",
        toolCount: integration.tools.length,
        tools: integration.tools
      };
      console.log(`    ✓ ${integration.tools.length} tools found`);
    } else {
      console.log(`    ⚠️  No tools found`);
      output.integrations[integration.id] = {
        name: integration.name,
        appName: integration.appName,
        id: integration.id,
        category: priorityInfo?.category || "other",
        toolCount: 0,
        tools: []
      };
    }
  }
  
  // Save result
  await saveJson(config.outputFile, output);
  console.log(`\n✅ Generated ${config.outputFile}`);
  
  // Statistics
  const totalTools = Object.values(output.integrations)
    .reduce((sum: number, int: any) => sum + int.toolCount, 0);
  
  console.log(`\n📊 Statistics:`);
  console.log(`  Integrations: ${Object.keys(output.integrations).length}`);
  console.log(`  Total Tools: ${totalTools}`);
  
  // Top 5 integrations
  console.log(`\n🏆 Top integrations by tool count:`);
  const sorted = Object.values(output.integrations)
    .sort((a: any, b: any) => b.toolCount - a.toolCount)
    .slice(0, 5);
  
  sorted.forEach((int: any) => {
    console.log(`  ${int.name}: ${int.toolCount} tools`);
  });
  
  console.log("");
}

try {
  await main();
} catch (error) {
  console.error("❌ Error:", error.message);
  Deno.exit(1);
}
