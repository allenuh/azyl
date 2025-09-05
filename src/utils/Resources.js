import Loaders from "./Loaders.js";
import { EventEmitter } from "events";
import * as THREE from "three";

export default class Resources extends EventEmitter {
    constructor(assets) {
        super();

        this.items = {};
        // this.assets = assets;
        // this.location = "westgate";

        this.loaders = new Loaders().loaders;

        this.startLoading();
    }

    startLoading() {
        // this.loaded = 0;
        // this.queue = this.assets[0][this.location].assets.length;

        this.loaders.gltfLoader.load('/src/assets/models/azylworld5.glb', (gltf) => {
            this.singleAssetLoaded() 
        });
    }

    singleAssetLoaded(asset, file) {
        // this.items[asset.name] = file;
        // this.loaded++;
        // this.emit("loading", this.loaded, this.queue);

        // if (this.loaded === this.queue) {
        //     this.emit("ready");
        // }
        this.emit("ready");
    }
}
