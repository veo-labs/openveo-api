YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AccessError",
        "ContentController",
        "ContentModel",
        "Controller",
        "Database",
        "EntityController",
        "EntityModel",
        "EntityProvider",
        "MongoDatabase",
        "Plugin",
        "applicationStorage",
        "core-i18n",
        "disableCacheMiddleware",
        "fileSystem",
        "logRequestMiddleware",
        "logger",
        "util"
    ],
    "modules": [
        "application-storage",
        "controllers",
        "core-i18n",
        "database",
        "errors",
        "fileSystem",
        "http-errors",
        "logger",
        "middlewares",
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
            "displayName": "controllers",
            "name": "controllers",
            "description": "Router controllers."
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
            "displayName": "errors",
            "name": "errors",
            "description": "All OpenVeo specific errors."
        },
        {
            "displayName": "fileSystem",
            "name": "fileSystem",
            "description": "Provides functions to interact with the file system as an extension to the Node.js filesystem module."
        },
        {
            "displayName": "http-errors",
            "name": "http-errors",
            "description": "The list of API HTTP errors with, for each error, its associated hexadecimal code and HTTP return code."
        },
        {
            "displayName": "logger",
            "name": "logger",
            "description": "Provides functions to manage loggers."
        },
        {
            "displayName": "middlewares",
            "name": "middlewares",
            "description": "Middlewares module includes ExpressJS middlewares."
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