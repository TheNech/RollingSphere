// размеры поля
var PLANE_WIDTH = 60,
    PLANE_LENGTH = 1000,
    PADDING = PLANE_WIDTH / 5 * 2,
    BARIERS_COUNT = 10,
    SPEED = 10,
    INTERVAL = 1000,
    INTERVAL_COUNT = 0,
    SCORE = 0
    JUMP = false,
    X_JUMP = 1,
    COINS = 0,
    COINS_BALANCE = 0
    COINS_BALANCE_ROAD = 0;

//переменные
var axeshelper = {},
    camera = {},
    $container = {},
    controls = {},
    containerWidth = 0,
    containerHeight = 0,
    directionalLight = {},
    globalRenderID = {},
    hero = {},
    heroSpeed = 0.2,
    hemisphereLight = {},
    plane = {},
    planeGeometry = {},
    planeMaterial = {},
    planeTexture = {},
    barier = [], 
    powerupSpawnIntervalID = {},
    powerupCounterIntervalID = {},
    powerupSpeedCounterIntervalID = {},
    queue = {},
    renderer = {},
    scene = {},
    space = true,
    jumping = {},
    coins = [];

function render () {
  globalRenderID = requestAnimationFrame(render);

  barier.forEach( function ( element, index ) {
      animateConuses(barier[index]);
  });
  coins.forEach( function (element) {
    animateCoins(element);
  });
  animateHero();
  renderer.render(scene, camera);
}

function gameOver () {
  cancelAnimationFrame(globalRenderID);
  window.clearInterval(powerupSpawnIntervalID);
  window.clearInterval(powerupSpeedCounterIntervalID);
  window.clearInterval(jumping);  

  var end = Date.now();
  SCORE = Math.floor(SCORE / 100);
  socket.emit('game-over', { score: SCORE, coins: COINS,  time: end - start });  
  
  $('#modalBoxResult').modal('show');
  document.getElementById('score').style.visibility = "hidden";
  document.getElementById('coins').style.visibility = "hidden";
  document.getElementById('mainScreenTop').style.visibility = "visible";

  $('#modalBoxResult p:nth-child(1)').text("Score: " + SCORE);
  $('#modalBoxResult p:nth-child(2)').text("Coins: " + COINS);
  $('#modalBoxResult p:nth-child(3)').text("Time: " + Math.floor((end - start) / 1000) + 's');  

  socket.on('update-top-score', function (data) {             

    var arrTop = [];
    for (var i = 0; i < data.scores.length; i++) {
      arrTop[i] = data.scores[i];
    }

    arrTop.sort(function (a, b) {
      return a.score - b.score;
    });
  
    arrTop.reverse();

    for (var i = 0; i < arrTop.length; i++) {
      $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(1)').text(i + 1);
      $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(2)').text(arrTop[i].user);
      $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3)').text(arrTop[i].score);
    }
  });

  if (SCORE > bestscore) {
    bestscore = SCORE;
  }
  Coins += COINS;
  time += (end - start);

  $('#btn-OK').one('click', function () {

    $('#modalBoxResult').modal('hide');
    $('#mainScreen').fadeIn(50);
    document.getElementById('mainScreen').style.position = "absolute"; 

    $('#mainScreenStatistic p:nth-child(2)').text('Best score: ' + bestscore);
    $('#mainScreenStatistic p:nth-child(3)').text('Coins: ' + Coins);
    $('#mainScreenStatistic p:nth-child(4)').text('Total time: ' + Math.floor(time / 1000) + 's');    

  });  

  $('#btn-restart').one('click', function () {
    
    resetValues();
    $('#modalBoxResult').modal('hide');
    document.getElementById('score').style.visibility = "visible";
    document.getElementById('coins').style.visibility = "visible";
    $('#score p').text("Score: " + SCORE);
    $('#coins p').text("Coins: " + COINS);

    render();
    startBarierLogic();
    start = Date.now();

  });
}

function resetValues () {
  barier.forEach(function (element, index) {
    scene.remove(barier[index]);
  });
  coins.forEach(function (element, index) {
    scene.remove(coins[index]);
  });
  barier = [];
  hero.position.x = 0;
  hero.position.y = 3;
  INTERVAL = 1000;
  SCORE = 0;
  JUMP = false;
  X_JUMP = 0.25;
  heroSpeed = 0.2;
  COINS = 0;
  COINS_BALANCE = 0;
  COINS_BALANCE_ROAD = 0;
  coins = [];  
}

function onWindowResize () {
  containerWidth = $container.innerWidth();
  containerHeight = $container.innerHeight();
  camera.aspect = containerWidth / containerHeight;
  camera.updateProjectionMatrix();
  renderer.clear();
  renderer.setSize(containerWidth, containerHeight);
}

function Hero () {
  var hero = {},
      heroGeometry = {},
      heroMaterial = {},
      heroTexrute = {};

  heroGeometry = new THREE.SphereGeometry(2, 32, 32);
  heroTexrute = new THREE.TextureLoader().load('/texture/ball.jpg');
  heroMaterial = new THREE.MeshBasicMaterial({map: heroTexrute});
  hero = new THREE.Mesh(heroGeometry, heroMaterial);
  hero.castShadow = true;
  hero.position.set(0, 3, (PLANE_LENGTH / 2 + 2));

  window.addEventListener('keydown', function (event) {
    if((event.keyCode === 65 || event.keyCode === 37) && hero.position.x !== -20) {
      hero.position.x -= 20;
    } else if((event.keyCode === 68 || event.keyCode === 39) && hero.position.x !== 20) {
      hero.position.x += 20;
    } else if((event.keyCode === 87 || event.keyCode === 38)) {
      if(!JUMP)
        jumpHero();
    }
  });

  return hero;
}

function animateHero () {
  hero.rotation.x -= heroSpeed;
}

function jumpHero () {
  JUMP = true;
  X_JUMP = 0.25;

  jumping = setInterval(function() {
    hero.position.y = 3 + (-0.61111 * X_JUMP * X_JUMP + 3.6667 * X_JUMP);
    if(X_JUMP === 6) {
      hero.position.y =3;
      clearInterval(jumping);
      hero.position.y = 3;
      JUMP = false;
    } else {
      X_JUMP += 0.25;
    } 
  }, 15);
}

function createLandscapeFloors () {
  var planeLeft = {},
      planeLeftGeometry = {},
      planeLeftMaterial = {},
      planeRight = {};

  planeLeftGeometry = new THREE.BoxGeometry(PLANE_WIDTH, PLANE_LENGTH + PLANE_LENGTH / 10, 1);
  planeLeftMaterial = new THREE.MeshLambertMaterial({color:0x808080});
  planeLeft = new THREE.Mesh(planeLeftGeometry, planeLeftMaterial);
  planeLeft.receiveShadow = true;
  planeLeft.x = 1.570;
  planeLeft.rotation.x = -PLANE_WIDTH;
  planeLeft.position.y = 1;

  planeRight = planeLeft.clone();
  planeRight.position.x = PLANE_WIDTH;

  scene.add(planeLeft, planeRight);
}

function createSpotlights () {
  var spotLight = {},
      target = {},
      targetGeometry = {},
      targetMaterial = {};

  for(var i = 0; i < 5; i++) {
    targetGeometry = new THREE.BoxGeometry(1, 1, 1);
    targetMaterial = new THREE.MeshNormalMaterial();
    target = new THREE.Mesh(targetGeometry, targetMaterial);
    target.position.set(0, 2, (i * PLANE_LENGTH / 5) - (PLANE_LENGTH / 2.5));
    target.visible = false;
    scene.add(target);

    spotLight = new THREE.SpotLight(0xFFFFFF, 2);
    spotLight.position.set(150, (i * PLANE_LENGTH / 5) - (PLANE_LENGTH / 2.5), -200);
    spotLight.castShadow = true;
    spotLight.shadow.camera.near.shadowCameraNear = 10;
    //spotLight.shadowCameraVisible = false;
    spotLight.target = target;
    spotLight.shadow.mapSize.width.shadowMapWidth = 2048;
    spotLight.shadow.mapSize.height.shadowMapHeight = 2048;
    spotLight.fov = 40;

    // var helper = new THREE.CameraHelper(spotLight.shadow.camera);
    // scene.add(helper);

    plane.add(spotLight);
  }
}

var Conuses = function () {

  this.mesh = new THREE.Object3D();

  var objectGeometry = new THREE.CylinderGeometry(0, 2.5, 4, 11);
  var objectMaterial = new THREE.MeshLambertMaterial({color: 0x29B6F6/*, shading: THREE.FlatShading*/});

  //create 1st conus
  var con1 = new THREE.Mesh(objectGeometry, objectMaterial);
  con1.position.x = - 7.5;
  con1.castShadow = true;
  con1.receiveShadow = true;
  this.mesh.add(con1);

  //create 2nd conus
  var con2 = new THREE.Mesh(objectGeometry, objectMaterial);
  con2.position.x = - 2.5;
  con2.castShadow = true;
  con2.receiveShadow = true;
  this.mesh.add(con2);

  //create 3rd conus
  var con3 = new THREE.Mesh(objectGeometry, objectMaterial);
  con3.position.x = 2.5;
  con3.castShadow = true;
  con3.receiveShadow = true;
  this.mesh.add(con3);

  //create 4th conus
  var con4 = new THREE.Mesh(objectGeometry, objectMaterial);
  con4.position.x = 7.5;
  con4.castShadow = true;
  con4.receiveShadow = true;
  this.mesh.add(con4);

  //create coin
  if(COINS_BALANCE >= 3) {
    COINS_BALANCE = 0;
    objectGeometry = new THREE.CylinderGeometry(2, 2, 1, 20);
    objectMaterial = new THREE.MeshLambertMaterial({color: 0xFFD700/*, shading: THREE.FlatShading*/});
    var coin = new THREE.Mesh(objectGeometry, objectMaterial);
    coin.position.x = 0;
    coin.position.y = 4.25;
    coin.rotation.x = 1.5;
    this.mesh.add(coin);
  }
};

function getRandomInteger( min, max ) {
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function animateConuses(conus) { 
  conus.position.z += SPEED;
  conus.children.forEach(function (element, index) {
    if(element.children.length > 4) {
      element.children[element.children.length - 1].rotation.z += 0.1;
    }
  });

  if(conus.position.z + 2 == hero.position.z - 2) {

    conus.children.forEach(function (element, index) {
      
      if(element.position.x == hero.position.x) {
        if(hero.position.y < (conus.position.y + 4)) {  
         gameOver();
        } 
        else if(element.children.length > 4) {
          element.children.pop();
          COINS++;
          $('#coins p').text("Coins: " + COINS);
        }    
      }

    });

    return;
  }
  if(conus.position.z > PLANE_LENGTH / 2 + PLANE_LENGTH / 10) {
    scene.remove(barier[0]);
    barier.shift();
  }

  SCORE += SPEED;

  $('#score p').text("Score: " + Math.floor(SCORE / 100));
}

var boxConuses = function (number) {
  this.mesh = new THREE.Object3D();
  this.mesh.position.y = 3;
  this.mesh.position.z = (-PLANE_LENGTH / 2) - 2;
  this.mesh.position.x = 0;

  if(number === 1) {
    COINS_BALANCE++;
    var cons;
    cons = new Conuses();
    cons.mesh.position.x = 20 * getRandomInteger(-1, 1);
    this.mesh.add(cons.mesh);
  }
  if(number === 2) {
    COINS_BALANCE++;
    var barPos = [-1, 0, 1];
    var pos = getRandomInteger(0, barPos.length - 1);
    var con1 = new Conuses();

    con1.mesh.position.x = 20 * barPos[pos];
    this.mesh.add(con1.mesh);
    barPos.splice(pos, 1);

    pos = getRandomInteger(0, barPos.length - 1);
    var con2 = new Conuses();
    con2.mesh.position.x = 20 * barPos[pos];
    this.mesh.add(con2.mesh);
  }
}

function conusesGenerate() {
  if(getRandomInteger(1, 2) === 1) {
    var box = new boxConuses(1);
    barier.push(box.mesh);
    scene.add(box.mesh);
  } 
  else {
    var box = new boxConuses(2);
    barier.push(box.mesh);
    scene.add(box.mesh);
  }

  if((getRandomInteger(1, 5) == 1)) {
    var pos = getRandomInteger(-1, 1);
    coinsGenerate(pos, 90);
    // if (INTERVAL > 500) {
    //   var pos = getRandomInteger(-1, 1);
    //   coinsGenerate(pos, 90);
    // } else {
    //   var pos = getRandomInteger(-1, 1);
    //   coinsGenerate(pos, 70);
    // }
  }

}

function coinsGenerate(pos, delta) {
  this.mesh = new THREE.Object3D();
  this.mesh.position.y = 3;
  this.mesh.position.x = 20 * pos;
  this.mesh.position.z = (-PLANE_LENGTH / 2) - 70 - delta;
  var objectGeometry = new THREE.CylinderGeometry(2, 2, 1, 20);
  var objectMaterial = new THREE.MeshLambertMaterial({color: 0xFFD700/*, shading: THREE.FlatShading*/});
  var coin = new THREE.Mesh(objectGeometry, objectMaterial);
  coin.position.y = 0;
  coin.rotation.x = 1.5;
  this.mesh.add(coin);
  coins.push(this.mesh);
  scene.add(this.mesh);
}

function animateCoins(coin) {
  coin.position.z += SPEED;
  coin.rotation.y -= 0.1;

  if((coin.position.z == hero.position.z - 2) && (coin.position.x == hero.position.x) && (hero.position.y <= coin.position.y + 1)) {
    COINS++;
    $('#coins p').text("Coins: " + COINS);
    scene.remove(coins[0]);
    coins.shift();
  }
  if(coin.position.z > PLANE_LENGTH / 2 + PLANE_LENGTH / 10) {
    scene.remove(coins[0]);
    coins.shift();
  }
}

function startBarierLogic () {
  //var period = 1000;
  powerupSpawnIntervalID = window.setInterval(conusesGenerate, INTERVAL);

  //window.clearInterval(powerupSpawnIntervalID);

  powerupSpeedCounterIntervalID = window.setInterval(function() {
    if(INTERVAL > 500){
      INTERVAL -= 100;
      heroSpeed += 0.05;

      window.clearInterval(powerupSpawnIntervalID);
      //console.log(INTERVAL);
      powerupSpawnIntervalID = window.setInterval(conusesGenerate, INTERVAL);
    }       
    
  }, 5000);
}

function initGame () {
  THREE.ImageUtils.crossOrigin = '';

  $container = $('#container');
  containerWidth = $container.innerWidth();
  containerHeight = $container.innerHeight();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(containerWidth, containerHeight);
  renderer.antialias = true;
  renderer.setClearColor( 0xFFFFFF, 1 );
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  $container.get(0).appendChild(renderer.domElement);

  scene = new THREE.Scene();
  axeshelper = new THREE.AxesHelper(PLANE_LENGTH / 2);

  camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 1, 3000);
  camera.position.set(0, PLANE_LENGTH / 100, PLANE_LENGTH / 2 + PLANE_LENGTH / 20);

  controls = new THREE.OrbitControls(camera, $container.get(0));
  controls.enableKeys = false;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.enableRotate = false;
  controls.minPolarAngle = 1.55;
  controls.maxPolarAngle = 1.55;
  controls.minAzimuteAngle = 0;
  controls.maxAzimuteAngle = 0;
  
  planeGeometry = new THREE.BoxGeometry(PLANE_WIDTH, PLANE_LENGTH + PLANE_LENGTH / 10, 1);
  planeTexture = new THREE.TextureLoader().load('/texture/asphalt.jpg');
  planeMaterial = new THREE.MeshBasicMaterial({map: planeTexture});
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = 1.570;
  plane.receiveShadow = true;

  //createLandscapeFloors();

  createSpotlights();
  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
  directionalLight.position.set(0, 1, 0);
  hemisphereLight = new THREE.HemisphereLight(0xFFB74D, 0x37474F, 1);
  hemisphereLight.position.y = 500;


  startBarierLogic();
  hero = new Hero();

  scene.add(camera, directionalLight, hemisphereLight, plane, hero)
}

function runGame () {
  window.addEventListener( 'resize', onWindowResize );
  render();
  onWindowResize();
}

$('#overlay-start').fadeIn(100);

var start;
function startGame () {
  $('#mainScreen').fadeOut(50);
  document.getElementById('score').style.visibility = "visible";
  document.getElementById('coins').style.visibility = "visible";

  initGame();
  runGame();

  start = Date.now();
}

var firstGame = true;
$('#btnStartGame').on('click', function () {
  if (firstGame) {
    firstGame = false;
    startGame();
  } else {
    resetValues();
    $('#btn-restart').unbind('click');
    $('#modalBoxResult').modal('hide');
    document.getElementById('score').style.visibility = "visible";
    document.getElementById('coins').style.visibility = "visible";
    $('#score p').text("Score: " + SCORE);
    $('#coins p').text("Coins: " + COINS);

    $('#mainScreen').fadeOut(50);

    render();
    startBarierLogic();
    start = Date.now(); 
  }
});