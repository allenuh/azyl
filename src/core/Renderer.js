import * as THREE from 'three';
import App from "../App.js"

export default class Renderer{
    constructor(){
        this.app = new App();
        this.scene = this.app.scene;
        this.canvas = this.app.canvas;
        this.camera = this.app.camera;

        this.setRenderer();
    }

    setRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true, // Get rid of z-fighting
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.canvas.appendChild(this.renderer.domElement);
    }

    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(this.sizes.pixelRatio);
    }

    update() {
        this.renderer.render(this.scene, this.camera.fpsCamera);
    }
} 