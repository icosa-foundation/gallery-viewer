import { Matrix4 } from 'three';

export type GalleryARHitTestState =
    | 'inactive'
    | 'initializing'
    | 'searching'
    | 'tracking'
    | 'lost'
    | 'unsupported'
    | 'error';

/**
 * Owns a viewer-space WebXR hit-test source for one AR session.
 *
 * Results remain placement candidates until the viewer explicitly commits one.
 * Updating hit tests must never move content by itself.
 */
export class ARHitTestService {
    private session?: XRSession;
    private source?: XRHitTestSource;
    private candidateWorldMatrix?: Matrix4;
    private generation = 0;

    public state: GalleryARHitTestState = 'inactive';

    public async start(session: XRSession): Promise<void> {
        this.stop();
        const generation = this.generation;
        this.session = session;
        this.state = 'initializing';

        if (!session.requestHitTestSource) {
            this.state = 'unsupported';
            return;
        }

        try {
            const viewerSpace = await session.requestReferenceSpace('viewer');
            if (!this.isCurrent(session, generation)) return;

            const sourcePromise = session.requestHitTestSource({ space: viewerSpace });
            if (!sourcePromise) {
                this.state = 'unsupported';
                return;
            }

            const source = await sourcePromise;
            if (!this.isCurrent(session, generation)) {
                source.cancel();
                return;
            }

            this.source = source;
            this.state = 'searching';
        } catch (error) {
            if (this.isCurrent(session, generation)) {
                const errorName = typeof error === 'object' && error !== null && 'name' in error
                    ? String(error.name)
                    : '';
                this.state = errorName === 'NotSupportedError'
                    ? 'unsupported'
                    : 'error';
            }
        }
    }

    public update(frame: XRFrame, baseSpace: XRReferenceSpace): void {
        if (!this.source) return;

        const result = frame.getHitTestResults(this.source)[0];
        const pose = result?.getPose(baseSpace);
        if (!pose) {
            this.candidateWorldMatrix = undefined;
            this.state = this.state === 'tracking' || this.state === 'lost'
                ? 'lost'
                : 'searching';
            return;
        }

        this.candidateWorldMatrix = new Matrix4().fromArray(
            Array.from(pose.transform.matrix)
        );
        this.state = 'tracking';
    }

    public currentWorldMatrix(target?: Matrix4): Matrix4 | undefined {
        if (!this.candidateWorldMatrix) return undefined;
        return (target ?? new Matrix4()).copy(this.candidateWorldMatrix);
    }

    public stop(): void {
        this.generation++;
        try {
            this.source?.cancel();
        } catch (_error) {
            // Cleanup remains idempotent if the runtime already invalidated it.
        }
        this.source = undefined;
        this.session = undefined;
        this.candidateWorldMatrix = undefined;
        this.state = 'inactive';
    }

    private isCurrent(session: XRSession, generation: number): boolean {
        return this.session === session && this.generation === generation;
    }
}
