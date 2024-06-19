// Adapted from original GLTF 1.0 Loader in three.js r86
// https://github.com/mrdoob/three.js/blob/r86/examples/js/loaders/GLTFLoader.js

import {
    Camera,
	Loader,
	LoadingManager,
    Scene,
} from 'three';

export interface LegacyGLTF  {
    scene: Scene;
    scenes: Scene[];
    cameras: Camera[];
    animations: Animation[];
}

export class LegacyGLTFLoader extends Loader {
	constructor( manager?: LoadingManager );
	reversed: boolean;

	load( url: string, onLoad: ( json: LegacyGLTF ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	parse( arraybuffer: ArrayBuffer ): object;
}
