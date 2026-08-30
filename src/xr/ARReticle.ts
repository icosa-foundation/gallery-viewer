import type * as THREE from 'three';
import type { GalleryARHitTestState } from './ARHitTest';

export type GalleryARReticleState =
    | 'hidden'
    | 'valid'
    | 'invalid'
    | 'lost'
    | 'locked';

const RETICLE_STYLE: Record<Exclude<GalleryARReticleState, 'hidden'>, {
    color: number;
    opacity: number;
}> = {
    valid: { color: 0x37ff8b, opacity: 0.9 },
    invalid: { color: 0xff4d4d, opacity: 0.9 },
    lost: { color: 0xffb020, opacity: 0.55 },
    locked: { color: 0x4db8ff, opacity: 1 }
};

/**
 * World-placement target adapted from the official Three.js AR hit-test
 * example. Input confirmation and placement policy remain outside this view.
 */
export class ARReticle {
    public readonly object: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
    public state: GalleryARReticleState = 'hidden';

    private hasPose = false;

    constructor(three: typeof THREE) {
        const geometry = new three.RingGeometry(0.15, 0.2, 32)
            .rotateX(-Math.PI / 2);
        const material = new three.MeshBasicMaterial({
            color: RETICLE_STYLE.valid.color,
            opacity: RETICLE_STYLE.valid.opacity,
            transparent: true,
            depthWrite: false,
            side: three.DoubleSide,
            toneMapped: false
        });

        this.object = new three.Mesh(geometry, material);
        this.object.name = 'Viewer AR placement reticle';
        this.object.matrixAutoUpdate = false;
        this.object.visible = false;
    }

    public updateFromHitTest(
        hitTestState: GalleryARHitTestState,
        localMatrix?: THREE.Matrix4
    ): void {
        if (localMatrix) {
            this.object.matrix.copy(localMatrix);
            this.object.matrixWorldNeedsUpdate = true;
            this.hasPose = true;
        }

        if (hitTestState === 'tracking') {
            this.setState('valid');
        } else if (hitTestState === 'lost' && this.hasPose) {
            this.setState('lost');
        } else {
            this.setState('hidden');
        }
    }

    public setState(state: GalleryARReticleState): void {
        this.state = state;
        if (state === 'hidden' || !this.hasPose) {
            this.object.visible = false;
            return;
        }

        const style = RETICLE_STYLE[state];
        this.object.material.color.setHex(style.color);
        this.object.material.opacity = style.opacity;
        this.object.visible = true;
    }

    public reset(): void {
        this.hasPose = false;
        this.setState('hidden');
        this.object.matrix.identity();
        this.object.matrixWorldNeedsUpdate = true;
    }

    public dispose(): void {
        this.object.geometry.dispose();
        this.object.material.dispose();
    }
}
