import { createLogger, format, transports } from "winston";
import Env from "./env";

const logger = createLogger({
  format: format.json(),
  exitOnError: true,
});

if (Env.nodeEnv !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export { logger };
