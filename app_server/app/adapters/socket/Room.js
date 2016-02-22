/**
 * @module Room
 * Abtraction of a chat room
 */
'use strict';

var rfr = require('rfr');

var Utility = rfr('app/util/Utility');

var logger = Utility.createLogger(__filename);

function Room(name, type) {
  if (!name) {
    logger.error('Room name is invalid');
    throw new Error('Room name must be provided');
  }

  if (!type) {
    logger.error('Room type is invalid');
    throw new Error('Room type must be provided');
  }

  this.__name = name;
  this.__type = type;
  this.__clients = {}; // A map from client's socket.io id to Client object
}

var Class = Room.prototype;
Room.ROOM_TYPES = Class.ROOM_TYPES = {
  STREAM: 'stream',
  GENERAL: 'general'
};

Class.getName = function() { return this.__name; };

Class.getType = function() { return this.__type; };

Class.getClients = function() { return this.__clients; };

Class.getClient = function(socketId) { return this.__clients[socketId]; };

/**
 * @param client {Client}
 */
Class.addClient = function(client) {
  this.__clients[client.getSocketId()] = client;
  client.__joinRoom__(this);
  logger.info(`${client.getSocketId()} added to ${this.getName()}`);
};

/**
 * @param client {Client}
 */
Class.removeClient = function(client) {
  if (!(client.getSocketId() in this.__clients)) {
    let err = `${client.getSocketId()} doesn't exist in ${this.getName()}`;
    logger.error(err);
    return new Error(err);
  }

  delete this.__clients[client.getSocketId()];
  client.__leaveRoom__(this);
  logger.info(`${client.getSocketId()} removed from ${this.getName()}`);
};

Class.removeAllClients = function() {
  logger.info(`Removing all clients in ${this.getName()}`);
  for (var client in this.__clients) {
    client.__leaveRoom__(this);
  }
  this.__clients = {};
};

module.exports = Room;
