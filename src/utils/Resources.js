import Loaders from "./Loaders.js";
import { EventEmitter } from "events";

export default class Resources extends EventEmitter {
    constructor(assets) {
        super();

        this.items = {};
        this.assets = assets || [
            {
                name: 'azylworld',
                type: 'gltf',
                path: '/src/assets/models/azylworld5.glb',
            },
            {
                name: 'museum',
                type: 'gltf',
                path: '/src/assets/models/Museum.glb',
            },
            {
                name: 'soldier',
                type: 'gltf',
                path: '/src/assets/models/Soldier.glb',
            },
            {
                name: 'deathmatch_arena',
                type: 'gltf',
                path: '/src/assets/models/dm.glb',
            },
            {
                name: 'grey_arena',
                type: 'gltf',
                path: '/src/assets/models/1v1.glb',
            },
        ];

        this.loaders = new Loaders().loaders;

        this.startLoading();
    }

    startLoading() {
        this.loaded = 0;
        this.queue = this.assets.length;

        this.assets.forEach((asset) => {
            if (asset.type === 'gltf') {
                this.loaders.gltfLoader.load(
                    asset.path,
                    (gltf) => this.singleAssetLoaded(asset, gltf),
                    undefined,
                    (error) => {
                        console.error(`Error loading asset "${asset.name}" from ${asset.path}:`, error);
                        this.singleAssetLoaded(asset, null);
                    },
                );
            }
        });
    }

    singleAssetLoaded(asset, file) {
        if (asset && file) {
            this.items[asset.name] = file;
        }

        this.loaded++;
        this.emit('loading', this.loaded, this.queue);

        if (this.loaded === this.queue) {
            this.emit('ready', this.items);
        }
    }
}
