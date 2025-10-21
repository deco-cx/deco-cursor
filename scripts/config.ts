/**
 * Configuration loader for workspace tools scripts
 * This module reads currentWorkspace.json and provides shared utilities
 */

export interface Integration {
  id: string;
  name: string;
  category?: string;
}

export interface WorkspaceConfig {
  workspace: string;
  projectName: string;
  projectSlug: string;
  description: string;
  priorityIntegrations: Integration[];
  includePatterns: string[];
  outputFile: string;
}

const CONFIG_FILE = "currentWorkspace.json";

/**
 * Load workspace configuration from currentWorkspace.json
 */
export async function loadConfig(): Promise<WorkspaceConfig> {
  try {
    const configText = await Deno.readTextFile(CONFIG_FILE);
    const config = JSON.parse(configText) as WorkspaceConfig;
    
    // Validate required fields
    if (!config.workspace) {
      throw new Error("Missing 'workspace' field in currentWorkspace.json");
    }
    
    return config;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`\n❌ Configuration file '${CONFIG_FILE}' not found!`);
      console.error("\n💡 Create a currentWorkspace.json file with:");
      console.error(`
{
  "workspace": "/your-workspace-path",
  "projectName": "Your Project Name",
  "projectSlug": "project-slug",
  "description": "Project description",
  "priorityIntegrations": [
    { "id": "i:integration-id", "name": "integration-name", "category": "core" }
  ],
  "includePatterns": ["pattern1", "pattern2"],
  "outputFile": "available-tools.json"
}
      `);
      Deno.exit(1);
    }
    throw error;
  }
}

/**
 * Call a deco tool
 */
export async function callTool(
  workspace: string,
  integrationId: string,
  toolName: string,
  params: Record<string, any> = {}
): Promise<any> {
  const cmd = new Deno.Command("deco", {
    args: [
      "call-tool",
      "-w", workspace,
      "-i", integrationId,
      toolName,
      "-p", JSON.stringify(params)
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout, stderr, success } = await cmd.output();
  
  if (!success) {
    throw new Error(new TextDecoder().decode(stderr));
  }

  return JSON.parse(new TextDecoder().decode(stdout));
}

/**
 * Save data to a JSON file
 */
export async function saveJson(filename: string, data: any): Promise<void> {
  await Deno.writeTextFile(
    filename,
    JSON.stringify(data, null, 2)
  );
}

/**
 * Load data from a JSON file
 */
export async function loadJson<T>(filename: string): Promise<T> {
  const content = await Deno.readTextFile(filename);
  return JSON.parse(content);
}

/**
 * Format a schema for readable display
 */
export function formatSchema(schema: any, indent = 2): string {
  const spaces = " ".repeat(indent);
  const lines: string[] = [];
  
  if (schema.type === "object" && schema.properties) {
    const required = schema.required || [];
    
    for (const [key, value] of Object.entries(schema.properties)) {
      const prop = value as any;
      const isRequired = required.includes(key);
      const requiredMarker = isRequired ? "*" : " ";
      
      let typeInfo = prop.type || "any";
      if (prop.enum) {
        typeInfo = prop.enum.join(" | ");
      }
      if (prop.format) {
        typeInfo += ` (${prop.format})`;
      }
      
      lines.push(`${spaces}${requiredMarker} ${key}: ${typeInfo}`);
      
      if (prop.description) {
        lines.push(`${spaces}  ${prop.description}`);
      }
      
      if (prop.default !== undefined) {
        lines.push(`${spaces}  Default: ${JSON.stringify(prop.default)}`);
      }
      
      if (prop.type === "object" && prop.properties) {
        lines.push(`${spaces}  Properties:`);
        lines.push(formatSchema(prop, indent + 4));
      }
      
      if (prop.type === "array" && prop.items) {
        if (prop.items.type === "object" && prop.items.properties) {
          lines.push(`${spaces}  Array items:`);
          lines.push(formatSchema(prop.items, indent + 4));
        } else {
          lines.push(`${spaces}  Array of: ${prop.items.type || "any"}`);
        }
      }
      
      lines.push("");
    }
  }
  
  return lines.join("\n");
}

/**
 * Print a header with borders
 */
export function printHeader(text: string, char = "="): void {
  const line = char.repeat(80);
  console.log("\n" + line);
  console.log(text);
  console.log(line + "\n");
}

/**
 * Print a subheader
 */
export function printSubheader(text: string): void {
  console.log(`\n${text}`);
  console.log("─".repeat(76) + "\n");
}

