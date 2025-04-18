// config.ts
import { CONFIG_PATH } from './path';
import { appendFile, readFileSync } from 'fs';
import { parse } from 'yaml';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  dbname: string;
  pool_size: number;
}

interface LoggingConfig {
  level: string;
  file: string;
  max_files: number;
}

interface ServerConfig {
  port: number;
  workers: number;
  timeout_seconds: number;
}

interface CrawlerConfig {
  max_retries: number;
  delay_ms: number;
  batch_size: number;
}

export interface Config {
  database: DatabaseConfig;
  logging: LoggingConfig;
  server: ServerConfig;
  crawler: CrawlerConfig;
}

export function loadConfig(configPath: string = 'config.yaml'): Config {
  try {
    const configFile = readFileSync(configPath, 'utf8');
    const config = parse(configFile) as Config;
    
    // Walidacja podstawowych wartości
    if (!config.database || !config.logging || !config.server || !config.crawler) {
      throw new Error('Invalid configuration structure');
    }

    return {
      database: {
        host: config.database.host || 'localhost',
        port: config.database.port || 5432,
        user: config.database.user || 'postgres',
        password: config.database.password || '',
        dbname: config.database.dbname || 'app_db',
        pool_size: config.database.pool_size || 10,
      },
      logging: {
        level: config.logging.level || 'info',
        file: config.logging.file || 'app.log',
        max_files: config.logging.max_files || 7,
      },
      server: {
        port: config.server.port || 3000,
        workers: config.server.workers || 4,
        timeout_seconds: config.server.timeout_seconds || 30,
      },
      crawler: {
        max_retries: config.crawler.max_retries || 3,
        delay_ms: config.crawler.delay_ms || 1000,
        batch_size: config.crawler.batch_size || 50,
      }
    };
  } catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
  }
}

// Przykładowe użycie:
// const config = loadConfig();
// export default config;