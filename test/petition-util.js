
'use strict';

var mockery = require('mockery'),
    when = require('saywhen'),
    buffer = require('buffer'),
    EventEmitter = require('events');

describe("Petition utilities", function() {
    var httpsMock;

    beforeEach(function() {
        httpsMock = {
            get : jasmine.createSpy('get')
        };

        mockery.enable({
            warnOnReplace : false,
            warnOnUnregistered : false,
            useCleanCache : true
        });
        mockery.registerMock('https', httpsMock);
    });
    afterEach(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('supports HTTPS requests', function() {
        var util = require('../target/js/private/petition-util');
        expect(util.getJsonOverHttps).toBeDefined();
    });
    it('fires an event when http requests complete', function(done) {
        var util = require('../target/js/private/petition-util');

        var responseListener;
        when(httpsMock.get)
            .isCalledWith(
                jasmine.any(Object),
                jasmine.any(Function))
            .then(function(options, callback) {
                responseListener = callback;
                return {
                    on : jasmine.createSpy('on')
                };
            });

        util.getJsonOverHttps({
            hostname: 'localhost',
            path: '/path'
        })
        .on('data', function(data) {
            expect(data).toBeDefined();
            expect(data.foo).toBeDefined();
            expect(data.foo).toBe('bar');
            done();
        })
        .on('error', function() {
            done.fail('The error event was fired');
        });

        var response = {
            statusCode : 200,
            on : jasmine.createSpy('on')
        };
        var dataListener;
        when(response.on).isCalledWith('data', jasmine.any(Function))
            .then(function(event, listener) {
                dataListener = function(d) {
                    listener(d);
                };
                return response;
            });
        when(response.on).isCalledWith('end', jasmine.any(Function))
            .then(function(event, listener) {
                dataListener(new buffer.Buffer('{"foo":"bar"}'));
                listener();
                return response;
            });
        responseListener(response);
    });
    it('fires an error event when http returns non-200 status code', function(done) {
        var util = require('../target/js/private/petition-util');

        var responseListener;
        when(httpsMock.get)
            .isCalledWith(
                jasmine.any(Object),
                jasmine.any(Function))
            .then(function(options, callback) {
                responseListener = callback;
                return {
                    on : jasmine.createSpy('on')
                };
            });

        util.getJsonOverHttps({
            hostname: 'localhost',
            path: '/path'
        })
        .on('data', function(data) {
            done.fail('Data not expected');
        })
        .on('error', function() {
            done();
        });

        var response = {
            statusCode : 404,
            on : jasmine.createSpy('on')
        };
        var dataListener;
        when(response.on).isCalledWith('data', jasmine.any(Function))
            .then(function(event, listener) {
                dataListener = function(d) {
                    listener(d);
                };
                return response;
            });
        when(response.on).isCalledWith('end', jasmine.any(Function))
            .then(function(event, listener) {
                dataListener(new buffer.Buffer('{"foo":"bar"}'));
                listener();
                return response;
            });
        responseListener(response);
    });
});
