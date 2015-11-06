/*
 * cicerone
 * https://github.com/goliatone/cicerone
 *
 * Copyright (c) 2015 goliatone
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('gextend');
var _inherit = require('util').inherits;
var EventEmitter = require('events').EventEmitter;


var DEFAULTS = {
    autoinitialize: true
};

function cicerone(config){
    EventEmitter.call(this);
    config = extend({}, this.constructor.DEFAULTS, config);

    if(config.autoinitialize ) this.init(config);
}

_inherit(cicerone, EventEmitter);

cicerone.DEFAULTS = DEFAULTS;

cicerone.prototype.init = function(config){
    if(this.initialized) return;
    this.initialized = true;

    extend(this, this.constructor.DEFAULTS, config);

};

cicerone.prototype.logger = console;

/**
 * Exports module
 */
module.exports = cicerone;
