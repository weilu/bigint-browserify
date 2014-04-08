var test = require("tape");

var bigint = require('bignum');
var bigintB = require('../');

var a = 'deadbeefcafe';
var b = 'dead';
var c = 'beef';

function assertSame(name, fn) {
  test(name, function(t) {
    t.plan(1);
    fn(bigint, function(err, expected) {
      fn(bigintB, function(err, actual) {
        t.equal(actual, expected);
        t.end();
      })
    })
  })
}

// basic

test('implicit base', function(t) {
  t.ok(bigintB(42));
  t.end();
});

// operations

['add', 'sub', 'mul', 'div', 'mod', 'invertm',
  'xor', 'and', 'powm', 'shiftLeft', 'shiftRight']
.forEach(function(name) {
  assertSame(name, function(bigint, cb) {
    var ba = bigint(a, 16);
    var bb = bigint(b, 16);
    var bc = bigint(c, 16);
    cb(null, ba[name](bb, bc).toBuffer().toString('hex'));
  });

  assertSame('bigint.' + name, function(bigint, cb) {
    var ba = bigint(a, 16);
    var bb = bigint(b, 16);
    var bc = bigint(c, 16);
    cb(null, bigint[name](ba, bb, bc).toBuffer().toString('hex'));
  });
});

// slow operations: use smaller numbers

assertSame('pow', function(bigint, cb) {
  var bb = bigint(b, 16);
  var bc = bigint(c, 16);
  cb(null, bb.pow(bc).toBuffer().toString('hex'));
});

// operations that does not take arguments
// also test on negative values

['abs', 'neg'].forEach(function(name) {
  assertSame(name, function(bigint, cb) {
    var ba = bigint(a, 16);
    cb(null, ba[name]().toString(16));
  });

  assertSame('bigint.' + name, function(bigint, cb) {
    var ba = bigint(a, 16).neg();
    cb(null, bigint[name](ba).toString(16));
  });
});

// additional method

for(var i=0; i<(a.lenth*4); i++) {
  assertSame('isbitset', function(bigint, cb) {
    var ba = bigint(a, 16);
    cb(null, ba.isbitset(i));
  });
}

// comparisons

assertSame('eq', function(bigint, cb) {
  var ba = bigint(a, 16);
  var bb = bigint(b, 16);
  cb(null, ba.eq(bb) && ba.eq(ba));
});

['cmp', 'gt', 'ge', 'lt', 'le']
.forEach(function(name) {
  assertSame(name, function(bigint, cb) {
    var ba = bigint(a, 16);
    var bb = bigint(b, 16);
    cb(null, ba[name](bb) && bb[name](ba) && ba[name](ba));
  });

  assertSame('bigint.' + name, function(bigint, cb) {
    var ba = bigint(a, 16);
    var bb = bigint(b, 16);
    cb(null, bigint[name](ba, bb) && bigint[name](bb, ba) && bigint[name](ba, ba));
  });
});

// misc

assertSame('bitLength', function(bigint, cb) {
  var ba = bigint(a, 16);
  cb(null, ba.bitLength());
});

assertSame('toBuffer', function(bigint, cb) {
  var ba = bigint(a, 16);
  cb(null, ba.toBuffer().toString('hex'));
});

assertSame('fromBuffer', function(bigint, cb) {
  var ba = bigint(a, 16);
  cb(null, bigint.fromBuffer(ba.toBuffer()).toString(16));
});
