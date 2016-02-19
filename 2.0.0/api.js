YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Database",
        "EntityModel",
        "EntityProvider",
        "MongoDatabase",
        "Plugin",
        "applicationStorage",
        "core-i18n",
        "fileSystem",
        "logger",
        "util"
    ],
    "modules": [
        "application-storage",
        "core-i18n",
        "database",
        "fileSystem",
        "logger",
        "models",
        "mongodb",
        "plugin",
        "providers",
        "util"
    ],
    "allModules": [
        {
            "displayName": "application-storage",
            "name": "application-storage",
            "description": "Application storage is a global storage for core and plugins, to be\nable to share information between both core and plugins.\n\nInformation stored in the application storage must be limited."
        },
        {
            "displayName": "core-i18n",
            "name": "core-i18n",
            "description": "Provides functions to help translates the application. Translations\nare grouped by dictionaries."
        },
        {
            "displayName": "database",
            "name": "database",
            "description": "Defines Database interface."
        },
        {
            "displayName": "fileSystem",
            "name": "fileSystem",
            "description": "Provides functions to interact with the file system as an extension to the Node.js filesystem module."
        },
        {
            "displayName": "logger",
            "name": "logger",
            "description": "Provides functions to manage loggers."
        },
        {
            "displayName": "models",
            "name": "models",
            "description": "A bunch of models to manipulate datas retrieved from providers."
        },
        {
            "displayName": "mongodb",
            "name": "mongodb",
            "description": "MongoDB database specific implementation."
        },
        {
            "displayName": "plugin",
            "name": "plugin",
            "description": "Defines a Plugin."
        },
        {
            "displayName": "providers",
            "name": "providers",
            "description": "A bunch of providers to manipulate datas retrieved from a storage."
        },
        {
            "displayName": "util",
            "name": "util",
            "description": "Provides functions for common JavaScript operations."
        }
    ],
    "elements": []
} };
});