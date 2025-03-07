// Promyfill (c) themirrazz
if(!window.Promise) {
    window.Promise = function (func) {
        if(!this instanceof window.Promise) {
            return new window.Promise(func);
        }
        var then;
        var onCatch;
        var thenRes;
        var resArgs;
        var thenRej;
        var status = 'pending';
        var promise = {
            constructor: window.Promise,
            then: function (thisThen) {
                if(status === 'fufilled') {
                    return thisThen.apply(this, resArgs);
                }
                if(then) { return false; }
                then = thisThen;
                return new window.Promise(function (res, rej) {
                    thenRes = res;
                    thenRej = rej;
                });
            },
            'catch': function (thisCatch) {
                if(status === 'rejected') {
                    return thisCatch.apply(this, resArgs);
                }
                onCatch = thisCatch;
            }
        };
        func(function () {
            if(status != 'pending') {
                return;
            }
            status = 'fufilled';
            resArgs = arguments;
            if(then) {
                try {
                    var thenr = then.apply(this, arguments);
                    if(thenr instanceof window.Promise) {
                        thenr.then(function () {
                            thenRes.apply(this, arguments);
                        })['catch'](function () {
                            thenRej.apply(this, arguments)
                        });
                    } else {
                        thenRes.apply(this, thenr);
                    }
                } catch (error) {
                    thenRej(error);
                };
            }
        }, function () {
            if(status != 'pending') {
                return;
            }
            status = 'rejected';
            resArgs = arguments;
            if(onCatch) {
                onCatch.apply(this, arguments);
            } else if(then) {
                thenRej.apply(this, arguments)
            } else {
                console.error(arguments);
            }
        });
        this.then = promise.then;
        this['catch'] = promise['catch'];
        return this;
    };
};
