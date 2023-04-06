const { stageNames } = require('./stageConfig');

const commandConfig = {
    "heartbeat": {
        "description": "Basic heartbeat commands",
        "folder": "heartbeat",
        "commands": {
            "ping": {
                "aliases": ["ping"],
                "description": "Ping!",
                "execute": "ping.js",
                "args": {},
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD]
            },
            "echo": {
                "aliases": ["echo"],
                "description": "echoes message",
                "execute": "echo.js",
                "args": {
                    "message": {
                        "type": "string",
                        "optional": true,
                        "variable": true
                    }
                },
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD]
            }
        }
    },
    "help": {
        "description": "Help commands",
        "folder": "help",
        "commands": {
            "help": {
                "aliases": ["help", "h"],
                "description": "Help with command usage",
                "execute": "help.js",
                "args": {
                    "command": {
                        "type": "string",
                        "optional": true,
                        "variable": false
                    }
                },
                "stages": [stageNames.ALPHA, stageNames.BETA, stageNames.PROD]
            }
        }
    }
}

module.exports = commandConfig;