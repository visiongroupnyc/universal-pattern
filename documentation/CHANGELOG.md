# Changelog

## Dec 18, 2017
- Added \_id into update object for hooks

## nov 18, 2018
- Hotfix:
- Fix props.value when the type is integer.
- Added support for array prop type.
- Added support for  minLength into array type.
- Added support for items.type into array type.
- Added new properties into default saved document:
  - \_n: count the document updates.
  - \_v: the document version (x-swagger-model-version).
- Added lookup support!.

## Jan 9, 2020
- Hotfix for object properties definitions.

## Jan 13, 2020
- Hotfix for boolean type
- Replace Object.assign for {}
- Added `routeController` prop into upInstance. params (req, res, next, props )
- Removed `value` subprop from swagger.params.
- coordinates field fixed.

## Feb 25, 2020
- Hotfix: remove by _id

## May 17, 2021
- Removed nodejs package
- New vg-mongo package implemented (Vision Group MongoDB driver written by Cesar Casas)

## June 16, 2021
- Reeplaced MongoJS for vg-mongo

## June 21, 2021
- Added support for use Universal Pattern without MongoDB connection.
- Fix error handler

