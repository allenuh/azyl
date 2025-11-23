import * as THREE from 'three';
import App from '../App';

export default class Environment{
    constructor() {
        this.app = new App();
        this.scene = this.app.scene;
        this.resources = this.app.resources;
        this.textureLoader = new THREE.TextureLoader();

        this.setEnvironment();
    }

    setEnvironment() {
        // this.scene.background = new THREE.Color(0xd8abee); // 0xf8cbee originally
        // this.scene.fog = new THREE.Fog( 0xb89bee, 10, 100 );

        // this.scene.background = new THREE.Color(0x990000); // red
        // this.scene.fog = new THREE.Fog( 0x660000, 20, 100 );
        
        // this.scene.background = new THREE.Color(0x44006b); // purple
        // this.scene.fog = new THREE.Fog( 0x25004e, 1, 100 );

        this.textureLoader.load("/src/assets/images/clear_sky.jpg", (jpgTexture) => {
            jpgTexture.colorSpace = THREE.SRGBColorSpace;
            let skySphereGeometry = new THREE.SphereGeometry(512, 60, 60);
            let skySphereMaterial = new THREE.MeshBasicMaterial({
                map: jpgTexture
            });

            skySphereMaterial.side = THREE.BackSide;
            let skySphereMesh = new THREE.Mesh(skySphereGeometry, skySphereMaterial);

            this.scene.add(skySphereMesh);
        },
        undefined,
        (error) => {
            console.error("Error loading texture:", error);
        });
    }
}