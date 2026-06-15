export interface RouteConfig {
  path: string; // The actual URL path
  pageName: string; // Human-readable page name
  params?: RouteParam[]; // Optional URL parameters
}

interface RouteParam {
  name: string;
  isOptional?: boolean;
}
