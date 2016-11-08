/**
 * Copyright 2013-present, Novivia, Inc.
 * All rights reserved.
 */

import Raven from "raven-js/src/raven";
import superagent from "superagent";

// const raven = new Raven();

export default function makeSentryMiddleware({
  dsn,
  ...sentryOptions,
} = {
  dsn: "https://109f015a2e75455197aadadd67422f2a@sentry.novivia.com/3",
}) {
  const uri = Raven.prototype._parseDSN(dsn);
  const globalServer = Raven.prototype._getGlobalServer(uri);
  const [, path, globalProject] = /([\w.-]*?)\/([\w.-]+)$/.exec(uri.path);

  return (req, res) => {
    superagent
    .post(`${globalServer}/${path}api/${globalProject}/store/`)
    .query({
      ...req.query,
      sentry_key: uri.user,
    })
    .send(req.body)
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
