import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import App from '../App';

export default class Player {
    constructor() {
        this.app = new App();
        this.camera = this.app.camera;
        this.octree = this.app.world.octree;
        this.scene = this.app.scene;
        this.clock = this.app.clock;
        // this.time = this.app.time;
        
        this.collider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.GRAVITY = 30;
        this.keyStates = {};
        this.onFloor = false;

        this.initControls();
    }

    initPlayer(){
        this.player = {};

        this.player.body = this.camera;
        this.player.animation = "idle";

        this.jumpOnce = false;
        this.player.onFloor = false;
        this.player.gravity = 60;

        this.player.spawn = {
            position: new THREE.Vector3(),
            rotation: new THREE.Euler(),
            velocity: new THREE.Vector3(),
        }

        this.player.raycaster = new THREE.Raycaster();
        this.player.raycaster.far = 5;

        this.player.position = new THREE.Vector3();
        this.player.quaternion = new THREE.Euler();
        this.player.directionOffset = 0;
        this.targetRotation = new THREE.Quaternion();

        this.upVector = new THREE.Vector3(0, 1, 0);
        this.player.velocity = new THREE.Vector3();
        this.player.direction = new THREE.Vector3();

        this.player.height = 1;

        this.otherPlayers = {};
    }

    initControls() {
        document.addEventListener('keydown', (e) => (this.keyStates[e.code] = true));
        document.addEventListener('keyup', (e) => (this.keyStates[e.code] = false));
        document.body.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleMouseMove(event) {
        if (document.pointerLockElement === document.body) {
            this.camera.fpsCamera.rotation.y -= event.movementX / 1000;
            this.camera.fpsCamera.rotation.x -= event.movementY / 1000;
            this.camera.fpsCamera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.camera.fpsCamera.rotation.x));
        }
    }

    controls(deltaTime) {
        const speed = deltaTime * (this.onFloor ? 25 : 8);
        if (this.keyStates['KeyW']) this.velocity.add(this.getForward().multiplyScalar(speed));
        if (this.keyStates['KeyS']) this.velocity.add(this.getForward().multiplyScalar(-speed));
        if (this.keyStates['KeyA']) this.velocity.add(this.getSide().multiplyScalar(-speed));
        if (this.keyStates['KeyD']) this.velocity.add(this.getSide().multiplyScalar(speed));
        if (this.onFloor && this.keyStates['Space']) this.velocity.y = 15;
    }

    getForward() {
        this.camera.fpsCamera.getWorldDirection(this.direction);
        this.direction.y = 0;
        this.direction.normalize();
        return this.direction;
    }

    getSide() {
        this.camera.fpsCamera.getWorldDirection(this.direction);
        this.direction.y = 0;
        this.direction.normalize();
        this.direction.cross(this.camera.fpsCamera.up);
        return this.direction;
    }

    checkCollisions() {
        const result = this.octree.capsuleIntersect(this.collider);
        this.onFloor = false;
        if (result) {
            this.onFloor = result.normal.y > 0;
        if (!this.onFloor) this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
            this.collider.translate(result.normal.multiplyScalar(result.depth));
        }
    }

    update(deltaTime) {
        this.controls(deltaTime);
        let damping = Math.exp(-4 * deltaTime) - 1;

        if (!this.onFloor) {
            this.velocity.y -= this.GRAVITY * deltaTime;
            damping *= 0.1;
        }

        this.velocity.addScaledVector(this.velocity, damping);

        const delta = this.velocity.clone().multiplyScalar(deltaTime);
        this.collider.translate(delta);

        this.checkCollisions();
        this.camera.fpsCamera.position.copy(this.collider.end);
    }
}
