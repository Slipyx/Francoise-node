# Francoise-node
*https://github.com/Slipyx/Francoise-node*

## Introduction
Francoise-node is a RSS feed reader IRC bot for [Node.js](http://nodejs.org/).

## License
Released under the MIT license. See LICENSE.txt for full information.

## Usage
First, edit config.json with your desired settings. Then launch the bot by
running server.js with your Node executable. You can specify a different config
file by using the --config command line argument. For example: `node server.js
--config config/myconfig` will use the file `./config/myconfig.json` for its
configuration.

#### Commands
.os - Get information about the OS the bot is running on.  
.stats - Get information about the running bot process.  
.version - Get Node version information.  
.listfeeds - Get a list of all the feeds in the config.  
.feedinfo (feedname) - Get information on the specified feed.  

## Dependencies
Francoise-node depends on at least Node.js v0.6.0 as well as a few external
modules which can be installed using [npm](http://npmjs.org/).  

*   [node-irc](https://github.com/martynsmith/node-irc)
*   [request](https://github.com/mikeal/request)
*   [sax-js](https://github.com/isaacs/sax-js)
