// src/core/LevelLoader.js
import App from '../App';

export default class LevelLoader {
    constructor(world) {
        this.world = world;
        this.app = world.app;
        this.scene = this.app.scene;
        this.resources = this.app.resources;
        this.currentLevel = null;

        // central place to define levels
        this.levels = {
            azylworld: {
                resourceName: 'azylworld', // from Resources.items
                onLoaded: (gltf) => this.addLevelScene(gltf),
            },
            museum: {
                resourceName: 'museum',
                onLoaded: (gltf) => this.addLevelScene(gltf),
            },
        };
    }

    // remove previous level meshes if needed
    clearCurrentLevel() {
        if (!this.currentLevel || !this.currentLevel.root) return;

        this.scene.remove(this.currentLevel.root);
        this.currentLevel = null;
    }

    addLevelScene(gltf) {
        if (!gltf) return;

        this.clearCurrentLevel();

        const root = gltf.scene;
        root.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.scene.add(root);

        // if you want collisions from this level:
        if (this.world && this.world.octree) {
            this.world.octree.fromGraphNode(root);
        }

        this.currentLevel = { root };
    }

    loadLevel(name) {
        const def = this.levels[name];
        if (!def) {
            console.warn(`Unknown level "${name}"`);
            return;
        }

        const gltf = this.resources.items[def.resourceName];
        if (!gltf) {
            console.warn(`Level resource "${def.resourceName}" not loaded yet`);
            return;
        }

        def.onLoaded(gltf);
    }
}
