import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
    constructor(scene, physicsWorld, camera) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.camera = camera;

        // Player state
        this.speed = 5;
        this.input = { forward: false, backward: false, left: false, right: false };
        this.rotationY = 0;
        this.cameraDistance = 5;

        this.initPhysics();
        this.initControls();
    }

    initPhysics() {
        // Create a "Capsule" shape (standard for humans in games)
        const radius = 0.5;
        const height = 1.8;
        this.shape = new CANNON.Sphere(radius); // Simple sphere for now
        this.body = new CANNON.Body({
            mass: 70, // Average human weight in kg
            position: new CANNON.Vec3(0, 5, 0),
            fixedRotation: true, // Prevents the player from falling over like a ragdoll
        });
        this.body.addShape(this.shape);
        this.physicsWorld.addBody(this.body);

        // Visual placeholder (Replace with GLTF model later)
        const geo = new THREE.CapsuleGeometry(radius, height - radius * 2, 4, 8);
        const mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geo, mat);
        this.scene.add(this.mesh);
    }

    initControls() {
        // Keyboard mapping
        window.addEventListener('keydown', (e) => this.onKeyChange(e.code, true));
        window.addEventListener('keyup', (e) => this.onKeyChange(e.code, false));

        // Mouse lock for aiming
        document.body.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                this.rotationY -= e.movementX * 0.002;
                // Vertical rotation would go here for camera tilt
            }
        });
    }

    onKeyChange(code, isPressed) {
        if (code === 'KeyW') this.input.forward = isPressed;
        if (code === 'KeyS') this.input.backward = isPressed;
        if (code === 'KeyA') this.input.left = isPressed;
        if (code === 'KeyD') this.input.right = isPressed;
    }

    update() {
        // 1. Calculate movement direction relative to camera rotation
        let moveX = 0;
        let moveZ = 0;

        if (this.input.forward) moveZ -= 1;
        if (this.input.backward) moveZ += 1;
        if (this.input.left) moveX -= 1;
        if (this.input.right) moveX += 1;

        // Normalize and apply rotation
        const vector = new THREE.Vector3(moveX, 0, moveZ).normalize();
        vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);

        // 2. Apply velocity to Physics Body
        this.body.velocity.x = vector.x * this.speed;
        this.body.velocity.z = vector.z * this.speed;

        // 3. Sync Visual Mesh with Physics Body
        this.mesh.position.copy(this.body.position);
        this.mesh.rotation.y = this.rotationY;

        // 4. Update Camera (Third Person Follow)
        const cameraOffset = new THREE.Vector3(0, 2, this.cameraDistance); // Height and distance
        cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
        
        this.camera.position.x = this.body.position.x + cameraOffset.x;
        this.camera.position.y = this.body.position.y + cameraOffset.y;
        this.camera.position.z = this.body.position.z + cameraOffset.z;
        
        // Make camera look at the player
        this.camera.lookAt(this.body.position.x, this.body.position.y + 1, this.body.position.z);
    }
}
