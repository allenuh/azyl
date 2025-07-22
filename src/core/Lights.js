import * as THREE from 'three';
import App from '../App';

export default class Lights {
    constructor(){
        this.app = new App();
        this.scene = this.app.scene;

        this.hemiLight = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
        this.hemiLight.position.set(2, 1, 1);

        this.directionalLight = new THREE.DirectionalLight( 0xffffff, 2.5 );
        this.directionalLight.position.set( - 5, 25, - 1 );
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.camera.near = 0.01;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.right = 30;
        this.directionalLight.shadow.camera.left = - 30;
        this.directionalLight.shadow.camera.top	= 30;
        this.directionalLight.shadow.camera.bottom = - 30;
        this.directionalLight.shadow.mapSize.width = 1024;
        this.directionalLight.shadow.mapSize.height = 1024;
        this.directionalLight.shadow.radius = 4;
        this.directionalLight.shadow.bias = - 0.00006;

        this.initLights();
    }

    initLights(){
        this.scene.add(this.hemiLight);
        this.scene.add(this.directionalLight);
    }
}