// scripts/generateRoutes.ts

import { generateRoutes } from '@/lib/routes.utils';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const routes = generateRoutes();

    const fileContent = `// This file is auto-generated. Do not edit directly.
// Generated on ${new Date().toISOString()}

export interface RouteNode {
    path: string;
    pageName: string;
    params?: { name: string; isOptional?: boolean }[];
    children?: Record<string, RouteNode>;
}

export type RouteConfig = {
    [K: string]: RouteNode & {
        children?: RouteConfig;
    };
};

export const routes = ${JSON.stringify(routes, null, 2)} as const;

/**
 * Generates a path with the given parameters for a route
 * @param route The route object
 * @param params Object containing parameter values
 * @returns The generated path with parameters replaced
 */
export function generatePath(
    route: RouteNode,
    params?: Record<string, string>
): string {
    if (!params || !route.params) {
        return route.path;
    }

    let path = route.path;
    Object.entries(params).forEach(([key, value]) => {
        path = path.replace(new RegExp(\`\\[+\${key}\\]+\`), value);
    });

    return path;
}
`;

    const configDir = path.join(process.cwd(), 'src', 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const routesPath = path.join(configDir, 'routes.ts');
    fs.writeFileSync(routesPath, fileContent);

    console.log('✓ Routes generated successfully!');
    console.log(
      `  Routes file created at: ${path.relative(process.cwd(), routesPath)}`,
    );
  } catch (error) {
    console.error('Error generating routes:', error);
    process.exit(1);
  }
}

main();
