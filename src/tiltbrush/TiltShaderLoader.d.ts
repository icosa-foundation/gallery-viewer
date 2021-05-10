import { Loader, LoadingManager, RawShaderMaterial } from 'three';

export class TiltShaderLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		shaderData: string,
		onLoad: (response: RawShaderMaterial) => void,
		onProgress?: ( event: ProgressEvent ) => void, 
		onError?: ( event: ErrorEvent ) => void 
	): RawShaderMaterial;
	parse( data: string ): RawShaderMaterial;
}
