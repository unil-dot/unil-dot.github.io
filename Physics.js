import * as CANNON from 'cannon-es';

export class PhysicsManager {
    constructor() {
        // 1. Setup the World
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // Real earth gravity
        
        // 2. Performance Tuning (Iterative Solver)
        // More iterations = more realistic collisions but heavier on CPU
        this.world.solver.iterations = 10;
        this.world.defaultContactMaterial.friction = 0.1;

        // 3. Materials (Defining how objects interact)
        this.initMaterials();
    }

    initMaterials() {
        // Define materials for different surfaces
        const groundMaterial = new CANNON.Material('ground');
        const slipperyMaterial = new CANNON.Material('slippery'); // For ice or metal
        const playerMaterial = new CANNON.Material('player');

        // Define what happens when Player touches Ground
        const playerGroundContact = new CANNON.ContactMaterial(
            playerMaterial,
            groundMaterial,
            {
                friction: 0.5,
                restitution: 0.1, // Bounciness (Low for realism)
            }
        );

        this.world.addContactMaterial(playerGroundContact);
        this.materials = { groundMaterial, playerMaterial, slipperyMaterial };
    }

    // Helper to create a static box (for Buildings/Obstacles)
    createBox(x, y, z, width, height, depth) {
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 0, // Mass 0 makes it static (it won't move when hit)
            position: new CANNON.Vec3(x, y, z),
            shape: shape,
            material: this.materials.groundMaterial
        });
        this.world.addBody(body);
        return body;
    }

    // Helper to create a dynamic object (for Props/Cars)
    createDynamicBox(x, y, z, width, height, depth, mass) {
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: mass,
            position: new CANNON.Vec3(x, y, z),
            shape: shape
        });
        this.world.addBody(body);
        return body;
    }

    update(deltaTime) {
        // Fixed time stepping for consistent physics regardless of frame rate
        const timeStep = 1 / 60;
        this.world.step(timeStep, deltaTime);
    }
}
