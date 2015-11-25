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