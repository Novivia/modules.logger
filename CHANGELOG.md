# Versions

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
