import * as THREE from 'three';

export default class RendererEngine{
    constructor(container, scene, camera){
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.container = container;
        this.scene = scene;
        this.camera = camera;
    }

    initRenderer() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    get webGLRenderer() {
        return this.renderer;
    }

    get domElement() {
        return this.renderer.domElement;
    }
}