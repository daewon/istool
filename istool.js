(function is(exports) {
  "use stric";

  // utility functions for is.js (inner function)
  var slice = Array.prototype.slice;
  var unshift = Array.prototype.unshift;
  var shift = Array.prototype.shift;
  var call = Function.prototype.call;
  var apply = Function.prototype.apply;
  var hasOwnProperty = Object.prototype.hasOwnProperty ;
  var tail = function(seq) { return slice.call(seq, 1); };
  var init = function(seq) { return slice.call(seq, 0, -1); };
  var head = function(seq) { return seq[0]; };
  var last = function(seq) { return seq[seq.length -1]; };
  var copy = function(seq) { return slice.call(seq); };
  var each = function(obj, f, context) {
    if (obj.length) {
      for (var i=0, l = obj.length; i < l; i++) {
        f.call(context, obj[i], i, obj) ;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          f.call( context, obj[key], key, obj) ;
        }
      }
    }
  };

  // curry & partial
  // from: http://ejohn.org/blog/partial-functions-in-javascript/a
  is.curry = function(/* arguments */) {
    var fn = head(arguments), args = tail(arguments);
    return function() {
      return fn.apply(fn, args.concat(slice.call(arguments)));
    };
  };

  is.partial = function(/* arguments */) {
    var fn = head(arguments), args = tail(arguments);
    return function() {
      var arg = 0;
      for (var i=0; i < args.length && arg < arguments.length; i++) {
        if (args[i] === undefined) {
          args[i] = arguments[arg++];
        }
      }
      return fn.apply(fn, args);
    };
  };

  // make comparer func
  // f -> f
  // used with is.pluck
  is.compareBy = function(f) {
    f = f || is.id ;
    return function(a, b) {
      return f(a) - f(b) ;
    };
  };

  // assign value to object
  is.assign = function(sProp, v) {
    var _arguments = sProp.indexOf('.' > -1) ? sProp.split('.') : [sProp];
    return function(e) {
      if (_arguments.length === 1) {
        e[sProp] = v;
        return v;
      } else {
        var keys = init(_arguments), key = last(_arguments);
        is.pluck.apply(keys, keys)(e)[key] = v;
        return v;
      }
    };
  };

  // predicate and composition
  is.and = function(/* args */) {
    var _arguments = slice.call(arguments);
    return function(el) {
      for (var i=0, len=_arguments.length; i < len; i++) {
        if (!_arguments[i](el)) {
          return false;
        }
      }

      return true;
    };
  };

  // predicate or composition
  is.or = function(/* args */) {
    var _arguments = slice.call(arguments);

    return function(el) {
      for (var i=0, len=_arguments.length; i < len; i++) {
        if (_arguments[i](el)) {
          return true;
        }
      }

      return false;
    };
  };

  // f -> f
  is.not = function(f) {
    return function(/* arguments */) {
      return !f.apply(f, arguments);
    };
  };

  // f -> f
  is.eq = function(src) {
    return function(target) {
      return src === target;
    };
  };

  // f -> f
  is.ne = function(src) {
    return function(target) {
      return src !== target;
    };
  };

  // any -> true
  is['true'] = function() {
    return true;
  };

  // any -> true
  is['false'] = function() {
    return true;
  };

  is.even = function(n) {
    return n % 2 == 0;
  };

  is.odd = function(n) {
    return n % 2 != 0;
  };

  // identity
  is.id = function(_) {
    return _;
  };

  // function composition
  // f* -> f
  is.comp = function(/* arguments */) {
    var arg = copy(arguments).reverse(), h = shift.call(arg), t = arg;

    return function() {
      var ret = h.apply(arguments, arguments);
      each(t, function(f) { ret = f.call(f, ret); });
      return ret;
    };
  };

  // pluck from object elements
  is.pluck = function(sProp) {
    var _arguments = sProp.indexOf('.' > -1) ? sProp.split('.') : [sProp];

    return function(obj) {
      var args = _arguments ;
      var prop = args.shift();

      while (!(prop === null || typeof prop === "undefined")) {
        obj = obj[prop];
        prop = args.shift();
      }

      return obj;
    };
  };

  is.invokeWith = function(sProp, obj) {
    return function() {
      return obj[sProp].apply(obj, arguments);
    };
  };

  // invoke method from object
  is.invoke = function(/* arguments */) {
    var _arguments = copy(arguments) ;

    return function(a) {
      var p = _arguments[0] ;
      var _f = a[p] ;
      return a[p].apply(a, tail(_arguments));
    };
  };

  // [log_exp](ttp://help.sap.com/abapdocu_70/en/ABENLOGEXP_ANY_OPERAND.htm)
  var eq2 = is.eq2 = function(a, b) { return a === b; };
  var ne2 = is.ne2 = function(a, b) { return a !== b; };
  var lt2 = is.lt2 = function(a, b) { return a < b; };
  var gt2 = is.gt2 = function(a, b) { return a > b; };
  var le2 = is.le2 = function(a, b) { return a <= b; };
  var ge2 = is.g22 = function(a, b) { return a >= b; };

  var op = function(o, b) {
    return is.curry(o, b);
  };

  // > eq, ne, lt, gt, le, ge
  is.eq = is.curry(op, eq2);
  is.ne = is.curry(op, ne2);
  is.lt = is.curry(op, lt2);
  is.gt = is.curry(op, gt2);
  is.le = is.curry(op, le2);
  is.ge = is.curry(op, ge2);

  var propOp = function(op) {
    var args = tail(arguments);
    var match = last(args), keys = init(args);

    return function(el) {
      return op(is.pluck.apply(el, keys)(el), match);
    };
  };

  var propOp2 = function(op2, sKey) {
    return function(a, b) {
      var elA = is.pluck(sKey)(a), elB = is.pluck(sKey)(b);
      return op2(elA, elB);
    };
  };

  var invokeOp = function(op) {
    var args = tail(arguments);
    var match = last(args), keys = init(args);

    return function(el) {
      return op(is.pluck.apply(el, keys)(el)(), match);
    };
  };

  var invokeOp2 = function(op2, sKey) {
    return function(a, b) {
      var elA = is.pluck(sKey)(a)(), elB = is.pluck(sKey)(b)();
      return op2(elA, elB);
    };
  };

  // > peq, pne, plt, pgt, ple, pge
  is.ieq = is.curry(invokeOp, eq2);
  is.ieq2 = is.curry(invokeOp2, eq2);
  is.peq = is.curry(propOp, eq2);
  is.peq2 = is.curry(propOp2, eq2);

  is.ine = is.curry(invokeOp, ne2);
  is.ine2 = is.curry(invokeOp2, ne2);
  is.pne = is.curry(propOp, ne2);
  is.pne2 = is.curry(propOp2, ne2);

  is.ilt = is.curry(invokeOp, lt2);
  is.ilt2 = is.curry(invokeOp2, lt2);
  is.plt = is.curry(propOp, lt2);
  is.plt2 = is.curry(propOp2, lt2);

  is.igt = is.curry(invokeOp, gt2);
  is.igt2 = is.curry(invokeOp2, gt2);
  is.pgt = is.curry(propOp, gt2);
  is.pgt2 = is.curry(propOp2, gt2);

  is.ile = is.curry(invokeOp, le2);
  is.ile2 = is.curry(invokeOp2, le2);
  is.ple = is.curry(propOp, le2);
  is.ple2 = is.curry(propOp2, le2);

  is.ige = is.curry(invokeOp, ge2);
  is.ige2 = is.curry(invokeOp2, ge2);
  is.pge = is.curry(propOp, ge2);
  is.pge2 = is.curry(propOp2, ge2);

  // support amd module
  if (typeof define === "function" && define.amd) {
    define("is", [], function() { return is; } );
  } else {
    for (var key in is) {
      if (hasOwnProperty.call(is, key)) {
        exports[key] = is[key];
      }
    }
  }

})(typeof exports !== 'undefined' ? exports : window );
