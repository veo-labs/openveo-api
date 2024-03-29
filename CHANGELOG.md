# 8.2.0 / 2023-02-27

## NEW FEATURES

- fileSystem.getFileType, fileSystem.getFileTypeFromBuffer and utils.validateFiles now support MP4 iso5 files

# 8.1.0 / 2022-04-15

## DEPENDENCIES

- **connect-mongo** has been upgraded from 4.4.1 to **4.6.0**
- **mongodb** has been upgraded from 3.6.10 o **4.5.0**

# 8.0.4 / 2022-04-04

## BUG FIXES

- Fix require('@openveo/api').fileSystem.extract which wasn't able to extract large zip files (more than 2Go)

## DEPENDENCIES

- **adm-zip** has been replaced by node-stream-zip

# 8.0.3 / 2022-03-10

## BUG FIXES

- Fix require('@openveo/api').controllers.ContentController.addAccessFilter which was returning null if filter argument wasn't set

# 8.0.2 / 2021-11-19

## BUG FIXES

- Fix 8.0.1 release date

# 8.0.1 / 2021-11-19

## BUG FIXES

- Fix ovDeployGithubPages which was hanging when credentials where required to push to the repository 

# 8.0.0 / 2021-11-19

## BREAKING CHANGES

- No longer tested on NodeJS &lt; 16.3.0 and NPM &lt; 7.15.1
- require('@openveo/api').socket.SocketServer.listen signature has changed and now expects a list of allowed origins as second parameter
- This is not a breaking change but a warning: Socket.io clients in version 2 are still supported but are strongly encouraged to upgrade to version 4
- require('@openveo/api').util.validateFiles won't consider non tar files with .tar extension as tar archives

## NEW FEATURES

- require('@openveo/api').logger now adds a timestamp property to each log containing localized date and time
- Improve code documentation by replacing Yuidoc by JSDoc
- Add require('@openveo/api').watcher to listen to files system changes
- ovWatch script has been added to execute an NPM script of files changes and can be launched using npx (see scripts/watch.js) for usage
- ovRemove script has been added to remove file system resources and can be launched using npx (see scripts/remove.js) for usage
- require('@openveo/api').imageProcessor.generateSpriteFreely has been added to be able to generate a sprite without resizing the images and simply ordering images by their height with all images of the same height on the same line of the sprites
- require('@openveo/api').angularJs.parser has been added to offer tools to analyze and AngularJS application like sorting components files by dependence (used by grunt.ngDpTask) or generating an AngularJS run script to put all HTML templates into $templateCache
- require('@openveo/api').fileSystem.replace has been added to be able to replace some text in a file
- require('@openveo/api').fileSystem.performActions has been added to be able perform several copy / remove actions
- require('@openveo/api').fileSystem.prepend has been added to be able to add text at the beginning of a file
- require('@openveo/api').fileSystem.rmdir is now able to keep the directory itself
- require('@openveo/api').fileSystem.rm is now able to remove the content of a directory without the directory itself
- require('@openveo/api').fileSystem.getFileType has been added to be able to get the type of a file (only for supported files)
- require('@openveo/api').fileSystem.extract is now capable of extracting zip files
- require('@openveo/api').fileSystem now supports zip files
- require('@openveo/api').storages.ResourceFilter now supports `exists` comparison operator to test if a field exists or not

## BUG FIXES

- Fix NodeJS DEP0005 warning when using fileSystem.readFile
- Fix "callback was already called" error when using fileSystem.getJSONFileContent to parse invalid JSON

## DEPENDENCIES

- **connect-mongo** has been upgraded from 3.2.0 to **4.4.1**
- **express-session** has been upgraded from 1.17.0 to **1.17.2**
- **mongodb** has been upgraded from 3.5.5 to **3.6.10**
- **passport-ldapauth** has been upgraded from 2.1.4 to **3.0.1**
- **shortid** has been replaced by nanoid
- **socket.io** has been upgraded from 2.3.0 to **4.2.0**
- **tar-fs** has been upgraded from 1.16.3 to **2.1.1**
- **winston** has been upgraded from 3.2.1 to **3.3.3**
- **chai** has been upgraded from 4.2.0 to **4.3.4**
- **mocha** has been upgraded from 7.1.1 to **9.1.0**
- **multer** has been upgraded from 1.4.2 to **1.4.3**
- **yuidoc** has been replaced by **JSDoc**
- **grunt-gh-pages** has been replaced by a custom script
- **grunt-eslint** has been removed
- **grunt** has been removed
- **grunt-cli** has been removed

# 7.0.0 / 2020-05-04

## BREAKING CHANGES

- Drop support for NodeJS &lt; 12.4.0 and NPM &lt; 6.9.0
- require('@openveo/api').logger console parameter if now set to false by default meaning that logs won't be printed to the standard output unless console parameter is set to true

## NEW FEATURES

- Add support for sorting by score to require('@openveo/api').providers.EntityProvider *get* and *getAll* methods
- Add require('@openveo/api').storages.ResourceFilter.getLogicalOperation to be able to find a logical operation from filter's operations
- require('@openveo/api').logger is now capable to log to standard output without logging to file by setting console parameter to true without specifying a file
- Add drop index support to require('@openveo/api').storages.Database
- Add require('@openveo/api').util.removeHtmlFromText to be able to clean a text containing HTML entities and tags

## BUG FIXES

- require('@openveo/api').fileSystem.extract now executes callback with an error for an incomplete archive
- require('@openveo/api').logger didn't respect the level parameter when logging to the standard output, it does now
- require('@openveo/api').fileSystem rm, rmdir and readdir have been fixed to avoid "Callback was already called" error when something went wrong on several resources

## DEPENDENCIES

- **async** has been upgraded from 2.1.4 to **3.2.0**
- **connect-mongo** has been upgraded from 1.3.2 to **3.2.0**
- **mongodb** has been upgraded from 2.2.16 to **3.5.5**
- **esprima** has been upgraded from 4.0.0 to **4.0.1**
- **express-session** has been upgraded from 1.14.2 to **1.17.0**
- **gm** has been upgraded from 1.23.0 to **1.23.1**
- **multer** has been upgraded from 1.3.0 to **1.4.2**
- **passport** has been upgraded from 0.4.0 to **0.4.1**
- **passport-ldapauth** has been upgraded from 2.0.0 to **2.1.4**
- **shortid** has been upgraded from 2.2.6 to **2.2.15**
- **socket.io** has been upgraded from 1.7.2 to **2.3.0**
- **tar-fs** has been upgraded from 1.15.0 to **1.16.3**
- **winston** has been upgraded from 2.3.0 to **3.2.1**
- **xml2js** has been upgraded from 0.4.17 to **0.4.23**
- **grunt** has been upgraded from 1.0.3 to **1.1.0**
- **grunt-contrib-yuidoc** dependencies have been upgraded
- **grunt-eslint** has been upgraded from 21.0.0 to **22.0.0**
- **grunt-gh-pages** dependencies have been upgraded
- **mocha** has been upgraded from 5.2.0 to **7.1.1**
- **mock-require** has been upgraded from 3.0.2 to **3.0.3**

# 6.2.2 / 2019-09-02

## BUG FIXES

- Fix duplicate values returned by require('@openveo/api').util.intersectArray when the same value was used several times in the same array

# 6.2.1 / 2019-06-04

## BUG FIXES

- require('@openveo/api').util.merge now leaves properties with value null as is instead of setting properties values to an empty Object

# 6.2.0 / 2019-03-25

## NEW FEATURES

- Add require('@openveo/api').imageProcessor to help manipulate images
- Add require('@openveo/api').imageProcessor.generateThumbnail to be able to generate a thumbnail of an image with the possibility to crop it and set its quality
- Add require('@openveo/api').imageProcessor.append to create an image using several input images appended in lines (horizontally or vertically)
- Add require('@openveo/api').imageProcessor.generateSprite to create a sprite image (as a grid of images) using several input images
- Add require('@openveo/api').imageProcessor.generateSprites to create sprite images using several input images. Depending on the number of input images and the size of the sprite grid, it might create several sprite images
- Add require('@openveo/api').grunt.copyTask as a grunt task to copy directories or files

# 6.1.0 / 2018-10-26

## NEW FEATURES

- require('@openveo/api').util.getPropertyFromArray can now start collecting values at a specified value
- require('@openveo/api').storages.ResourceFilter now supports regular expressions
- require('@openveo/api').util.escapeTextForRegExp has been added to help escape a text that will be used in a JavaScript regular expression

## DEPENDENCIES

- **chai** has been upgraded from 4.0.2 to **4.2.0**
- **chai-spies** has been upgraded from 0.7.1 to **1.0.0**
- **grunt** has been upgraded from 1.0.1 to **1.0.3**
- **grunt-eslint** has been upgraded from 19.0.0 to **21.0.0**
- **grunt-gh-pages** has been upgraded from 2.0.0 to **3.1.0**
- **grunt-mocha-test** has been upgraded from 0.13.2 to **0.13.3**
- **mocha** has been upgraded from 3.2.0 to **5.2.0**
- **mock-require** has been upgraded from 3.0.1 to **3.0.2**

# 6.0.0 / 2018-10-16

## BREAKING CHANGES

- Drop support for NodeJS &lt; 8.9.4 and NPM &lt; 5.6.0
- multipart.MultipartParser.getFileDestination has been removed, use multipart.MultipartParser.getField

## NEW FEATURES

- multipart.MultipartParser can now specify the uniqueness of file names with the property "unique". Set "unique" property of a field to true will generate a unique file name for all files corresponding to the field

## BUG FIXES

- require('@openveo/api').util.shallowValidateObject now throws an error when trying to validate an Object (other than a Date) as a Date

# 5.1.1 / 2018-05-30

## BUG FIXES

- Fix missing *esprima* module when installing

# 5.1.0 / 2018-05-04

## NEW FEATURES

- Add NPM package-lock.json file

# 5.0.0 / 2018-05-03

## BREAKING CHANGES

- require('@openveo/api').util.shallowValidateObject now throws an error when trying to validate an Object as an array&lt;string&gt;, array&lt;number&gt; or array&lt;object&gt;
- Controller / Model / Provider / Database system has been revised into a Controller / Provider / Storage system with the following important consequences:
  - Models have been entirely removed as the notion of Model was confusing. Consequently require('@openveo/api').models does not exist anymore. You should now directly use Provider and EntityProvider instead of Model and EntityModel. If you were using ContentModel, content access verification based on a user has been moved into ContentController, thus you should use ContentController or implement content access controls yourself.
  - require('@openveo/api').databases.factory is now accessible on require('@openveo/api').storages.factory
  - require('@openveo/api').databases.Database is now accessible on require('@openveo/api').storages.databases.Database, this is because a new level of abstraction has been added to databases: the Storage. Database now extends Storage.
  - EntityController.getEntitiesAction does not return all entities anymore but paginated results.
  - EntityController.getEntityAction can now return an HTTP error 404 if entity has not been found.
  - EntityController.updateEntityAction and ContentController.updateEntityAction now return property **total** with value **1** if everything went fine.
  - EntityController.addEntityAction and ContentController.addEntityAction have been renamed into EntityController.addEntitiesAction and ContentController.addEntitiesAction because it is now possible to add several entities at once.
  - EntityController.removeEntityAction and ContentController.removeEntityAction have been renamed into EntityController.removeEntitiesAction and ContentController.removeEntitiesAction because it is now possible to remove several entities at once.
  - EntityController.removeEntitiesAction and ContentController.removeEntitiesAction now return property **total** with the number of removed entities.
  - ContentController.updateEntityAction can now return an HTTP error 404 if entity has not been found.
  - ContentController sub classes need to implement the method isUserManager.
  - ContentController.isUserAuthorized now return false if user is not specified.
  - ContentController.isUserAuthorized now return true if user is a manager (if ContentController.isUserManager return true).
  - ContentController.updateEntityAction authorizes managers to update the entity owner.
  - Classes extending EntityController must now implement a getProvider method instead of a getModel method.
  - EntityProvider.getOne now expects a ResourceFilter and new fields format.
  - EntityProvider.getPaginatedFilteredEntities has been removed, use EntityProvider.get instead.
  - EntityProvider.get does not return all entities anymore but paginated results, it expects a ResourceFilter and new fields format.
  - EntityProvider.update has been renamed into EntityProvider.updateOne and now expects a ResourceFilter.
  - EntityProvider.remove now expects a ResourceFilter.
  - EntityProvider.removeProp has been renamed into EntityProvider.removeField and now expects a ResourceFilter.
  - EntityProvider.increase has been removed, use EntityProvider.updateOne instead.
  - Database.insert has been renamed into Database.add an now expects a ResourceFilter.
  - Database.remove now expects a ResourceFilter.
  - Database.removeProp has been renamed into Database.removeField and now expects a ResourceFilter.
  - Database.update now expects a ResourceFilter.
  - Database.get now expects a ResourceFilter and new fields format.
  - Database.search has been removed, use Database.get instead.
  - Database.increase has been removed, use Database.updateOne instead.
  - HTTP error code 512(10) does not correspond anymore to a forbidden error when fetching entities but to a forbidden error when removing entities.
  - HTTP error code 515(10) which corresponded to a forbidden error when adding entities has been removed.

## NEW FEATURES

- Add cropping parameter to image style definition, image can be cropped when both height & width are specified.
- Add require('@openveo/api').grunt.ngDpTask as a grunt task to analyze an AngularJS application and generate a file containing the list of CSS and JavaScript files respecting the order of AngularJS dependencies. Use it to make sure that your AngularJS files and their associated CSS files are loaded in the right order. Is is based on the premise that the AngularJS application is organiszed in components and sub components
- Add require('@openveo/api').middlewares.imageProcessorMiddleware as an ExpressJS middleware to preprocess images before sending them to the client. Actually only one kind of image manipulation is available: generate a thumbnail
- Add require('@openveo/api').controllers.HttpController which is a new level of abstraction for the EntityController as an EntityController is intimately linked to the HTTP protocol. EntityController now extends HttpController which extends Controller.
- Add fields on require('@openveo/api').controllers.EntityController, require('@openveo/api').controllers.ContentController, require('@openveo/api').providers.EntityProvider and require('@openveo/api').storages.Storage. This lets you precise which entity fields you want to include / exclude from returned entities.
- Add require('@openveo/api').storages.ResourceFilter to be used between controllers, providers and storage to unify the writing of query filters.
- Add EntityProvider.getAll to fetch all entities automatically by requesting pages one by one. This should be used wisely.
- Add Provider.executeCallback as an helper function to execute a callback or log the message if callback is not defined.
- Add require('@openveo/api').storages.databaseErrors holding all error codes relative to databases.
- Add require('@openveo/api').fileSystem.rm to remove either a directory or a file. Use it instead of require('@openveo/api').fileSystem.rmdir.
- Add the notion of content entities manager. Controllers of type ContentController should now implement the method "isUserManager" to indicate if the current user must have the same privileges as the super administrator on the content entities. Managers of content entities are always authorized to perform CRUD operations on a particular type of content entities.

## BUG FIXES

- require('@openveo/api').multipart.MultipartParser now removes temporary files if client aborts the request

# 4.3.1 / 2018-01-16

## BUG FIXES

- require('@openveo/api').util.validateFiles now considers M4V files as valid MP4 files

# 4.3.0 / 2017-11-15

## NEW FEATURES

- require('@openveo/api').util.validateFiles is now capable of also validating file extensions

# 4.2.0 / 2017-10-18

## NEW FEATURES

- Add require('@openveo/api').util.areSameArrays to shallow validates that two arrays contain the same values, no more no less
- Add require('@openveo/api').util.evaluateDeepObjectProperties to evaluate a path of properties on an object without making use of the JavaScript eval function
- Add hook mechanism for plugins. Plugins can now use PluginApi.registerAction, PluginApi.unregisterAction and PluginApi.executeHook to respectively register an action on a hook, unregister an action from a hook and execute all registered actions for a hook
- Add local, LDAP and CAS passport strategies with a factory. You can use this to facilitate the integration of passport authentications. Modules are exposed under require('@openveo/api').passport

# 4.1.0 / 2017-09-12

## DEPENDENCIES

- **chai** has been upgraded from 3.5.0 to **4.0.2**

## NEW FEATURES

- Add require('@openveo/api').multipart.MultipartParser to help parse a request containing multipart data (including files)
- Improve require('@openveo/api').util.shadowValidateObject to add the possibility to validate values of array&lt;string&gt; and array&lt;number&gt; against a list of values using the *in* property
- Add require('@openveo/api').fileSystem.readFile to read part of a file
- Add require('@openveo/api').fileSystem.getFileTypeFromBuffer to get the type of a file as a buffer
- Add require('@openveo/api').util.validateFiles to validate that files types are as expected
- Add require('@openveo/api').util.getPropertyFromArray to retrieve values of a property inside an array of objects
- Add support for MP4 and TAR for require('@openveo/api').util.shadowValidateObject

# 4.0.0 / 2017-05-04

## BREAKING CHANGES

- **Database** previously exposed on require('@openveo/api').Database is now exposed through a **database** namespace (e.g. require('@openveo/api').database.Database)
- **Plugin** previously exposed on require('@openveo/api').Plugin is now exposed through a **plugin** namespace (e.g. require('@openveo/api').plugin.Plugin)
- **EntityModel** previously exposed on require('@openveo/api').EntityModel is now exposed through a **models** namespace (e.g. require('@openveo/api').models.EntityModel)
- **ContentModel** previously exposed on require('@openveo/api').ContentModel is now exposed through a **models** namespace (e.g. require('@openveo/api').models.ContentModel)
- **EntityProvider** previously exposed on require('@openveo/api').EntityProvider is now exposed through a **providers** namespace (e.g. require('@openveo/api').providers.EntityProvider)
- require('@openveo/api').applicationStorage has been removed. Use process.api instead
- require('@openveo/api').i18n has been removed. Use process.api instead
- Most of the properties of exposed classes are now unalterable
- Drop support for Node.js &lt;7.4.0
- Drop support for NPM &lt;4.0.5
- logger.get does not create a logger anymore, use logger.add instead
- logger.add without configuration still creates a logger but without Console transport. Consequently it is no longer possible to create a logger with a simple console transport stream.
- ContentModel.isUserAdmin and ContentModel.isUserOwner now expect the user as parameter
- Models extending ContentModel need to implement getSuperAdminId and getAnonymousId methods
- Controllers extending EntityController (or ContentController by extension) does not need to specify the model and provider constructors when calling the super constructor but need to implement the getModel method
- MongoDatabase search *page* parameter now starts at 0 instead of 1

## NEW FEATURES

- A new namespace "socket" has been added to expose tools to create socket servers and socket namespaces
- A new namespace "emitters" has been added to expose extensions of Node.js events.EventEmitter
- A new namespace "grunt" has been added to expose grunt tasks
- A rename grunt task has been added to rename a source (file or directory)
- A remove grunt task has been added to remove resources (files or directories)
- A generic Provider has been added for all providers (e.g. require('@openveo/api').providers.Provider)
- A generic Model has been added for all models (e.g. require('@openveo/api').models.Model)
- Add file validation to the util.shallowValidateObject function. Actually supported files are PNG, GIF and JPG.
- util.shallowValidateObject is now capable to validate a timestamp as a string for a date
- Add require('@openveo/api').fileSystem.readdir function to get resources of a directory and all its sub directories

## BUG FIXES

- Fix util.shallowValidateObject when using gt, lt, gte or lte at 0. Validation always succeeded, ignoring gt, lt, gte and lte.
- Fix util.shallowValidateObject when validating an undefined number. Validating an undefined number was failing even if not required. It now throws an error only if not defined and required.

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
