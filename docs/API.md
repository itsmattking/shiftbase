## API Spec

## Auth

* Auth via headers
** X-API-Key

## couchbase API

### bucket structure

* <siteid>
** views
*** <ModelName>
** <uuid> - data item


## REST API

* GET /manifest
** Returns manifest of data models

** Data Structure
*** isManifest - true (signifies manifest for view query)
*** model - string
*** structure - {field => type}
*** listDisplay - array[{field => {options}}] (fields to be displayed in lists, ordered by display preference)
*** formDisplay - array[{field => {options}}] (fields to be displayed in forms, ordered by display preference)


* GET /manifest/<ModelName>
** Returns current data structure for ModelName

* GET /manifest/<ModelName>/versions
** Returns list of data structure versions for ModelName

* GET /manifest/<ModelName>/versions/<id>
** Returns version of data structure for ModelName

* PUT /manifest/<ModelName>
** Create data structure manifest for ModelName

* POST /manifest/<ModelName>
** Update data structure manifest for ModelName

* GET /<ModelName>
** Returns list of available data for ModelName wrapped in meta data
*** optional: current data structure
*** count
** Parameters: limit, offset, bodies

* GET /<ModelName>/<id>
** Returns individual data item by id

* GET /<ModelName>/<id>/versions
** Returns list of versions for individual data item by id

* GET /<ModelName>/<id>/versions/<id>
** Returns version of individual data item by id

* PUT /<ModelName>
** Create new data item for ModelName
** Requires write API key

* POST /<ModelName>/<id>
** Update data item for ModelName
** Requires write API key

* DELETE /<ModelName>/<id>
** Delete data item for ModelName
** Requires write API key

