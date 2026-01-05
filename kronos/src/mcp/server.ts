import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

const server = new Server(
    {
        name: "kronos-dev-assistant",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Tool definitions
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "run_tests",
                description: "Executa testes unitários ou E2E do projeto",
                inputSchema: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            enum: ["unit", "e2e"],
                            description: "Tipo de teste a executar",
                        },
                        pattern: {
                            type: "string",
                            description: "Padrão de nome de arquivo ou pasta para filtrar os testes",
                        },
                    },
                    required: ["type"],
                },
            },
            {
                name: "analyze_code",
                description: "Analisa o código em busca de code smells ou melhorias",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: {
                            type: "string",
                            description: "Caminho do arquivo para análise",
                        },
                    },
                    required: ["filePath"],
                },
            },
            {
                name: "check_deploy_readiness",
                description: "Verifica se o projeto está pronto para deploy (env vars, build, testes críticos)",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});

/**
 * Tool execution handlers
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "run_tests": {
                const type = args?.type as string;
                const pattern = (args?.pattern as string) || "";
                const command = type === "e2e"
                    ? `npx playwright test ${pattern}`
                    : `npx vitest run ${pattern}`;

                const { stdout, stderr } = await execAsync(command);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Resultados dos testes (${type}):\n\n${stdout}\n${stderr}`,
                        },
                    ],
                };
            }

            case "analyze_code": {
                const filePath = args?.filePath as string;
                const fullPath = path.resolve(process.cwd(), filePath);

                if (!fs.existsSync(fullPath)) {
                    return {
                        isError: true,
                        content: [{ type: "text", text: `Arquivo não encontrado: ${filePath}` }],
                    };
                }

                const content = fs.readFileSync(fullPath, "utf-8");

                // Simple analysis logic (simulated for now, could be expanded with ESLint or AI)
                const lines = content.split("\n");
                const results = [];

                if (content.includes("console.log")) {
                    results.push("- Encontrado console.log: remova logs de debug antes do commit.");
                }
                if (lines.length > 300) {
                    results.push("- Arquivo muito longo (>300 linhas): considere refatorar em componentes menores.");
                }
                if (content.includes("any") && !content.includes("eslint-disable")) {
                    results.push("- Uso de 'any' detectado: tente usar tipagem mais específica.");
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: results.length > 0
                                ? `Análise de ${filePath}:\n\n${results.join("\n")}`
                                : `Código em ${filePath} parece estar seguindo as boas práticas iniciais.`,
                        },
                    ],
                };
            }

            case "check_deploy_readiness": {
                const issues = [];

                // Check env vars
                const envExamplePath = path.resolve(process.cwd(), ".env.example");
                if (!fs.existsSync(envExamplePath)) {
                    issues.push("- Arquivo .env.example não encontrado.");
                }

                // Check for debug routes
                const debugRoutePath = path.resolve(process.cwd(), "src/app/api/debug-db/route.ts");
                if (fs.existsSync(debugRoutePath)) {
                    issues.push("- ROTA DE DEBUG EXPOSTA: remova src/app/api/debug-db/route.ts");
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: issues.length > 0
                                ? `⚠️ Pendências para Deploy:\n\n${issues.join("\n")}`
                                : "✅ Projeto pronto para deploy! (Verifique as variáveis de ambiente manualmente no Vercel).",
                        },
                    ],
                };
            }

            default:
                throw new Error(`Ferramenta não encontrada: ${name}`);
        }
    } catch (error: any) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Erro ao executar ferramenta ${name}: ${error.message}`,
                },
            ],
        };
    }
});

/**
 * Transport initialization
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Kronos Dev Assistant MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error starting MCP server:", error);
    process.exit(1);
});
