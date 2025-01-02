// src/utils/routesGenerator.ts
import fs from 'fs';
import path from 'path';

// Define the base route node structure
export interface RouteNode {
  path: string;
  pageName: string;
  params?: { name: string; isOptional?: boolean }[];
  children?: Record<string, RouteNode>;
}

// Define a recursive type for the entire routes structure
export type RouteConfig = {
  [K: string]: RouteNode & {
    children?: RouteConfig;
  };
};

function formatPathToName(pathPart: string): string {
  return pathPart
    .replace(/^\[+|\]+$/g, '') // Remove brackets from dynamic segments
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractParamsFromPath(pagePath: string) {
  const params: { name: string; isOptional?: boolean }[] = [];
  const matches = pagePath.matchAll(/\[(\.\.\.)?([^\/\]]+)\]/g);

  for (const match of matches) {
    const isSpread = Boolean(match[1]);
    const paramName = match[2];
    const isOptional = pagePath.includes(
      `[[${isSpread ? '...' : ''}${paramName}]]`,
    );

    params.push({
      name: paramName,
      isOptional,
    });
  }

  return params.length > 0 ? params : undefined;
}

function isValidNextPath(filePath: string): boolean {
  const invalidPatterns = [
    '/api/',
    '/_app',
    '/_document',
    '/_error',
    '/components/',
    '/utils/',
    '/lib/',
    '/hooks/',
    '/types/',
    '/styles/',
    '/public/',
    '/assets/',
    '/contexts/',
    '/services/',
    '/constants/',
    '/config/',
  ];

  return (
    !invalidPatterns.some((pattern) => filePath.includes(pattern)) &&
    !filePath.includes('._') &&
    !filePath.endsWith('.test.ts') &&
    !filePath.endsWith('.spec.ts')
  );
}

function cleanRoutePath(routePath: string): string {
  return (
    routePath
      .replace(/\\/g, '/')
      .replace(/^\/?(src\/app\/?)?/, '/')
      .replace(/\/page$/, '')
      .replace(/^\/index$/, '/')
      .replace(/\/index\//, '/') || '/'
  );
}

function generateRoutesFromDir(
  currentPath: string,
  basePath: string = '',
  parentRoute: string = '',
): RouteConfig {
  const routes: RouteConfig = {};
  const files = fs.readdirSync(currentPath);

  for (const file of files) {
    const filePath = path.join(currentPath, file);
    const stats = fs.statSync(filePath);

    if (!isValidNextPath(filePath)) continue;

    if (stats.isDirectory()) {
      const dirName = file;
      const routeKey = dirName
        .replace(/^\[+|\]+$/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();

      const hasPage =
        fs.existsSync(path.join(filePath, 'page.tsx')) ||
        fs.existsSync(path.join(filePath, 'page.jsx'));

      if (hasPage) {
        const routePath = cleanRoutePath(path.join(parentRoute, dirName));
        const params = extractParamsFromPath(routePath);
        const children = generateRoutesFromDir(filePath, basePath, routePath);

        routes[routeKey] = {
          path: routePath,
          pageName: formatPathToName(dirName),
          ...(params && { params }),
          ...(Object.keys(children).length > 0 && { children }),
        };
      }
    } else if (file === 'page.tsx' || file === 'page.jsx') {
      const dirName = path.basename(currentPath);
      const routeKey = dirName
        .replace(/^\[+|\]+$/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
      const routePath = cleanRoutePath(parentRoute);
      const params = extractParamsFromPath(routePath);

      if (routePath === '/') {
        routes.home = {
          path: '/',
          pageName: 'Home',
          ...(params && { params }),
        };
      } else {
        routes[routeKey] = {
          path: routePath,
          pageName: formatPathToName(dirName),
          ...(params && { params }),
        };
      }
    }
  }

  return routes;
}

export function generatePath(
  route: RouteNode,
  params?: Record<string, string>,
): string {
  if (!params || !route.params) {
    return route.path;
  }

  let path = route.path;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(new RegExp(`\\[+${key}\\]+`), value);
  });

  return path;
}

export function generateRoutes(): RouteConfig {
  const appDirectory = path.join(process.cwd(), 'src', 'app');

  if (!fs.existsSync(appDirectory)) {
    throw new Error(
      'Could not find src/app directory. Make sure you are running this script from your project root.',
    );
  }

  return generateRoutesFromDir(appDirectory);
}
