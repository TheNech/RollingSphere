// размеры поля
var PLANE_WIDTH = 60,
    PLANE_LENGTH = 1000,
    PADDING = PLANE_WIDTH / 5 * 2;
    BARIERS_COUNT = 10;

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
    queue = {},
    renderer = {},
    scene = {};

function render () {
  globalRenderID = requestAnimationFrame(render);
  
  barier.forEach( function ( element, index ) {
      animateConuses(barier[index]);
  });



  renderer.render(scene, camera);
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
  hero.position.set(0, 5, (PLANE_LENGTH / 2));

  window.addEventListener('keydown', function () {
    if((event.keyCode === 65 || event.keyCode === 37) && hero.position.x !== -(PLANE_WIDTH - PADDING) / 2) {
      hero.position.x -= (PLANE_WIDTH - PADDING) / 2;
    } else if((event.keyCode === 68 || event.keyCode === 39) && hero.position.x !== (PLANE_WIDTH - PADDING) / 2) {
      hero.position.x += (PLANE_WIDTH - PADDING) / 2;
    }
  });

  return hero;
}

function detectCollisions(objects) {
  
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

/*function Barier (centerPos, zPos) {
  var bar1 = {},
      bar2 = {},
      bar3 = {},
      bar4 = {},
      objectDimension = 0,
      objectGeometry = {},
      objectMaterial = {},
      xPosition = 0,
      xPositionValues = [],
      yPosition = 0,
      yPositionValues = [],
      zPosition = 0,
      zPositionValues = [],
      setOfBariers = [];

  objectDimension = 2;

  xPositionValues = [centerPos - 7.5, centerPos - 2.5, centerPos + 2.5, centerPos + 7.5];
  yPositionValues = [objectDimension];
  zPositionValues = [-(PLANE_LENGTH - PADDING) / 2];

  objectGeometry = new THREE.CylinderGeometry(0, 2.5, 4, 11);
  objectMaterial = new THREE.MeshLambertMaterial({
    color: 0x29B6F6, 
    shading: THREE.FlatShading
    });
  
  bar1 = new THREE.Mesh(objectGeometry, objectMaterial);
  bar2 = new THREE.Mesh(objectGeometry, objectMaterial);
  bar3 = new THREE.Mesh(objectGeometry, objectMaterial);
  bar4 = new THREE.Mesh(objectGeometry, objectMaterial);

  yPosition = 3;
  zPosition = zPos;

  bar1.castShadow = true;
  bar1.receiveShadow = true;
  bar2.castShadow = true;
  bar2.receiveShadow = true;
  bar3.castShadow = true;
  bar3.receiveShadow = true;
  bar4.castShadow = true;
  bar4.receiveShadow = true;

  xPosition = xPositionValues[0];
  bar1.position.set(xPosition, yPosition, zPosition);

  xPosition = xPositionValues[1];
  bar2.position.set(xPosition, yPosition, zPosition);

  xPosition = xPositionValues[2];
  bar3.position.set(xPosition, yPosition, zPosition);

  xPosition = xPositionValues[3];
  bar4.position.set(xPosition, yPosition, zPosition);

  // setOfBariers.push(bar1, bar2, bar3, bar4);

  scene.add(bar1, bar2, bar3, bar4);
  // scene.add(setOfBariers[0], setOfBariers[1], setOfBariers[2], setOfBariers[3]);
  // return setOfBariers;
}*/

var Conuses = function () {

  this.mesh = new THREE.Object3D();
  
  this.mesh.position.y = 3;
  this.mesh.position.z = 400/*PLANE_LENGTH / 2*/;

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
  conus.position.z += 5;
  if(conus.position.z > PLANE_LENGTH / 2 + PLANE_LENGTH / 10)
    barier.shift();
}
function startBarierLogic () {
  
  powerupSpawnIntervalID = window.setInterval(function() {
    if(barier.length < BARIERS_COUNT) {
      var cons;
      cons = new Conuses();
      cons.mesh.position.x = 20 * getRandomInteger(-1, 1);
      cons.mesh.position.z = -(PLANE_LENGTH / 2);
      barier.push(cons.mesh);
      scene.add(cons.mesh);
    }
  }, 2000)

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
  camera.position.set(0, PLANE_LENGTH / 100, PLANE_LENGTH / 2 + PLANE_LENGTH / 25);

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