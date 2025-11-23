import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
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

    constructor(container) {
        if (App.instance) return App.instance;
        App.instance = this;

        this.container = container;
        this.canvas = container;
        this.clock = new THREE.Clock();

        this.accumulator = 0;
        this.fixedDelta = 1 / 128; // fixed time step of 128 Hz

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
        this.player = new Player(this);
        if (this.world){
            this.world.setPlayer(this.player);
        }
    }

    setSpheres(){
        this.spheres = new Spheres();
        if (this.world){
            this.world.setSpheres(this.spheres);
        }
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
        const frameDelta = Math.min(0.05, this.clock.getDelta());
        this.accumulator += frameDelta;

        // fixed time step update for physics and world at this.fixedDelta
        while (this.accumulator >= this.fixedDelta) {
            this.world.update(this.fixedDelta);
            this.accumulator -= this.fixedDelta;
        }

        // render current state
        this.renderer.update();
        this.stats.update();

        window.requestAnimationFrame(() => this.update());
    }
}
