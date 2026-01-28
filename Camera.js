import * as THREE from 'three';

export class CameraManager {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target; // This will be the Player's mesh or physics body

        // Configuration
        this.offset = new THREE.Vector3(0, 1.5, 4); // Height and distance from player
        this.lookAtOffset = new THREE.Vector3(0, 1.5, 0); // Where the camera looks
        
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.phi = 0;   // Vertical rotation (Pitch)
        this.theta = 0; // Horizontal rotation (Yaw)

        this.initMouseListeners();
    }

    initMouseListeners() {
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement) {
                // Adjust sensitivity here (0.002 is standard)
                this.theta -= e.movementX * 0.002;
                this.phi -= e.movementY * 0.002;

                // GTA 6 Style Clamping: Prevent camera from flipping over the head or under the feet
                this.phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.phi));
            }
        });
    }

    update(deltaTime) {
        if (!this.target) return;

        // 1. Calculate the rotation based on mouse input
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(this.phi, this.theta, 0, 'YXZ'));

        // 2. Apply rotation to the default offset
        const currentOffset = this.offset.clone().applyQuaternion(quaternion);

        // 3. Calculate target position
        const targetPosition = new THREE.Vector3().copy(this.target.position).add(currentOffset);

        // 4. Smooth Camera Movement (Lerping)
        // This gives it that heavy "GTA" cinematic weight rather than a rigid attachment
        this.camera.position.lerp(targetPosition, 0.1);

        // 5. Look at the player (slightly above their origin)
        const lookAtTarget = new THREE.Vector3()
            .copy(this.target.position)
            .add(this.lookAtOffset);
            
        this.camera.lookAt(lookAtTarget);
    }
}
