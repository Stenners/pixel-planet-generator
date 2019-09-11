// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/utils/perlin_noise.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function shuffle(array, rng) {
  var end = array.length - 1;
  var i;
  var temp;

  while (end > 0) {
    i = Math.round(rng.unit() * (end - 1));
    temp = array[end];
    array[end] = array[i];
    array[i] = temp;
    end--;
  }
} // Refactor to Class? 


function PerlinNoise(rng) {
  this.seed = rng.seed;
  this.permutation = new Array(256);
  this.p = new Array(512);

  for (var i = 0; i < 256; i++) {
    this.permutation[i] = i;
  }

  shuffle(this.permutation, rng);

  for (var i = 0; i < 256; i++) {
    this.p[i] = this.p[i + 256] = this.permutation[i];
  }
}

PerlinNoise.prototype = {
  noise: function noise(x, y, z) {
    var X = Math.floor(x) & 255;
    var Y = Math.floor(y) & 255;
    var Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    var u = this.fade(x);
    var v = this.fade(y);
    var w = this.fade(z);
    var A = this.p[X] + Y,
        AA = this.p[A] + Z,
        AB = this.p[A + 1] + Z,
        B = this.p[X + 1] + Y,
        BA = this.p[B] + Z,
        BB = this.p[B + 1] + Z;
    var result = this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)), this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))), this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)), this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    return result;
  },
  lerp: function lerp(t, a, b) {
    return a + t * (b - a);
  },
  fade: function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  },
  grad: function grad(hash, x, y, z) {
    var h = hash & 15;

    switch (h) {
      case 0:
        return x + y;

      case 1:
        return x - y;

      case 2:
        return -x + y;

      case 3:
        return -x - y;

      case 4:
        return x + z;

      case 5:
        return x - z;

      case 6:
        return -x + z;

      case 7:
        return -x - z;

      case 8:
        return y + z;

      case 9:
        return y - z;

      case 10:
        return -y + z;

      case 11:
        return -y - z;

      case 12:
        return x + y;

      case 13:
        return x - y;

      case 14:
        return -x + y;

      case 15:
        return -x - y;
    }
  }
};
var _default = PerlinNoise;
exports.default = _default;
},{}],"src/utils/rng.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RNG =
/*#__PURE__*/
function () {
  function RNG(seed) {
    _classCallCheck(this, RNG);

    this.seed = this.getSeed(seed) * 394875498754986; //394875498754986 could be any big number

    this.a = 16807;
    this.c = 0;
    this.m = Math.pow(2, 31) - 1;
  }

  _createClass(RNG, [{
    key: "getSeed",
    value: function getSeed(seed) {
      var s = 34737;

      for (var i = 0; i < seed.length; i++) {
        s += (i + 1) * seed.charCodeAt(i);
      }

      return s;
    }
  }, {
    key: "unit",
    value: function unit() {
      this.seed = (this.a * this.seed + this.c) % this.m;
      return this.seed / (this.m - 1);
    }
  }]);

  return RNG;
}();

var _default = RNG;
exports.default = _default;
},{}],"src/index.js":[function(require,module,exports) {
"use strict";

var _perlin_noise = _interopRequireDefault(require("./utils/perlin_noise"));

var _rng = _interopRequireDefault(require("./utils/rng"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ctx = document.getElementsByTagName("canvas")[0].getContext("2d");
var seedField = document.getElementById("seed_field");
var pixelSizeField = document.getElementById("pixelSize_field");
var randomButton = document.getElementById("random_btn");
var mouseDown = false;
var justReleasedMouse = false;
var mousePos = {
  x: 0,
  y: 0
};
var mouseDiff = {
  x: 0,
  y: 0
};
seedField.addEventListener("input", function (e) {
  generate(true);
});
pixelSizeField.addEventListener("input", function (e) {
  generate(false);
});
randomButton.addEventListener("click", function (e) {
  randomSeed();
});
window.addEventListener("mousedown", function (e) {
  mouseDown = true;
});
window.addEventListener("mouseup", function (e) {
  mouseDown = false;
  justReleasedMouse = true;
});
window.addEventListener("mousemove", function (e) {
  mouseDiff.x = e.clientX - mousePos.x;
  mouseDiff.y = e.clientY - mousePos.y;
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

function map(c, a1, a2, b1, b2) {
  return b1 + (c - a1) / (a2 - a1) * (b2 - b1);
}

function setColor(data, x, y, w, r, g, b, a, pixelSize) {
  pixelSize = pixelSize || 1;

  for (var xx = x; xx < x + pixelSize; xx++) {
    for (var yy = y; yy < y + pixelSize; yy++) {
      data[(xx + yy * w) * 4] = r;
      data[(xx + yy * w) * 4 + 1] = g;
      data[(xx + yy * w) * 4 + 2] = b;
      data[(xx + yy * w) * 4 + 3] = a;
    }
  }
}

function generateRedTypePlanet(n, texture_data, x, y, heightmap_width, pixelSize) {
  if (n < 150) {
    n = n < 110 ? 110 : n; //So the earth is not too dark

    setColor(texture_data, x, y, heightmap_width, n, Math.round(n * 0.6), Math.round(n / 2), n, pixelSize);
  } else if (n < 210) setColor(texture_data, x, y, heightmap_width, Math.round(n * 0.8), Math.round(n * 0.4), Math.round(n / 2), n, pixelSize);else setColor(texture_data, x, y, heightmap_width, n, Math.round(n / 2), Math.round(n / 3), n, pixelSize);
}

function generateEarthTypePlanet(n, texture_data, x, y, heightmap_width, pixelSize) {
  if (n < 140) {
    n = n < 70 ? 70 : n; //So the water is not too dark
    // setColor(texture_data, x, y, heightmap_width, 0, 0, n, n, pixelSize);

    setColor(texture_data, x, y, heightmap_width, 64, 166, 246, n, pixelSize);
  } // else if (n < 180) {
  //   // setColor(texture_data, x, y, heightmap_width, 214, 228, 189, n, pixelSize); 
  //    setColor(texture_data, x, y, heightmap_width, 167, 239, 112, n, pixelSize); 
  // } 
  else {
      // setColor(texture_data, x, y, heightmap_width, n, n, n, n, pixelSize);
      // setColor(texture_data, x, y, heightmap_width, 57, 183, 100, n, pixelSize);
      setColor(texture_data, x, y, heightmap_width, 167, 239, 112, n, pixelSize);
    }
}

function generateGasTypePlanet(n, texture_data, x, y, heightmap_width, pixelSize) {
  if (n < 210) {
    n = n < 120 ? 120 : n; //So the gas is not too dark

    setColor(texture_data, x, y, heightmap_width, Math.round(n / 3), Math.round(n / 2), n, n, pixelSize);
  } else setColor(texture_data, x, y, heightmap_width, Math.round(n / 3), Math.round(n * 0.6), n, n, pixelSize);
}

var rng;
var withAsteroids;
var asteroidColors = [[130, 72, 41], [96, 60, 39], [91, 73, 64]];
var asteroids;
var orbitRadius;
var orbitAngle;
var numAsteroids;
var orbitInclinationAngle;
var heightmap_width = 700;
var heightmap_height = 400;
var dphi = 0.0;
var planetRotationDiff;
var rotationMomentum = 0.0;
var radius = 100;
var planetType;
var RED_TYPE = 0,
    EARTH_TYPE = 1,
    GAS_TYPE = 2;
var noise;
var imageData = ctx.createImageData(heightmap_width, heightmap_height);
var texture_data = imageData.data;
var stars;
generate(false);

function randomSeed() {
  //Size of the seed between 1 and 20 character
  var n = Math.ceil(Math.random() * 20);
  var seed = "";

  for (var i = 0; i < n; i++) {
    //Concatenate a character form '!' (code 33) to '~' (code 126)
    seed += String.fromCharCode(Math.round(Math.random() * (126 - 33)) + 33);
  }

  seedField.value = seed;
  generate();
}

var id = null;

function generate(wait) {
  if (wait) {
    if (id !== null) window.clearTimeout(id);
    id = window.setTimeout(function () {
      generate(false);
    }, 300);
    return;
  }

  var seed = seedField.value;
  var rng = new _rng.default(seed);
  var pixelSize = parseInt(pixelSizeField.value) || 5;
  withAsteroids = false;

  if (rng.unit() < 0.5) {
    withAsteroids = true;
  }

  asteroids = [];
  var orbitRadiusInner = rng.unit() * 100 + 120;
  var orbitRadiusOuter = orbitRadiusInner + 50;
  var diffRadius = orbitRadiusOuter - orbitRadiusInner;
  orbitAngle = 0.0;
  numAsteroids = rng.unit() * 200 + 75;
  orbitInclinationAngle = -rng.unit() * Math.PI / 10.0;

  if (withAsteroids) {
    for (var a = 0; a < numAsteroids; a++) {
      var angle = rng.unit() * Math.PI * 2.0;
      var rad = orbitRadiusInner + rng.unit() * diffRadius;
      var x = rad * Math.cos(angle),
          y = (rng.unit() * 2.0 - 1.0) * 10.0,
          z = rad * Math.sin(angle),
          c = Math.round(rng.unit() * 2),
          size = Math.round(rng.unit() * 5 + 5);
      asteroids.push([x, y, z, angle, asteroidColors[c][0], asteroidColors[c][1], asteroidColors[c][2], size]);
    }
  }

  planetRotationDiff = rng.unit() * 0.03;
  noise = new _perlin_noise.default(new _rng.default(seed));
  planetType = Math.round(rng.unit() * 2);

  for (var x = 0; x < heightmap_width; x += pixelSize) {
    for (var y = 0; y < heightmap_height; y += pixelSize) {
      var phi = map(x, 0, heightmap_width - 1, 3.0 / 2.0 * Math.PI + dphi, -Math.PI / 2.0 + dphi),
          theta = map(y, 0, heightmap_height - 1, Math.PI, 0);
      var xx = radius * Math.abs(Math.sin(theta)) * Math.cos(phi),
          yy = radius * Math.cos(theta),
          zz = radius * Math.abs(Math.sin(theta)) * Math.sin(phi);
      var amplitude = 1.0,
          frequency = 0.014;
      var n = 0.0;

      for (var o = 0; o < 3; o++) {
        n += amplitude * noise.noise(xx * frequency, yy * frequency, zz * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }

      n += 1.0;
      n *= 0.5;
      n = Math.round(n * 255);

      if (planetType === RED_TYPE) {
        generateRedTypePlanet(n, texture_data, x, y, heightmap_width, pixelSize);
      } else if (planetType === EARTH_TYPE) {
        generateEarthTypePlanet(n, texture_data, x, y, heightmap_width, pixelSize);
      } else if (planetType === GAS_TYPE) {
        generateGasTypePlanet(n, texture_data, x, y, heightmap_width, pixelSize);
      }
    }
  }

  console.log(planetType); // stars = [];
  // for (var x = 0; x < 700; x++) {
  //   for (var y = 0; y < 700; y++) {
  //     var r = rng.unit();
  //     if (r < 0.0005) {
  //       stars.push([x, y]);
  //     }
  //   }
  // }

  ctx.putImageData(imageData, 0, 0);
}

animate(texture_data, radius);

function animate(texture_data, radius) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 700, 700);
  var w = heightmap_width,
      h = heightmap_height;
  var imageData = ctx.createImageData(700, 700);
  var data = imageData.data; //Draw space and stars
  // for (var x = 0; x < 700; x++) {
  //   for (var y = 0; y < 700; y++) {
  //     setColor(data, x, y, 700, 0, 0, 0, 255);
  //   }
  // }
  // for (var s = 0; s < stars.length; s++) {
  //   var star = stars[s];
  //   setColor(data, star[0], star[1], 700, 255, 255, 255, 255);
  // }

  if (withAsteroids) {
    var orbitAnglePerFrame = -0.03;
    var astXYZ = [];

    for (var a = 0; a < asteroids.length; a++) {
      var asteroid = asteroids[a];
      var astX = asteroid[0] * Math.cos(orbitAngle) - asteroid[2] * Math.sin(orbitAngle);
      var astZ = asteroid[0] * Math.sin(orbitAngle) + asteroid[2] * Math.cos(orbitAngle);
      astX = Math.round(astX) + 250;
      var astY = Math.round(asteroid[1] * Math.cos(orbitInclinationAngle) - astZ * Math.sin(orbitInclinationAngle)) + 250;
      astZ = Math.round(asteroid[1] * Math.sin(orbitInclinationAngle) + astZ * Math.cos(orbitInclinationAngle));
      astXYZ.push(astX, astY, astZ);
    }

    orbitAngle += orbitAnglePerFrame;

    for (var a = 0; a < astXYZ.length; a += 3) {
      if (astXYZ[a + 2] < 0) {
        setColor(data, astXYZ[a], astXYZ[a + 1], 700, asteroids[a / 3][4], asteroids[a / 3][5], asteroids[a / 3][6], 255, asteroids[a / 3][7]);
      }
    }
  }

  render_planet(data, texture_data, radius, w, h, 0, w, 3.0 / 2.0 * Math.PI, -Math.PI / 2.0); // render_planet(data, texture_data, radius, w, h, 0, Math.round(w/4), (3.0/2.0)*Math.PI, Math.PI);
  // render_planet(data, texture_data, radius, w, h, w-Math.round(w/4), w, 0, -Math.PI/2.0);
  // render_planet(data, texture_data, radius, w, h, Math.round(w/4), w-Math.round(w/4), Math.PI, 0);

  if (withAsteroids) {
    for (var a = 0; a < astXYZ.length; a += 3) {
      if (astXYZ[a + 2] >= 0) {
        setColor(data, astXYZ[a], astXYZ[a + 1], 700, asteroids[a / 3][4], asteroids[a / 3][5], asteroids[a / 3][6], 255, asteroids[a / 3][7]);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  dphi -= planetRotationDiff + rotationMomentum; //rotationMomentum *= 0.90;

  if (mouseDown) {
    dphi -= mouseDiff.x * 0.005;
  } // if(justReleasedMouse){
  // 	rotationMomentum = mouseDiff.x > 0 ? 1 : -1;
  // 	justReleasedMouse = false;
  // }


  window.requestAnimationFrame(function () {
    animate(texture_data, radius);
  });
}

function render_planet(canvas_data, texture_data, radius, w, h, x1, x2, angle1, angle2) {
  for (var x = x1; x < x2; x++) {
    for (var y = 0; y < h; y++) {
      var phi = map(x, x1, x2, angle1 + dphi, angle2 + dphi),
          theta = map(y, 0, h - 1, Math.PI, 0);
      var r = texture_data[(x + y * w) * 4],
          g = texture_data[(x + y * w) * 4 + 1],
          b = texture_data[(x + y * w) * 4 + 2],
          a = texture_data[(x + y * w) * 4 + 3];
      var rad = radius;
      var zz = rad * Math.abs(Math.sin(theta)) * Math.sin(phi),
          xx = Math.round(rad * Math.abs(Math.sin(theta)) * Math.cos(phi)) + 250,
          yy = Math.round(rad * Math.cos(theta)) + 250;

      if (zz >= 0) {
        setColor(canvas_data, xx, yy, 700, r, g, b, 255);
      }
    }
  }
}
},{"./utils/perlin_noise":"src/utils/perlin_noise.js","./utils/rng":"src/utils/rng.js"}],"node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "50934" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel/src/builtins/hmr-runtime.js","src/index.js"], null)
//# sourceMappingURL=/src.a2b27638.js.map