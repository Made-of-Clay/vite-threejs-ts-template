import GUI from 'lil-gui'
import {
  AxesHelper,
  Clock,
  GridHelper,
  LoadingManager,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLightHelper,
  Scene,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'stats.js'
import * as animations from './helpers/animations'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'
import { getDemoObjects } from './getDemoObjects'
import { getLights } from './getLights'

let clock: Clock
let stats: Stats
let gui: GUI

const animation = { enabled: true, play: true }

// ===== 🖼️ CANVAS, RENDERER, & SCENE =====
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
const scene = new Scene()

  // ===== 👨🏻‍💼 LOADING MANAGER =====
const loadingManager = new LoadingManager(console.log, console.log, console.error)

const { ambientLight, pointLight } = getLights()
scene.add(ambientLight)
scene.add(pointLight)

const { cube, plane } = getDemoObjects();
scene.add(cube)
scene.add(plane)

// ===== 🎥 CAMERA =====
const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(2, 2, 5)

// ===== 🕹️ CONTROLS =====
const cameraControls = new OrbitControls(camera, canvas)
cameraControls.target = cube.position.clone()
cameraControls.enableDamping = true
cameraControls.autoRotate = false
cameraControls.update()

// ===== 🪄 HELPERS =====
const axesHelper = new AxesHelper(4)
axesHelper.visible = false
scene.add(axesHelper)

const pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
pointLightHelper.visible = false
scene.add(pointLightHelper)

const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
gridHelper.position.y = -0.01
scene.add(gridHelper)

// ===== 📈 STATS & CLOCK =====
{
  clock = new Clock()
  stats = new Stats()
  document.body.appendChild(stats.dom)
}

// TODO consider initializing gui earlier and passing in as DI to getter functions
// ==== 🐞 DEBUG GUI ====
gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

const cubeOneFolder = gui.addFolder('Cube one')

cubeOneFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x')
cubeOneFolder
  .add(cube.position, 'y')
  .min(-5)
  .max(5)
  .step(1)
  .name('pos y')
  .onChange(() => (animation.play = false))
  .onFinishChange(() => (animation.play = true))
cubeOneFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z')

cubeOneFolder.add(cube.material as MeshStandardMaterial, 'wireframe')
cubeOneFolder.addColor(cube.material as MeshStandardMaterial, 'color')
cubeOneFolder.add(cube.material as MeshStandardMaterial, 'metalness', 0, 1, 0.1)
cubeOneFolder.add(cube.material as MeshStandardMaterial, 'roughness', 0, 1, 0.1)

cubeOneFolder
  .add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
  .name('rotate x')
cubeOneFolder
  .add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
  .name('rotate y')
  .onChange(() => (animation.play = false))
  .onFinishChange(() => (animation.play = true))
cubeOneFolder
  .add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
  .name('rotate z')

cubeOneFolder.add(animation, 'enabled').name('animated')

const lightsFolder = gui.addFolder('Lights')
lightsFolder.add(pointLight, 'visible').name('point light')
lightsFolder.add(ambientLight, 'visible').name('ambient light')

const helpersFolder = gui.addFolder('Helpers')
helpersFolder.add(axesHelper, 'visible').name('axes')
helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(cameraControls, 'autoRotate')

// persist GUI state in local storage on changes
gui.onFinishChange(() => {
  const guiState = gui.save()
  localStorage.setItem('guiState', JSON.stringify(guiState))
})

// load GUI state if available in local storage
const guiState = localStorage.getItem('guiState')
if (guiState) gui.load(JSON.parse(guiState))

// reset GUI state button
const resetGui = () => {
  localStorage.removeItem('guiState')
  gui.reset()
}
gui.add({ resetGui }, 'resetGui').name('RESET')

gui.close()

function animate() {
  requestAnimationFrame(animate)

  stats.begin()
  if (animation.enabled && animation.play) {
    animations.rotate(cube, clock, Math.PI / 3)
    animations.bounce(cube, clock, 1, 0.5, 0.5)
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  renderer.render(scene, camera)
  stats.end()
}

animate();
