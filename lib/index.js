/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import _ from "lodash";
import cycle from "cycle";
import {noMultiSpaceAfterLineFeed} from "tempura";
import pkginfo from "pkginfo-json5";
import Sentry from "winston-sentry";
import util from "util";
import winston from "winston";

// FIXME: Try to avoid using this, perhaps in Winston 2.x.
import winstonCommon from "winston/lib/winston/common";
import wordwrap from "word-wrap";

// FIXME: Replace with the proper utility once the utility module is out there.
const __DEV__ = process.env.NODE_ENV !== "production";

const defaultLevel = __DEV__ ? "verbose" : "info";
const loggers = new Map();
let longestLabelLength = 0;
let unknownCount = 0;

// Utility to get the Date ISO 8601 string, but for the localtime.
// See https://gist.github.com/peterbraden/752376
function localISOString(d, ignoreTimezone) {
  function pad(n) {
    return n < 10 ? "0" + n : n;
  }

  const timezone = ignoreTimezone ? 0 : d.getTimezoneOffset();
  let timezoneSeconds = (
    (timezone > 0 ? "-" : "+") + pad(parseInt(Math.abs(timezone / 60), 10))
  );

  if (timezone % 60 !== 0) {
    timezoneSeconds += pad(Math.abs(timezone % 60));
  }

  if (timezone === 0) {
    // Zulu time == UTC
    timezoneSeconds = ignoreTimezone ? "" : "Z";
  }

  return (noMultiSpaceAfterLineFeed`
    ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T
    ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}
    ${timezoneSeconds}
  `);
}

// Remove default (basic) console logger.
winston.remove(winston.transports.Console);

let exitOnError = true;
const longestLevelLength = Math.max(
  ...Object.keys(winston.config.npm.levels).map(level => level.length),
);

class BackendLogger {
  constructor(
    name,
    {
      sentry: {
        level = "error",
        logger = name,
        ...sentryRest
      } = {},
    } = {},
  ) {
    const options = {
      sentry: {
        level,
        logger,
        patchGlobal: true,
        ...sentryRest,
      },
    };

    // Attach the console transport.
    this.consoleTransport = new (winston.transports.Console)({
      level: defaultLevel,
      handleExceptions: true,
      prettyPrint: true,
      colorize: true,
      timestamp: () => {
        const now = new Date();
        let nowISOString;

        if (__DEV__) {
          // ISO-like date, but do as if current timezone was UTC.
          nowISOString = localISOString(now, true);
        } else {
          // Return UTC date and time unless in development.
          nowISOString = now.toISOString();
        }

        return nowISOString.replace(/T/, " ").replace(/\..+/, "");
      },
      formatter: options => {
        const timestamp = options.timestamp();

        // FIXME: Avoid using Winston internals, see:
        // https://github.com/winstonjs/winston/issues/603
        const level = options.colorize ?
          winston.config.colorize(options.level)
        : options.level;
        const message = options.message !== undefined ? options.message : "";

        // Watered down version of:
        // https://github.com/winstonjs/winston/blob/d91b0315025b7e4db28adaf5feb54f9b4136f575/lib/winston/common.js#L213-L247
        let meta = "";
        const metaInfo = (
          options.meta !== null &&
          options.meta !== undefined &&
          !(options.meta instanceof Error) ?
            winston.clone(cycle.decycle(options.meta))
          : options.meta || null
        );

        if (metaInfo !== null && metaInfo !== undefined) {
          if (typeof metaInfo !== "object") {
            meta += ` ${metaInfo}`;
          } else if (Object.keys(metaInfo).length > 0) {
            meta += (
              " \n" +
              util.inspect(
                metaInfo,
                false,
                options.depth || null,
                options.colorize
              )
            );
          } else {
            meta += ` ${winstonCommon.serialize(metaInfo)}`;
          }
        }

        const maxLength = (
          longestLabelLength + longestLevelLength - options.level.length + 3
        );
        const label = options.label ?
          _.padStart(` [${options.label}]`, maxLength)
        : "";

        const messagePrefix = `${timestamp} - ${level}:${label} `;
        const wrappedMessage = wordwrap(
          message,
          {
            cut: true,
            indent: " ".repeat(
              messagePrefix.length + options.level.length - level.length
            ),
            width: 80,
          },
        )
        .trim();

        return `${messagePrefix}${wrappedMessage}${meta}`;
      },
      label: (name || undefined)
    });
    const transports = [this.consoleTransport];

    // If a dsn is provided, attach the Sentry transport.
    if (options.sentry.dsn) {
      // We want to keep running if we have errors to send to a Sentry.
      exitOnError = false;
      transports.push(this.sentryTransport = new Sentry(options.sentry));
    }

    // Attach the logger.
    this.logger = new (winston.Logger)({
      exitOnError,
      transports,
    });
  }

  getLogger() {
    return this.logger;
  }

  // Expose a method to allow the user to change the minimal logging level
  // needed to be displayed in the console.
  setConsoleLevel(level) {
    this.consoleTransport.level = level || defaultLevel;
  }
}

class LoggerProxy {
  constructor(...args) {
    const logger = new BackendLogger(...args);

    return new Proxy(
      logger,
      {get: (target, property) => (
        logger.getLogger()[property] ||
        target[property]
      )}
    );
  }
}

function getLoggerName(module) {
  if (typeof module === "string") {
    // If a string, assume it is directly the label.
    return module;
  }

  // Otherwise, try the role field from the package.json(5) and then
  // the name as a last resort.
  const packageInfo = pkginfo(module, "name", "role");

  if (packageInfo.role) {
    return packageInfo.role;
  }

  if (packageInfo.name) {
    return packageInfo.name;
  }

  return `unknown-${++unknownCount}`;
}

// Provide the appropriate logger each time we're called.
export default function getLogger(module, options) {
  // Label value for the module.
  const name = getLoggerName(module);

  // Verify if a logger is already cached for that name.
  if (loggers.has(name)) {
    return loggers.get(name);
  }

  longestLabelLength = Math.max(longestLabelLength, name.length);

  // Create transport for that name.
  const logger = new LoggerProxy(name, options);

  loggers.set(name, logger);

  return logger;
}
