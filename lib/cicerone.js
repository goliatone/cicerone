/*
 * cicerone
 * https://github.com/goliatone/cicerone
 *
 * Copyright (c) 2015 goliatone
 * Licensed under the MIT license.
 */
'use strict';
var Promise = require("bluebird");
var readFile = Promise.promisify(require('fs').readFile);
var writeFile = Promise.promisify(require('fs').writeFile);
var temp = require('temp');
var president = require('president');

var hostspath = require('hosts-path')();
if(process.env.NODE_ENV === 'test') hostspath = '/tmp/hosts';

var TAG_START = '#cicerone:start',
    TAG_END = '#cicerone:end',
    REG = new RegExp(TAG_START + '([\\s\\S]*?)' + TAG_END, 'gm');

function Cicerone(){}

Cicerone.addHost = function(ip, domain){
    return Cicerone.getHosts().then(function(block){
        var entry = ip + '\t' + domain + '\n';
        //TODO: We should do a better check!
        if(block.indexOf(entry) === -1) block += entry;
        //Ideally, if we already have this entry we don't want
        //to touch the file.
        return Cicerone.readHosts().then(function(hosts){
            hosts = hosts.replace(REG, TAG_START + block + TAG_END);
            return Cicerone.writeHosts(hosts);
        });
    });
};

Cicerone.removeHost = function(ip, domain){
    return Cicerone.getHosts().then(function(block){
        var entry = ip + '\t' + domain + '\n';
        //TODO: We should do a better check!
        if(block.indexOf(entry) !== -1) block = block.replace(entry, '');
        //Ideally, if we dont have this entry we don't want
        //to touch the file.
        return Cicerone.readHosts().then(function(hosts){
            hosts = hosts.replace(REG, TAG_START + block + TAG_END);
            return Cicerone.writeHosts(hosts);
        });
    });
};

Cicerone.getHosts = function(){
    return Cicerone.readHosts().then(function(hosts){
        return (REG.exec(hosts) || [''])[1];
    });
};

Cicerone.readHosts = function(){
    return readFile(hostspath, 'utf8').then(function(data) {
        return data;
    }).catch(function(e){
        console.log('ERROR', e);
    });
};

Cicerone.writeHosts = function(content){
    var tmp = temp.path();
    content = content.charCodeAt(content.length-1) === '\n'.charCodeAt(0) ? content : content + '\n';
    return writeFile(tmp, content, 'utf-8').then(function() {
        var cmd = ['/bin/sh', '-c', 'cat < ' + tmp + ' > ' + hostspath];
        return new Promise(function(resolve, reject){
            president.execute(cmd, function(err) {
                require('fs').unlinkSync(tmp);
                if (err) reject(err);
                else resolve(content);
            });
        });
    }).catch(function(err){
        console.log('ERROR', err);
        return err;
    });
};

Cicerone.hostToObject = function(domainFirst, line){
    // R.E from feross/hostile
    var matches = /^\s*?([^#]+?)\s+([^#]+?)$/.exec(line);
    if (matches && matches.length === 3) {
        var hostMap = {};
        if(domainFirst) hostMap[matches[2]] = matches[1]; // host:ip
        else hostMap[matches[1]] = matches[2]; //ip:host
        return hostMap;
    }
};

Cicerone.hostsFileJSON = function(domainFirst, allHosts){
    var method = allHosts ? 'readHosts' : 'getHosts';
    return Cicerone[method]().then(function(data) {
        return data.replace(/\n$/, '').split('\n');
    }).then(function(hosts){
        return hosts.map(Cicerone.hostToObject.bind(Cicerone, domainFirst)).filter(function(item){
            return item;
        });
    });
};

/**
 * Exports module
 */
module.exports = Cicerone;
