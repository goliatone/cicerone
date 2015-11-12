'use strict';
var fs = require('fs');
var path = require('path');
var readFile = require('fs').readFileSync;
var fixture = path.resolve.bind(path, __dirname);

function _make(filepath){
    //copy file
    var destfile = fixture(filepath) + '.tmp',
        content = _load(filepath);
    fs.writeFileSync(destfile, content, 'utf-8');
    process.env.CICERONE_PATH = destfile;
}

function _load(filepath){
    var mock = readFile(fixture(filepath), 'utf-8')
    if(path.extname(filepath) === '.json'){
        try{
            mock = JSON.parse(mock);
        } catch(e){
            throw new Error('Error parsing mock file ' + filepath);
        }
    }
    return mock;
}

function _clean(cb){
    fs.unlink(process.env.CICERONE_PATH, cb);
}

module.exports = {
    make: _make,
    load: _load,
    clean: _clean
};
