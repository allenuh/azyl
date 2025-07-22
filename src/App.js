import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import Lights from './core/Lights.js';
import Renderer from './core/Renderer.js';

// import Sizes from './utils/Sizes.js';

import World from './components/World.js'
import Player from './components/Player.js';
import Spheres from './components/Spheres.js';
import Camera from './core/Camera.js';

export default class App {
    static instance; // singleton
  
    constructor(canvas) {
        if (App.instance) { // check if instance exists & return
            return App.instance;
        }
        App.instance = this;
        
        this.canvas = canvas;
        this.clock = new THREE.Clock();

        this.setScene();
        this.setLights();
        this.setCamera();
        this.setRenderer();
        this.setWorld();
        this.setPlayer();
        this.setSpheres();
        this.setStats();

        window.addEventListener('resize', () => this.onWindowResize());

        this.update(); // this needs to be called for renderer to start (look into why l8r)
    }

    init() {
        this.loadWorld();
    }

    setScene(){
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8cbe9);
    }

    setLights(){
        this.lights = new Lights();
    }

    setCamera(){
        this.camera = new Camera();
    }

    setRenderer(){
        this.renderer = new Renderer();
    }

    setWorld(){
        this.world = new World();
    }

    setPlayer(){
        this.player = new Player();
    }

    setSpheres(){
        this.spheres = new Spheres();
    }

    setEvents(){
    }

    loadWorld() {
        const loader = new GLTFLoader().setPath('/src/assets/models/');
        loader.load('azylworld.glb', (gltf) => {
            this.scene.add(gltf.scene);
            this.world.octree.fromGraphNode(gltf.scene);

            gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
            });

            const helper = new OctreeHelper(this.world.octree);
            helper.visible = false;
            this.scene.add(helper);

            const gui = new GUI( { width: 200 } );
            gui.add({ debug: false }, 'debug').onChange((v) => (helper.visible = v));
        });
    }

    setStats() {
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        this.canvas.appendChild(this.stats.domElement);
    }

    onWindowResize() {
        this.camera.onWindowResize();
        this.renderer.onWindowResize();
    }

    update() {
        const deltaTime = Math.min(0.05, this.clock.getDelta()) / 1; // magic number 1, could be anything

        this.player.update(deltaTime);
        this.spheres.update(deltaTime);
        
        // for (let i = 0; i < 5; i++) {
        //     this.player.update(deltaTime);
        //     this.spheres.update(deltaTime);
        // }

        this.renderer.update();
        this.stats.update();

        window.requestAnimationFrame(() => {
            this.update();
        });
    }
}
