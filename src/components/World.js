import * as THREE from 'three';
// import { EventEmitter } from 'events';

import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
import App from '../App';

export default class World{
    constructor() {
        this.app = new App();
        this.octree = new Octree();
        this.player = null;
    }

    update() {
        if (this.player) this.player.update();
    }
}