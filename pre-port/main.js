import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"; // To move the camera in the scrren
import gsap from 'gsap'

// Control panel options
const gui = new dat.GUI()
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50
  }
}

// Changing the width of the plane using control panel
gui.add(world.plane, 'width', 1, 500).onChange(generatePlane)

// Changing the height of the plane using control panel
gui.add(world.plane, 'height', 1, 500).onChange(generatePlane)

// Changing the width segments of the plane using control panel
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)

// Changing the height segments of the plane using control panel
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)

// Function to add options the control panel
function generatePlane() {
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  )

  // Vertice position randomization
  const {array} = planeMesh.geometry.attributes.position
  const randomValues = [] // empty array
  for(let i = 0; i < array.length; i++) {

    if (i % 3 == 0){
      const x = array[i]
      const y = array[i + 1]
      const z = array[i + 2]
      

      array[i] = x + (Math.random() - 0.5) * 3     // To alter the x position
      array[i + 1] = y + (Math.random() - 0.5) * 3 // To alter the y position
      array[i + 2] = z + (Math.random() -0.5) * 3  // To add more depth to the plane
    }

    randomValues.push(Math.random() * Math.PI * 2)
  }

  planeMesh.geometry.attributes.position.randomValues = randomValues
  planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array

  const colors = []
  for(let i = 0; i < planeMesh.geometry.attributes.position.count; i++ ) {
    colors.push(0, .19, .4)
  }

  planeMesh.geometry.setAttribute(
    'color', 
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  )


}

const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, innerWidth/innerHeight, 0.1, 1000)
const renderer =  new THREE.WebGLRenderer()

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio) 
document.body.appendChild(renderer.domElement)

// To add a box geometry
/*
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF})
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(boxMesh)
*/

new OrbitControls(camera, renderer.domElement)
camera.position.z = 50

// To add a plane geometry
const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments 
)

const planeMaterial = new THREE.MeshPhongMaterial( {
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
   vertexColors: true
  }
)
const planeMesh = new THREE.Mesh( planeGeometry, planeMaterial )
scene.add( planeMesh )
generatePlane()


// to make light in front of camera
const light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(0, 1, 1)
scene.add(light)

// to make back light 
const backLight = new THREE.DirectionalLight(0xFFFFFF, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)

const mouse = {
  x: undefined,
  y: undefined
}

let frame = 0
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  /* This code to make the box move
  boxMesh.rotation.x += 0.01
  boxMesh.rotation.y += 0.01
  boxMesh.rotation.z += 0.01
  */
  // planeMesh.rotation.x += 0.01 // to make the plane move

  // To make the coordinates move in animation
  frame += 0.01
  const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    // x coordinate
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01

    // y coordinate
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.001
  }

  planeMesh.geometry.attributes.position.needsUpdate = true

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(planeMesh)

  if(intersects.length > 0) {
    const {color} = intersects[0].object.geometry.attributes

    // Vertice 1
    color.setX(intersects[0].face.a, 0.1)
    color.setY(intersects[0].face.a, 0.5)
    color.setZ(intersects[0].face.a, 1)

    // Vertice 2
    color.setX(intersects[0].face.b, 0.1)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 1)

    // Vertice 3
    color.setX(intersects[0].face.c, 0.1)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 1)
    intersects[0].object.geometry.attributes.color.needsUpdate = true

    const initialColor ={
      r: 0,
      g: .19,
      b: .4
    }

    const hoverColor ={
      r: 0.1,
      g: .5,
      b: 1
    }
    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)
    
        // Vertice 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)
    
        // Vertice 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)

        color.needsUpdate = true
      }
    })
  }
}

animate()

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = mouse.y = -(event.clientY / innerHeight) * 2 + 1
})