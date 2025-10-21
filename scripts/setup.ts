#!/usr/bin/env -S deno run --allow-all

/**
 * Interactive setup script to create currentWorkspace.json
 * Run this in a new project to get started quickly
 */

async function prompt(question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (default: ${defaultValue})` : "";
  const buffer = new Uint8Array(1024);
  
  await Deno.stdout.write(new TextEncoder().encode(`${question}${suffix}: `));
  const n = await Deno.stdin.read(buffer);
  
  if (n === null) {
    return defaultValue || "";
  }
  
  const answer = new TextDecoder().decode(buffer.subarray(0, n)).trim();
  return answer || defaultValue || "";
}

async function getCurrentWorkspace(): Promise<string> {
  try {
    const cmd = new Deno.Command("deco", {
      args: ["whoami"],
      stdout: "piped",
      stderr: "piped",
    });
    
    const { stdout, success } = await cmd.output();
    
    if (success) {
      const output = new TextDecoder().decode(stdout);
      const match = output.match(/Current Workspace:\s*(.+)/);
      if (match) {
        return match[1].trim();
      }
    }
  } catch {
    // deco not found or error
  }
  
  return "";
}

async function getAvailableIntegrations(workspace: string): Promise<any[]> {
  try {
    const cmd = new Deno.Command("deco", {
      args: [
        "call-tool",
        "-w", workspace,
        "-i", "i:integration-management",
        "INTEGRATIONS_LIST"
      ],
      stdout: "piped",
      stderr: "piped",
    });
    
    const { stdout, success } = await cmd.output();
    
    if (success) {
      const result = JSON.parse(new TextDecoder().decode(stdout));
      return result.items || [];
    }
  } catch {
    // Error fetching
  }
  
  return [];
}

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 Available Tools Setup");
  console.log("=".repeat(80) + "\n");
  
  console.log("This wizard will help you create a currentWorkspace.json file.\n");
  
  // Get current workspace
  console.log("📡 Detecting workspace with deco whoami...");
  const detectedWorkspace = await getCurrentWorkspace();
  
  if (detectedWorkspace) {
    console.log(`⚠️  Found workspace: ${detectedWorkspace}`);
    console.log(`    (Este é provavelmente seu workspace PESSOAL)\n`);
  } else {
    console.log("⚠️  Could not detect workspace automatically.\n");
  }
  
  console.log("💡 IMPORTANTE: Use o workspace do PROJETO, não o pessoal!");
  console.log("   Como descobrir o workspace correto:");
  console.log("   1. Abra o Deco Chat: chat.deco.cx/WORKSPACE-AQUI");
  console.log("   2. Pergunte ao admin do projeto");
  console.log("   3. Workspace pessoal (/users/xxx) geralmente NÃO é o que você quer!\n");
  
  // Ask questions
  const workspace = await prompt("Workspace path", detectedWorkspace);
  
  if (!workspace) {
    console.log("\n❌ Workspace is required. Run 'deco whoami' to find it.");
    Deno.exit(1);
  }
  
  const projectName = await prompt("Project name", "My Project");
  const projectSlug = await prompt("Project slug", projectName.toLowerCase().replace(/\s+/g, "-"));
  const description = await prompt("Description", `Available tools for ${projectName}`);
  
  // Fetch integrations
  console.log(`\n📥 Fetching integrations from ${workspace}...`);
  const integrations = await getAvailableIntegrations(workspace);
  
  if (integrations.length > 0) {
    console.log(`✓ Found ${integrations.length} integrations\n`);
    
    console.log("Core integrations (recommended):");
    const coreIntegrations = [
      "i:ai-generation",
      "i:databases-management", 
      "i:workflows-management",
      "i:http"
    ];
    
    coreIntegrations.forEach(id => {
      const int = integrations.find(i => i.id === id);
      if (int) {
        console.log(`  • ${int.name} (${id})`);
      }
    });
    
    console.log("\nCustom integrations found:");
    const customIntegrations = integrations.filter(int => 
      !coreIntegrations.includes(int.id) &&
      int.appName &&
      !int.appName.startsWith("@deco/")
    ).slice(0, 10);
    
    customIntegrations.forEach(int => {
      console.log(`  • ${int.name} - ${int.appName} (${int.id})`);
    });
    
    if (customIntegrations.length === 0) {
      console.log("  (none found)");
    }
  } else {
    console.log("⚠️  Could not fetch integrations. You can add them manually later.\n");
  }
  
  const includePatterns = await prompt(
    "\nInclude patterns (comma-separated, e.g., 'myapp,custom')",
    projectSlug
  );
  
  // Build config
  const priorityIntegrations = [
    { id: "i:ai-generation", name: "ai-generation", category: "core" },
    { id: "i:databases-management", name: "databases", category: "core" },
    { id: "i:workflows-management", name: "workflows", category: "core" },
    { id: "i:http", name: "http", category: "core" }
  ];
  
  // Add custom integrations if found
  if (integrations.length > 0) {
    const customFound = integrations.filter(int => 
      int.appName &&
      includePatterns.split(",").some(pattern => 
        int.appName.toLowerCase().includes(pattern.trim().toLowerCase())
      )
    );
    
    customFound.forEach(int => {
      priorityIntegrations.push({
        id: int.id,
        name: int.name,
        category: "custom"
      });
    });
  }
  
  const config = {
    workspace,
    projectName,
    projectSlug,
    description,
    priorityIntegrations,
    includePatterns: includePatterns.split(",").map(p => p.trim()).filter(Boolean),
    outputFile: "available-tools.json"
  };
  
  // Save config
  const configPath = "../currentWorkspace.json";
  await Deno.writeTextFile(
    configPath,
    JSON.stringify(config, null, 2)
  );
  
  console.log(`\n✅ Created ${configPath}\n`);
  
  // Show next steps
  console.log("=".repeat(80));
  console.log("📋 Next Steps:");
  console.log("=".repeat(80) + "\n");
  
  console.log("1. Review and edit currentWorkspace.json if needed");
  console.log("2. Generate the tools catalog:");
  console.log("   deno run --allow-all scripts/generate-available-tools.ts\n");
  console.log("3. Explore the tools:");
  console.log("   deno run --allow-all scripts/list-tools.ts");
  console.log("   deno run --allow-all scripts/search-tools.ts <keyword>");
  console.log("   deno run --allow-all scripts/find-tool.ts <TOOL_NAME>\n");
  
  console.log("💡 Tip: Add more integrations to priorityIntegrations in currentWorkspace.json");
  console.log("   to include specific integrations you want to document.\n");
}

try {
  await main();
} catch (error) {
  console.error("\n❌ Error:", error.message);
  Deno.exit(1);
}

