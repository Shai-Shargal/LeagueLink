import winston from "winston";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = join(dirname(__dirname), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "leaguelink-api" },
  transports: [
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({
      filename: join(logsDir, "error.log"),
      level: "error",
    }),
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({
      filename: join(logsDir, "combined.log"),
    }),
  ],
});

// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Export a stream object for Morgan middleware
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
