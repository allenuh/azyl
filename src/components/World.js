import * as THREE from 'three';
import { EventEmitter } from 'events';
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import LevelLoader from '../core/LevelLoader.js';

import App from '../App.js';
import Environment from './Environment';

export default class World extends EventEmitter{
    constructor() {
        super();
        this.app = new App();
        this.resources = this.app.resources;
        this.scene = this.app.scene;

        // will be set from App.js
        this.octree = new Octree();
        this.player = null;

        this.levelLoader = new LevelLoader(this);

        this.resources.on('ready', () => {
            if (!this.environment) {
                this.environment = new Environment();
            }

            // when you’re ready to use a GLB level: use this.levelLoader.loadLevel('levelName');
            // this.levelLoader.loadLevel('azylworld');
            // or:
            // this.levelLoader.loadLevel('azylworld');

            // simple ground plane for testing
            const planeGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);
            const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const floor = new THREE.Mesh(planeGeometry, planeMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            this.scene.add(floor);
            this.octree.fromGraphNode(floor);
    
            const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
            this.scene.add(grid);

            const helper = new OctreeHelper(this.octree);
            helper.visible = false;
            this.scene.add(helper);
    
            const gui = new GUI( { width: 200 } );
            gui.add({ debug: false }, 'debug').onChange((v) => (helper.visible = v));
        });
    }

    setPlayer(player) {
        this.player = player;
    }

    setSpheres(spheres) {
        this.spheres = spheres;
    }

    // net-ready single entry point for simulation, server could call this on every tick
    update(dt) {
        if (this.player){
            this.player.update(dt);
        }
        if (this.spheres){
            this.spheres.update(dt);
        }
    }
}
