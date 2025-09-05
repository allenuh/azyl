import * as THREE from 'three';
import { EventEmitter } from 'events';

import { Octree } from 'three/addons/math/Octree.js';

import App from '../App.js';
import Player from './Player.js';
import Environment from './Environment';

export default class World extends EventEmitter{
    constructor() {
        super();
        this.app = new App();
        this.resources = this.app.resources;

        this.octree = new Octree();
        this.player = null;

        this.resources.on("ready", () => {
            if (this.player === null) {
                this.environment = new Environment();
            }
        });
    }

    update() {
        if (this.player) this.player.update();
    }
}