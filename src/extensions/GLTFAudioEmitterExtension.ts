type AnyObject = { [key: string]: any };

export class GLTFAudioEmitterExtension {

    public readonly name = 'KHR_audio_emitter';

    private parser: any;
    private three: any;
    private listener: any;
    private sourceBufferCache: Map<number, Promise<AudioBuffer | null>>;

    constructor(parser: any, listener: any, threeNamespace: any) {
        this.parser = parser;
        this.listener = listener;
        this.three = threeNamespace;
        this.sourceBufferCache = new Map<number, Promise<AudioBuffer | null>>();
    }

    public createNodeAttachment(nodeIndex: number): Promise<any | null> | null {
        const nodeDef = this.parser?.json?.nodes?.[nodeIndex];
        const nodeExt = nodeDef?.extensions?.[this.name];
        const emitterIndex = nodeExt?.emitter;
        if (typeof emitterIndex !== 'number') {
            return null;
        }

        return this.createAudioForEmitter(emitterIndex, true)
            .then((audio) => {
                if (audio) {
                    return audio;
                }
                console.warn(`[KHR_audio_emitter] node ${nodeIndex} emitter ${emitterIndex} produced no audio attachment`);
                return this.createEmptyAttachment();
            })
            .catch((err) => {
                console.error(`[KHR_audio_emitter] node ${nodeIndex} emitter ${emitterIndex} attachment failed`, err);
                return this.createEmptyAttachment();
            });
    }

    public async afterRoot(result: AnyObject): Promise<void> {
        const scenes = result?.scenes || [];
        const processedSceneIndices = new Set<number>();
        const pending: Array<Promise<void>> = [];

        for (const scene of scenes) {
            const sceneIndex = this.parser?.associations?.get(scene)?.scenes;
            if (typeof sceneIndex !== 'number' || processedSceneIndices.has(sceneIndex)) {
                continue;
            }

            processedSceneIndices.add(sceneIndex);
            const sceneDef = this.parser?.json?.scenes?.[sceneIndex];
            const sceneExt = sceneDef?.extensions?.[this.name];
            const emitterIndices = this.toIndexList(sceneExt?.emitters);

            for (const emitterIndex of emitterIndices) {
                pending.push(this.createAudioForEmitter(emitterIndex, false)
                    .then((audio) => {
                        if (audio) {
                            scene.add(audio);
                        }
                    })
                    .catch(() => {}));
            }
        }

        await Promise.all(pending);
    }

    private getExtensionRoot(): AnyObject | null {
        const rootExt = this.parser?.json?.extensions?.[this.name];
        return rootExt && typeof rootExt === 'object' ? rootExt : null;
    }

    private getSource(sourceIndex: number): AnyObject | null {
        const ext = this.getExtensionRoot();
        const sources = ext?.sources;
        return Array.isArray(sources) ? sources[sourceIndex] ?? null : null;
    }

    private getEmitter(emitterIndex: number): AnyObject | null {
        const ext = this.getExtensionRoot();
        const emitters = ext?.emitters;
        return Array.isArray(emitters) ? emitters[emitterIndex] ?? null : null;
    }

    private getAudio(audioIndex: number): AnyObject | null {
        const ext = this.getExtensionRoot();
        const audioDefs = ext?.audio;
        return Array.isArray(audioDefs) ? audioDefs[audioIndex] ?? null : null;
    }

    private async createAudioForEmitter(emitterIndex: number, positionalPreferred: boolean): Promise<any | null> {
        try {
            const emitter = this.getEmitter(emitterIndex);
            if (!emitter) {
                console.warn(`[KHR_audio_emitter] missing emitter ${emitterIndex}`);
                return null;
            }

            const sourceIndices = this.toIndexList(emitter.sources);
            if (sourceIndices.length === 0) {
                console.warn(`[KHR_audio_emitter] emitter ${emitterIndex} has no sources`);
                return null;
            }
            const audioNodes: any[] = [];
            for (const sourceIndex of sourceIndices) {
                const audioNode = await this.createAudioForSource(emitter, sourceIndex, positionalPreferred);
                if (audioNode) {
                    audioNodes.push(audioNode);
                }
            }
            if (audioNodes.length === 0) {
                return null;
            }
            if (audioNodes.length === 1) {
                return audioNodes[0];
            }
            const root = audioNodes[0];
            for (let i = 1; i < audioNodes.length; i++) {
                root.add(audioNodes[i]);
            }
            return root;
        } catch (_err) {
            return null;
        }
    }

    private createEmptyAttachment(): any {
        const Object3DCtor = this.getThreeCtor([79, 98, 106, 101, 99, 116, 51, 68]); // Object3D
        return new Object3DCtor();
    }

    private async createAudioForSource(emitter: AnyObject, sourceIndex: number, positionalPreferred: boolean): Promise<any | null> {
        const source = this.getSource(sourceIndex);
        if (!source) {
            console.warn(`[KHR_audio_emitter] missing source ${sourceIndex}`);
            return null;
        }

        const emitterType = emitter.type;
        const isPositional = positionalPreferred && emitterType !== 'global';
        const ctorNameCodes = isPositional
            ? [80, 111, 115, 105, 116, 105, 111, 110, 97, 108, 65, 117, 100, 105, 111] // PositionalAudio
            : [65, 117, 100, 105, 111]; // Audio
        const AudioCtor = this.getThreeCtor(ctorNameCodes);
        const audio = new AudioCtor(this.listener);

        const buffer = await this.loadSourceBuffer(sourceIndex);
        if (!buffer) {
            console.warn(`[KHR_audio_emitter] source ${sourceIndex} buffer load failed`);
            return null;
        }
        audio.setBuffer(buffer);

        const sourceGain = typeof source.gain === 'number' ? source.gain : 1.0;
        const emitterGain = typeof emitter.gain === 'number' ? emitter.gain : 1.0;
        audio.setVolume(sourceGain * emitterGain);
        audio.setLoop(Boolean(source.loop));
        audio.userData = audio.userData || {};
        audio.userData.__khrAudioAutoPlay = Boolean(source.autoPlay);

        if (isPositional) {
            this.applyPositionalSettings(audio, emitter);
        }

        if (source.autoPlay) {
            try {
                audio.play();
            } catch (_err) {
                // Browsers can block autoplay until user interaction.
                console.warn(`[KHR_audio_emitter] source ${sourceIndex} autoplay blocked (waiting for unlock)`);
            }
        }

        return audio;
    }

    private applyPositionalSettings(audio: any, emitter: AnyObject): void {
        const positional = emitter?.positional && typeof emitter.positional === 'object'
            ? emitter.positional
            : null;
        if (!positional) {
            return;
        }

        if (typeof positional.distanceModel === 'string') {
            audio.setDistanceModel(positional.distanceModel);
        }
        if (typeof positional.maxDistance === 'number') {
            audio.setMaxDistance(positional.maxDistance);
        }
        if (typeof positional.refDistance === 'number') {
            audio.setRefDistance(positional.refDistance);
        }
        if (typeof positional.rolloffFactor === 'number') {
            audio.setRolloffFactor(positional.rolloffFactor);
        }

        const shapeType = positional.shapeType;
        if (shapeType === 'cone') {
            const innerAngleRad = positional.coneInnerAngle ?? Math.PI * 2;
            const outerAngleRad = positional.coneOuterAngle ?? Math.PI * 2;
            const outerGain = positional.coneOuterGain ?? 0;
                audio.setDirectionalCone(
                this.three.MathUtils.radToDeg(innerAngleRad),
                this.three.MathUtils.radToDeg(outerAngleRad),
                outerGain
            );
        }
    }

    private loadSourceBuffer(sourceIndex: number): Promise<AudioBuffer | null> {
        const cached = this.sourceBufferCache.get(sourceIndex);
        if (cached) {
            return cached;
        }

        const source = this.getSource(sourceIndex);
        if (!source || typeof source.audio !== 'number') {
            const missing = Promise.resolve(null);
            this.sourceBufferCache.set(sourceIndex, missing);
            return missing;
        }

        const promise = this.loadAudioBuffer(source.audio);
        this.sourceBufferCache.set(sourceIndex, promise);
        return promise;
    }

    private toIndexList(value: any): number[] {
        if (!Array.isArray(value)) {
            return [];
        }
        const out: number[] = [];
        for (const item of value) {
            if (typeof item === 'number') {
                out.push(item);
            }
        }
        return out;
    }

    private async loadAudioBuffer(audioIndex: number): Promise<AudioBuffer | null> {
        const audioDef = this.getAudio(audioIndex);
        if (!audioDef) {
            console.warn(`[KHR_audio_emitter] missing audio entry ${audioIndex}`);
            return null;
        }

        let arrayBuffer: ArrayBuffer | null = null;

        if (typeof audioDef.uri === 'string') {
            arrayBuffer = await this.loadArrayBufferFromUri(audioDef.uri);
        } else if (typeof audioDef.bufferView === 'number') {
            arrayBuffer = await this.parser.getDependency('bufferView', audioDef.bufferView);
        }

        if (!arrayBuffer) {
            console.warn(`[KHR_audio_emitter] audio ${audioIndex} has no uri/bufferView data`);
            return null;
        }

        const clonedBuffer = arrayBuffer.slice(0);
        try {
            const decoded = await this.listener.context.decodeAudioData(clonedBuffer);
            return decoded;
        } catch (err) {
            console.error(`[KHR_audio_emitter] audio ${audioIndex} decode failed`, err);
            return null;
        }
    }

    private loadArrayBufferFromUri(uri: string): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const path = this.parser?.options?.path || '';
            const resolvedUri = this.three.LoaderUtils.resolveURL(uri, path);
            const loader = new this.three.FileLoader(this.parser?.options?.manager);
            loader.setResponseType('arraybuffer');
            loader.setWithCredentials(this.parser?.options?.withCredentials === true);
            loader.load(resolvedUri, (data) => resolve(data as ArrayBuffer), undefined, reject);
        });
    }

    private getThreeCtor(charCodes: number[]): any {
        const key = String.fromCharCode(...charCodes);
        const ctor = this.three[key];
        if (typeof ctor !== 'function') {
            throw new Error(`[KHR_audio_emitter] THREE.${key} constructor unavailable`);
        }
        return ctor;
    }
}
