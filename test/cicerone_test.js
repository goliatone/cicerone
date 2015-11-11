'use strict';
var fs = require('fs');
var path = require('path');
var readFile = require('fs').readFileSync;
var fixture = path.resolve.bind(path, __dirname, 'fixtures');

var test = require('tape');
var cicerone = require('..');

test('Cicerone removeHost', function(t){
    makeHosts('removeHost/hosts.txt');
    cicerone.removeHost('127.0.0.3', 'cicerone.dev').then(function(hosts){
        t.equal(hosts, fixtureFile('removeHost/expected.txt'), 'Should remove host entry');
        cleanHosts();
        t.end();
    });
});

test('Cicerone readHosts', function (t) {
    makeHosts('readHosts/hosts.txt');
    cicerone.readHosts().then(function(result){
        t.equal(result, fixtureFile('readHosts/hosts.txt'), 'Should read hosts file');
        cleanHosts();
        t.end();
    });
});

test('Cicerone addHost', function(t){
    makeHosts('addHost/hosts.txt');
    cicerone.addHost('127.0.0.3', 'cicerone.dev').then(function(hosts){
        t.equal(hosts, fixtureFile('addHost/expected.txt'), 'Should add host entry');
        cleanHosts();
        t.end();
    });
});

test('Cicerone getHosts', function (t) {
    makeHosts('getHosts/hosts.txt');
    cicerone.getHosts().then(function(result){
        t.equal(result, fixtureFile('getHosts/expected.txt'), 'Should read full hosts file');
        cleanHosts();
        t.end();
    });
});



function fixtureFile(filepath){
    return readFile(fixture(filepath), 'utf-8');
}

function makeHosts(filepath){
    //copy file
    filepath = fixture(filepath);
    var destfile = fixture(filepath) + '.tmp',
        content = fs.readFileSync(filepath, 'utf-8');
    fs.writeFileSync(destfile, content, 'utf-8');

    process.env.CICERONE_PATH = destfile;
}

function cleanHosts(){
    fs.unlinkSync(process.env.CICERONE_PATH);
}
