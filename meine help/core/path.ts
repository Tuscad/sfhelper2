import * as path from 'path';

/**
 * Resolves the absolute path to the configuration directory.
 * This path is determined relative to the current file's directory.
 * 
 * @constant
 * @type {string}
 */
export const CONFIG_PATH = path.resolve(__dirname, '../config');
export const LOGS_PATH = path.resolve(__dirname, '../logs');
export const DATA_PATH = path.resolve(__dirname, '../data');

export function resolvePath(relativePath: string): string {
    return path.resolve(__dirname, relativePath);
}