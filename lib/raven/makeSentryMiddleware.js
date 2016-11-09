/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import getPackageInfo from "pkginfo-json5";
import Raven from "raven-js/src/raven";
import superagent from "superagent";

export default function makeSentryMiddleware({
  dsn,
  ...sentryOptions,
} = {}) {
  const uri = Raven.prototype._parseDSN(dsn);
  const globalServer = Raven.prototype._getGlobalServer(uri);
  const [, path, globalProject] = /([\w.-]*?)\/([\w.-]+)$/.exec(uri.path);

  return (req, res) => {
    const release = getPackageInfo(
      null,
      {
        dir: process.cwd(),
        include: ["version"],
      },
    ).version;

    superagent
    .post(`${globalServer}/${path}api/${globalProject}/store/`)
    .query({
      ...req.query,
      sentry_key: uri.user,
    })
    .send({
      ...req.body,
      release,
      ...(sentryOptions || {}),
      environment: process.env.NODE_ENV,
      logger: "novivia-frontend-proxy",
    })
    .set("Origin", "novivia://")
    .end((err, response) => {
      if (err) {
        console.error("Sentry proxy error", err);

        return res.status(500).end();
      }

      res.send(response.body);
    });
  };
}
