import PerlinNoise from './utils/perlin_noise';
import RNG from './utils/rng';

var ctx = document.getElementsByTagName("canvas")[0].getContext("2d");
var seedField = document.getElementById("seed_field");
var pixelSizeField = document.getElementById("pixelSize_field");
var randomButton = document.getElementById("random_btn");

var mouseDown = false;
var justReleasedMouse = false;
var mousePos = { x: 0, y: 0 };
var mouseDiff = { x: 0, y: 0 };

seedField.addEventListener("input", function (e) {
  generate(true);
});

pixelSizeField.addEventListener("input", function (e) {
  generate(false);
});

randomButton.addEventListener("click", function (e) {
  randomSeed()
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
  return b1 + ((c - a1) / (a2 - a1)) * (b2 - b1);
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
    n = n < 110 ? 110 : n;	//So the earth is not too dark
    setColor(texture_data, x, y, heightmap_width, n, Math.round(n * 0.6), Math.round(n / 2), n, pixelSize);
  } else if (n < 210)
    setColor(texture_data, x, y, heightmap_width, Math.round(n * 0.8), Math.round(n * 0.4), Math.round(n / 2), n, pixelSize);
  else
    setColor(texture_data, x, y, heightmap_width, n, Math.round(n / 2), Math.round(n / 3), n, pixelSize);
}

function generateEarthTypePlanet(n, texture_data, x, y, heightmap_width, pixelSize) {
  if (n < 140) {
    n = n < 70 ? 70 : n;	//So the water is not too dark
    // setColor(texture_data, x, y, heightmap_width, 0, 0, n, n, pixelSize);
    setColor(texture_data, x, y, heightmap_width, 64, 166, 246, n, pixelSize);
  }
  // else if (n < 180) {
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
    n = n < 120 ? 120 : n;	//So the gas is not too dark
    setColor(texture_data, x, y, heightmap_width, Math.round(n / 3), Math.round(n / 2), n, n, pixelSize);
  }
  else
    setColor(texture_data, x, y, heightmap_width, Math.round(n / 3), Math.round(n * 0.6), n, n, pixelSize);
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
var RED_TYPE = 0, EARTH_TYPE = 1, GAS_TYPE = 2;
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
    if (id !== null)
      window.clearTimeout(id);

    id = window.setTimeout(function () {
      generate(false);
    }, 300);

    return;
  }

  const seed = seedField.value;
  const rng = new RNG(seed);
  const pixelSize = parseInt(pixelSizeField.value) || 5;

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
  noise = new PerlinNoise(new RNG(seed));

  planetType = Math.round(rng.unit() * 2);

  for (var x = 0; x < heightmap_width; x += pixelSize) {
    for (var y = 0; y < heightmap_height; y += pixelSize) {
      var phi = map(x, 0, heightmap_width - 1, (3.0 / 2.0) * Math.PI + dphi, -Math.PI / 2.0 + dphi),
        theta = map(y, 0, heightmap_height - 1, Math.PI, 0);
      var xx = radius * Math.abs(Math.sin(theta)) * Math.cos(phi),
        yy = radius * Math.cos(theta),
        zz = radius * Math.abs(Math.sin(theta)) * Math.sin(phi);

      var amplitude = 1.0, frequency = 0.014;

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

  console.log(planetType);
  // stars = [];
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
  var data = imageData.data;

  //Draw space and stars
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

  render_planet(data, texture_data, radius, w, h, 0, w, (3.0 / 2.0) * Math.PI, -Math.PI / 2.0);
  // render_planet(data, texture_data, radius, w, h, 0, Math.round(w/4), (3.0/2.0)*Math.PI, Math.PI);
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

  dphi -= planetRotationDiff + rotationMomentum;
  //rotationMomentum *= 0.90;
  if (mouseDown) {
    dphi -= mouseDiff.x * 0.005;
  }
  // if(justReleasedMouse){
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