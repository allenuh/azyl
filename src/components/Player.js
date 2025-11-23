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

        // simulation variables
        this.collider = new Capsule(
            new THREE.Vector3(0, 0.35, 0), 
            new THREE.Vector3(0, 2, 0), 
            0.35
        );
        this.position = this.collider.end;
        this.velocity = new THREE.Vector3();
        this.onFloor = false;
        this.direction = new THREE.Vector3();

        this.health = 100;

        // movement variables/tuning
        this.GRAVITY = 32;
        this.maxGroundSpeed = 10;
        this.maxAirSpeed = 5;
        this.jumpSpeed = 10;

        // input state
        this.keyStates = {};
        this.controlsEnabled = true;
        this.mouseWheelJump = false; // mousewheel jump flag, fix later
        this.isFiring = false;

        // sensitivity
        this.sensitivity = 2000;

        // raycast weapon
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 100; // shooting range in units
        this.fireRate = 10;
        this.fireCooldown = 0;

        this.speedElement = this.createSpeedElement();

        this.initControls();
    }
    // TODO: Refactor input readings to use InputManager, to help with decoupling.
    initControls() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.body.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.body.addEventListener('wheel', (e) => this.handleMouseWheel(e));
        document.body.addEventListener('mousedown', (e) => {this.handleMouseDown(e)});
        document.body.addEventListener('mouseup', (e) => {this.handleMouseUp(e)});
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

    handleKeyDown(event) {
        if (!this.controlsEnabled) return;
        this.keyStates[event.code] = true;
    }

    handleKeyUp(event) {
        this.keyStates[event.code] = false;
    }

    handleMouseWheel(event) {
        if (event.deltaY !== 0) {
            this.mouseWheelJump = true;
        }
    }

    handleMouseMove(event) {
        if (!this.controlsEnabled) return;
        if (document.pointerLockElement === document.body) {
            this.camera.fpsCamera.rotation.y -= event.movementX / this.sensitivity;
            this.camera.fpsCamera.rotation.x -= event.movementY / this.sensitivity;
            // clamp vertical look angle (pitch)
            const maxPitch = Math.PI / 2.5;
            this.camera.fpsCamera.rotation.x = Math.max(
                -maxPitch, 
                Math.min(maxPitch, this.camera.fpsCamera.rotation.x)
            );
        }
    }
    
    handleMouseDown(event) {
        if (!this.controlsEnabled) return;
        if (event.button === 0) {
            this.isFiring = true;
        }
    }

    handleMouseUp(event) {
        if (event.button === 0) {
            this.isFiring = false;
        }
    }

    // reads "keyStates" and returns movement commands for this tick
    getMovementCommand() {
        let forwardMove = 0;
        let sideMove = 0;

        if (this.keyStates['KeyW']) forwardMove += 1;
        if (this.keyStates['KeyS']) forwardMove -= 1;
        if (this.keyStates['KeyA']) sideMove -= 1;
        if (this.keyStates['KeyD']) sideMove += 1;

        const wishDir = this.getForward().multiplyScalar(forwardMove).add(this.getSide().multiplyScalar(sideMove));

        if (wishDir.lengthSq() > 0) {
            wishDir.normalize();
        }

        const wantsJump = !!this.keyStates['Space'] || this.mouseWheelJump;
        this.mouseWheelJump = false; // reset mouse wheel jump flag

        return { wishDir, wantsJump };
    }

    // get forward vector relative to camera yaw
    getForward() {
        const dir = new THREE.Vector3();
        this.camera.fpsCamera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        return dir;
    }

    // get side vector relative to camera yaw
    getSide() {
        const dir = new THREE.Vector3();
        this.camera.fpsCamera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        dir.cross(this.camera.fpsCamera.up);
        return dir;
    }

    // --- Physics / movement --- //
    applyGroundFriction(dt) {
        const friction = 12;
        const stopSpeed = 5;

        const vel = this.velocity.clone();
        vel.y = 0; // horizontal only

        const speed = vel.length();
        if (speed < 0.0001) return;

        // Quake-style friction
        const control = Math.max(speed, stopSpeed);
        const drop = control * friction * dt;

        const newSpeed = Math.max(speed - drop, 0);
        const scale = newSpeed / speed;

        this.velocity.x *= scale;
        this.velocity.z *= scale;
    }

    applyGravity(dt) {
        this.velocity.y -= this.GRAVITY * dt;
    }

    // normalize wish direction so moving diagonally doesn't go faster which would result in sqrt(2) times normal speed
    // use dot product so speed is only increased along the wish direction
    // use explicit maxGroundSpeed and groundAcceleration
    groundAccelerate(wishDir, maxSpeed, dt) {
        if (!wishDir || wishDir.lengthSq() === 0) return; 

        const accel = 50; // tune, ground acceleration
        const wishSpeed = maxSpeed; // tune with scaling by input strength

        // current speed along wish direction
        const currentSpeed = this.velocity.dot(wishDir);
        const addSpeed = wishSpeed - currentSpeed;
        if (addSpeed <= 0) return;

        let accelSpeed = accel * dt * wishSpeed;
        if (accelSpeed > addSpeed) {
            accelSpeed = addSpeed;
        }

        this.velocity.addScaledVector(wishDir, accelSpeed);
    }

    airAccelerate(wishDir, maxAirSpeed, dt) {
        if (!wishDir || wishDir.lengthSq() === 0) return;

        const accel = 40; // tune, air acceleration
        const wishSpeed = maxAirSpeed; // tune with scaling by input strength
        
        const currentSpeed = this.velocity.dot(wishDir);
        const addSpeed = wishSpeed - currentSpeed;
        if (addSpeed <= 0) return;

        let accelSpeed = accel * dt * wishSpeed;
        if (accelSpeed > addSpeed) {
            accelSpeed = addSpeed;
        }

        this.velocity.addScaledVector(wishDir, accelSpeed);
    }

    checkCollisions() {
        if (!this.octree) return;

        const result = this.octree.capsuleIntersect(this.collider); // avoids small "bumps" being treated as collisions (ground)
        this.onFloor = false;

        if (!result) return;

        const normal = result.normal;
        const isGround = normal.y > 0.7; // treat mostly-up surfaces as floor
        this.onFloor = isGround;

        // Slide along any collision planes
        const velocityProjection = this.velocity.dot(normal);
        if (velocityProjection < 0) {
            this.velocity.addScaledVector(normal, -velocityProjection);
        }

        this.collider.translate(normal.multiplyScalar(result.depth));

        // kill downward velocity when landing, optional
        if (this.onFloor && this.velocity.y < 0) {
            this.velocity.y = 0;
        }
    }

    // --- Raycast weapon --- //
    tryShoot(dt) {
        this.fireCooldown -= dt;
        if (this.fireCooldown < 0) {
            this.fireCooldown = 0;
        }

        if (!this.isFiring) return;
        if (this.fireCooldown > 0) return;

        // reset cooldown
        this.fireCooldown = 1 / this.fireRate;
        this.performRaycastShot();
    }

    performRaycastShot() {
        const origin = this.camera.fpsCamera.position.clone();
        const direction = new THREE.Vector3();
        this.camera.fpsCamera.getWorldDirection(direction);

        this.raycaster.set(origin, direction);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
            const hit = intersects[0];
            console.log('Hit object:', hit.object.name || hit.object, 'at', hit.point);
            // Later: apply damage, spawn impact effect, etc.
        }
    }

    update(dt) {
        if (!this.controlsEnabled) return;

        // 1) Input -> command
        const { wishDir, wantsJump } = this.getMovementCommand();

        // 2) Movement
        if (this.onFloor) {
            this.applyGroundFriction(dt);
            this.groundAccelerate(wishDir, this.maxGroundSpeed, dt);
            if (wantsJump) {
                this.velocity.y = this.jumpSpeed;
                this.onFloor = false;
            }
        } else {
            this.airAccelerate(wishDir, this.maxAirSpeed, dt);
        }

        // 3) Gravity
        this.applyGravity(dt);

        // 4) Integrate position via capsule
        const deltaPos = this.velocity.clone().multiplyScalar(dt);
        this.collider.translate(deltaPos);

        // 5) Collisions
        this.checkCollisions();

        // 6) Shooting
        this.tryShoot(dt);

        // 7) Map simulation -> camera
        this.camera.fpsCamera.position.copy(this.collider.end);

        // 8) HUD
        if (this.speedElement) {
            const horizontalSpeed = Math.sqrt(
                this.velocity.x * this.velocity.x +
                this.velocity.z * this.velocity.z
            );
            this.speedElement.textContent = `Speed: ${horizontalSpeed.toFixed(2)}`;
        }
    }

    // --- Control enabling/disabling --- //
    disableControls() {
        this.controlsEnabled = false;
        this.clearKeyStates();
        this.isFiring = false;
    }

    enableControls() {
        this.controlsEnabled = true;
        this.clearKeyStates();
    }

    clearKeyStates() {
        Object.keys(this.keyStates).forEach((code) => {
            this.keyStates[code] = false;
        });
    }

    createSpeedElement() {
        let el = document.getElementById('player-speed');
        if (!el) {
            el = document.createElement('div');
            el.id = 'player-speed';
            el.style.position = 'absolute';
            el.style.bottom = '10px';
            el.style.right = '10px';
            el.style.padding = '4px 8px';
            el.style.background = 'rgba(0,0,0,0.6)';
            el.style.color = '#fff';
            el.style.fontFamily = 'Monospace';
            el.style.fontSize = '12px';
            el.style.zIndex = '3';
            document.body.appendChild(el);
        }
        el.textContent = 'Speed: 0.00';
        return el;
    }
}
