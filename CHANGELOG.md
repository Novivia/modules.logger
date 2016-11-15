# Versions

## v0.6.1 - (15/11/2016)

* Project compilation now targets the frontend.


## v0.6.0 - (09/11/2016)

* Project now maintained under the Novivia scope. (@novivia)
* Project open-sourced.
* Added utilities to collect logs from the frontend, see `frontend` and
 `middleware` files.

* New dependencies:
    * `@novivia/linter`
    * `@novivia/open-sourcer`
    * `pkginfo-json5`
    * `raven-js`
    * `superagent`

* Updated dependencies:
    * `@novivia/build-module` to v0.5.
    * `lodash` to v4.


## v0.5.4 - (29/06/2016)

* Unpinned the winston-sentry dependency.


## v0.5.3 - (22/06/2016)

* Pinned the `winston-sentry` dependency to v0.1.1.


## v0.5.2 - (18/03/2016)

* Addressed an issue that caused thrown errors not to be sent to the
  sentry server.


## v0.5.1 - (16/01/2016)

* Rebuilt with a Babel fix (through the builder module) for a bug that caused
  the v0.5.0 bundle to crash.


## v0.5.0 - (12/01/2016)

* Updated dependencies:
    * `@auex/build-module` to v0.2.
    * `@auex/utilities` to v0.3.
    * `winston` to v2.
    * `winston-sentry` to v0.1.


## v0.4.3 - (10/08/2015)

* Added support for logger options when initializing a logger.
* Added support for a Sentry transport, DSN can be provided through the new
  logger options feature.


## v0.4.2 - (06/08/2015)

* Updated Winston to 1.0.
* Now padding the log level and the log label together to minimize the waste of
  space and to align messages between lines.
* Now hard wordwrapping messages at 80 columns and indenting the other lines
  properly.


## v0.4.1 - (31/07/2015)

* Bumped dependencies


## v0.4.0 - (17/07/2015)

* Package now built using the AuctionEx build tool (in beta).
* Package now scoped under @auex and published in private npm.


## v0.3.0 - (17/10/2014)

* Now resolving the label when registring a module with the following priority:
  * String provided.
  * Role in module provided.
  * Name in module provided.
  * Auto-assigned "unknown" ID.


## v0.2.2 - (08/08/2014)

* Now possible to provide the module object as a paremeter to infer
  the package name as the label.


## v0.2.1 - (07/08/2014)

* Now wrapping logger implementation and providing utilities on the proxy.
* Removed package.json in favor of package.json5 for yapm.
* Added a README file describing how to install and use.


## v0.2.0 - (19/05/2014)

* Now caching transports to only create them once per unique name.


## v0.1.1 - (19/05/2014)

* Removed work-around for older clients of the module.


## v0.1.0 - (19/05/2014)

* Initial tagged version of the logger.
* Logger now expects a label name when being required.
