# hapi-goomeo-logger

Logger for Hapi based on Good and Winston.

This logger catch this events : 
 - request
 - response
 - error
 - ops
 - log
 
## Installation

```
npm install --save hapi-goomeo-logger
```

## Usage 

```javascript
server.register({
    plugin : require('hapi-goomeo-logger')
});
```

## Options 

| Option    | Type      | Default               | Description                               |
| ---       | ---       | ---                   | ---                                       |
| logPath   | String    | `/tmp/good-winston`   | directory that contains your log files    |
| log       | Object    | -                     | Contains default log options              |
| ops       | Object    | -                     | Contains ops log options                  |
| request   | Object    | -                     | Contains request log options              |
| response  | Object    | -                     | Contains response log options             |
| error     | Object    | -                     | Contains error log options                |

## Logs Options

For the `log`, `ops`, `request`, `response`, `error` options, the settings are the same :

| Option    | Type      | Default               | Description                                       |
| ---       | ---       | ---                   | ---                                               |
| enable    | Boolean   | `true`                | True : enable log. False otherwise.               |
| console   | Boolean   | `true`                | True : enable console stdout. False otherwise.    |
| rotate    | Boolean   | `true`                | True : enable log rotate file. False otherwise.   |
| name      | String    | `log`, `ops`, `request`, `response`, `error` | Log Name. It's used for file name |
| level     | String    | `'*'`                 | Level capture                                     |

## Server Methods

```javascript
server.methods.log(message, [messages...]);
server.methods.warn(message, [messages...]);
server.methods.error(message, [messages...]);
server.methods.profile(libelle);
```