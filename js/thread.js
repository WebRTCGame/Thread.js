(function(global) {
  "use strict";
  // global = window

  /* this is a fragment of JSONfn plugin ( https://github.com/vkiryukhin/jsonfn ) */
  const _JSONfn = {
    stringify: function(obj) {
      return JSON.stringify(obj, function(key, value) {
        if (value instanceof Function || typeof value == 'function')
          return value.toString();
        if (value instanceof RegExp)
          return '_PxEgEr_' + value;
        return value;
      });
    }
  };

  const _buildObj = function(obj, fn, args, context, importFiles) {
    // the 4-th argument exist, but it is Array, which means
    // that this is a list of imported files.
    if (Array.isArray(context))
      obj.imprt = context;
    else if (context)
      obj.cntx = context;

    if (importFiles)
      obj.imprt = importFiles;
  };

  const _execPolyfill = function(fn, args, cb) {
    global.setTimeout((function(args) {
      return function() {
        cb(fn.apply(global, args));
      };
    })(args), 0);
  };

  function Thread() {

    var err;

    try {
      throw new Error();
    } catch (e) {
      err = e.stack;
    }

    if (err === undefined)
      this.path = '';
    else
      this.path = 'http' + err.split('http')[1].split('vkthread.js').slice(0, -1) + 'worker.js';

    if (!global.Worker) {
      this.exec = _execPolyfill;
    }

    this._JSONfn = {
      stringify: function(obj) {
        return JSON.stringify(obj, function(key, value) {
          if (value instanceof Function || typeof value == 'function')
            return value.toString();
          if (value instanceof RegExp)
            return '_PxEgEr_' + value;
          return value;
        });
      }
    };
  }

  /**
   *   Thread.exec() - Callback-style API function ( no dependency )
   *
   *   Execute function in the thread and process result in callback function.
   *
   *    @fn          - Function;  function to open in a thread;
   *    @args        - Array;     array of arguments for @fn;
   *    @cb          - Function;  callback function to process returned data;
   *    @context     - Object;    object which will be 'this' for @fn.
   *    @importFiles - Array of Strings;  list of files (with path), which @fn depends on.
   */
  Thread.prototype.exec = function(fn, args, cb, context, importFiles) {

    console.log(fn);

    var worker = {};

    var obj = {
      fn: fn,
      args: args,
      cntx: false,
      imprt: false
    };

    var workerWrap =
      "(" +
      (function() {
        "use strict";
        var JSONfn = {
          parse: function(str, date2obj) {
            var iso8061 = date2obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;
            return JSON.parse(str, function(key, value) {
              if (typeof value != "string") return value;
              if (value.length < 8) return value;
              if (iso8061 && value.match(iso8061)) return new Date(value);
              if (value.substring(0, 8) === "function") return eval("(" + value + ")");
              if (value.substring(0, 8) === "_PxEgEr_") return eval(value.slice(8));
              return value
            })
          }
        };
        self.onmessage = function(e) {
          var t = JSONfn.parse(e.data, true),
            n = t.cntx ? t.cntx : self;
          if (t.imprt) importScripts.apply(null, t.imprt);
          self.postMessage(t.fn.apply(n, t.args))
        }
      }).toString() + ")()";
    /*
        var fileBlob = new global.Blob([workerWrap], {
          "type": "text/javascript"
        });

        var UrlObj = global.URL.createObjectURL(new global.Blob([workerWrap], {
          "type": "text/javascript"
        }));
    */
    worker = new Worker(global.URL.createObjectURL(new global.Blob([workerWrap], {
      "type": "text/javascript"
    })));


    _buildObj(obj, fn, args, context, importFiles);

    worker.onmessage = function(oEvent) {
      cb(oEvent.data);
      worker.terminate();
    };

    worker.onerror = function(error) {
      cb(null, error.message);
      worker.terminate();
    };



    worker.postMessage(
      this._JSONfn.stringify(obj)
    );



  };

  global.Thread = new Thread();

})(self);


var fn = function(x, y)  {
  return x + y
};
console.log(fn(1, 3));

Thread.exec(fn, // function to execute in a thread
  [2, 3], // arguments for the function
  x => {
    console.log(x)
  }
);
