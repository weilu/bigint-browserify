var jsbn = require('jsbn');
var Buffer = require('buffer').Buffer;

var bigint = module.exports = function(int, base) {
  var n = new BigNum(int, base);
  n.constructor = BigNum;
  return n;
};

function BigNum(str, base) {
  if (str && str._jsbn) {
    this._jsbn = str._jsbn;
  } else {
    if (typeof str === 'number') {
      str = str.toString();
    }

    if (str.match(/e\+/)) { // positive exponent
      if (!Number(str).toString().match(/e+/)) {
        str = Math.floor(Number(str)).toString();
      } else {
        var pow = Math.ceil(Math.log(str) / Math.log(2))
        var n = (str / Math.pow(2, pow)).toString(2)
          .replace(/^0/, '')
        var i = n.length - n.indexOf('.')
        n = n.replace(/\./, '')

        for (; i <= pow; i++) n += '0'
        str = n;
        base = 2;
      }
    } else if (str.match(/e\-/)) { // negative exponent
      str = Math.floor(Number(str)).toString();
    }

    this._jsbn = new jsbn(str, base || 10);
  }
}

function fromJsbn(n) {
  var bi = new BigNum(0);
  bi._jsbn = n;
  bi.constructor = BigNum;
  return bi;
}

BigNum.prototype = {
  powm: function(a, b) {
    if (!a._jsbn) a = new BigNum(a);
    if (!b._jsbn) b = new BigNum(b);
    return fromJsbn(this._jsbn.modPow(a._jsbn, b._jsbn));
  },
  pow: function(a) {
    if (this._jsbn.equals(jsbn.ZERO)) {
      return fromJsbn(jsbn.ZERO);
    }
    if (!a._jsbn) a = new BigNum(a);
    return fromJsbn(this._jsbn.pow(a._jsbn));
  },
  eq: function(a) {
    if (!a._jsbn) a = new BigNum(a);
    return this._jsbn.equals(a._jsbn);
  },
  ne: function(a) {
    if (!a._jsbn) a = new BigNum(a);
    return !this._jsbn.equals(a._jsbn);
  },
  cmp: function(a) {
    if (!a._jsbn) a = new BigNum(a);
    return this._jsbn.compareTo(a._jsbn);
  },
  gt: function(a) {
    return this.cmp(a) > 0;
  },
  ge: function(a) {
    return this.cmp(a) >= 0;
  },
  lt: function(a) {
    return this.cmp(a) < 0;
  },
  le: function(a) {
    return this.cmp(a) <= 0;
  },
  abs: function() {
    return fromJsbn(this._jsbn.abs());
  },
  neg: function() {
    return fromJsbn(this._jsbn.negate());
  },
  isbitset: function(i) {
    return this._jsbn.testBit(i)
  },
  bitLength: function() {
    return this._jsbn.bitLength();
  },
  toBuffer: function() {
    var hex = this._jsbn.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    return new Buffer(hex, 'hex');
  },
  toString: function(base) {
    return this._jsbn.toString(base);
  },
  toNumber: function(){
    return parseInt(this._jsbn.toString());
  },
  mod: function(a) {
    if (!a._jsbn) a = new BigNum(a);
    if (this._jsbn.compareTo(jsbn.ZERO) < 0 && a._jsbn.compareTo(jsbn.ZERO) < 0) {
      return fromJsbn(this._jsbn.abs().mod(a._jsbn.abs()).negate());
    } else {
      return fromJsbn(this._jsbn.mod(a._jsbn));
    }
  },
};

var binOps = {
  add: 'add',
  sub: 'subtract',
  mul: 'multiply',
  div: 'divide',
  invertm: 'modInverse',
  xor: 'xor',
  and: 'and',
  or: 'or',
  gcd: 'gcd',
  shiftLeft: 'shiftLeft',
  shiftRight: 'shiftRight'
};

Object.keys(binOps).forEach(function(op) {
  BigNum.prototype[op] = function (a) {
    if (!a._jsbn) a = new BigNum(a);
    return fromJsbn(this._jsbn[binOps[op]](a._jsbn));
  };
});

bigint.fromBuffer = function(buffer) {
  var n = new BigNum(buffer.toString('hex'), 16);
  n.constructor = BigNum;
  return n;
};

Object.keys(BigNum.prototype).forEach(function (name) {
    if (name === 'inspect' || name === 'toString') return;

    bigint[name] = function (num) {
        var args = [].slice.call(arguments, 1);

        if (num._jsbn) {
            return num[name].apply(num, args);
        }
        else {
            var bigi = new BigNum(num);
            return bigi[name].apply(bigi, args);
        }
    };
});
