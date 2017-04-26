// размеры поля
var PLANE_WIDTH = 50,
    PLANE_LENGTH = 1000,
    PADDING = PLANE_WIDTH / 5 * 2;

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
    powerup = {}, 
    powerups = [],
    powerupSpawnIntervalID = {},
    powerupCounterIntervalID = {},
    queue = {},
    renderer = {},
    scene = {};

function render () {
  globalRenderID = requestAnimationFrame(render);

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
    spotLight.shadowCameraNear = 10;
    spotLight.shadowCameraVisible = false;
    spotLight.target = target;
    spotLight.shadowMapWidth = 2048;
    spotLight.shadowMapHeight = 2048;
    spotLight.fov = 40;

    plane.add(spotLight);
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
  camera.position.set(0, PLANE_LENGTH / 125, PLANE_LENGTH / 2 + PLANE_LENGTH / 25);

  control = new THREE.OrbitControls(camera, $container.get(0));
  controls.noKeys = true;
  controls.noPan = true;
  controls.noZoom = true;
  controls.minPolarAngle = 1.55;
  controls.maxPolarAngle = 1.55;
  controls.minAzimuteAngle = 0;
  controls.maxAzimuteAngle = 0;

  planeGeometry = new THREE.BoxGeometry(PLANE_WIDTH, PLANE_LENGTH + PLANE_LENGTH / 10, 1);
  planeMaterial = new THREE.MeshLambertMaterial({color: 0x808080});
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = 1.570;
  plane.receiveShadow = true;

  createLandscapeFloors();

  createSpotlights();
  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
  directionalLight.position.set(0, 1, 0);
  hemisphereLight = new THREE.hemisphereLight(0xFFB74D, 0x37474F, 1);
  hemisphereLight.position.y = 500;

  scene.add(camera, directionalLight, hemisphereLight, plane);
}

function runGame () {
  window.addEventListener( 'resize', onWindowResize );
  render();
  onWindowResize();
}
	
initGame();
runGame();