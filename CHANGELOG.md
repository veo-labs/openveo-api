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