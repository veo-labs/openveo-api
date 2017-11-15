YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "AccessError",
        "AdvancedEmitter",
        "AdvancedEvent",
        "CAS",
        "CAS1",
        "CAS2",
        "CAS3",
        "CasStrategy",
        "ComponentExpression",
        "ConfigExpression",
        "ConstantExpression",
        "ContentController",
        "ContentModel",
        "Controller",
        "Database",
        "DirectiveExpression",
        "ElementExpression",
        "EntityController",
        "EntityModel",
        "EntityProvider",
        "Expression",
        "FilterExpression",
        "InjectExpression",
        "Model",
        "ModuleExpression",
        "MongoDatabase",
        "MultipartParser",
        "NotFoundError",
        "Pilot",
        "Plugin",
        "PluginApi",
        "Provider",
        "RouteExpression",
        "STRATEGIES",
        "SocketController",
        "SocketNamespace",
        "SocketServer",
        "ValueExpression",
        "disableCacheMiddleware",
        "factory",
        "fileSystem",
        "http-errors",
        "logRequestMiddleware",
        "logger",
        "ngDpTask",
        "removeTask",
        "renameTask",
        "util"
    ],
    "modules": [
        "controllers",
        "database",
        "emitters",
        "errors",
        "fileSystem",
        "grunt",
        "logger",
        "middlewares",
        "models",
        "multipart",
        "passport",
        "plugin",
        "providers",
        "socket",
        "util"
    ],
    "allModules": [
        {
            "displayName": "controllers",
            "name": "controllers",
            "description": "Base controllers' stuff to be used by all controllers.\n\n    // Load module \"controllers\"\n    var controllers = require('@openveo/api').controllers;"
        },
        {
            "displayName": "database",
            "name": "database",
            "description": "Databases implementations.\n\n    // Load module \"database\"\n    var database = require('@openveo/api').database;"
        },
        {
            "displayName": "emitters",
            "name": "emitters",
            "description": "Defines an enhanced version of the Node.js EventEmitter.\n\n    // Load module \"emitters\"\n    var emitters = require('@openveo/api').emitters;"
        },
        {
            "displayName": "errors",
            "name": "errors",
            "description": "All OpenVeo specific errors.\n\n    // Load module \"errors\"\n    var errors = require('@openveo/api').errors;"
        },
        {
            "displayName": "fileSystem",
            "name": "fileSystem",
            "description": "Defines functions to interact with the file system as an extension to the Node.js filesystem module.\n\n    // Load module \"fileSystem\"\n    var fsApi = require('@openveo/api').fileSystem;"
        },
        {
            "displayName": "grunt",
            "name": "grunt",
            "description": "All OpenVeo Grunt tasks (http://gruntjs.com/).\n\n    // Load module \"grunt\"\n    var tasks = require('@openveo/api').grunt;"
        },
        {
            "displayName": "logger",
            "name": "logger",
            "description": "Defines functions to manage loggers.\n\n    // Load module \"logger\"\n    var loggerAPI = require('@openveo/api').logger;"
        },
        {
            "displayName": "middlewares",
            "name": "middlewares",
            "description": "OpenVeo ExpressJS middlewares.\n\n    // Load module \"middlewares\"\n    var middlewares = require('@openveo/api').middlewares;"
        },
        {
            "displayName": "models",
            "name": "models",
            "description": "Base models to be used by all models.\n\n    // Load module \"models\"\n    var models = require('@openveo/api').models;"
        },
        {
            "displayName": "multipart",
            "name": "multipart",
            "description": "All elements necessary to parse multipart requests.\n\n    // Load module \"multipart\"\n    var multipart = require('@openveo/api').multipart;"
        },
        {
            "displayName": "passport",
            "name": "passport",
            "description": "Gets an instance of a passport strategy.\n\nHave a look at require('@openveo/api').passport.STRATEGIES to find out which\npassport strategies are supported."
        },
        {
            "displayName": "plugin",
            "name": "plugin",
            "description": "All elements necessary to create plugins or get information about them.\n\n    // Load module \"plugin\"\n    var plugin = require('@openveo/api').plugin;"
        },
        {
            "displayName": "providers",
            "name": "providers",
            "description": "Base providers' to be used by all providers.\n\n    // Load module \"providers\"\n    var providers = require('@openveo/api').providers;"
        },
        {
            "displayName": "socket",
            "name": "socket",
            "description": "All elements necessary to create socket servers.\n\n    // Load module \"socket\"\n    var socket = require('@openveo/api').socket;"
        },
        {
            "displayName": "util",
            "name": "util",
            "description": "Provides functions for common JavaScript operations.\n\n    // Load module \"util\"\n    var util = require('@openveo/api').util;"
        }
    ],
    "elements": []
} };
});