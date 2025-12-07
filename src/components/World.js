import * as THREE from 'three';
import { EventEmitter } from 'events';
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import LevelLoader from '../core/LevelLoader.js';

import App from '../App.js';
import Environment from './Environment';

export default class World extends EventEmitter {
    constructor() {
        super();
        this.app = new App();
        this.resources = this.app.resources;
        this.scene = this.app.scene;

        // will be set from App.js
        this.octree = new Octree();
        this.player = null;

        // simple test dummy container
        this.dummy = null;

        // TODO: make this more elegant by not passing world into LevelLoader
        this.levelLoader = new LevelLoader(this);

        this.resources.on('ready', () => {
            if (!this.environment) {
                this.environment = new Environment();
            }

            // when you're ready to use a GLB level: use this.levelLoader.loadLevel('levelName');
            this.levelLoader.loadLevel('grey_arena');

            // this.setTestLevel();
            this.addTestDummy();
        });
    }

    setPlayer(player) {
        this.player = player;
    }

    addTestDummy() {
        const soldierGltf = this.resources.items.soldier;
        if (!soldierGltf) return;

        // Use the scene from the GLB directly
        this.dummy = soldierGltf.scene;

        // Light/shadow flags so it renders nicely
        this.dummy.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        this.scene.add(this.dummy);

        // Wrap movement-related state in an object
        this.dummy = {
            root: this.dummy,
            health: 100,
            maxHealth: 100,
            baseX: 0,
            ticksPerLeg: 240,   // ticks per direction
            tickCount: 0,
            direction: 1,
            amplitude: 5,       // side-to-side distance from center
        };

        // Initial placement in front of the player
        this.dummy.root.position.set(0, 0, -20);
        this.dummy.baseX = this.dummy.root.position.x;
    }

    setTestLevel() {
        // simple ground plane for testing
        const planeGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);
        const planeMaterial = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.0 });
        const floor = new THREE.Mesh(planeGeometry, planeMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.octree.fromGraphNode(floor);

        // const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
        // this.scene.add(grid);

        const helper = new OctreeHelper(this.octree);
        helper.visible = false;
        this.scene.add(helper);

        const gui = new GUI({ width: 200 });
        gui.add({ debug: false }, 'debug').onChange((v) => (helper.visible = v));
    }

    // net-ready single entry point for simulation, server could call this on every tick
    update(dt) {
        if (this.player) {
            this.player.update(dt);
        }

        if (this.dummy && this.dummy.root) {
            this.updateDummyMovement();
        }
    }

    updateDummyMovement() {
        const d = this.dummy;
        if (!d || !d.root) return;

        // progress 0..1 over one leg (240 ticks)
        const t = d.tickCount / d.ticksPerLeg;

        // linear move from -A to +A, then +A back to -A on next leg
        let offsetX;
        if (d.direction === 1) {
            // left -> right
            offsetX = -d.amplitude + 2 * d.amplitude * t;
        } else {
            // right -> left
            offsetX = d.amplitude - 2 * d.amplitude * t;
        }

        d.root.position.x = d.baseX + offsetX;

        d.tickCount++;
        if (d.tickCount >= d.ticksPerLeg) {
            d.tickCount = 0;
            d.direction *= -1; // flip direction every 240 ticks
        }
    }
}
