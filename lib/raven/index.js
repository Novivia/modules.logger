/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import Raven from "raven-js";

function reshapeRequest(options) {
  return {
    ...options,
    url: "/logging",
  };
}

export function install({
  makeRequest,
  ...sentryConfig,
} = {
  makeRequest: Raven._makeRequest,
}) {
  Raven
  .config(
    // "Trick" DSN since we proxy to our backend. See
    // https://github.com/getsentry/raven-js/issues/346
    "//public@127.0.0.1/logging",
    {
      ...sentryConfig,
      transport(options) {
        makeRequest(reshapeRequest(options));
      },
    },
  )
  .install();
}
