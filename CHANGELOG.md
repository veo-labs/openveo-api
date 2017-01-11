# 4.0.0 /

## BREAKING CHANGES

- **Database** previously exposed on require('@openveo/api').Database is now exposed through a **database** namespace (e.g. require('@openveo/api').database.Database)
- **Plugin** previously exposed on require('@openveo/api').Plugin is now exposed through a **plugin** namespace (e.g. require('@openveo/api').plugin.Plugin)
- **EntityModel** previously exposed on require('@openveo/api').EntityModel is now exposed through a **models** namespace (e.g. require('@openveo/api').models.EntityModel)
- **ContentModel** previously exposed on require('@openveo/api').ContentModel is now exposed through a **models** namespace (e.g. require('@openveo/api').models.ContentModel)
- **EntityProvider** previously exposed on require('@openveo/api').EntityProvider is now exposed through a **providers** namespace (e.g. require('@openveo/api').providers.EntityProvider)
- require('@openveo/api').applicationStorage has been removed. Use require('@openveo/api').api.getCoreApi() instead
- Most of the properties of exposed classes are now unalterable
- Drop support for Node.js &lt;7.4.0
- Drop support for NPM &lt;4.0.5

## NEW FEATURES

- A new namespace "socket" has been added to expose tools to create socket servers and socket namespaces
- A new namespace "emitters" has been added to expose extensions of Node.js events.EventEmitter
- A generic Provider has been added for all providers (e.g. require('@openveo/api').providers.Provider)
- A generic Model has been added for all models (e.g. require('@openveo/api').models.Model)
- An important feature is APIs for Plugins, each plugin can now expose APIs to other plugins (see documentation for more details)

## DEPENDENCIES

- **tar-fs** has been updated from 1.13.2 to **1.15.0**
- **grunt** has been updated from 0.4.5 to **1.0.1**
- **grunt-eslint** has been updated from 18.1.0 to **19.0.0**
- **grunt-gh-pages** has been updated from 1.1.0 to **2.0.0**
- **grunt-mocha-test** has been updated from 0.12.7 to **0.13.2**
- **mocha** has been updated from 2.4.5 to **3.2.0**
- **pre-commit** has been updated from 1.1.2 to **1.2.2**
- **grunt-extend-config** has been removed
- **grunt-init** has been removed
- **glob** has been removed

# 3.1.0 / 2017-01-03

- Improve util by adding boolean and object value in shallowValidateObject function
- Debug javascript error in i18n lib

# 3.0.3 / 2016-09-26

- Debug tar extract on large files by changing dependency

# 3.0.2 / 2016-09-09

- Store session secret in application storage

# 3.0.1 / 2016-06-10

- Add interface to know if a user is content owner

# 3.0.0 / 2016-05-30
- Update logger
- Update Models to define Entity and ContentEntity
- Update Plugin interface
- Add Taxonomy Model in API
- Add Controller interface
- Add search index
- Add increase function in database interface
- Add migration script
- Add Helper to validate JSON Object

# 2.0.0 / 2016-02-19

- Add support for Arrays in require('@openveo/api').util.merge function
- Add Database close method
- Dissociate add and get on the logger. "get" method was used to both create and get a logger. Two methods are now available "add" and "get". Thus get method no longer create a new logger, use add instead
- Add translations API. Available through require('@openveo/api').i18n
- Use real unique String ids when adding new entities
- Correct bug when recursively creating directory using require('@openveo/api').fileSystem.mkdir with concurrent calls
- require('@openveo/api').fileSystem.copy can now copy both files and directories, not just files
- Update MongoDB database interface relative to MongoDB driver 2.0, Be careful Database methods may not return the same arguments
- Change the prototype Database.removeProp method to add a filter argument
- Correct bug when an error occured during search ("callback method called twice")

# 1.1.2 / 2015-11-25

Remove peer dependency on @openveo/core project

# 1.1.1 / 2015-11-25

Modify @openveo/core compatibility version to accept all versions &gt;=1.0.0 and &lt;1.2.0

# 1.1.0 / 2015-11-24

- Update fileSystem.copy to create destination directory if it does not exist
- Freeze project's dependencies
- Add EntityProvider.removeProp to remove a property from all entities
- Remove stdout logs in production environment
- Correct issue when uploading an invalid archive, process was stuck, it is now in error
- Update fileSystem.rmdir to test if directory exists before trying to remove it

# 1.0.0 / 2015-10-26

First stable version of OpenVeo API for [OpenVeo core](https://github.com/veo-labs/openveo-core) and plugins development.