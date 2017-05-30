// размеры поля
var PLANE_WIDTH = 60,
    PLANE_LENGTH = 1000,
    PADDING = PLANE_WIDTH / 5 * 2,
    BARIERS_COUNT = 10,
    SPEED = 10,
    INTERVAL = 1000,
    INTERVAL_COUNT = 0,
    SCORE = 0;

//переменные
var axishelper = {},
    camera = {},
    $container = {},
    controls = {},
    containerWidth = 0,
    containerHeight = 0,
    directionalLight = {},
    globalRenderID = {},
    hero = {},
    hemisphereLight = {},
    plane = {},
    planeGeometry = {},
    planeMaterial = {},
    barier = [], 
    // bariers = [],
    powerupSpawnIntervalID = {},
    powerupCounterIntervalID = {},
    powerupSpeedCounterIntervalID = {},
    queue = {},
    renderer = {},
    scene = {};

function render () {
  globalRenderID = requestAnimationFrame(render);
  
  barier.forEach( function ( element, index ) {
      // if(barier[index + 1] && barier[index].position.z == barier[index + 1].position.z) {
      //   animateTwoConuses(barier[index], barier[index + 1]);
      //   index++;
      // } else 
      animateConuses(barier[index]);
  });
  //console.log(barier.length);
  renderer.render(scene, camera);
}

function gameOver () {
  cancelAnimationFrame(globalRenderID);
  window.clearInterval(powerupSpawnIntervalID);
  window.clearInterval(powerupSpeedCounterIntervalID);

  $('#overlay-gameover').fadeIn(100);
  $('.message-container p:nth-child(2)').text("Score: " + Math.floor(SCORE / 100));
  $('#score p').fadeOut(50);

  $('#btn-restart').one('click', function () {
    $('#overlay-gameover').fadeOut(50);
    barier.forEach(function (element, index) {
      scene.remove(barier[index]);
    });
    barier = [];
    hero.position.x = 0;
    render();
    INTERVAL = 1000;
    SCORE = 0;
    startBarierLogic();
  });
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
      heroMaterial = {};

  heroGeometry = new THREE.SphereGeometry(2, 32, 32);
  heroMaterial = new THREE.MeshNormalMaterial();
  hero = new THREE.Mesh(heroGeometry, heroMaterial);
  hero.castShadow = true;
  hero.position.set(0, 3, (PLANE_LENGTH / 2));

  window.addEventListener('keydown', function () {
    if((event.keyCode === 65 || event.keyCode === 37) && hero.position.x !== -20) {
      hero.position.x -= 20;
    } else if((event.keyCode === 68 || event.keyCode === 39) && hero.position.x !== 20) {
      hero.position.x += 20;
    }
  });

  return hero;
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
  
  this.mesh.position.y = 3;
  this.mesh.position.z = -PLANE_LENGTH / 2;

  var objectGeometry = new THREE.CylinderGeometry(0, 2.5, 4, 11);
  var objectMaterial = new THREE.MeshLambertMaterial({color: 0x29B6F6, shading: THREE.FlatShading});

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
};

function getRandomInteger( min, max ) {
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function animateConuses(conus) {
  conus.position.z += SPEED;
  if(conus.position.z == hero.position.z && conus.position.x == hero.position.x) {
    //console.log('столкновение');
    gameOver();
    return;
  }
  if(conus.position.z > PLANE_LENGTH / 2 + PLANE_LENGTH / 10)
    barier.shift();

  SCORE += SPEED;

  $('#score p').text("Score: " + Math.floor(SCORE / 100));
}

function animateTwoConuses(conus1, conus2) {
  conus1.position.z += SPEED;
  conus2.position.z += SPEED;
  if(conus1.position.z == hero.position.z && (conus1.position.x == hero.position.x || conus2.position.x == hero.position.x))
      gameOver();
  if(conus1.position.z > PLANE_LENGTH / 2 + PLANE_LENGTH / 10) {
    barier.shift();
    barier.shift();
  }
}

function conusesGenerate() {
  if(getRandomInteger(1, 2) === 1) {
      var cons;
      cons = new Conuses();
      cons.mesh.position.x = 20 * getRandomInteger(-1, 1);
      barier.push(cons.mesh);
      scene.add(cons.mesh);
    } else {
      var barPos = [-1, 0, 1];
      var pos = getRandomInteger(0, barPos.length - 1);
      var con1;
      con1 = new Conuses();
      con1.mesh.position.x = 20 * barPos[pos];
      barier.push(con1.mesh);
      barPos.splice(pos, 1);

      pos = getRandomInteger(0, barPos.length - 1);
      var con2;
      con2 = new Conuses();
      con2.mesh.position.x = 20 * barPos[pos];
      barier.push(con2.mesh);

      scene.add(con1.mesh, con2.mesh);


      }
    //console.log(barier.length);
}
function startBarierLogic () {
  //var period = 1000;
  powerupSpawnIntervalID = window.setInterval(conusesGenerate, INTERVAL);

  //window.clearInterval(powerupSpawnIntervalID);

  powerupSpeedCounterIntervalID = window.setInterval(function() {
    if(INTERVAL > 500){
      INTERVAL -= 100;
      window.clearInterval(powerupSpawnIntervalID);
      console.log(INTERVAL);
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
  axishelper = new THREE.AxisHelper(PLANE_LENGTH / 2);

  camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 1, 3000);
  camera.position.set(0, PLANE_LENGTH / 100, PLANE_LENGTH / 2 + PLANE_LENGTH / 20);

  controls = new THREE.OrbitControls(camera, $container.get(0));
  controls.enableKeys = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = false;
  controls.minPolarAngle = 1.55;
  controls.maxPolarAngle = 1.55;
  controls.minAzimuteAngle = 0;
  controls.maxAzimuteAngle = 0;
  
  planeGeometry = new THREE.BoxGeometry(PLANE_WIDTH, PLANE_LENGTH + PLANE_LENGTH / 10, 1);
  planeMaterial = new THREE.MeshBasicMaterial({color: 0x808080});
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
	
initGame();
runGame();