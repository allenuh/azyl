import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import Resources from "./utils/Resources.js"
import ChatOverlay from "./components/ChatOverlay.js";
import ChatClient from "./services/ChatClient.js";

import Lights from './core/Lights.js';
import Renderer from './core/Renderer.js';
import World from './components/World.js'
import Player from './components/Player.js';
import Spheres from './components/Spheres.js';
import Camera from './core/Camera.js';

export default class App {
    static instance;

    constructor(canvas) {
        if (App.instance) return App.instance;
        App.instance = this;

        this.canvas = canvas;
        this.clock = new THREE.Clock();

        this.setScene();
        this.setLights();
        this.setCamera();
        this.setRenderer();
        this.setResources();
        this.setWorld();
        this.setPlayer();
        this.setSpheres();
        this.setStats();
        this.setChat();
        this.update();
        window.addEventListener('resize', () => this.onWindowResize());
    }

    init() {
        this.loadWorld();
    }

    setScene(){
        this.scene = new THREE.Scene();
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

    setResources(){
        this.resources = new Resources();
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

    setChat() {
        this.chatClient = new ChatClient();
        this.chatOverlay = new ChatOverlay({
            mountNode: document.body,
            chatClient: this.chatClient,
            onFocusChange: (isFocused) => this.handleChatFocus(isFocused),
        });
        this.chatClient.connect();
    }

    handleChatFocus(isFocused) {
        if (!this.player) return;
        if (isFocused) {
            this.player.disableControls();
        } else {
            this.player.enableControls();
        }
    }

    loadWorld() {
        // const loader = new GLTFLoader().setPath('/src/assets/models/');
        // loader.load('azylworld5.glb', (gltf) => {
        //     this.scene.add(gltf.scene);
        //     this.world.octree.fromGraphNode(gltf.scene);

        //     gltf.scene.traverse((child) => {
        //         if (child.isMesh) {
        //             child.castShadow = true;
        //             child.receiveShadow = true;
        //         }
        //     });

        //     const helper = new OctreeHelper(this.world.octree);
        //     helper.visible = false;
        //     this.scene.add(helper);

        //     const gui = new GUI( { width: 200 } );
        //     gui.add({ debug: false }, 'debug').onChange((v) => (helper.visible = v));
        // });
        const planeGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const floor = new THREE.Mesh(planeGeometry, planeMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.world.octree.fromGraphNode(floor);

        const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
        this.scene.add(grid);
        
        const helper = new OctreeHelper(this.world.octree);
        helper.visible = false;
        this.scene.add(helper);

        const gui = new GUI( { width: 200 } );
        gui.add({ debug: false }, 'debug').onChange((v) => (helper.visible = v));
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
        const dt = Math.min(0.05, this.clock.getDelta()) / 1;

        // Your local game sim
        this.player.update(dt);
        this.spheres.update(dt);

        this.renderer.update();
        this.stats.update();

        window.requestAnimationFrame(() => this.update());
    }
}
