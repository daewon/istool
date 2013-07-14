(function hi(exports) {
  "use stric";

  // utility functions for hi.js (inner function)
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
  hi.curry = function(/* arguments */) {
    var fn = head(arguments), args = tail(arguments);
    return function() {
      return fn.apply(fn, args.concat(slice.call(arguments)));
    };
  };
  
  hi.partial = function(/* arguments */) {
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
  // used with hi.pluck
  hi.compareBy = function(f) {
    f = f || hi.id ; 
    return function(a, b) {
      return f(a) - f(b) ;
    };
  };

  // assign value to object
  hi.assign = function(sProp, v) {
    var _arguments = sProp.indexOf('.' > -1) ? sProp.split('.') : [sProp];
    return function(e) {
      if (_arguments.length === 1) {
        e[sProp] = v;
        return v;
      } else {
        var keys = init(_arguments), key = last(_arguments);
        hi.pluck.apply(keys, keys)(e)[key] = v;
        return v;
      }
    };
  };

  // > and

  // predicate and composition
  var and = hi.and = function(/* args */) {
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

  // > or

  // predicate or composition
  var or = hi.or = function(/* args */) {
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
  hi.not = function(f) {
    return function(/* arguments */) {
      return !f.apply(f, arguments);
    };
  };

  // f -> f
  hi.eq = function(src) {
    return function(target) {
      return src === target;
    };
  };
  
  // f -> f
  hi.ne = function(src) {
    return function(target) {
      return src !== target;
    };
  };

  // any -> true
  hi['true'] = function() {
    return true;
  };
  
  // any -> true
  hi['false'] = function() {
    return true;
  };

  hi.even = function(n) {
    return n % 2 == 0;
  };

  hi.odd = function(n) {
    return n % 2 != 0;
  };

  // identity
  hi.id = function(_) {
    return _;
  };

  // function composition
  // f* -> f
  hi.comp = function(/* arguments */) {
    var arg = copy(arguments).reverse(), h = shift.call(arg), t = arg;
    
    return function() {
      var ret = h.apply(arguments, arguments);
      each(t, function(f) { ret = f.call(f, ret); });
      return ret;
    };
  };



  // > pluck
  // pluck from object elements
  hi.pluck = function(sProp) {
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

  hi.invokeWith = function(sProp, obj) {
    return function() {
      return obj[sProp].apply(obj, arguments);
    };
  };

  // invoke method from object 
  hi.invoke = function(/* arguments */) {
    var _arguments = copy(arguments) ;

    return function(a) {
      var p = _arguments[0] ;
      var _f = a[p] ;
      return a[p].apply(a, tail(_arguments));
    };
  };

  // [log_exp](ttp://help.sap.com/abapdocu_70/en/ABENLOGEXP_ANY_OPERAND.htm)
  var eq2 = hi.eq2 = function(a, b) { return a === b; };
  var ne2 = hi.ne2 = function(a, b) { return a !== b; };
  var lt2 = hi.lt2 = function(a, b) { return a < b; };
  var gt2 = hi.gt2 = function(a, b) { return a > b; };
  var le2 = hi.le2 = function(a, b) { return a <= b; };
  var ge2 = hi.g22 = function(a, b) { return a >= b; };

  var op = function(o, b) {
    return hi.curry(o, b);
  };

  // > eq, ne, lt, gt, le, ge
  var eq = hi.eq = hi.curry(op, eq2);
  var ne = hi.ne = hi.curry(op, ne2);
  var lt = hi.lt = hi.curry(op, lt2);
  var gt = hi.gt = hi.curry(op, gt2);
  var le = hi.le = hi.curry(op, le2);
  var ge = hi.ge = hi.curry(op, ge2);

  var propOp = function(op) {
    var args = tail(arguments);
    var match = last(args), keys = init(args);

    return function(el) {
      return op(hi.pluck.apply(el, keys)(el), match);
    };
  };

  var propOp2 = function(op2, sKey) {
    return function(a, b) {
      var elA = hi.pluck(sKey)(a), elB = hi.pluck(sKey)(b);
      return op2(elA, elB);
    };
  };

  var invokeOp = function(op) {
    var args = tail(arguments);
    var match = last(args), keys = init(args);

    return function(el) {
      return op(hi.pluck.apply(el, keys)(el)(), match);
    };
  };

  var invokeOp2 = function(op2, sKey) {
    return function(a, b) {
      var elA = hi.pluck(sKey)(a)(), elB = hi.pluck(sKey)(b)();
      return op2(elA, elB);
    };
  };
  
  // > peq, pne, plt, pgt, ple, pge  
  hi.ieq = hi.curry(invokeOp, eq2);  
  hi.ieq2 = hi.curry(invokeOp2, eq2);  
  hi.peq = hi.curry(propOp, eq2);
  hi.peq2 = hi.curry(propOp2, eq2);
  
  hi.ine = hi.curry(invokeOp, ne2);
  hi.ine2 = hi.curry(invokeOp2, ne2);
  hi.pne = hi.curry(propOp, ne2);
  hi.pne2 = hi.curry(propOp2, ne2);

  hi.ilt = hi.curry(invokeOp, lt2);
  hi.ilt2 = hi.curry(invokeOp2, lt2);
  hi.plt = hi.curry(propOp, lt2);
  hi.plt2 = hi.curry(propOp2, lt2);

  hi.igt = hi.curry(invokeOp, gt2);
  hi.igt2 = hi.curry(invokeOp2, gt2);
  hi.pgt = hi.curry(propOp, gt2);
  hi.pgt2 = hi.curry(propOp2, gt2);

  hi.ile = hi.curry(invokeOp, le2);
  hi.ile2 = hi.curry(invokeOp2, le2);
  hi.ple = hi.curry(propOp, le2);
  hi.ple2 = hi.curry(propOp2, le2);

  hi.ige = hi.curry(invokeOp, ge2);
  hi.ige2 = hi.curry(invokeOp2, ge2);
  hi.pge = hi.curry(propOp, ge2);
  hi.pge2 = hi.curry(propOp2, ge2);
  
  // support amd module
  if (typeof define === "function" && define.amd) {
    define("hi", [], function() { return hi; } );
  } else {
    for (var key in hi) {
      if (hasOwnProperty.call(hi, key)) {
        exports[key] = hi[key];
      }
    }
  }
  
})(typeof exports !== 'undefined' ? exports : window );
