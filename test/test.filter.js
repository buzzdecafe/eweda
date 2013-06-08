var assert = require("assert");
var eweda = require("./../eweda");

describe('filter', function() {
    var filter = eweda.filter;
    var even = function(x) {return !(x % 2);};

    it('should reduce an array to those matching a filter', function() {
        assert.deepEqual(filter(even, [1, 2, 3, 4, 5]), [2, 4]);
    });

    it('should be automatically curried', function() {
        var onlyEven = filter(even);
        assert.deepEqual(onlyEven([1, 2, 3,4, 5, 6, 7]), [2, 4, 6]);
    });
});

describe('reject', function() {
    var reject = eweda.reject;
    var even = function(x) {return !(x % 2);};

    it('should reduce an array to those not matching a filter', function() {
        assert.deepEqual(reject(even, [1, 2, 3, 4, 5]), [1, 3, 5]);
    });

    it('should be automatically curried', function() {
        var odd = reject(even);
        assert.deepEqual(odd([1, 2, 3,4, 5, 6, 7]), [1, 3, 5, 7]);
    });
});

describe('take', function() {
    var take = eweda.take;

    it('should take only the first `n` elements from a list', function() {
        assert.deepEqual(take(3, ['a', 'b', 'c', 'd', 'e', 'f', 'g']), ['a', 'b', 'c']);
    });

    it('should be automatically curried', function() {
        var take3 = take(3);
        assert.deepEqual(take3(['a', 'b', 'c', 'd', 'e', 'f', 'g']), ['a', 'b', 'c']);
        assert.deepEqual(take3(['w', 'x', 'y', 'z']), ['w', 'x', 'y']);

    });
});

describe('takeWhile', function() {
    var takeWhile = eweda.takeWhile;

    it('should continue taking elements while the function reports `true`', function() {
        assert.deepEqual(takeWhile(function(x) {return x != 5;}, [1, 3, 5, 7, 9]), [ 1, 3]);
    });
});

describe('skip', function() {
    var skip = eweda.skip;

    it('should skip the first `n` elements from a list, returning the remainder', function() {
        assert.deepEqual(skip(3, ['a', 'b', 'c', 'd', 'e', 'f', 'g']), ['d', 'e', 'f', 'g']);
    });

    it('should be automatically curried', function() {
        var skip2 = skip(2);
        assert.deepEqual(skip2(['a', 'b', 'c', 'd', 'e']), ['c', 'd', 'e']);
        assert.deepEqual(skip2(['x', 'y', 'z']), ['z']);
    });

    it('should be aliased by `drop`', function() {
        assert.deepEqual(eweda.drop(1, ['a', 'b', 'c']), ['b', 'c']);
        assert.strictEqual(eweda.drop, skip);
    });
});