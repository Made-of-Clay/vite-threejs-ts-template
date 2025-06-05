import { AmbientLight, PointLight } from 'three'

export function getLights() {
  const ambientLight = new AmbientLight('white', 0.4)
  const pointLight = new PointLight('white', 20, 100)
  pointLight.position.set(-2, 2, 2)
  pointLight.castShadow = true
  pointLight.shadow.radius = 4
  pointLight.shadow.camera.near = 0.1
  pointLight.shadow.camera.far = 1000
  pointLight.shadow.mapSize.width = 2048
  pointLight.shadow.mapSize.height = 2048

  return { ambientLight, pointLight }
}