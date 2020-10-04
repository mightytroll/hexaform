import config from "config";
import winston from "winston";

let transports = [];

if (config.has("log.console")) {
    let options = Object.assign(
        {
            silent: true,
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        },
        config.get("log.console")
    );

    transports.push(new winston.transports.Console(options));
}

export const Log = winston.createLogger({
    transports: transports
});
