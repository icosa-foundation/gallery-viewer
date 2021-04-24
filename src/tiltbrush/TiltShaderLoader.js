import { RawShaderMaterial } from 'three';
import { Loader, FileLoader } from 'three';

export class TiltShaderLoader extends Loader {
    constructor( manager ) {
        super( manager );
    }

    load(materialParams, onLoad, onProgress, onError ) {
        const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'text' );
		loader.setWithCredentials( this.withCredentials );
        
        //Load vert
        loader.load(materialParams.vertexShader, function ( vertexShader ) {
            loader.load(materialParams.fragmentShader, function ( fragmentShader ) {
                try {
                    onLoad( scope.parse( materialParams, vertexShader, fragmentShader ) );
                } catch ( e ) {
                    if ( onError ) {
                        onError( e );
                    } else {
                        console.error( e );
                    }
    
                    scope.manager.itemError( materialParams );
                }
            })
        }, onProgress, onError );
    }

    parse( materialParams, vert, frag ) {
        materialParams.vertexShader = vert;
        materialParams.fragmentShader = frag;
        return new RawShaderMaterial(materialParams);
    }
}