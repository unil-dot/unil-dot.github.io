import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class World {
    constructor() {
        // 1. Initialize Visual Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        
        // 2. Initialize Physics World
        this.physicsWorld = new CANNON.World();
        this.physicsWorld.gravity.set(0, -9.82, 0); // Real world gravity
        
        this.initLights();
        this.createGround();
    }

    initLights() {
        // Ambient light for general visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Directional light to act as the Sun (creates shadows)
        this.sun = new THREE.DirectionalLight(0xffffff, 1.2);
        this.sun.position.set(100, 100, 50);
        this.sun.castShadow = true;
        
        // Improve shadow quality for realism
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.far = 500;
        
        this.scene.add(this.sun);
    }

    createGround() {
        // Visual Ground
        const geometry = new THREE.PlaneGeometry(1000, 1000);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x333333, // Asphalt color
            roughness: 0.8 
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Physics Ground (Invisible collision floor)
        const groundBody = new CANNON.Body({
            mass: 0, // Mass 0 makes it unmovable (static)
            shape: new CANNON.Plane(),
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.physicsWorld.addBody(groundBody);
    }

    // Method to add realistic buildings
    addBuilding(x, z, width, height, depth) {
        const geo = new THREE.BoxGeometry(width, height, depth);
        const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, height / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Add physics box for the building so player/cars don't walk through it
        const shape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.set(x, height/2, z);
        this.physicsWorld.addBody(body);
    }

    update(deltaTime) {
        // Step the physics engine forward in time
        this.physicsWorld.step(1 / 60, deltaTime);
    }
}
