import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Duration } from './duration';
import { RouteConfig } from '@/interfaces/routes.interface';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type EnvValueType = string | number | Duration;

export function env<T extends EnvValueType>(
  key: string,
  defaultValue: T,
  options?: { parseDuration?: boolean },
): T {
  const value = process.env[key];

  // If no value is found, return the default
  if (value === undefined) {
    return defaultValue;
  }

  // If duration parsing is requested, try to parse as duration
  if (options?.parseDuration) {
    try {
      return Duration.parse(value) as T;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.warn(`Failed to parse duration for ${key}, using default value`);
      return defaultValue;
    }
  }

  // For number types, parse the value
  if (typeof defaultValue === 'number') {
    const parsed = Number(value);
    return (Number.isNaN(parsed) ? defaultValue : parsed) as T;
  }

  return value as T;
}

export function generatePath(
  route: RouteConfig,
  params?: Record<string, string>,
): string {
  if (!params || !route.params) {
    return route.path;
  }

  let path = route.path;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`[${key}]`, value);
  });

  return path;
}
