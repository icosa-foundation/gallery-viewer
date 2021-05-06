import { Loader, LoadingManager, RawShaderMaterial, ShaderMaterialParameters } from 'three';

export class TiltShaderLoader extends Loader {

	constructor( manager?: LoadingManager );

	load(
		shaderData: ShaderMaterialParameters,
		onLoad: (response: RawShaderMaterial) => void,
		onProgress?: ( event: ProgressEvent ) => void, 
		onError?: ( event: ErrorEvent ) => void 
	): RawShaderMaterial;
	parse( data: string ): RawShaderMaterial;
}
