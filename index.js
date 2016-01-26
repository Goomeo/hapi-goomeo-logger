'use strict';

const _                 = require('underscore');
const async             = require('async');
const good              = require('good');
const winston           = require('winston');
const path              = require('path');
const os                = require('os');
const fs                = require('fs');
const GoodWinston       = require('good-winston');
const DailyRotateFile   = require('winston-daily-rotate-file');

const loggers = {
    getLogger      : function getLogger(options) {
        var transports = [];

        if (options.console === true) {
            transports.push(new winston.transports.Console({
                colorize : true
            }));
        }

        if (options.rotate === true) {
            transports.push(new DailyRotateFile({
                name        : options.name,
                datePattern : '.yyyy-MM-ddTHH',
                filename    : path.join(options.logPath, options.name + '.log')
            }));
        }

        return new (winston.Logger)({
            exitOnError : false,
            transports  : transports
        });
    }
};

const myPlugin = {
    /**
     * Plugin Register Function
     *
     * @param {object}      server                              Hapi Server
     * @param {object}      options                             Plugin Options
     * @param {string}      options.logPath                     Path to log directory
     * @param {object}      options.log                         Log logger config
     * @param {boolean}     options.log.enable                  True : enable log. False otherwise. (Default : true)
     * @param {boolean}     options.log.console                 True : enable console stdout. False otherwise. (Default : true)
     * @param {boolean}     options.log.rotate                  True : enable log rotate file. False otherwise. (Default : true)
     * @param {string}      options.log.name                    Log Name. It's used for file name
     * @param {string}      options.log.level                   Level capture (Default : '*')
     * @param {object}      options.opts                        Opts logger config
     * @param {boolean}     options.opts.enable                 True : enable log. False otherwise. (Default : true)
     * @param {boolean}     options.opts.console                True : enable console stdout. False otherwise. (Default : true)
     * @param {boolean}     options.opts.rotate                 True : enable log rotate file. False otherwise. (Default : true)
     * @param {string}      options.opts.name                   Log Name. It's used for file name
     * @param {string}      options.opts.level                  Level capture (Default : '*')
     * @param {object}      options.request                     Request logger config
     * @param {boolean}     options.request.enable              True : enable log. False otherwise. (Default : true)
     * @param {boolean}     options.request.console             True : enable console stdout. False otherwise. (Default : true)
     * @param {boolean}     options.request.rotate              True : enable log rotate file. False otherwise. (Default : true)
     * @param {string}      options.request.name                Log Name. It's used for file name
     * @param {string}      options.request.level               Level capture (Default : '*')
     * @param {object}      options.response                    Response logger config
     * @param {boolean}     options.response.enable             True : enable log. False otherwise. (Default : true)
     * @param {boolean}     options.response.console            True : enable console stdout. False otherwise. (Default : true)
     * @param {boolean}     options.response.rotate             True : enable log rotate file. False otherwise. (Default : true)
     * @param {string}      options.response.name               Log Name. It's used for file name
     * @param {string}      options.response.level               Level capture (Default : '*')
     * @param {object}      options.error                       Error logger config
     * @param {boolean}     options.error.enable                True : enable log. False otherwise. (Default : true)
     * @param {boolean}     options.error.console               True : enable console stdout. False otherwise. (Default : true)
     * @param {boolean}     options.error.rotate                True : enable log rotate file. False otherwise. (Default : true)
     * @param {string}      options.error.name                  Log Name. It's used for file name
     * @param {string}      options.error.level                 Level capture (Default : '*')
     * @param {function}    next                                Next Function
     */
    register: function (server, options, next) {
        var logs = [ 'log', 'opts', 'request', 'response', 'error' ];

        options = _.extend({}, {
            logPath : path.join(os.tmpdir(), '/good-winston')
        }, options);

        _.each(logs, function (log) {
            options[log] = _.extend({}, {
                enable  : true,
                console : true,
                rotate  : true,
                name    : log,
                level   : '*'
            });
        });

        async.series({
            initLogDir : function initLogDir(callback) {
                fs.access(options.logPath, fs.R_OK | fs.W_OK, function (err) {
                    if (err) {
                        fs.mkdir(options.logPath, callback);
                        return;
                    }
                    callback();
                });
            },
            setGood : function setGood(callback) {
                var reporters = [];

                _.each(logs, function (log) {
                    if (options[log].enable === true) {
                        var opts = {};
                        opts[log] = options[log].level;

                        options[log].logPath = options.logPath;

                        reporters.push(new GoodWinston(opts, loggers.getLogger(options[log])));
                    }
                });

                server.register({
                    register : good,
                    options : {
                        reporters: reporters
                    }
                }, callback)
            },
            setLogFunction : function setLogFunction(callback) {
                server.method('log', function () {
                    var args = Array.prototype.slice.call(arguments);
                    _.each(args, function (message) {
                        loggers.getLogger({
                            name        : options.log.name,
                            console     : options.log.console,
                            rotate      : options.log.rotate,
                            logPath     : options.logPath
                        }).info(message);
                    });
                });
                server.method('error', function () {
                    var args = Array.prototype.slice.call(arguments);
                    _.each(args, function (message) {
                        loggers.getLogger({
                            name        : options.log.name,
                            console     : options.log.console,
                            rotate      : options.log.rotate,
                            logPath     : options.logPath
                        }).error(message);
                    });
                });
                server.method('warn', function () {
                    var args = Array.prototype.slice.call(arguments);
                    _.each(args, function (message) {
                        loggers.getLogger({
                            name        : options.log.name,
                            console     : options.log.console,
                            rotate      : options.log.rotate,
                            logPath     : options.logPath
                        }).warn(message);
                    });
                });
                server.method('profile', function (name) {
                    loggers.getLogger({
                        name        : options.log.name,
                        console     : options.log.console,
                        rotate      : options.log.rotate,
                        logPath     : options.logPath
                    }).profile(name);
                });
                callback();
            }
        }, next);
    }
};

myPlugin.register.attributes = {
    name: 'logger',
    version: '1.0.0'
};

module.exports.register = myPlugin.register;