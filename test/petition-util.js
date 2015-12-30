
var mockery = require('mockery'),
    when = require('saywhen'),
    buffer = require('buffer');

describe("Petition utilities", function() {
    var httpsMock = {
        get : jasmine.createSpy('get')
    };

    beforeAll(function() {
        mockery.enable({
            warnOnReplace : false,
            warnOnUnregistered : false,
            useCleanCache : true
        });
        mockery.registerMock('https', httpsMock);
    });
    afterAll(function() {
        mockery.disable();
    });

    it('supports HTTPS requests', function() {
        var util = require('../src/petition-util');
        expect(util.getJsonOverHttps).toBeDefined();
    });
    it('fires an event when http requests complete', function(done) {
        var util = require('../src/petition-util');

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
    it('supports forwarding errors', function() {
        var util = require('../src/petition-util');
        expect(util.forwardError).toBeDefined();
    });
});
