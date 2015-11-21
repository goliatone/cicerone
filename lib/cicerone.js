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
// var president = require('president');
var president = require('sweat');

var TAG_START = '#cicerone:start',
    TAG_END = '#cicerone:end',
    // REG = new RegExp(TAG_START + '([\\s]+)' + TAG_END, 'gm');
    REG = new RegExp(TAG_START + '([\\s\\S]*?)' + TAG_END, 'gm');

function Cicerone(){}

Cicerone.addHosts = function(hosts){
    //TODO: Assert that hosts is valid
    return Promise.each(hosts, function(item) {
        return Cicerone.addHost(item.ip, item.domain);
    }).then(function(results) {
        return Cicerone.readHosts();
    }).catch(function(e){
        console.log('error', e);
    });
};

Cicerone.addHost = function(ip, domain){
    //TODO: Assert that ip and domain are valid
    return Cicerone.getAllHosts().then(function(block){
        if(!block) return //TODO: make something meaningful here.
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
    //TODO: Assert that ip and domain are valid
    return Cicerone.getAllHosts().then(function(block){
        var entry = ip + '\t' + domain + '\n',
            check = new RegExp(ip.split('.').join('\\.') + '[\\s]+' + domain.replace('.','\\.'));

        if(check.exec(block)) {
            block = block.replace(check, '_LINE_');
            block = block.replace('\n_LINE_', '');
        }

        //Ideally, if we dont have this entry we don't want
        //to touch the file.
        return Cicerone.readHosts().then(function(hosts){
            hosts = hosts.replace(REG, TAG_START + block + TAG_END);
            return Cicerone.writeHosts(hosts);
        });
    });
};

/**
 * Return all hosts found in the
 * `hosts` file, including those
 * not managed by "cicerone".
 *
 * TODO: Make a better name.
 *
 * @return {Promise} resolves to string
 */
Cicerone.getAllHosts = function(){
    return Cicerone.readHosts().then(function(hosts){
        return (REG.exec(hosts) || [''])[1];
    });
};

Cicerone.readHosts = function(){
    return readFile(Cicerone.hostspath(), 'utf8').then(function(data) {
        return data;
    }).catch(function(e){
        console.log('ERROR', e);
    });
};

Cicerone.writeHosts = function(content){
    var tmp = temp.path();
    content = content.charCodeAt(content.length-1) === '\n'.charCodeAt(0) ? content : content + '\n';
    return writeFile(tmp, content, 'utf-8').then(function() {
        var cmd = ['/bin/sh', '-c', 'cat < ' + tmp + ' > ' + Cicerone.hostspath()];
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
        var hostMap = {},
            host = matches[2],
            ip = matches[1];
        ip && (ip = ip.trim());
        host && (host = host.trim());

        if(domainFirst) hostMap[host] = ip; // host:ip
        else hostMap[ip] = host; //ip:host
        return hostMap;
    }
};

Cicerone.hostsFileJSON = function(domainFirst, allHosts){
    var method = allHosts ? 'readHosts' : 'getAllHosts';
    return Cicerone[method]().then(function(data) {
        return (data || '').replace(/\n$/, '').split('\n');
    }).then(function(hosts){
        return hosts.map(Cicerone.hostToObject.bind(Cicerone, domainFirst)).filter(function(item){
            return item;
        });
    });
};

Cicerone.find = function(opts){
    return Cicerone.hostsFileJSON(true, true).then(function(hosts){
        return hosts.reduce(function(out, item){
            out.push(Cicerone.normalize(item));
            return out;
        }, []).reduce(function(out, item){
            return (item.ip === opts.ip || item.domain === opts.domain) ? item : out;
        });
    });
};

Cicerone.hostspath = function(){
    // hostspath = '/tmp/hosts';
    if(process.env.NODE_ENV === 'test') return process.env.CICERONE_PATH || '/tmp/hosts';
    return require('hosts-path')();
};

Cicerone.normalize = function (item){
    var key = Object.keys(item)[0],
        value = item[key],
        out = {};
    var IP = /(([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3}))/
    if(IP.exec(key)) {
        out.ip = key;
        out.domain = value;
    } else {
        out.ip = value;
        out.domain = key;
    }
    return out;
};

/**
 * Exports module
 */
module.exports = Cicerone;
