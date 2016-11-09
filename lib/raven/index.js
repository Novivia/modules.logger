/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import Raven from "raven-js";

function makeLogger(level) {
  // Sadly, Sentry uses "warning" while browsers use "warn". Let's stick to
  // "warn".
  const ravenLevel = level === "warn" ? "warning" : level;

  return {
    [level](message, options = {}) {
      if (!this.shouldLog) {
        return console[level](
          ...["Sentry:", message].concat(options.extra || []),
        );
      }

      Raven.captureMessage(
        message,
        {
          ...options,
          level: ravenLevel,
        },
      );
    }
  };
}

export function captureException(exception) {
  // Ensure it's wrapped in an Error.
  if (!(exception instanceof Error)) {
    console.warn(
      "Please ensure you wrap your exceptions in an 'Error' object:",
      exception,
    );

    exception = new Error(exception);
  }

  return Raven.captureException(exception);
}

export function getLogger({shouldLog} = {shouldLog: true}) {
  return {
    shouldLog,

    ...makeLogger("error"),
    ...makeLogger("info"),
    ...makeLogger("warn"),
  };
}

export function install({
  // By default, "trick" DSN since we might want to proxy to our backend. See
  // https://github.com/getsentry/raven-js/issues/346
  dsn = "//public@sentry.novivia.com/logging",
  makeRequest = Raven._makeRequest,
  reportUnhandledPromises = true,
  ...sentryConfig,
} = {}) {
  if (Raven.isSetup()) {
    return console.warn(
      "Logging is already enabled in the front-end. Ignoring install command.",
    );
  }

  Raven
  .config(
    dsn,
    {
      autoBreadcrumbs: {
        console: true,
        dom: true,
        location: true,
        xhr: true,
      },
      transport(options) {
        makeRequest({
          ...options,
          url: "/logging",
        });
      },
      ...sentryConfig,
      logger: "novivia-frontend",
    },
  )
  .install();

  if (reportUnhandledPromises && typeof window !== "undefined") {
    window.onunhandledrejection = ({reason}) => Raven.captureException(
      new Error(`Promise rejected${reason ? `: ${reason}` : "."}`),
    );
  }
}

export const setExtraContext = ::Raven.setExtraContext;
export const setUserContext = ::Raven.setUserContext;
export const showReportDialog = ::Raven.showReportDialog;
