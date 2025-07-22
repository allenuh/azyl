import * as THREE from 'three';
import App from '../App';

export default class Spheres {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.octree = this.app.world.octree;
    this.player = this.app.player;
    this.canvas = this.app.canvas;

    this.spheres = [];
    this.sphereIdx = 0;
    this.GRAVITY = 30;
    this.NUM_SPHERES = 100;
    this.RADIUS = 0.2;

    this.vector1 = new THREE.Vector3();
    this.vector2 = new THREE.Vector3();
    this.vector3 = new THREE.Vector3();

    const geometry = new THREE.IcosahedronGeometry(this.RADIUS, 5);
    const material = new THREE.MeshLambertMaterial({ color: 0xdede8d });

    for (let i = 0; i < this.NUM_SPHERES; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.spheres.push({
        mesh,
        collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), this.RADIUS),
        velocity: new THREE.Vector3(),
      });
    }

    document.body.addEventListener('mouseup', () => this.throw());
    this.canvas.addEventListener('mousedown', () => {
      document.body.requestPointerLock();
      this.mouseTime = performance.now();
    });
  }

  throw() {
    const sphere = this.spheres[this.sphereIdx];
    this.player.camera.fpsCamera.getWorldDirection(this.player.direction);

    sphere.collider.center.copy(this.player.collider.end).addScaledVector(this.player.direction, this.player.collider.radius * 1.5);
    const impulse = 15 + 30 * (1 - Math.exp((this.mouseTime - performance.now()) * 0.001));
    sphere.velocity.copy(this.player.direction).multiplyScalar(impulse).addScaledVector(this.player.velocity, 2);

    this.sphereIdx = (this.sphereIdx + 1) % this.NUM_SPHERES;
  }

  update(deltaTime) {
    this.spheres.forEach((sphere) => {
      sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);

      const result = this.octree.sphereIntersect(sphere.collider);
      if (result) {
        sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5);
        sphere.collider.center.add(result.normal.multiplyScalar(result.depth));
      } else {
        sphere.velocity.y -= this.GRAVITY * deltaTime;
      }

      const damping = Math.exp(-1.5 * deltaTime) - 1;
      sphere.velocity.addScaledVector(sphere.velocity, damping);
      sphere.mesh.position.copy(sphere.collider.center);
    });
  }
}
