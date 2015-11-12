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
        t.equal(hosts, loadFixture('removeHost/expected.txt'), 'Should remove host entry');
        cleanHosts();
        t.end();
    });
});

test('Cicerone readHosts', function (t) {
    makeHosts('readHosts/hosts.txt');
    cicerone.readHosts().then(function(result){
        t.equal(result, loadFixture('readHosts/hosts.txt'), 'Should read hosts file');
        cleanHosts();
        t.end();
    });
});

test('Cicerone addHost', function(t){
    makeHosts('addHost/hosts.txt');
    cicerone.addHost('127.0.0.3', 'cicerone.dev').then(function(hosts){
        t.equal(hosts, loadFixture('addHost/expected.txt'), 'Should add host entry');
        cleanHosts();
        t.end();
    });
});

test('Cicerone addHosts', function(t){
    makeHosts('addHosts/hosts.txt');
    var hosts = loadFixture('addHosts/hosts.json');
    cicerone.addHosts(hosts).then(function(hosts){
        console.log(hosts)
        t.equal(hosts, loadFixture('addHosts/expected.txt'), 'Should add host entry');
        cleanHosts();
        t.end();
    });
});

test('Cicerone getAllHosts', function (t) {
    makeHosts('getAllHosts/hosts.txt');
    cicerone.getAllHosts().then(function(result){
        t.equal(result, loadFixture('getAllHosts/expected.txt'), 'Should read full hosts file');
        cleanHosts();
        t.end();
    });
});

test('Cicerone hostToObject:domainFirst', function(t){
    var line = loadFixture('hostToObject/line.txt');
    var result = cicerone.hostToObject(true, line);
    var expected = loadFixture('hostToObject/expected.domain.json');
    t.deepEqual(result, expected);
    t.end();
});

test('Cicerone hostToObject:ipFirst', function(t){
    var line = loadFixture('hostToObject/line.txt');
    var result = cicerone.hostToObject(false, line);
    var expected = loadFixture('hostToObject/expected.ip.json');
    t.deepEqual(result, expected);
    t.end();
});

test('Cicerone hostsFileJSON', function(t){
    makeHosts('hostsFileJSON/hosts.txt');
    cicerone.hostsFileJSON(true, true).then(function(result){
        t.deepEqual(result, loadFixture('hostsFileJSON/expected.domain.all.json'), 'Should get domain first all hosts in JSON');
        cleanHosts();
        t.end();
    });
});

test('Cicerone hostsFileJSON', function(t){
    makeHosts('hostsFileJSON/hosts.txt');
    cicerone.hostsFileJSON(false, true).then(function(result){
        t.deepEqual(result, loadFixture('hostsFileJSON/expected.ip.all.json'), 'Should get ip first all hosts in JSON');
        cleanHosts();
        t.end();
    });
});

test('Cicerone hostsFileJSON', function(t){
    makeHosts('hostsFileJSON/hosts.txt');
    cicerone.hostsFileJSON(false, false).then(function(result){
        t.deepEqual(result, loadFixture('hostsFileJSON/expected.ip.json'), 'Should get ip first cicerone hosts in JSON');
        cleanHosts();
        t.end();
    });
});

test('Cicerone hostsFileJSON', function(t){
    makeHosts('hostsFileJSON/hosts.txt');
    cicerone.hostsFileJSON(true, false).then(function(result){
        t.deepEqual(result, loadFixture('hostsFileJSON/expected.domain.json'), 'Should get domain first cicerone hosts in JSON');
        cleanHosts();
        t.end();
    });
});
//////////////////////////////////////
/// FIXTURE HELPERS
//////////////////////////////////////


function makeHosts(filepath){
    //copy file
    var destfile = fixture(filepath) + '.tmp',
        content = loadFixture(filepath);
    fs.writeFileSync(destfile, content, 'utf-8');
    process.env.CICERONE_PATH = destfile;
}

function loadFixture(filepath){
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

function cleanHosts(){
    fs.unlinkSync(process.env.CICERONE_PATH);
}
