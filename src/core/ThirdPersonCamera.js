import * as THREE from 'three';
import App from '../App';

export default class ThirdPersonCamera {
    constructor() {
        this.app = new App();
        this.sizes = this.app.sizes;
        this.container = this.app.container;
        this.tpsCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    }
}