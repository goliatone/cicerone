'use strict';
var fixture = require('./fixtures');
var test = require('tape');
var cicerone = require('..');

test('Cicerone removeHost', function(t){
    fixture.make('removeHost/hosts.txt');
    cicerone.removeHost('127.0.0.3', 'cicerone.dev').then(function(hosts){
        t.equal(hosts, fixture.load('removeHost/expected.txt'), 'Should remove host entry');
        fixture.clean(t.end);
    });
});

test('Cicerone readHosts', function (t) {
    fixture.make('readHosts/hosts.txt');
    cicerone.readHosts().then(function(result){
        t.equal(result, fixture.load('readHosts/hosts.txt'), 'Should read hosts file');
        fixture.clean(t.end);
    });
});

test('Cicerone addHost', function(t){
    fixture.make('addHost/hosts.txt');
    cicerone.addHost('127.0.0.3', 'cicerone.dev').then(function(hosts){
        t.equal(hosts, fixture.load('addHost/expected.txt'), 'Should add host entry');
        fixture.clean(t.end);
    });
});

test('Cicerone addHosts', function(t){
    fixture.make('addHosts/hosts.txt');
    var hosts = fixture.load('addHosts/hosts.json');
    cicerone.addHosts(hosts).then(function(hosts){
        t.equal(hosts, fixture.load('addHosts/expected.txt'), 'Should add an array of host entries');
        fixture.clean(t.end);
    });
});

test('Cicerone getAllHosts', function (t) {
    fixture.make('getAllHosts/hosts.txt');
    cicerone.getAllHosts().then(function(result){
        t.equal(result, fixture.load('getAllHosts/expected.txt'), 'Should read full hosts file');
        fixture.clean(t.end);
    });
});

test('Cicerone hostToObject:domainFirst', function(t){
    var line = fixture.load('hostToObject/line.txt');
    var result = cicerone.hostToObject(true, line);
    var expected = fixture.load('hostToObject/expected.domain.json');
    t.deepEqual(result, expected);
    t.end();
});

test('Cicerone hostToObject:ipFirst', function(t){
    var line = fixture.load('hostToObject/line.txt');
    var result = cicerone.hostToObject(false, line);
    var expected = fixture.load('hostToObject/expected.ip.json');
    t.deepEqual(result, expected);
    t.end();
});

test('Cicerone hostsFileJSON', function(t){
    fixture.make('hostsFileJSON/hosts0.txt');
    cicerone.hostsFileJSON(true, true).then(function(result){
        t.deepEqual(result, fixture.load('hostsFileJSON/expected.domain.all.json'), 'Should get domain first all hosts in JSON');
        fixture.clean(t.end);
    });
});

test('Cicerone hostsFileJSON', function(t){
    fixture.make('hostsFileJSON/hosts1.txt');
    cicerone.hostsFileJSON(false, true).then(function(result){
        t.deepEqual(result, fixture.load('hostsFileJSON/expected.ip.all.json'), 'Should get ip first all hosts in JSON');
        fixture.clean(t.end);
    });
});


test('Cicerone hostsFileJSON', function(t){
    fixture.make('hostsFileJSON/hosts3.txt');
    cicerone.hostsFileJSON(true, false).then(function(result){
        t.deepEqual(result, fixture.load('hostsFileJSON/expected.domain.json'), 'Should get domain first cicerone hosts in JSON');
        fixture.clean(t.end);
    });
});
