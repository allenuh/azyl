import * as THREE from 'three';
import App from '../App';

export default class Environment{
    constructor() {
        this.app = new App();
        this.scene = this.app.scene;
        this.resources = this.app.resources;

        this.setEnvironment();
    }

    setEnvironment() {
        // this.scene.background = new THREE.Color(0xd8abee); // 0xf8cbee originally
        // this.scene.fog = new THREE.Fog( 0xb89bee, 10, 100 );

        // this.scene.background = new THREE.Color(0x990000); // red
        // this.scene.fog = new THREE.Fog( 0x660000, 20, 100 );
        
        this.scene.background = new THREE.Color(0x44006b); // red
        this.scene.fog = new THREE.Fog( 0x25004e, 1, 100 );
    }
}