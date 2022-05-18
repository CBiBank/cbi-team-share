// npm i three -S
// 显示包体积 大小 extension -> import cost
import * as THREE from 'three'

const { Scene, PerspectiveCamera, BoxGeometry, WebGLRenderer, TextureLoader, MeshLambertMaterial, Mesh, Color, AmbientLight, DirectionalLight } = THREE



function main () {
  // 可视角度
  const FOV = 75
  const WINDOW_WIDTH = window.innerWidth
  const WINDOW_HEIGHT = window.innerHeight
  const ASPECT = WINDOW_WIDTH / WINDOW_HEIGHT
  
  
  const scene = new Scene()
       scene.castShadow = true
  const camera = new PerspectiveCamera(FOV,ASPECT, 0.1, 1000)

        camera.position.set(320, 320, 320)
  
  // const planeGeometry = new PlaneGeometry(500, 500)

  // const planeMaterial = new MeshLambertMaterial({ color: 0xeeeeee })

  // const plane = new Mesh(planeGeometry,planeMaterial )

  // plane.position.set(100, 100, 0)

  // plane.rotation.x = Math.PI / 8

  // scene.add(plane)

        

  
  new TextureLoader().load('https://img2.baidu.com/it/u=4171937707,4141510649&fm=253&fmt=auto&app=138&f=JPEG?w=567&h=378', (texture)=> {
    const boxMaterial = new MeshLambertMaterial({ map: texture })
    const boxGeometry = new BoxGeometry(200, 200, 200, 200, 200)

    const box = new Mesh(boxGeometry, boxMaterial)
          box.castShadow = true
  
    scene.add(box)
  
    const ambientLight = new AmbientLight(new Color(0xffffff))
  
    scene.add(ambientLight)
  
    const directionalLight = new DirectionalLight(0xffff00, 1)
         directionalLight.position.set(250, 250, 250)
  
    scene.add(directionalLight)
  
    camera.lookAt(scene.position)
    const renderer = new WebGLRenderer({ antialias: true })
    renderer.setClearColor(0xeeeeee)
    renderer.shadowMapEnabled = true


renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT)

document.body.appendChild(renderer.domElement)


function animate() {
 box.rotation.y += 0.01
 requestAnimationFrame(animate)
 renderer.render(scene, camera)
}

animate()

  })







}


main()
