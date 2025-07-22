import * as THREE from "three";
import App from "../App";
// import Sizes from "../utils/Sizes";

export default class Camera {
    constructor() {
        this.app = new App();
        this.sizes = this.app.sizes;
        this.container = this.app.container;
        this.fpsCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.fpsCamera.rotation.order = 'YXZ';
    }

    onWindowResize(){
        this.fpsCamera.aspect = window.innerWidth / window.innerHeight;
        this.fpsCamera.updateProjectionMatrix();
    }
}
