(function (root, factory) {if (typeof exports === 'object') {module.exports = factory();} else if (typeof define === 'function' && define.amd) {define(factory);} else {root.eweda = factory();}}(this, function () { // see https://github.com/umdjs/umd/blob/master/returnExports.js
    // TODO: remove var statements from `var xyz = E.xyz = /* ... */` if local xyz is not used.
    var lib = function(bootstrap) {
        var E = function() {return lib.apply(this, arguments);};
        var undef = (function(){})();
        var aliasFor = function(oldName) {
            var fn = function(newName) {E[newName] = E[oldName]; return fn;};
            return (fn.is = fn.are = fn.and = fn);
        };

        var EMPTY = bootstrap.EMPTY;
        var isEmpty = bootstrap.isEmpty;
        var prepend = E.prepend = bootstrap.prepend;
        aliasFor("prepend").is("cons");
        var head = E.head = bootstrap.head;
        aliasFor("head").is("car");  // TODO: really? sure!
        var tail = E.tail = bootstrap.tail;
        aliasFor("tail").is("cdr");  // TODO: really? absolutely!
        var isAtom = E.isAtom = bootstrap.isAtom;

        var bind = function(fn, context) {
            var args = Array.prototype.slice.call(arguments, 2);
            return function() {
                return fn.apply(context || this, args.concat(Array.prototype.slice.call(arguments)));
            };
        };

        var slice = bind(Function.prototype.call, Array.prototype.slice);
        var toString = bind(Function.prototype.call, Object.prototype.toString);
        var isArray = function(val) {return toString(val) === "[object Array]";};


        var expand = function(a, len) {
            var arr = a ? isArray(a) ? a : slice(a) : [];
            while(arr.length < len) {arr[arr.length] = undef;}
            return arr;
        };

        var _ = function(fn) {
            var arity = fn.length;
            var f = function(args) {
                return function () {
                    var newArgs = args.concat(slice(arguments, 0));
                    if (newArgs.length >= arity) {
                        return fn.apply(this, newArgs);
                    }
                    else {return f(newArgs);}
                };
            };
            return f(EMPTY);
        };

        var and = E.and = _(function (a, b) {
            return !!(a && b);
        });

        var or = E.or = _(function (a, b) {
            return !!(a || b);
        });

        var not = E.not = function (a) {
            return !a;
        };

        var eq = E.eq = _(function(a, b) {
            return a === b;
        });

        // Still not particularly happy with the names `andFn`, `orFn`, `notFn`, but at least Oliver Twist can pronounce one...

        var andFn = E.andFn = _(function(f, g) { // TODO: arity?
           return function() {return !!(f.apply(this, arguments) && g.apply(this, arguments));};
        });

        var orFn = E.orFn = _(function(f, g) { // TODO: arity?
           return function() {return !!(f.apply(this, arguments) || g.apply(this, arguments));};
        });

        var notFn = E.notFn = function (f) {
            return function() {return !f.apply(this, arguments);};
        };

        var foldl = E.foldl = _(function(fn, acc, arr) {
            return (isEmpty(arr)) ? acc : foldl(fn, fn(acc, head(arr)), tail(arr));
        });
        aliasFor("foldl").is("reduce");

        var foldl1 = E.foldl1 = _(function (fn, arr) {
            if (isEmpty(arr)) {
                throw new Error("foldl1 does not work on empty lists");
            }
            return foldl(fn, head(arr), tail(arr));
        });

        var foldr = E.foldr =_(function(fn, acc, arr) {
            return (isEmpty(arr)) ? acc : fn(head(arr), foldr(fn, acc, tail(arr)));
        });
        aliasFor("foldr").is("reduceRight");

        var foldr1 = E.foldr1 = _(function (fn, arr) {
            if (isEmpty(arr)) {
                throw new Error("foldr1 does not work on empty lists");
            }
            var rev = reverse(arr);
            return foldr(fn, head(rev), reverse(tail(rev)));
        });

        var flip = E.flip = function(fn) {
            return function(a, b) {
                return fn.apply(this, [b, a].concat(slice(arguments, 2)));
            };
        };
        var append = E.append = _(function(arr1, arr2) {
            return (isEmpty(arr1)) ? arr2 :  prepend(head(arr1), append(tail(arr1), arr2));
        });

        var reverse = E.reverse = foldl(flip(prepend), EMPTY);

        var map = E.map = _(function(fn, arr) {
            return (isEmpty(arr)) ? EMPTY : prepend(fn(head(arr)), map(fn, tail(arr)));
        });

        var all = E.all = _(function (fn, arr) {
            return (isEmpty(arr)) ? true : fn(head(arr)) && all(fn, tail(arr));
        });
        aliasFor("all").is("every");

        var some = E.some = _(function(fn, arr) {
            return (isEmpty(arr)) ? false : fn(head(arr)) || some(fn, tail(arr));
        });
        aliasFor("some").is("any").and("atLeastOne"); // TODO: remove superfluous alias used for testing `and`

        var filter = E.filter = _(function(fn, arr) {
            return (isEmpty(arr)) ? EMPTY : (fn(head(arr))) ? prepend(head(arr), filter(fn, tail(arr))) : filter(fn, tail(arr));
        });

        var reject = E.reject = _(function(fn, arr) {
            return filter(notFn(fn), arr);
        });

        var lPartial = E.lPartial = function (fn) {
            var args = slice(arguments, 1);
            return function() {
                return fn.apply(this, args.concat(slice(arguments)));
            };
        };
        aliasFor("lPartial").is("applyLeft");

        var rPartial = E.rPartial =function (fn) {
            var args = slice(arguments, 1);
            return function() {
                return fn.apply(this, slice(arguments).concat(args));
            };
        };
        aliasFor("rPartial").is("applyRight");

        var prop = E.prop = function(p) {return function(obj) {return obj[p];};};

        var func = E.func = function(n) {return function(obj) {return obj[n].apply(obj, slice(arguments, 1));};};

        var pluck = E.pluck = function(p) {return map(prop(p));};
        // var pluck = E.pluck = map(prop); // TODO: shouldn't this work? // ANS: Duh, requires compose

        var uniq = E.uniq = function(arr) {
            var h = head(arr), t = tail(arr);
            return (isEmpty(arr)) ? EMPTY : (contains(h, t)) ? uniq(t) : prepend(h, uniq(t));
        };

        var take = E.take = _(function(n, arr) {
            return (isEmpty(arr) || !(n > 0)) ? EMPTY : prepend(head(arr), take(n - 1, tail(arr)));
        });

        var skip = E.skip = _(function(n, arr) {
            return isEmpty(arr) ? EMPTY : (n > 0) ? skip(n - 1, tail(arr)) : arr;
        });
        aliasFor('skip').is('drop');

        var xprodWith = E.xprodWith = _(function(fn, a, b) {
            return (isEmpty(a) || isEmpty(b)) ? EMPTY : foldl1(append, map(function(z) {return map(_(fn)(z), b);}, a));
        });

        var xprod = E.xprod = xprodWith(prepend);

        var zipWith = E.zipWith = _(function(fn, a, b) {
            return (isEmpty(a) || isEmpty(b)) ? EMPTY : prepend(fn(head(a), head(b)), zipWith(fn, tail(a), tail(b)));
        });

        var zip = E.zip = zipWith(prepend);

        var flatten = E.flatten = function(list) {
            var h = head(list), t = tail(list);
            return isEmpty(list) ? EMPTY : (isAtom(h)) ? prepend(h, flatten(t)) : append(flatten(h), flatten(t));
        };

        // would be nice to have a find for objects as well
        var find = E.find = _(function(fn, lat) {
            var h = head(lat);
            return (isEmpty(lat)) ? false : fn(h) ? h : find(fn, tail(lat));
        });

        // express contains in terms of find?
        var contains = E.contains = _(function(a, lat) {
            return (isEmpty(lat)) ? false : head(lat) === a || contains(a, tail(lat));
        });

        var tap = E.tap = _(function(x, y) {
            if (typeof y === "function") {
                y(x);
            }
            return x;
        });
        aliasFor("tap").is("K");

        var keys = E.keys = function(obj) {
            return Object.keys(obj);
        };

        var values = E.values = function(obj) {
            return map(function(x) { return obj[x]; }, keys(obj));
        };

        var anyBlanks = some(function(val) {return val === null || val === undef;});

        var maybe = E.maybe = function (fn) {
            return function () {
                return (arguments.length === 0 || anyBlanks(expand(arguments, fn.length))) ? undef : fn.apply(this, arguments);
            };
        };

        var compose = E.compose = function() {  // TODO: type check of arguments?
            var fns = slice(arguments);
            return function() {
                return foldr(function(fn, args) {return [fn.apply(this, args)];}, slice(arguments), fns)[0];
            }
        };
        aliasFor("compose").is("fog"); // TODO: really?

        var pipe = E.pipe = function() { // TODO: type check of arguments?
            return compose.apply(this, slice(arguments).reverse());
        };
        aliasFor("pipe").is("sequence");

        var identity = E.identity = function(val) {
            return function() {return val;};
        };

        E.alwaysZero = identity(0);
        E.alwaysFalse = identity(false);
        E.alwaysTrue = identity(true);

        var props = E.props = function(obj) {
            return function(prop) {return obj && obj[prop];};
        };

        var wrap = E.wrap = function(fn, wrapper) {
            return function() {
                return wrapper.apply(this, [fn].concat(slice(arguments)));
            };
        };

        // note: not really pure.  Meant to keep side-effects from repeating.
        var once = E.once = function(fn) {
            var called = false, result;
            return function() {
                if (called) {return result;}
                called = true;
                return (result = fn.apply(this, arguments));
            }
        };

        // note: really only handles string and number parameters
        var memoize = E.memoize = function(fn) {
            var cache = {};
            return function() {
                var position = foldl(function(cache, arg) {return cache[arg] || (cache[arg] = {});}, cache,
                        slice(arguments, 0, arguments.length - 1));
                var arg = arguments[arguments.length - 1];
                return (position[arg] || (position[arg] = fn.apply(this, arguments)));
            };
        };

        return E;
    };

    return lib(function() {
        var EMPTY = [];
        return {
            EMPTY: EMPTY,
            isEmpty: function(arr) {
                return !arr || !arr.length;
            },
            prepend: function(el, arr) {
                return [el].concat(arr);
            },
            head: function(arr) {
                arr = arr || EMPTY;
                return (arr.length) ? arr[0] : EMPTY;
            },
            tail: function(arr) {
                arr = arr || EMPTY;
                return (arr.length > 1) ? arr.slice(1) : EMPTY;
            },
            isAtom: function(x) {
                return (x !== null) && (x !== undefined) && Object.prototype.toString.call(x) !== "[object Array]";
            }
        };
    }());
}));
