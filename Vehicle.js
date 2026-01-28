import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Vehicle {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        
        this.wheelMeshes = [];
        this.initPhysics();
        this.initControls();
    }

    initPhysics() {
        // 1. The Car Body (Chassis)
        const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
        this.chassisBody = new CANNON.Body({ mass: 1500 }); // Realistic car weight
        this.chassisBody.addShape(chassisShape);
        this.chassisBody.position.set(0, 2, 0);

        // Visual Chassis
        const geo = new THREE.BoxGeometry(2, 1, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.8, roughness: 0.2 });
        this.chassisMesh = new THREE.Mesh(geo, mat);
        this.scene.add(this.chassisMesh);

        // 2. Create the Raycast Vehicle
        this.vehicle = new CANNON.RaycastVehicle({
            chassisBody: this.chassisBody,
            indexForwardAxis: 2, // Z-axis
            indexRightAxis: 0,   // X-axis
            indexUpAxis: 1,      // Y-axis
        });

        // 3. Wheel Options (The "Handling" Settings)
        const wheelOptions = {
            radius: 0.4,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 1.4, // How much the car drifts
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            rollInfluence: 0.01, // Prevents flipping over in tight turns
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(),
        };

        // Add 4 wheels
        const offset = 0.9;
        this.addWheel(Object.assign({}, wheelOptions, { chassisConnectionPointLocal: new CANNON.Vec3(-offset, 0, 1.5) })); // Front Left
        this.addWheel(Object.assign({}, wheelOptions, { chassisConnectionPointLocal: new CANNON.Vec3(offset, 0, 1.5) }));  // Front Right
        this.addWheel(Object.assign({}, wheelOptions, { chassisConnectionPointLocal: new CANNON.Vec3(-offset, 0, -1.5) })); // Rear Left
        this.addWheel(Object.assign({}, wheelOptions, { chassisConnectionPointLocal: new CANNON.Vec3(offset, 0, -1.5) }));  // Rear Right

        this.vehicle.addToWorld(this.physicsWorld);
    }

    addWheel(options) {
        this.vehicle.addWheel(options);
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 20);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMesh = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
        this.wheelMeshes.push(wheelMesh);
        this.scene.add(wheelMesh);
    }

    initControls() {
        this.inputs = { forward: 0, brake: 0, steering: 0 };
        window.addEventListener('keydown', (e) => this.updateKeys(e.key, 1));
        window.addEventListener('keyup', (e) => this.updateKeys(e.key, 0));
    }

    updateKeys(key, value) {
        const force = 2000;
        const steerVal = 0.5;
        if (key === 'w') this.inputs.forward = value * force;
        if (key === 's') this.inputs.forward = -value * force;
        if (key === 'a') this.inputs.steering = value * steerVal;
        if (key === 'd') this.inputs.steering = -value * steerVal;
        if (key === ' ') this.inputs.brake = value * 100;
    }

    update() {
        // Apply engine force to rear wheels (RWD)
        this.vehicle.applyEngineForce(this.inputs.forward, 2);
        this.vehicle.applyEngineForce(this.inputs.forward, 3);
        
        // Apply steering to front wheels
        this.vehicle.setSteeringValue(this.inputs.steering, 0);
        this.vehicle.setSteeringValue(this.inputs.steering, 1);

        this.vehicle.setBrake(this.inputs.brake, 0);
        this.vehicle.setBrake(this.inputs.brake, 1);

        // Sync visual meshes with physics
        this.chassisMesh.position.copy(this.chassisBody.position);
        this.chassisMesh.quaternion.copy(this.chassisBody.quaternion);

        for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
            this.vehicle.updateWheelTransform(i);
            const t = this.vehicle.wheelInfos[i].worldTransform;
            this.wheelMeshes[i].position.copy(t.position);
            this.wheelMeshes[i].quaternion.copy(t.quaternion);
        }
    }
}
