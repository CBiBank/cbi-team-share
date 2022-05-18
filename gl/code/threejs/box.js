
// import * as THREE from 'three'
import * as THREE from './three.js'

 // 初始化场景
 const scene = new THREE.Scene()
 // 初始化相机（透视相机）
 const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
// 初始化渲染器
 const renderer = new THREE.WebGLRenderer()

 renderer.setSize(window.innerWidth, window.innerHeight)

 renderer.setClearColor(new THREE.Color(0x000000))
// 正方形
 const boxGeometry = new THREE.BoxGeometry(300, 300, 300)
 const boxMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, })
 const box = new THREE.Mesh(boxGeometry, boxMaterial)
 scene.add(box)
// 球体
const sphereGeometry = new THREE.SphereGeometry(100, 40, 40);
 sphereGeometry.scale(-1,1,1)
// const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff })
new THREE.TextureLoader().load('./imgs/football.jpg', (sphereTexture) => {
    const sphereMaterial = new THREE.MeshLambertMaterial({ map: sphereTexture })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.position.set(300,0,0)
    scene.add(sphere)
    
    const ambientLight = new THREE.AmbientLight(0xffffff)
    
    scene.add(ambientLight)
    
    const pointLight = new THREE.PointLight()
    
    pointLight.position.set(400, 400, 400)
    scene.add(pointLight)
    camera.position.set(400,400,400)
    camera.lookAt(scene.position)
    renderer.render(scene, camera)
    animate()

    function animate () {
        rotateSphere()
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
    }
    
    function rotateSphere () {
        sphere.rotation.x += 0.01
        sphere.rotation.y += 0.01
    }
    
})






 


 document.body.appendChild(renderer.domElement)


 
