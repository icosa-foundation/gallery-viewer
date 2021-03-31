/*!
 * Icosa Viewer
 * https://github.com/icosa-gallery/icosa-viewer
 * Copyright (c) 2021 Icosa Gallery
 * Released under the Apache 2.0 Licence.
 */
import * as THREE from 'three';
import { Loader as Loader$1, LoaderUtils, FileLoader, Color, AmbientLight, SpotLight, PointLight, DirectionalLight, InterleavedBuffer, InterleavedBufferAttribute, BufferAttribute, TextureLoader, RGBAFormat, UnsignedByteType, LinearFilter, NearestMipmapLinearFilter, RepeatWrapping, FrontSide, DoubleSide, LessDepth, CustomBlending, NoBlending, AddEquation, OneFactor, ZeroFactor, MeshBasicMaterial, Group, BufferGeometry, MeshPhongMaterial, Mesh, LineSegments, Line, PerspectiveCamera, Math, OrthographicCamera, Matrix4, QuaternionKeyframeTrack, VectorKeyframeTrack, InterpolateLinear, AnimationUtils, AnimationClip, Bone, Object3D, LineLoop, SkinnedMesh, Skeleton, Scene, Matrix3, Vector2, Vector3, Vector4, Texture, NearestFilter, NearestMipmapNearestFilter, LinearMipmapNearestFilter, LinearMipmapLinearFilter, ClampToEdgeWrapping, MirroredRepeatWrapping, AlphaFormat, RGBFormat, LuminanceFormat, LuminanceAlphaFormat, UnsignedShort4444Type, UnsignedShort5551Type, UnsignedShort565Type, BackSide, NeverDepth, EqualDepth, LessEqualDepth, GreaterEqualDepth, NotEqualDepth, AlwaysDepth, SubtractEquation, ReverseSubtractEquation, SrcColorFactor, OneMinusSrcColorFactor, SrcAlphaFactor, OneMinusSrcAlphaFactor, DstAlphaFactor, OneMinusDstAlphaFactor, DstColorFactor, OneMinusDstColorFactor, SrcAlphaSaturateFactor, InterpolateDiscrete, MeshLambertMaterial, UniformsUtils, RawShaderMaterial, MeshStandardMaterial, Box3, HemisphereLight, MathUtils, WebGLRenderer, Clock } from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import CameraControls from 'camera-controls';
import { KeyboardKeyHold } from 'hold-event';
import { TiltLoader } from 'three/examples/jsm/loaders/TiltLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "#icosa-viewer {\n  margin: 0;\n  width: 100%;\n  height: 100%;\n  position: relative;\n  overflow: hidden;\n  display: block; }\n\n#c {\n  width: 100%;\n  height: 100%;\n  display: block;\n  position: static; }\n";
styleInject(css_248z);

class LegacyGLTFLoader extends Loader$1 {


    load ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var resourcePath;

        if ( this.resourcePath !== '' ) {

            resourcePath = this.resourcePath;

        } else if ( this.path !== '' ) {

            resourcePath = this.path;

        } else {

            resourcePath = LoaderUtils.extractUrlBase( url );

        }

        var loader = new FileLoader( scope.manager );

        loader.setPath( this.path );
        loader.setResponseType( 'arraybuffer' );

        loader.load( url, function ( data ) {

            scope.parse( data, resourcePath, onLoad );

        }, onProgress, onError );

    }

    parse ( data, path, callback ) {

        var content;
        var extensions = {};

        var magic = LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

        if ( magic === BINARY_EXTENSION_HEADER_DEFAULTS.magic ) {

            extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );
            content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

        } else {

            content = LoaderUtils.decodeText( new Uint8Array( data ) );

        }

        var json = JSON.parse( content );

        if ( json.extensionsUsed && json.extensionsUsed.indexOf( EXTENSIONS.KHR_MATERIALS_COMMON ) >= 0 ) {

            extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] = new GLTFMaterialsCommonExtension( json );

        }

        var parser = new GLTFParser( json, extensions, {

            crossOrigin: this.crossOrigin,
            manager: this.manager,
            path: path || this.resourcePath || ''

        } );

        parser.parse( function ( scene, scenes, cameras, animations ) {

            var glTF = {
                "scene": scene,
                "scenes": scenes,
                "cameras": cameras,
                "animations": animations
            };

            callback( glTF );

        } );
    }
}

function GLTFRegistry() {

    var objects = {};

    return	{

        get: function ( key ) {

            return objects[ key ];

        },

        add: function ( key, object ) {

            objects[ key ] = object;

        },

        remove: function ( key ) {

            delete objects[ key ];

        },

        removeAll: function () {

            objects = {};

        },

        update: function ( scene, camera ) {

            for ( var name in objects ) {

                var object = objects[ name ];

                if ( object.update ) {

                    object.update( scene, camera );

                }

            }

        }

    };

}

class GLTFShader {
    constructor ( targetNode, allNodes ) {

        var boundUniforms = {};

        // bind each uniform to its source node

        var uniforms = targetNode.material.uniforms;

        for ( var uniformId in uniforms ) {

            var uniform = uniforms[ uniformId ];

            if ( uniform.semantic ) {

                var sourceNodeRef = uniform.node;

                var sourceNode = targetNode;

                if ( sourceNodeRef ) {

                    sourceNode = allNodes[ sourceNodeRef ];

                }

                boundUniforms[ uniformId ] = {
                    semantic: uniform.semantic,
                    sourceNode: sourceNode,
                    targetNode: targetNode,
                    uniform: uniform
                };

            }

        }

        this.boundUniforms = boundUniforms;
        this._m4 = new Matrix4();
    }

    update ( scene, camera ) {

		var boundUniforms = this.boundUniforms;

		for ( var name in boundUniforms ) {

			var boundUniform = boundUniforms[ name ];

			switch ( boundUniform.semantic ) {

				case "MODELVIEW":

					var m4 = boundUniform.uniform.value;
					m4.multiplyMatrices( camera.matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
					break;

				case "MODELVIEWINVERSETRANSPOSE":

					var m3 = boundUniform.uniform.value;
					this._m4.multiplyMatrices( camera.matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
					m3.getNormalMatrix( this._m4 );
					break;

				case "PROJECTION":

					var m4 = boundUniform.uniform.value;
					m4.copy( camera.projectionMatrix );
					break;

				case "JOINTMATRIX":

					var m4v = boundUniform.uniform.value;

					for ( var mi = 0; mi < m4v.length; mi ++ ) {

						// So it goes like this:
						// SkinnedMesh world matrix is already baked into MODELVIEW;
						// transform joints to local space,
						// then transform using joint's inverse
						m4v[ mi ]
							.getInverse( boundUniform.sourceNode.matrixWorld )
							.multiply( boundUniform.targetNode.skeleton.bones[ mi ].matrixWorld )
							.multiply( boundUniform.targetNode.skeleton.boneInverses[ mi ] )
							.multiply( boundUniform.targetNode.bindMatrix );

					}

					break;

				default :

					console.warn( "Unhandled shader semantic: " + boundUniform.semantic );
					break;

			}

		}
    }


}

var EXTENSIONS = {
    KHR_BINARY_GLTF: 'KHR_binary_glTF',
    KHR_MATERIALS_COMMON: 'KHR_materials_common'
};

function GLTFMaterialsCommonExtension( json ) {

    this.name = EXTENSIONS.KHR_MATERIALS_COMMON;

    this.lights = {};

    var extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) || {};
    var lights = extension.lights || {};

    for ( var lightId in lights ) {

        var light = lights[ lightId ];
        var lightNode;

        var lightParams = light[ light.type ];
        var color = new Color().fromArray( lightParams.color );

        switch ( light.type ) {

            case "directional":
                lightNode = new DirectionalLight( color );
                lightNode.position.set( 0, 0, 1 );
                break;

            case "point":
                lightNode = new PointLight( color );
                break;

            case "spot":
                lightNode = new SpotLight( color );
                lightNode.position.set( 0, 0, 1 );
                break;

            case "ambient":
                lightNode = new AmbientLight( color );
                break;

        }

        if ( lightNode ) {

            this.lights[ lightId ] = lightNode;

        }

    }
}

var BINARY_EXTENSION_BUFFER_NAME = 'binary_glTF';

var BINARY_EXTENSION_HEADER_DEFAULTS = { magic: 'glTF', version: 1, contentFormat: 0 };

var BINARY_EXTENSION_HEADER_LENGTH = 20;

class GLTFBinaryExtension{
    constructor( data ) {

        this.name = EXTENSIONS.KHR_BINARY_GLTF;

        var headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

        var header = {
            magic: LoaderUtils.decodeText( new Uint8Array( data.slice( 0, 4 ) ) ),
            version: headerView.getUint32( 4, true ),
            length: headerView.getUint32( 8, true ),
            contentLength: headerView.getUint32( 12, true ),
            contentFormat: headerView.getUint32( 16, true )
        };

        for ( var key in BINARY_EXTENSION_HEADER_DEFAULTS ) {

            var value = BINARY_EXTENSION_HEADER_DEFAULTS[ key ];

            if ( header[ key ] !== value ) {

                throw new Error( 'Unsupported glTF-Binary header: Expected "%s" to be "%s".', key, value );

            }

        }

        var contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH, header.contentLength );

        this.header = header;
        this.content = LoaderUtils.decodeText( contentArray );
        this.body = data.slice( BINARY_EXTENSION_HEADER_LENGTH + header.contentLength, header.length );
    }

    loadShader = function ( shader, bufferViews ) {

		var bufferView = bufferViews[ shader.extensions[ EXTENSIONS.KHR_BINARY_GLTF ].bufferView ];
		var array = new Uint8Array( bufferView );

		return LoaderUtils.decodeText( array );

	};
}

var WEBGL_CONSTANTS = {
    FLOAT: 5126,
    //FLOAT_MAT2: 35674,
    FLOAT_MAT3: 35675,
    FLOAT_MAT4: 35676,
    FLOAT_VEC2: 35664,
    FLOAT_VEC3: 35665,
    FLOAT_VEC4: 35666,
    LINEAR: 9729,
    REPEAT: 10497,
    SAMPLER_2D: 35678,
    TRIANGLES: 4,
    LINES: 1,
    UNSIGNED_BYTE: 5121,
    UNSIGNED_SHORT: 5123,

    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632
};

var WEBGL_TYPE = {
    5126: Number,
    //35674: Matrix2,
    35675: Matrix3,
    35676: Matrix4,
    35664: Vector2,
    35665: Vector3,
    35666: Vector4,
    35678: Texture
};

var WEBGL_COMPONENT_TYPES = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
};

var WEBGL_FILTERS = {
    9728: NearestFilter,
    9729: LinearFilter,
    9984: NearestMipmapNearestFilter,
    9985: LinearMipmapNearestFilter,
    9986: NearestMipmapLinearFilter,
    9987: LinearMipmapLinearFilter
};

var WEBGL_WRAPPINGS = {
    33071: ClampToEdgeWrapping,
    33648: MirroredRepeatWrapping,
    10497: RepeatWrapping
};

var WEBGL_TEXTURE_FORMATS = {
    6406: AlphaFormat,
    6407: RGBFormat,
    6408: RGBAFormat,
    6409: LuminanceFormat,
    6410: LuminanceAlphaFormat
};

var WEBGL_TEXTURE_DATATYPES = {
    5121: UnsignedByteType,
    32819: UnsignedShort4444Type,
    32820: UnsignedShort5551Type,
    33635: UnsignedShort565Type
};

var WEBGL_SIDES = {
    1028: BackSide, // Culling front
    1029: FrontSide // Culling back
    //1032: NoSide   // Culling front and back, what to do?
};

var WEBGL_DEPTH_FUNCS = {
    512: NeverDepth,
    513: LessDepth,
    514: EqualDepth,
    515: LessEqualDepth,
    516: GreaterEqualDepth,
    517: NotEqualDepth,
    518: GreaterEqualDepth,
    519: AlwaysDepth
};

var WEBGL_BLEND_EQUATIONS = {
    32774: AddEquation,
    32778: SubtractEquation,
    32779: ReverseSubtractEquation
};

var WEBGL_BLEND_FUNCS = {
    0: ZeroFactor,
    1: OneFactor,
    768: SrcColorFactor,
    769: OneMinusSrcColorFactor,
    770: SrcAlphaFactor,
    771: OneMinusSrcAlphaFactor,
    772: DstAlphaFactor,
    773: OneMinusDstAlphaFactor,
    774: DstColorFactor,
    775: OneMinusDstColorFactor,
    776: SrcAlphaSaturateFactor
    // The followings are not supported by js yet
    //32769: CONSTANT_COLOR,
    //32770: ONE_MINUS_CONSTANT_COLOR,
    //32771: CONSTANT_ALPHA,
    //32772: ONE_MINUS_CONSTANT_COLOR
};

var WEBGL_TYPE_SIZES = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT2': 4,
    'MAT3': 9,
    'MAT4': 16
};

var PATH_PROPERTIES = {
    scale: 'scale',
    translation: 'position',
    rotation: 'quaternion'
};

var INTERPOLATION = {
    LINEAR: InterpolateLinear,
    STEP: InterpolateDiscrete
};

var STATES_ENABLES = {
    2884: 'CULL_FACE',
    2929: 'DEPTH_TEST',
    3042: 'BLEND',
    3089: 'SCISSOR_TEST',
    32823: 'POLYGON_OFFSET_FILL',
    32926: 'SAMPLE_ALPHA_TO_COVERAGE'
};

function _each( object, callback, thisObj ) {

    if ( ! object ) {

        return Promise.resolve();

    }

    var results;
    var fns = [];

    if ( Object.prototype.toString.call( object ) === '[object Array]' ) {

        results = [];

        var length = object.length;

        for ( var idx = 0; idx < length; idx ++ ) {

            var value = callback.call( thisObj || this, object[ idx ], idx );

            if ( value ) {

                fns.push( value );

                if ( value instanceof Promise ) {

                    value.then( function ( key, value ) {

                        results[ key ] = value;

                    }.bind( this, idx ) );

                } else {

                    results[ idx ] = value;

                }

            }

        }

    } else {

        results = {};

        for ( var key in object ) {

            if ( object.hasOwnProperty( key ) ) {

                var value = callback.call( thisObj || this, object[ key ], key );

                if ( value ) {

                    fns.push( value );

                    if ( value instanceof Promise ) {

                        value.then( function ( key, value ) {

                            results[ key ] = value;

                        }.bind( this, key ) );

                    } else {

                        results[ key ] = value;

                    }

                }

            }

        }

    }

    return Promise.all( fns ).then( function () {

        return results;

    } );

}

function resolveURL( url, path ) {

    // Invalid URL
    if ( typeof url !== 'string' || url === '' )
        return '';

    // Absolute URL http://,https://,//
    if ( /^(https?:)?\/\//i.test( url ) ) {

        return url;

    }

    // Data URI
    if ( /^data:.*,.*$/i.test( url ) ) {

        return url;

    }

    // Blob URL
    if ( /^blob:.*$/i.test( url ) ) {

        return url;

    }

    // Relative URL
    return ( path || '' ) + url;

}

// js seems too dependent on attribute names so globally
// replace those in the shader code
function replaceTHREEShaderAttributes( shaderText, technique ) {

    // Expected technique attributes
    var attributes = {};

    for ( var attributeId in technique.attributes ) {

        var pname = technique.attributes[ attributeId ];

        var param = technique.parameters[ pname ];
        var atype = param.type;
        var semantic = param.semantic;

        attributes[ attributeId ] = {
            type: atype,
            semantic: semantic
        };

    }

    // Figure out which attributes to change in technique

    var shaderParams = technique.parameters;
    var shaderAttributes = technique.attributes;
    var params = {};

    for ( var attributeId in attributes ) {

        var pname = shaderAttributes[ attributeId ];
        var shaderParam = shaderParams[ pname ];
        var semantic = shaderParam.semantic;
        if ( semantic ) {

            params[ attributeId ] = shaderParam;

        }

    }

    for ( var pname in params ) {

        var param = params[ pname ];
        var semantic = param.semantic;

        var regEx = new RegExp( "\\b" + pname + "\\b", "g" );

        switch ( semantic ) {

            case "POSITION":

                shaderText = shaderText.replace( regEx, 'position' );
                break;

            case "NORMAL":

                shaderText = shaderText.replace( regEx, 'normal' );
                break;

            case 'TEXCOORD_0':
            case 'TEXCOORD0':
            case 'TEXCOORD':

                shaderText = shaderText.replace( regEx, 'uv' );
                break;

            case 'TEXCOORD_1':

                shaderText = shaderText.replace( regEx, 'uv2' );
                break;

            case 'COLOR_0':
            case 'COLOR0':
            case 'COLOR':

                shaderText = shaderText.replace( regEx, 'color' );
                break;

            case "WEIGHT":

                shaderText = shaderText.replace( regEx, 'skinWeight' );
                break;

            case "JOINT":

                shaderText = shaderText.replace( regEx, 'skinIndex' );
                break;

        }

    }

    return shaderText;

}

function createDefaultMaterial() {

    return new MeshPhongMaterial( {
        color: 0x00000,
        emissive: 0x888888,
        specular: 0x000000,
        shininess: 0,
        transparent: false,
        depthTest: true,
        side: FrontSide
    } );

}

class DeferredShaderMaterial {
    constructor( params ) {
        this.isDeferredShaderMaterial = true;

        this.params = params;
    }

    create = function () {

        var uniforms = UniformsUtils.clone( this.params.uniforms );

        for ( var uniformId in this.params.uniforms ) {

            var originalUniform = this.params.uniforms[ uniformId ];

            if ( originalUniform.value instanceof Texture ) {

                uniforms[ uniformId ].value = originalUniform.value;
                uniforms[ uniformId ].value.needsUpdate = true;

            }

            uniforms[ uniformId ].semantic = originalUniform.semantic;
            uniforms[ uniformId ].node = originalUniform.node;

        }

        this.params.uniforms = uniforms;

        return new RawShaderMaterial( this.params );
    }
}

class GLTFParser {
    constructor( json, extensions, options ) {
        this.json = json || {};
        this.extensions = extensions || {};
        this.options = options || {};

        // loader object cache
        this.cache = new GLTFRegistry();
    }

    _withDependencies = function ( dependencies ) {

		var _dependencies = {};

		for ( var i = 0; i < dependencies.length; i ++ ) {

			var dependency = dependencies[ i ];
			var fnName = "load" + dependency.charAt( 0 ).toUpperCase() + dependency.slice( 1 );

			var cached = this.cache.get( dependency );

			if ( cached !== undefined ) {

				_dependencies[ dependency ] = cached;

			} else if ( this[ fnName ] ) {

				var fn = this[ fnName ]();
				this.cache.add( dependency, fn );

				_dependencies[ dependency ] = fn;

			}

		}

		return _each( _dependencies, function ( dependency ) {

			return dependency;

		} );

	};

	parse = function ( callback ) {

		var json = this.json;

		// Clear the loader cache
		this.cache.removeAll();

		// Fire the callback on complete
		this._withDependencies( [

			"scenes",
			"cameras",
			"animations"

		] ).then( function ( dependencies ) {

			var scenes = [];

			for ( var name in dependencies.scenes ) {

				scenes.push( dependencies.scenes[ name ] );

			}

			var scene = json.scene !== undefined ? dependencies.scenes[ json.scene ] : scenes[ 0 ];

			var cameras = [];

			for ( var name in dependencies.cameras ) {

				var camera = dependencies.cameras[ name ];
				cameras.push( camera );

			}

			var animations = [];

			for ( var name in dependencies.animations ) {

				animations.push( dependencies.animations[ name ] );

			}

			callback( scene, scenes, cameras, animations );

		} );

	};

	loadShaders = function () {

		var json = this.json;
		var extensions = this.extensions;
		var options = this.options;

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			return _each( json.shaders, function ( shader ) {

				if ( shader.extensions && shader.extensions[ EXTENSIONS.KHR_BINARY_GLTF ] ) {

					return extensions[ EXTENSIONS.KHR_BINARY_GLTF ].loadShader( shader, dependencies.bufferViews );

				}

				return new Promise( function ( resolve ) {

					var loader = new FileLoader( options.manager );
					loader.setResponseType( 'text' );
					loader.load( resolveURL( shader.uri, options.path ), function ( shaderText ) {

						resolve( shaderText );

					} );

				} );

			} );

		} );

	};

	loadBuffers = function () {

		var json = this.json;
		var extensions = this.extensions;
		var options = this.options;

		return _each( json.buffers, function ( buffer, name ) {

			if ( name === BINARY_EXTENSION_BUFFER_NAME ) {

				return extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body;

			}

			if ( buffer.type === 'arraybuffer' || buffer.type === undefined ) {

				return new Promise( function ( resolve ) {

					var loader = new FileLoader( options.manager );
					loader.setResponseType( 'arraybuffer' );
					loader.load( resolveURL( buffer.uri, options.path ), function ( buffer ) {

						resolve( buffer );

					} );

				} );

			} else {

				console.warn( 'THREE.LegacyGLTFLoader: ' + buffer.type + ' buffer type is not supported' );

			}

		} );

	};

	loadBufferViews = function () {

		var json = this.json;

		return this._withDependencies( [

			"buffers"

		] ).then( function ( dependencies ) {

			return _each( json.bufferViews, function ( bufferView ) {

				var arraybuffer = dependencies.buffers[ bufferView.buffer ];

				var byteLength = bufferView.byteLength !== undefined ? bufferView.byteLength : 0;

				return arraybuffer.slice( bufferView.byteOffset, bufferView.byteOffset + byteLength );

			} );

		} );

	};

	loadAccessors = function () {

		var json = this.json;

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			return _each( json.accessors, function ( accessor ) {

				var arraybuffer = dependencies.bufferViews[ accessor.bufferView ];
				var itemSize = WEBGL_TYPE_SIZES[ accessor.type ];
				var TypedArray = WEBGL_COMPONENT_TYPES[ accessor.componentType ];

				// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
				var elementBytes = TypedArray.BYTES_PER_ELEMENT;
				var itemBytes = elementBytes * itemSize;

				// The buffer is not interleaved if the stride is the item size in bytes.
				if ( accessor.byteStride && accessor.byteStride !== itemBytes ) {

					// Use the full buffer if it's interleaved.
					var array = new TypedArray( arraybuffer );

					// Integer parameters to IB/IBA are in array elements, not bytes.
					var ib = new InterleavedBuffer( array, accessor.byteStride / elementBytes );

					return new InterleavedBufferAttribute( ib, itemSize, accessor.byteOffset / elementBytes );

				} else {

					array = new TypedArray( arraybuffer, accessor.byteOffset, accessor.count * itemSize );

					return new BufferAttribute( array, itemSize );

				}

			} );

		} );

	};

	loadTextures = function () {

		var json = this.json;
		var options = this.options;

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			return _each( json.textures, function ( texture ) {

				if ( texture.source ) {

					return new Promise( function ( resolve ) {

						var source = json.images[ texture.source ];
						var sourceUri = source.uri;
						var isObjectURL = false;

						if ( source.extensions && source.extensions[ EXTENSIONS.KHR_BINARY_GLTF ] ) {

							var metadata = source.extensions[ EXTENSIONS.KHR_BINARY_GLTF ];
							var bufferView = dependencies.bufferViews[ metadata.bufferView ];
							var blob = new Blob( [ bufferView ], { type: metadata.mimeType } );
							sourceUri = URL.createObjectURL( blob );
							isObjectURL = true;

						}

						var textureLoader = options.manager.getHandler( sourceUri );

						if ( textureLoader === null ) {

							textureLoader = new TextureLoader( options.manager );

						}

						textureLoader.setCrossOrigin( options.crossOrigin );

						textureLoader.load( resolveURL( sourceUri, options.path ), function ( _texture ) {

							if ( isObjectURL ) URL.revokeObjectURL( sourceUri );

							_texture.flipY = false;

							if ( texture.name !== undefined ) _texture.name = texture.name;

							_texture.format = texture.format !== undefined ? WEBGL_TEXTURE_FORMATS[ texture.format ] : RGBAFormat;

							if ( texture.internalFormat !== undefined && _texture.format !== WEBGL_TEXTURE_FORMATS[ texture.internalFormat ] ) {

								console.warn( 'THREE.LegacyGLTFLoader: Three.js doesn\'t support texture internalFormat which is different from texture format. ' +
															'internalFormat will be forced to be the same value as format.' );

							}

							_texture.type = texture.type !== undefined ? WEBGL_TEXTURE_DATATYPES[ texture.type ] : UnsignedByteType;

							if ( texture.sampler ) {

								var sampler = json.samplers[ texture.sampler ];

								_texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || LinearFilter;
								_texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || NearestMipmapLinearFilter;
								_texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || RepeatWrapping;
								_texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || RepeatWrapping;

							}

							resolve( _texture );

						}, undefined, function () {

							if ( isObjectURL ) URL.revokeObjectURL( sourceUri );

							resolve();

						} );

					} );

				}

			} );

		} );

	};

    loadMaterials = function () {

		var json = this.json;

		return this._withDependencies( [

			"shaders",
			"textures"

		] ).then( function ( dependencies ) {

			return _each( json.materials, function ( material ) {

				var materialType;
				var materialValues = {};
				var materialParams = {};

				var khr_material;

				if ( material.extensions && material.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) {

					khr_material = material.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ];

				}

				if ( khr_material ) {

					// don't copy over unused values to avoid material warning spam
					var keys = [ 'ambient', 'emission', 'transparent', 'transparency', 'doubleSided' ];

					switch ( khr_material.technique ) {

						case 'BLINN' :
						case 'PHONG' :
							materialType = MeshPhongMaterial;
							keys.push( 'diffuse', 'specular', 'shininess' );
							break;

						case 'LAMBERT' :
							materialType = MeshLambertMaterial;
							keys.push( 'diffuse' );
							break;

						case 'CONSTANT' :
						default :
							materialType = MeshBasicMaterial;
							break;

					}

					keys.forEach( function ( v ) {

						if ( khr_material.values[ v ] !== undefined ) materialValues[ v ] = khr_material.values[ v ];

					} );

					if ( khr_material.doubleSided || materialValues.doubleSided ) {

						materialParams.side = DoubleSide;

					}

					if ( khr_material.transparent || materialValues.transparent ) {

						materialParams.transparent = true;
						materialParams.opacity = ( materialValues.transparency !== undefined ) ? materialValues.transparency : 1;

					}

				} else if ( material.technique === undefined ) {

					materialType = MeshPhongMaterial;

					Object.assign( materialValues, material.values );

				} else {

					materialType = DeferredShaderMaterial;

					var technique = json.techniques[ material.technique ];

					materialParams.uniforms = {};

					var program = json.programs[ technique.program ];

					if ( program ) {

						materialParams.fragmentShader = dependencies.shaders[ program.fragmentShader ];

						if ( ! materialParams.fragmentShader ) {

							console.warn( "ERROR: Missing fragment shader definition:", program.fragmentShader );
							materialType = MeshPhongMaterial;

						}

						var vertexShader = dependencies.shaders[ program.vertexShader ];

						if ( ! vertexShader ) {

							console.warn( "ERROR: Missing vertex shader definition:", program.vertexShader );
							materialType = MeshPhongMaterial;

						}

						// IMPORTANT: FIX VERTEX SHADER ATTRIBUTE DEFINITIONS
						materialParams.vertexShader = replaceTHREEShaderAttributes( vertexShader, technique );

						var uniforms = technique.uniforms;

						for ( var uniformId in uniforms ) {

							var pname = uniforms[ uniformId ];
							var shaderParam = technique.parameters[ pname ];

							var ptype = shaderParam.type;

							if ( WEBGL_TYPE[ ptype ] ) {

								var pcount = shaderParam.count;
								var value;

								if ( material.values !== undefined ) value = material.values[ pname ];

								var uvalue = new WEBGL_TYPE[ ptype ]();
								var usemantic = shaderParam.semantic;
								var unode = shaderParam.node;

								switch ( ptype ) {

									case WEBGL_CONSTANTS.FLOAT:

										uvalue = shaderParam.value;

										if ( pname == "transparency" ) {

											materialParams.transparent = true;

										}

										if ( value !== undefined ) {

											uvalue = value;

										}

										break;

									case WEBGL_CONSTANTS.FLOAT_VEC2:
									case WEBGL_CONSTANTS.FLOAT_VEC3:
									case WEBGL_CONSTANTS.FLOAT_VEC4:
									case WEBGL_CONSTANTS.FLOAT_MAT3:

										if ( shaderParam && shaderParam.value ) {

											uvalue.fromArray( shaderParam.value );

										}

										if ( value ) {

											uvalue.fromArray( value );

										}

										break;

									case WEBGL_CONSTANTS.FLOAT_MAT2:

										// what to do?
										console.warn( "FLOAT_MAT2 is not a supported uniform type" );
										break;

									case WEBGL_CONSTANTS.FLOAT_MAT4:

										if ( pcount ) {

											uvalue = new Array( pcount );

											for ( var mi = 0; mi < pcount; mi ++ ) {

												uvalue[ mi ] = new WEBGL_TYPE[ ptype ]();

											}

											if ( shaderParam && shaderParam.value ) {

												var m4v = shaderParam.value;
												uvalue.fromArray( m4v );

											}

											if ( value ) {

												uvalue.fromArray( value );

											}

										} else {

											if ( shaderParam && shaderParam.value ) {

												var m4 = shaderParam.value;
												uvalue.fromArray( m4 );

											}

											if ( value ) {

												uvalue.fromArray( value );

											}

										}

										break;

									case WEBGL_CONSTANTS.SAMPLER_2D:

										if ( value !== undefined ) {

											uvalue = dependencies.textures[ value ];

										} else if ( shaderParam.value !== undefined ) {

											uvalue = dependencies.textures[ shaderParam.value ];

										} else {

											uvalue = null;

										}

										break;

								}

								materialParams.uniforms[ uniformId ] = {
									value: uvalue,
									semantic: usemantic,
									node: unode
								};

							} else {

								throw new Error( "Unknown shader uniform param type: " + ptype );

							}

						}

						var states = technique.states || {};
						var enables = states.enable || [];
						var functions = states.functions || {};

						var enableCullFace = false;
						var enableDepthTest = false;
						var enableBlend = false;

						for ( var i = 0, il = enables.length; i < il; i ++ ) {

							var enable = enables[ i ];

							switch ( STATES_ENABLES[ enable ] ) {

								case 'CULL_FACE':

									enableCullFace = true;

									break;

								case 'DEPTH_TEST':

									enableDepthTest = true;

									break;

								case 'BLEND':

									enableBlend = true;

									break;

								// TODO: implement
								case 'SCISSOR_TEST':
								case 'POLYGON_OFFSET_FILL':
								case 'SAMPLE_ALPHA_TO_COVERAGE':

									break;

								default:

									throw new Error( "Unknown technique.states.enable: " + enable );

							}

						}

						if ( enableCullFace ) {

							materialParams.side = functions.cullFace !== undefined ? WEBGL_SIDES[ functions.cullFace ] : FrontSide;

						} else {

							materialParams.side = DoubleSide;

						}

						materialParams.depthTest = enableDepthTest;
						materialParams.depthFunc = functions.depthFunc !== undefined ? WEBGL_DEPTH_FUNCS[ functions.depthFunc ] : LessDepth;
						materialParams.depthWrite = functions.depthMask !== undefined ? functions.depthMask[ 0 ] : true;

						materialParams.blending = enableBlend ? CustomBlending : NoBlending;
						materialParams.transparent = enableBlend;

						var blendEquationSeparate = functions.blendEquationSeparate;

						if ( blendEquationSeparate !== undefined ) {

							materialParams.blendEquation = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 0 ] ];
							materialParams.blendEquationAlpha = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 1 ] ];

						} else {

							materialParams.blendEquation = AddEquation;
							materialParams.blendEquationAlpha = AddEquation;

						}

						var blendFuncSeparate = functions.blendFuncSeparate;

						if ( blendFuncSeparate !== undefined ) {

							materialParams.blendSrc = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 0 ] ];
							materialParams.blendDst = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 1 ] ];
							materialParams.blendSrcAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 2 ] ];
							materialParams.blendDstAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 3 ] ];

						} else {

							materialParams.blendSrc = OneFactor;
							materialParams.blendDst = ZeroFactor;
							materialParams.blendSrcAlpha = OneFactor;
							materialParams.blendDstAlpha = ZeroFactor;

						}

					}

				}

				if ( Array.isArray( materialValues.diffuse ) ) {

					materialParams.color = new Color().fromArray( materialValues.diffuse );

				} else if ( typeof ( materialValues.diffuse ) === 'string' ) {

					materialParams.map = dependencies.textures[ materialValues.diffuse ];

				}

				delete materialParams.diffuse;

				if ( typeof ( materialValues.reflective ) === 'string' ) {

					materialParams.envMap = dependencies.textures[ materialValues.reflective ];

				}

				if ( typeof ( materialValues.bump ) === 'string' ) {

					materialParams.bumpMap = dependencies.textures[ materialValues.bump ];

				}

				if ( Array.isArray( materialValues.emission ) ) {

					if ( materialType === MeshBasicMaterial ) {

						materialParams.color = new Color().fromArray( materialValues.emission );

					} else {

						materialParams.emissive = new Color().fromArray( materialValues.emission );

					}

				} else if ( typeof ( materialValues.emission ) === 'string' ) {

					if ( materialType === MeshBasicMaterial ) {

						materialParams.map = dependencies.textures[ materialValues.emission ];

					} else {

						materialParams.emissiveMap = dependencies.textures[ materialValues.emission ];

					}

				}

				if ( Array.isArray( materialValues.specular ) ) {

					materialParams.specular = new Color().fromArray( materialValues.specular );

				} else if ( typeof ( materialValues.specular ) === 'string' ) {

					materialParams.specularMap = dependencies.textures[ materialValues.specular ];

				}

				if ( materialValues.shininess !== undefined ) {

					materialParams.shininess = materialValues.shininess;

				}

				var _material = new materialType( materialParams );
				if ( material.name !== undefined ) _material.name = material.name;

				return _material;

			} );

		} );

	};

	loadMeshes = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors",
			"materials"

		] ).then( function ( dependencies ) {

			return _each( json.meshes, function ( mesh ) {

				var group = new Group();
				if ( mesh.name !== undefined ) group.name = mesh.name;

				if ( mesh.extras ) group.userData = mesh.extras;

				var primitives = mesh.primitives || [];

				for ( var name in primitives ) {

					var primitive = primitives[ name ];

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === undefined ) {

						var geometry = new BufferGeometry();

						var attributes = primitive.attributes;

						for ( var attributeId in attributes ) {

							var attributeEntry = attributes[ attributeId ];

							if ( ! attributeEntry ) return;

							var bufferAttribute = dependencies.accessors[ attributeEntry ];

							switch ( attributeId ) {

								case 'POSITION':
									geometry.setAttribute( 'position', bufferAttribute );
									break;

								case 'NORMAL':
									geometry.setAttribute( 'normal', bufferAttribute );
									break;

								case 'TEXCOORD_0':
								case 'TEXCOORD0':
								case 'TEXCOORD':
									geometry.setAttribute( 'uv', bufferAttribute );
									break;

								case 'TEXCOORD_1':
									geometry.setAttribute( 'uv2', bufferAttribute );
									break;

								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':
									geometry.setAttribute( 'color', bufferAttribute );
									break;

								case 'WEIGHT':
									geometry.setAttribute( 'skinWeight', bufferAttribute );
									break;

								case 'JOINT':
									geometry.setAttribute( 'skinIndex', bufferAttribute );
									break;

								default:

									if ( ! primitive.material ) break;

									var material = json.materials[ primitive.material ];

									if ( ! material.technique ) break;

									var parameters = json.techniques[ material.technique ].parameters || {};

									for ( var attributeName in parameters ) {

										if ( parameters[ attributeName ][ 'semantic' ] === attributeId ) {

											geometry.setAttribute( attributeName, bufferAttribute );

										}

									}

							}

						}

						if ( primitive.indices ) {

							geometry.setIndex( dependencies.accessors[ primitive.indices ] );

						}

						var material = dependencies.materials !== undefined ? dependencies.materials[ primitive.material ] : createDefaultMaterial();

						var meshNode = new Mesh( geometry, material );
						meshNode.castShadow = true;
						meshNode.name = ( name === "0" ? group.name : group.name + name );

						if ( primitive.extras ) meshNode.userData = primitive.extras;

						group.add( meshNode );

					} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

						var geometry = new BufferGeometry();

						var attributes = primitive.attributes;

						for ( var attributeId in attributes ) {

							var attributeEntry = attributes[ attributeId ];

							if ( ! attributeEntry ) return;

							var bufferAttribute = dependencies.accessors[ attributeEntry ];

							switch ( attributeId ) {

								case 'POSITION':
									geometry.setAttribute( 'position', bufferAttribute );
									break;

								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':
									geometry.setAttribute( 'color', bufferAttribute );
									break;

							}

						}

						var material = dependencies.materials[ primitive.material ];

						var meshNode;

						if ( primitive.indices ) {

							geometry.setIndex( dependencies.accessors[ primitive.indices ] );

							meshNode = new LineSegments( geometry, material );

						} else {

							meshNode = new Line( geometry, material );

						}

						meshNode.name = ( name === "0" ? group.name : group.name + name );

						if ( primitive.extras ) meshNode.userData = primitive.extras;

						group.add( meshNode );

					} else {

						console.warn( "Only triangular and line primitives are supported" );

					}

				}

				return group;

			} );

		} );

	};

	loadCameras = function () {

		var json = this.json;

		return _each( json.cameras, function ( camera ) {

			if ( camera.type == "perspective" && camera.perspective ) {

				var yfov = camera.perspective.yfov;
				var aspectRatio = camera.perspective.aspectRatio !== undefined ? camera.perspective.aspectRatio : 1;

				// According to COLLADA spec...
				// aspectRatio = xfov / yfov
				var xfov = yfov * aspectRatio;

				var _camera = new PerspectiveCamera( Math.radToDeg( xfov ), aspectRatio, camera.perspective.znear || 1, camera.perspective.zfar || 2e6 );
				if ( camera.name !== undefined ) _camera.name = camera.name;

				if ( camera.extras ) _camera.userData = camera.extras;

				return _camera;

			} else if ( camera.type == "orthographic" && camera.orthographic ) {

				var _camera = new OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, camera.orthographic.znear, camera.orthographic.zfar );
				if ( camera.name !== undefined ) _camera.name = camera.name;

				if ( camera.extras ) _camera.userData = camera.extras;

				return _camera;

			}

		} );

	};

	loadSkins = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors"

		] ).then( function ( dependencies ) {

			return _each( json.skins, function ( skin ) {

				var bindShapeMatrix = new Matrix4();

				if ( skin.bindShapeMatrix !== undefined ) bindShapeMatrix.fromArray( skin.bindShapeMatrix );

				var _skin = {
					bindShapeMatrix: bindShapeMatrix,
					jointNames: skin.jointNames,
					inverseBindMatrices: dependencies.accessors[ skin.inverseBindMatrices ]
				};

				return _skin;

			} );

		} );

	};

	loadAnimations = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors",
			"nodes"

		] ).then( function ( dependencies ) {

			return _each( json.animations, function ( animation, animationId ) {

				var tracks = [];

				for ( var channelId in animation.channels ) {

					var channel = animation.channels[ channelId ];
					var sampler = animation.samplers[ channel.sampler ];

					if ( sampler ) {

						var target = channel.target;
						var name = target.id;
						var input = animation.parameters !== undefined ? animation.parameters[ sampler.input ] : sampler.input;
						var output = animation.parameters !== undefined ? animation.parameters[ sampler.output ] : sampler.output;

						var inputAccessor = dependencies.accessors[ input ];
						var outputAccessor = dependencies.accessors[ output ];

						var node = dependencies.nodes[ name ];

						if ( node ) {

							node.updateMatrix();
							node.matrixAutoUpdate = true;

							var TypedKeyframeTrack = PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.rotation
								? QuaternionKeyframeTrack
								: VectorKeyframeTrack;

							var targetName = node.name ? node.name : node.uuid;
							var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : InterpolateLinear;

							// KeyframeTrack.optimize() will modify given 'times' and 'values'
							// buffers before creating a truncated copy to keep. Because buffers may
							// be reused by other tracks, make copies here.
							tracks.push( new TypedKeyframeTrack(
								targetName + '.' + PATH_PROPERTIES[ target.path ],
								AnimationUtils.arraySlice( inputAccessor.array, 0 ),
								AnimationUtils.arraySlice( outputAccessor.array, 0 ),
								interpolation
							) );

						}

					}

				}

				var name = animation.name !== undefined ? animation.name : "animation_" + animationId;

				return new AnimationClip( name, undefined, tracks );

			} );

		} );

	};

	loadNodes = function () {

		var json = this.json;
		var extensions = this.extensions;
		var scope = this;

		return _each( json.nodes, function ( node ) {

			var matrix = new Matrix4();

			var _node;

			if ( node.jointName ) {

				_node = new Bone();
				_node.name = node.name !== undefined ? node.name : node.jointName;
				_node.jointName = node.jointName;

			} else {

				_node = new Object3D();
				if ( node.name !== undefined ) _node.name = node.name;

			}

			if ( node.extras ) _node.userData = node.extras;

			if ( node.matrix !== undefined ) {

				matrix.fromArray( node.matrix );
				_node.applyMatrix4( matrix );

			} else {

				if ( node.translation !== undefined ) {

					_node.position.fromArray( node.translation );

				}

				if ( node.rotation !== undefined ) {

					_node.quaternion.fromArray( node.rotation );

				}

				if ( node.scale !== undefined ) {

					_node.scale.fromArray( node.scale );

				}

			}

			return _node;

		} ).then( function ( __nodes ) {

			return scope._withDependencies( [

				"meshes",
				"skins",
				"cameras"

			] ).then( function ( dependencies ) {

				return _each( __nodes, function ( _node, nodeId ) {

					var node = json.nodes[ nodeId ];

					if ( node.meshes !== undefined ) {

						for ( var meshId in node.meshes ) {

							var mesh = node.meshes[ meshId ];
							var group = dependencies.meshes[ mesh ];

							if ( group === undefined ) {

								console.warn( 'LegacyGLTFLoader: Couldn\'t find node "' + mesh + '".' );
								continue;

							}

							for ( var childrenId in group.children ) {

								var child = group.children[ childrenId ];

								// clone Mesh to add to _node

								var originalMaterial = child.material;
								var originalGeometry = child.geometry;
								var originalUserData = child.userData;
								var originalName = child.name;

								var material;

								if ( originalMaterial.isDeferredShaderMaterial ) {

									originalMaterial = material = originalMaterial.create();

								} else {

									material = originalMaterial;

								}

								switch ( child.type ) {

									case 'LineSegments':
										child = new LineSegments( originalGeometry, material );
										break;

									case 'LineLoop':
										child = new LineLoop( originalGeometry, material );
										break;

									case 'Line':
										child = new Line( originalGeometry, material );
										break;

									default:
										child = new Mesh( originalGeometry, material );

								}

								child.castShadow = true;
								child.userData = originalUserData;
								child.name = originalName;

								var skinEntry;

								if ( node.skin ) {

									skinEntry = dependencies.skins[ node.skin ];

								}

								// Replace Mesh with SkinnedMesh in library
								if ( skinEntry ) {

									var getJointNode = function ( jointId ) {

										var keys = Object.keys( __nodes );

										for ( var i = 0, il = keys.length; i < il; i ++ ) {

											var n = __nodes[ keys[ i ] ];

											if ( n.jointName === jointId ) return n;

										}

										return null;

									};

									var geometry = originalGeometry;
									var material = originalMaterial;
									material.skinning = true;

									child = new SkinnedMesh( geometry, material );
									child.castShadow = true;
									child.userData = originalUserData;
									child.name = originalName;

									var bones = [];
									var boneInverses = [];

									for ( var i = 0, l = skinEntry.jointNames.length; i < l; i ++ ) {

										var jointId = skinEntry.jointNames[ i ];
										var jointNode = getJointNode( jointId );

										if ( jointNode ) {

											bones.push( jointNode );

											var m = skinEntry.inverseBindMatrices.array;
											var mat = new Matrix4().fromArray( m, i * 16 );
											boneInverses.push( mat );

										} else {

											console.warn( "WARNING: joint: '" + jointId + "' could not be found" );

										}

									}

									child.bind( new Skeleton( bones, boneInverses ), skinEntry.bindShapeMatrix );

									var buildBoneGraph = function ( parentJson, parentObject, property ) {

										var children = parentJson[ property ];

										if ( children === undefined ) return;

										for ( var i = 0, il = children.length; i < il; i ++ ) {

											var nodeId = children[ i ];
											var bone = __nodes[ nodeId ];
											var boneJson = json.nodes[ nodeId ];

											if ( bone !== undefined && bone.isBone === true && boneJson !== undefined ) {

												parentObject.add( bone );
												buildBoneGraph( boneJson, bone, 'children' );

											}

										}

									};

									buildBoneGraph( node, child, 'skeletons' );

								}

								_node.add( child );

							}

						}

					}

					if ( node.camera !== undefined ) {

						var camera = dependencies.cameras[ node.camera ];

						_node.add( camera );

					}

					if ( node.extensions
							 && node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ]
							 && node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].light ) {

						var extensionLights = extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].lights;
						var light = extensionLights[ node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].light ];

						_node.add( light );

					}

					return _node;

				} );

			} );

		} );

	};

	loadScenes = function () {

		var json = this.json;

		// scene node hierachy builder

		function buildNodeHierachy( nodeId, parentObject, allNodes ) {

			var _node = allNodes[ nodeId ];
			parentObject.add( _node );

			var node = json.nodes[ nodeId ];

			if ( node.children ) {

				var children = node.children;

				for ( var i = 0, l = children.length; i < l; i ++ ) {

					var child = children[ i ];
					buildNodeHierachy( child, _node, allNodes );

				}

			}

		}

		return this._withDependencies( [

			"nodes"

		] ).then( function ( dependencies ) {

			return _each( json.scenes, function ( scene ) {

				var _scene = new Scene();
				if ( scene.name !== undefined ) _scene.name = scene.name;

				if ( scene.extras ) _scene.userData = scene.extras;

				var nodes = scene.nodes || [];

				for ( var i = 0, l = nodes.length; i < l; i ++ ) {

					var nodeId = nodes[ i ];
					buildNodeHierachy( nodeId, _scene, dependencies.nodes );

				}

				_scene.traverse( function ( child ) {

					// Register raw material meshes with LegacyGLTFLoader.Shaders
					if ( child.material && child.material.isRawShaderMaterial ) {

						child.gltfShader = new GLTFShader( child, dependencies.nodes );
						child.onBeforeRender = function ( renderer, scene, camera ) {

							this.gltfShader.update( scene, camera );

						};

					}

				} );

				return _scene;

			} );

		} );

	};
}

var Convert = (function () {
    function Convert() {
    }
    Convert.toPoly = function (json) {
        return JSON.parse(json);
    };
    Convert.polyToJson = function (value) {
        return JSON.stringify(value);
    };
    return Convert;
}());

var diamondHullVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_worldNormal;varying vec3 v_normal;varying vec3 v_position;varying vec3 v_worldPosition;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelMatrix;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_worldNormal=(modelMatrix*vec4(a_normal,1)).xyz;v_position=(modelViewMatrix*a_position).xyz;v_worldPosition=(modelMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var diamondHullFrag = "\n#extension GL_OES_standard_derivatives : enable\nprecision mediump float;\n#define GLSLIFY 1\nuniform vec4 u_time;uniform vec4 u_ambient_light_color;uniform vec4 u_SceneLight_0_color;uniform vec4 u_SceneLight_1_color;uniform sampler2D u_MainTex;uniform vec3 cameraPosition;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_worldNormal;varying vec3 v_position;varying vec3 v_worldPosition;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying vec2 v_texcoord0;float dispAmount=.0025;uniform vec3 u_fogColor;uniform float u_fogDensity;varying float f_fog_coord;vec3 ApplyFog(vec3 color){float density=(u_fogDensity/.693147)*10.;float fogFactor=f_fog_coord*density;fogFactor=exp2(-fogFactor);fogFactor=clamp(fogFactor,0.0,1.0);return mix(u_fogColor,color.xyz,fogFactor);}\n#ifndef GL_OES_standard_derivatives\nvec3 PerturbNormal(vec3 position,vec3 normal,vec2 uv){return normal;}\n#else\nuniform sampler2D u_BumpMap;uniform vec4 u_BumpMap_TexelSize;vec3 xxx_dFdx3(vec3 v){return vec3(dFdx(v.x),dFdx(v.y),dFdx(v.z));}vec3 xxx_dFdy3(vec3 v){return vec3(dFdy(v.x),dFdy(v.y),dFdy(v.z));}vec2 xxx_dFdx2(vec2 v){return vec2(dFdx(v.x),dFdx(v.y));}vec2 xxx_dFdy2(vec2 v){return vec2(dFdy(v.x),dFdy(v.y));}vec3 PerturbNormal(vec3 position,vec3 normal,vec2 uv){highp vec3 vSigmaS=xxx_dFdx3(position);highp vec3 vSigmaT=xxx_dFdy3(position);highp vec3 vN=normal;highp vec3 vR1=cross(vSigmaT,vN);highp vec3 vR2=cross(vN,vSigmaS);float fDet=dot(vSigmaS,vR1);vec2 texDx=xxx_dFdx2(uv);vec2 texDy=xxx_dFdy2(uv);float resolution=max(u_BumpMap_TexelSize.z,u_BumpMap_TexelSize.w);highp float d=min(1.,(0.5/resolution)/max(length(texDx),length(texDy)));vec2 STll=uv;vec2 STlr=uv+d*texDx;vec2 STul=uv+d*texDy;highp float Hll=texture2D(u_BumpMap,STll).x;highp float Hlr=texture2D(u_BumpMap,STlr).x;highp float Hul=texture2D(u_BumpMap,STul).x;Hll=mix(Hll,1.-Hll,float(!gl_FrontFacing))*dispAmount;Hlr=mix(Hlr,1.-Hlr,float(!gl_FrontFacing))*dispAmount;Hul=mix(Hul,1.-Hul,float(!gl_FrontFacing))*dispAmount;highp float dBs=(Hlr-Hll)/d;highp float dBt=(Hul-Hll)/d;highp vec3 vSurfGrad=sign(fDet)*(dBs*vR1+dBt*vR2);return normalize(abs(fDet)*vN-vSurfGrad);}\n#endif\nconst float PI=3.141592654;const float INV_PI=0.318309886;const vec3 GAMMA_DIELECTRIC_SPEC=vec3(0.220916301,0.220916301,0.220916301);const float GAMMA_ONE_MINUS_DIELECTRIC=(1.0-0.220916301);float Pow5(float x){return x*x*x*x*x;}float DisneyDiffuseTerm(float NdotV,float NdotL,float LdotH,float perceptualRoughness){float fd90=0.5+2.0*LdotH*LdotH*perceptualRoughness;float lightScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotL);float viewScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotV);return lightScatter*viewScatter;}float SmithJointVisibilityTerm(float NdotL,float NdotV,float roughness){float lambdaV=NdotL*mix(NdotV,1.0,roughness);float lambdaL=NdotV*mix(NdotL,1.0,roughness);return 0.5/(lambdaV+lambdaL+1e-5);}float GgxDistributionTerm(float NdotH,float roughness){float a2=roughness*roughness;float d=(NdotH*a2-NdotH)*NdotH+1.0;return INV_PI*a2/(d*d+1e-7);}vec3 FresnelTerm(vec3 F0,float cosA){float t=Pow5(1.0-cosA);return F0+(vec3(1.0)-F0)*t;}vec3 SurfaceShaderInternal(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor,float perceptualRoughness){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float NdotV=abs(dot(normal,eyeDir));vec3 halfVector=normalize(lightDir+eyeDir);float NdotH=clamp(dot(normal,halfVector),0.0,1.0);float LdotH=clamp(dot(lightDir,halfVector),0.0,1.0);float diffuseTerm=NdotL*DisneyDiffuseTerm(NdotV,NdotL,LdotH,perceptualRoughness);if(length(specularColor)<1e-5){return diffuseColor*(lightColor*diffuseTerm);}float roughness=perceptualRoughness*perceptualRoughness;float V=GgxDistributionTerm(NdotH,roughness);float D=SmithJointVisibilityTerm(NdotL,NdotV,roughness);float specularTerm=V*D*PI;specularTerm=sqrt(max(1e-4,specularTerm));specularTerm*=NdotL;vec3 fresnelColor=FresnelTerm(specularColor,LdotH);return lightColor*(diffuseTerm*diffuseColor+specularTerm*fresnelColor);}vec3 SurfaceShaderSpecularGloss(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,vec3 specularColor,float gloss){float oneMinusSpecularIntensity=1.0-clamp(max(max(specularColor.r,specularColor.g),specularColor.b),0.,1.);vec3 diffuseColor=albedoColor*oneMinusSpecularIntensity;float perceptualRoughness=1.0-gloss;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 SurfaceShaderMetallicRoughness(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,float metallic,float perceptualRoughness){vec3 specularColor=mix(GAMMA_DIELECTRIC_SPEC,albedoColor,metallic);float oneMinusReflectivity=GAMMA_ONE_MINUS_DIELECTRIC-metallic*GAMMA_ONE_MINUS_DIELECTRIC;vec3 diffuseColor=albedoColor*oneMinusReflectivity;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 ShShaderWithSpec(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor){float specularGrayscale=dot(specularColor,vec3(0.3,0.59,0.11));float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float shIntensityMultiplier=1.-specularGrayscale;shIntensityMultiplier*=shIntensityMultiplier;return diffuseColor*lightColor*NdotL*shIntensityMultiplier;}vec3 ShShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){return ShShaderWithSpec(normal,lightDir,lightColor,diffuseColor,vec3(0.,0.,0.));}vec3 LambertShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);return diffuseColor*lightColor*NdotL;}float rs(float n1,float n2,float cosI,float cosT){return(n1*cosI-n2*cosT)/(n1*cosI+n2*cosT);}float rp(float n1,float n2,float cosI,float cosT){return(n2*cosI-n1*cosT)/(n1*cosT+n2*cosI);}float ts(float n1,float n2,float cosI,float cosT){return 2.0*n1*cosI/(n1*cosI+n2*cosT);}float tp(float n1,float n2,float cosI,float cosT){return 2.0*n1*cosI/(n1*cosT+n2*cosI);}float thinFilmReflectance(float cos0,float lambda,float thickness,float n0,float n1,float n2){float PI=3.1415926536;float d10=mix(PI,0.0,float(n1>n0));float d12=mix(PI,0.0,float(n1>n2));float delta=d10+d12;float sin1=pow(n0/n1,2.0)*(1.0-pow(cos0,2.0));if(sin1>1.0)return 1.0;float cos1=sqrt(1.0-sin1);float sin2=pow(n0/n2,2.0)*(1.0-pow(cos0,2.0));if(sin2>1.0)return 1.0;float cos2=sqrt(1.0-sin2);float alpha_s=rs(n1,n0,cos1,cos0)*rs(n1,n2,cos1,cos2);float alpha_p=rp(n1,n0,cos1,cos0)*rp(n1,n2,cos1,cos2);float beta_s=ts(n0,n1,cos0,cos1)*ts(n1,n2,cos1,cos2);float beta_p=tp(n0,n1,cos0,cos1)*tp(n1,n2,cos1,cos2);float phi=(2.0*PI/lambda)*(2.0*n1*thickness*cos1)+delta;float ts=pow(beta_s,2.0)/(pow(alpha_s,2.0)-2.0*alpha_s*cos(phi)+1.0);float tp=pow(beta_p,2.0)/(pow(alpha_p,2.0)-2.0*alpha_p*cos(phi)+1.0);float beamRatio=(n2*cos2)/(n0*cos0);float t=beamRatio*(ts+tp)/2.0;return 1.0-t;}vec3 GetDiffraction(vec3 thickTex,vec3 I,vec3 N){const float thicknessMin=250.0;const float thicknessMax=400.0;const float nmedium=1.0;const float nfilm=1.3;const float ninternal=1.0;float cos0=abs(dot(I,N));float t=(thickTex[0]+thickTex[1]+thickTex[2])/3.0;float thick=thicknessMin*(1.0-t)+thicknessMax*t;float red=thinFilmReflectance(cos0,650.0,thick,nmedium,nfilm,ninternal);float green=thinFilmReflectance(cos0,510.0,thick,nmedium,nfilm,ninternal);float blue=thinFilmReflectance(cos0,475.0,thick,nmedium,nfilm,ninternal);return vec3(red,green,blue);}vec3 computeLighting(vec3 normal,vec3 albedo,vec3 specColor,float shininess){if(!gl_FrontFacing){normal*=-1.0;}vec3 lightDir0=normalize(v_light_dir_0);vec3 lightDir1=normalize(v_light_dir_1);vec3 eyeDir=-normalize(v_position);vec3 lightOut0=SurfaceShaderSpecularGloss(normal,lightDir0,eyeDir,u_SceneLight_0_color.rgb,albedo,specColor,shininess);vec3 lightOut1=ShShaderWithSpec(normal,lightDir1,u_SceneLight_1_color.rgb,albedo,specColor);vec3 ambientOut=albedo*u_ambient_light_color.rgb;return(lightOut0+lightOut1+ambientOut);}void main(){float shininess=.8;vec3 albedo=v_color.rgb*.2;vec3 viewDir=normalize(cameraPosition-v_worldPosition);vec3 normal=v_normal;float rim=1.0-abs(dot(normalize(viewDir),v_worldNormal));rim*=1.0-pow(rim,5.0);rim=mix(rim,150.0,1.0-clamp(abs(dot(normalize(viewDir),v_worldNormal))/.1,0.0,1.0));vec3 diffraction=texture2D(u_MainTex,vec2(rim+u_time.x*.3+normal.x,rim+normal.y)).xyz;diffraction=GetDiffraction(diffraction,normal,normalize(viewDir));vec3 emission=rim*v_color.rgb*diffraction*.5+rim*diffraction*.25;vec3 specColor=v_color.rgb*clamp(diffraction,0.0,1.0);gl_FragColor.rgb=computeLighting(v_normal,albedo,specColor,shininess)+emission;gl_FragColor.a=1.0;}"; // eslint-disable-line

var icingVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var icingFrag = "\n#extension GL_OES_standard_derivatives : enable\nprecision mediump float;\n#define GLSLIFY 1\nuniform vec4 u_ambient_light_color;uniform vec4 u_SceneLight_0_color;uniform vec4 u_SceneLight_1_color;uniform vec3 u_SpecColor;uniform float u_Shininess;uniform float u_Cutoff;uniform sampler2D u_MainTex;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying vec2 v_texcoord0;float dispAmount=.0025;uniform vec3 u_fogColor;uniform float u_fogDensity;varying float f_fog_coord;vec3 ApplyFog(vec3 color){float density=(u_fogDensity/.693147)*10.;float fogFactor=f_fog_coord*density;fogFactor=exp2(-fogFactor);fogFactor=clamp(fogFactor,0.0,1.0);return mix(u_fogColor,color.xyz,fogFactor);}\n#ifndef GL_OES_standard_derivatives\nvec3 PerturbNormal(vec3 position,vec3 normal,vec2 uv){return normal;}\n#else\nuniform sampler2D u_BumpMap;uniform vec4 u_BumpMap_TexelSize;vec3 xxx_dFdx3(vec3 v){return vec3(dFdx(v.x),dFdx(v.y),dFdx(v.z));}vec3 xxx_dFdy3(vec3 v){return vec3(dFdy(v.x),dFdy(v.y),dFdy(v.z));}vec2 xxx_dFdx2(vec2 v){return vec2(dFdx(v.x),dFdx(v.y));}vec2 xxx_dFdy2(vec2 v){return vec2(dFdy(v.x),dFdy(v.y));}vec3 PerturbNormal(vec3 position,vec3 normal,vec2 uv){highp vec3 vSigmaS=xxx_dFdx3(position);highp vec3 vSigmaT=xxx_dFdy3(position);highp vec3 vN=normal;highp vec3 vR1=cross(vSigmaT,vN);highp vec3 vR2=cross(vN,vSigmaS);float fDet=dot(vSigmaS,vR1);vec2 texDx=xxx_dFdx2(uv);vec2 texDy=xxx_dFdy2(uv);float resolution=max(u_BumpMap_TexelSize.z,u_BumpMap_TexelSize.w);highp float d=min(1.,(0.5/resolution)/max(length(texDx),length(texDy)));vec2 STll=uv;vec2 STlr=uv+d*texDx;vec2 STul=uv+d*texDy;highp float Hll=texture2D(u_BumpMap,STll).x;highp float Hlr=texture2D(u_BumpMap,STlr).x;highp float Hul=texture2D(u_BumpMap,STul).x;Hll=mix(Hll,1.-Hll,float(!gl_FrontFacing))*dispAmount;Hlr=mix(Hlr,1.-Hlr,float(!gl_FrontFacing))*dispAmount;Hul=mix(Hul,1.-Hul,float(!gl_FrontFacing))*dispAmount;highp float dBs=(Hlr-Hll)/d;highp float dBt=(Hul-Hll)/d;highp vec3 vSurfGrad=sign(fDet)*(dBs*vR1+dBt*vR2);return normalize(abs(fDet)*vN-vSurfGrad);}\n#endif\nconst float PI=3.141592654;const float INV_PI=0.318309886;const vec3 GAMMA_DIELECTRIC_SPEC=vec3(0.220916301,0.220916301,0.220916301);const float GAMMA_ONE_MINUS_DIELECTRIC=(1.0-0.220916301);float Pow5(float x){return x*x*x*x*x;}float DisneyDiffuseTerm(float NdotV,float NdotL,float LdotH,float perceptualRoughness){float fd90=0.5+2.0*LdotH*LdotH*perceptualRoughness;float lightScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotL);float viewScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotV);return lightScatter*viewScatter;}float SmithJointVisibilityTerm(float NdotL,float NdotV,float roughness){float lambdaV=NdotL*mix(NdotV,1.0,roughness);float lambdaL=NdotV*mix(NdotL,1.0,roughness);return 0.5/(lambdaV+lambdaL+1e-5);}float GgxDistributionTerm(float NdotH,float roughness){float a2=roughness*roughness;float d=(NdotH*a2-NdotH)*NdotH+1.0;return INV_PI*a2/(d*d+1e-7);}vec3 FresnelTerm(vec3 F0,float cosA){float t=Pow5(1.0-cosA);return F0+(vec3(1.0)-F0)*t;}vec3 SurfaceShaderInternal(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor,float perceptualRoughness){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float NdotV=abs(dot(normal,eyeDir));vec3 halfVector=normalize(lightDir+eyeDir);float NdotH=clamp(dot(normal,halfVector),0.0,1.0);float LdotH=clamp(dot(lightDir,halfVector),0.0,1.0);float diffuseTerm=NdotL*DisneyDiffuseTerm(NdotV,NdotL,LdotH,perceptualRoughness);if(length(specularColor)<1e-5){return diffuseColor*(lightColor*diffuseTerm);}float roughness=perceptualRoughness*perceptualRoughness;float V=GgxDistributionTerm(NdotH,roughness);float D=SmithJointVisibilityTerm(NdotL,NdotV,roughness);float specularTerm=V*D*PI;specularTerm=sqrt(max(1e-4,specularTerm));specularTerm*=NdotL;vec3 fresnelColor=FresnelTerm(specularColor,LdotH);return lightColor*(diffuseTerm*diffuseColor+specularTerm*fresnelColor);}vec3 SurfaceShaderSpecularGloss(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,vec3 specularColor,float gloss){float oneMinusSpecularIntensity=1.0-clamp(max(max(specularColor.r,specularColor.g),specularColor.b),0.,1.);vec3 diffuseColor=albedoColor*oneMinusSpecularIntensity;float perceptualRoughness=1.0-gloss;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 SurfaceShaderMetallicRoughness(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,float metallic,float perceptualRoughness){vec3 specularColor=mix(GAMMA_DIELECTRIC_SPEC,albedoColor,metallic);float oneMinusReflectivity=GAMMA_ONE_MINUS_DIELECTRIC-metallic*GAMMA_ONE_MINUS_DIELECTRIC;vec3 diffuseColor=albedoColor*oneMinusReflectivity;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 ShShaderWithSpec(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor){float specularGrayscale=dot(specularColor,vec3(0.3,0.59,0.11));float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float shIntensityMultiplier=1.-specularGrayscale;shIntensityMultiplier*=shIntensityMultiplier;return diffuseColor*lightColor*NdotL*shIntensityMultiplier;}vec3 ShShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){return ShShaderWithSpec(normal,lightDir,lightColor,diffuseColor,vec3(0.,0.,0.));}vec3 LambertShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);return diffuseColor*lightColor*NdotL;}vec3 computeLighting(vec3 normal){if(!gl_FrontFacing){normal*=-1.0;}vec3 lightDir0=normalize(v_light_dir_0);vec3 lightDir1=normalize(v_light_dir_1);vec3 eyeDir=-normalize(v_position);vec3 lightOut0=SurfaceShaderSpecularGloss(normal,lightDir0,eyeDir,u_SceneLight_0_color.rgb,v_color.rgb,u_SpecColor,u_Shininess);vec3 lightOut1=ShShaderWithSpec(normal,lightDir1,u_SceneLight_1_color.rgb,v_color.rgb,u_SpecColor);vec3 ambientOut=v_color.rgb*u_ambient_light_color.rgb;return(lightOut0+lightOut1+ambientOut);}void main(){float brush_mask=texture2D(u_MainTex,v_texcoord0).w;brush_mask*=v_color.w;vec3 normal=PerturbNormal(v_position.xyz,normalize(v_normal),v_texcoord0);gl_FragColor.rgb=ApplyFog(computeLighting(normal));gl_FragColor.a=1.0;if(brush_mask<=u_Cutoff){discard;}}"; // eslint-disable-line

var lightVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var lightFrag = "precision mediump float;\n#define GLSLIFY 1\nuniform float u_EmissionGain;uniform sampler2D u_MainTex;varying vec4 v_color;varying vec2 v_texcoord0;vec4 bloomColor(vec4 color,float gain){float cmin=length(color.rgb)*.05;color.rgb=max(color.rgb,vec3(cmin,cmin,cmin));color.r=pow(color.r,2.2);color.g=pow(color.g,2.2);color.b=pow(color.b,2.2);color.a=pow(color.a,2.2);color.rgb*=2.0*exp(gain*10.0);return color;}void main(){float brush_mask=texture2D(u_MainTex,v_texcoord0).w;gl_FragColor=brush_mask*bloomColor(v_color,u_EmissionGain);}"; // eslint-disable-line

var matteHullVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var matteHullFrag = "\n#extension GL_OES_standard_derivatives : enable\nprecision mediump float;\n#define GLSLIFY 1\nuniform vec4 u_ambient_light_color;uniform vec4 u_SceneLight_0_color;uniform vec4 u_SceneLight_1_color;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying vec2 v_texcoord0;uniform sampler2D u_MainTex;uniform float u_Cutoff;uniform vec3 u_fogColor;uniform float u_fogDensity;varying float f_fog_coord;vec3 ApplyFog(vec3 color){float density=(u_fogDensity/.693147)*10.;float fogFactor=f_fog_coord*density;fogFactor=exp2(-fogFactor);fogFactor=clamp(fogFactor,0.0,1.0);return mix(u_fogColor,color.xyz,fogFactor);}const float PI=3.141592654;const float INV_PI=0.318309886;const vec3 GAMMA_DIELECTRIC_SPEC=vec3(0.220916301,0.220916301,0.220916301);const float GAMMA_ONE_MINUS_DIELECTRIC=(1.0-0.220916301);float Pow5(float x){return x*x*x*x*x;}float DisneyDiffuseTerm(float NdotV,float NdotL,float LdotH,float perceptualRoughness){float fd90=0.5+2.0*LdotH*LdotH*perceptualRoughness;float lightScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotL);float viewScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotV);return lightScatter*viewScatter;}float SmithJointVisibilityTerm(float NdotL,float NdotV,float roughness){float lambdaV=NdotL*mix(NdotV,1.0,roughness);float lambdaL=NdotV*mix(NdotL,1.0,roughness);return 0.5/(lambdaV+lambdaL+1e-5);}float GgxDistributionTerm(float NdotH,float roughness){float a2=roughness*roughness;float d=(NdotH*a2-NdotH)*NdotH+1.0;return INV_PI*a2/(d*d+1e-7);}vec3 FresnelTerm(vec3 F0,float cosA){float t=Pow5(1.0-cosA);return F0+(vec3(1.0)-F0)*t;}vec3 SurfaceShaderInternal(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor,float perceptualRoughness){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float NdotV=abs(dot(normal,eyeDir));vec3 halfVector=normalize(lightDir+eyeDir);float NdotH=clamp(dot(normal,halfVector),0.0,1.0);float LdotH=clamp(dot(lightDir,halfVector),0.0,1.0);float diffuseTerm=NdotL*DisneyDiffuseTerm(NdotV,NdotL,LdotH,perceptualRoughness);if(length(specularColor)<1e-5){return diffuseColor*(lightColor*diffuseTerm);}float roughness=perceptualRoughness*perceptualRoughness;float V=GgxDistributionTerm(NdotH,roughness);float D=SmithJointVisibilityTerm(NdotL,NdotV,roughness);float specularTerm=V*D*PI;specularTerm=sqrt(max(1e-4,specularTerm));specularTerm*=NdotL;vec3 fresnelColor=FresnelTerm(specularColor,LdotH);return lightColor*(diffuseTerm*diffuseColor+specularTerm*fresnelColor);}vec3 SurfaceShaderSpecularGloss(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,vec3 specularColor,float gloss){float oneMinusSpecularIntensity=1.0-clamp(max(max(specularColor.r,specularColor.g),specularColor.b),0.,1.);vec3 diffuseColor=albedoColor*oneMinusSpecularIntensity;float perceptualRoughness=1.0-gloss;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 SurfaceShaderMetallicRoughness(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,float metallic,float perceptualRoughness){vec3 specularColor=mix(GAMMA_DIELECTRIC_SPEC,albedoColor,metallic);float oneMinusReflectivity=GAMMA_ONE_MINUS_DIELECTRIC-metallic*GAMMA_ONE_MINUS_DIELECTRIC;vec3 diffuseColor=albedoColor*oneMinusReflectivity;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 ShShaderWithSpec(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor){float specularGrayscale=dot(specularColor,vec3(0.3,0.59,0.11));float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float shIntensityMultiplier=1.-specularGrayscale;shIntensityMultiplier*=shIntensityMultiplier;return diffuseColor*lightColor*NdotL*shIntensityMultiplier;}vec3 ShShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){return ShShaderWithSpec(normal,lightDir,lightColor,diffuseColor,vec3(0.,0.,0.));}vec3 LambertShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);return diffuseColor*lightColor*NdotL;}vec3 computeLighting(){vec3 normal=normalize(v_normal);if(!gl_FrontFacing){normal*=-1.0;}vec3 lightDir0=normalize(v_light_dir_0);vec3 lightDir1=normalize(v_light_dir_1);vec3 lightOut0=LambertShader(normal,lightDir0,u_SceneLight_0_color.rgb,v_color.rgb);vec3 lightOut1=ShShader(normal,lightDir1,u_SceneLight_1_color.rgb,v_color.rgb);vec3 ambientOut=v_color.rgb*u_ambient_light_color.rgb;return(lightOut0+lightOut1+ambientOut);}void main(){gl_FragColor.rgb=ApplyFog(computeLighting());gl_FragColor.a=1.0;}"; // eslint-disable-line

var neonPulseVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var neonPulseFrag = "precision mediump float;\n#define GLSLIFY 1\nuniform vec4 u_ambient_light_color;uniform vec4 u_SceneLight_0_color;uniform vec4 u_SceneLight_1_color;uniform vec3 u_SpecColor;uniform float u_Shininess;uniform sampler2D u_MainTex;uniform vec4 u_time;uniform float _EmissionGain;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying vec2 v_texcoord0;const float PI=3.141592654;const float INV_PI=0.318309886;const vec3 GAMMA_DIELECTRIC_SPEC=vec3(0.220916301,0.220916301,0.220916301);const float GAMMA_ONE_MINUS_DIELECTRIC=(1.0-0.220916301);float Pow5(float x){return x*x*x*x*x;}float DisneyDiffuseTerm(float NdotV,float NdotL,float LdotH,float perceptualRoughness){float fd90=0.5+2.0*LdotH*LdotH*perceptualRoughness;float lightScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotL);float viewScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotV);return lightScatter*viewScatter;}float SmithJointVisibilityTerm(float NdotL,float NdotV,float roughness){float lambdaV=NdotL*mix(NdotV,1.0,roughness);float lambdaL=NdotV*mix(NdotL,1.0,roughness);return 0.5/(lambdaV+lambdaL+1e-5);}float GgxDistributionTerm(float NdotH,float roughness){float a2=roughness*roughness;float d=(NdotH*a2-NdotH)*NdotH+1.0;return INV_PI*a2/(d*d+1e-7);}vec3 FresnelTerm(vec3 F0,float cosA){float t=Pow5(1.0-cosA);return F0+(vec3(1.0)-F0)*t;}vec3 SurfaceShaderInternal(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor,float perceptualRoughness){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float NdotV=abs(dot(normal,eyeDir));vec3 halfVector=normalize(lightDir+eyeDir);float NdotH=clamp(dot(normal,halfVector),0.0,1.0);float LdotH=clamp(dot(lightDir,halfVector),0.0,1.0);float diffuseTerm=NdotL*DisneyDiffuseTerm(NdotV,NdotL,LdotH,perceptualRoughness);if(length(specularColor)<1e-5){return diffuseColor*(lightColor*diffuseTerm);}float roughness=perceptualRoughness*perceptualRoughness;float V=GgxDistributionTerm(NdotH,roughness);float D=SmithJointVisibilityTerm(NdotL,NdotV,roughness);float specularTerm=V*D*PI;specularTerm=sqrt(max(1e-4,specularTerm));specularTerm*=NdotL;vec3 fresnelColor=FresnelTerm(specularColor,LdotH);return lightColor*(diffuseTerm*diffuseColor+specularTerm*fresnelColor);}vec3 SurfaceShaderSpecularGloss(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,vec3 specularColor,float gloss){float oneMinusSpecularIntensity=1.0-clamp(max(max(specularColor.r,specularColor.g),specularColor.b),0.,1.);vec3 diffuseColor=albedoColor*oneMinusSpecularIntensity;float perceptualRoughness=1.0-gloss;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 SurfaceShaderMetallicRoughness(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,float metallic,float perceptualRoughness){vec3 specularColor=mix(GAMMA_DIELECTRIC_SPEC,albedoColor,metallic);float oneMinusReflectivity=GAMMA_ONE_MINUS_DIELECTRIC-metallic*GAMMA_ONE_MINUS_DIELECTRIC;vec3 diffuseColor=albedoColor*oneMinusReflectivity;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 ShShaderWithSpec(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor){float specularGrayscale=dot(specularColor,vec3(0.3,0.59,0.11));float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float shIntensityMultiplier=1.-specularGrayscale;shIntensityMultiplier*=shIntensityMultiplier;return diffuseColor*lightColor*NdotL*shIntensityMultiplier;}vec3 ShShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){return ShShaderWithSpec(normal,lightDir,lightColor,diffuseColor,vec3(0.,0.,0.));}vec3 LambertShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);return diffuseColor*lightColor*NdotL;}vec3 computeLighting(){vec3 normal=normalize(v_normal);if(!gl_FrontFacing){normal*=-1.0;}vec3 lightDir0=normalize(v_light_dir_0);vec3 lightDir1=normalize(v_light_dir_1);vec3 eyeDir=-normalize(v_position);float smoothness=.8;vec3 spec=vec3(.05,.05,.05);vec3 diffuse=vec3(0.0,0.0,0.0);vec3 lightOut0=SurfaceShaderSpecularGloss(normal,lightDir0,eyeDir,u_SceneLight_0_color.rgb,diffuse,spec,smoothness);vec3 lightOut1=ShShaderWithSpec(normal,lightDir1,u_SceneLight_1_color.rgb,diffuse,spec);vec3 ambientOut=vec3(0.0,0.0,0.0);return(lightOut0+lightOut1+ambientOut);}vec4 bloomColor(vec4 color,float gain){color=pow(color,vec4(2.2,2.2,2.2,2.2));color.rgb*=80.0*exp(gain*10.0);return color;}void main(){gl_FragColor.rgb=computeLighting();vec2 uv=v_texcoord0;uv.x-=u_time.x*15.0;uv.x=mod(abs(uv.x),1.0);float neon=pow(10.0*clamp(.2-uv.x,0.0,1.0),5.0);neon=clamp(neon,0.0,1.0);vec4 bloom=bloomColor(v_color,_EmissionGain);vec3 eyeDir=-normalize(v_position);vec3 normal=normalize(v_normal);float NdotV=abs(dot(normal,eyeDir));bloom*=pow(NdotV,2.0);bloom*=NdotV;gl_FragColor.rgb+=neon*bloom.rgb;gl_FragColor.a=1.0;}"; // eslint-disable-line

var oilPaintVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var oilPaintFrag = "\n#extension GL_OES_standard_derivatives : enable\nprecision mediump float;\n#define GLSLIFY 1\nuniform vec4 u_ambient_light_color;uniform vec4 u_SceneLight_0_color;uniform vec4 u_SceneLight_1_color;uniform vec3 u_SpecColor;uniform float u_Shininess;uniform float u_Cutoff;uniform sampler2D u_MainTex;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying vec2 v_texcoord0;float dispAmount=.0015;uniform vec3 u_fogColor;uniform float u_fogDensity;varying float f_fog_coord;vec3 ApplyFog(vec3 color){float density=(u_fogDensity/.693147)*10.;float fogFactor=f_fog_coord*density;fogFactor=exp2(-fogFactor);fogFactor=clamp(fogFactor,0.0,1.0);return mix(u_fogColor,color.xyz,fogFactor);}\n#ifndef GL_OES_standard_derivatives\nvec3 PerturbNormal(vec3 position,vec3 normal,vec2 uv){return normal;}\n#else\nuniform sampler2D u_BumpMap;uniform vec4 u_BumpMap_TexelSize;vec3 xxx_dFdx3(vec3 v){return vec3(dFdx(v.x),dFdx(v.y),dFdx(v.z));}vec3 xxx_dFdy3(vec3 v){return vec3(dFdy(v.x),dFdy(v.y),dFdy(v.z));}vec2 xxx_dFdx2(vec2 v){return vec2(dFdx(v.x),dFdx(v.y));}vec2 xxx_dFdy2(vec2 v){return vec2(dFdy(v.x),dFdy(v.y));}vec3 PerturbNormal(vec3 position,vec3 normal,vec2 uv){highp vec3 vSigmaS=xxx_dFdx3(position);highp vec3 vSigmaT=xxx_dFdy3(position);highp vec3 vN=normal;highp vec3 vR1=cross(vSigmaT,vN);highp vec3 vR2=cross(vN,vSigmaS);float fDet=dot(vSigmaS,vR1);vec2 texDx=xxx_dFdx2(uv);vec2 texDy=xxx_dFdy2(uv);float resolution=max(u_BumpMap_TexelSize.z,u_BumpMap_TexelSize.w);highp float d=min(1.,(0.5/resolution)/max(length(texDx),length(texDy)));vec2 STll=uv;vec2 STlr=uv+d*texDx;vec2 STul=uv+d*texDy;highp float Hll=texture2D(u_BumpMap,STll).x;highp float Hlr=texture2D(u_BumpMap,STlr).x;highp float Hul=texture2D(u_BumpMap,STul).x;Hll=mix(Hll,1.-Hll,float(!gl_FrontFacing))*dispAmount;Hlr=mix(Hlr,1.-Hlr,float(!gl_FrontFacing))*dispAmount;Hul=mix(Hul,1.-Hul,float(!gl_FrontFacing))*dispAmount;highp float dBs=(Hlr-Hll)/d;highp float dBt=(Hul-Hll)/d;highp vec3 vSurfGrad=sign(fDet)*(dBs*vR1+dBt*vR2);return normalize(abs(fDet)*vN-vSurfGrad);}\n#endif\nconst float PI=3.141592654;const float INV_PI=0.318309886;const vec3 GAMMA_DIELECTRIC_SPEC=vec3(0.220916301,0.220916301,0.220916301);const float GAMMA_ONE_MINUS_DIELECTRIC=(1.0-0.220916301);float Pow5(float x){return x*x*x*x*x;}float DisneyDiffuseTerm(float NdotV,float NdotL,float LdotH,float perceptualRoughness){float fd90=0.5+2.0*LdotH*LdotH*perceptualRoughness;float lightScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotL);float viewScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotV);return lightScatter*viewScatter;}float SmithJointVisibilityTerm(float NdotL,float NdotV,float roughness){float lambdaV=NdotL*mix(NdotV,1.0,roughness);float lambdaL=NdotV*mix(NdotL,1.0,roughness);return 0.5/(lambdaV+lambdaL+1e-5);}float GgxDistributionTerm(float NdotH,float roughness){float a2=roughness*roughness;float d=(NdotH*a2-NdotH)*NdotH+1.0;return INV_PI*a2/(d*d+1e-7);}vec3 FresnelTerm(vec3 F0,float cosA){float t=Pow5(1.0-cosA);return F0+(vec3(1.0)-F0)*t;}vec3 SurfaceShaderInternal(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor,float perceptualRoughness){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float NdotV=abs(dot(normal,eyeDir));vec3 halfVector=normalize(lightDir+eyeDir);float NdotH=clamp(dot(normal,halfVector),0.0,1.0);float LdotH=clamp(dot(lightDir,halfVector),0.0,1.0);float diffuseTerm=NdotL*DisneyDiffuseTerm(NdotV,NdotL,LdotH,perceptualRoughness);if(length(specularColor)<1e-5){return diffuseColor*(lightColor*diffuseTerm);}float roughness=perceptualRoughness*perceptualRoughness;float V=GgxDistributionTerm(NdotH,roughness);float D=SmithJointVisibilityTerm(NdotL,NdotV,roughness);float specularTerm=V*D*PI;specularTerm=sqrt(max(1e-4,specularTerm));specularTerm*=NdotL;vec3 fresnelColor=FresnelTerm(specularColor,LdotH);return lightColor*(diffuseTerm*diffuseColor+specularTerm*fresnelColor);}vec3 SurfaceShaderSpecularGloss(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,vec3 specularColor,float gloss){float oneMinusSpecularIntensity=1.0-clamp(max(max(specularColor.r,specularColor.g),specularColor.b),0.,1.);vec3 diffuseColor=albedoColor*oneMinusSpecularIntensity;float perceptualRoughness=1.0-gloss;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 SurfaceShaderMetallicRoughness(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,float metallic,float perceptualRoughness){vec3 specularColor=mix(GAMMA_DIELECTRIC_SPEC,albedoColor,metallic);float oneMinusReflectivity=GAMMA_ONE_MINUS_DIELECTRIC-metallic*GAMMA_ONE_MINUS_DIELECTRIC;vec3 diffuseColor=albedoColor*oneMinusReflectivity;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 ShShaderWithSpec(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor){float specularGrayscale=dot(specularColor,vec3(0.3,0.59,0.11));float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float shIntensityMultiplier=1.-specularGrayscale;shIntensityMultiplier*=shIntensityMultiplier;return diffuseColor*lightColor*NdotL*shIntensityMultiplier;}vec3 ShShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){return ShShaderWithSpec(normal,lightDir,lightColor,diffuseColor,vec3(0.,0.,0.));}vec3 LambertShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);return diffuseColor*lightColor*NdotL;}vec3 computeLighting(vec3 normal){normal.z*=mix(-1.0,1.0,float(gl_FrontFacing));vec3 lightDir0=normalize(v_light_dir_0);vec3 lightDir1=normalize(v_light_dir_1);vec3 eyeDir=-normalize(v_position);vec3 lightOut0=SurfaceShaderSpecularGloss(normal,lightDir0,eyeDir,u_SceneLight_0_color.rgb,v_color.rgb,u_SpecColor,u_Shininess);vec3 lightOut1=ShShaderWithSpec(normal,lightDir1,u_SceneLight_1_color.rgb,v_color.rgb,u_SpecColor);vec3 ambientOut=v_color.rgb*u_ambient_light_color.rgb;return(lightOut0+lightOut1+ambientOut);}void main(){float brush_mask=texture2D(u_MainTex,v_texcoord0).w;brush_mask*=v_color.w;vec3 normal=PerturbNormal(v_position.xyz,normalize(v_normal),v_texcoord0);gl_FragColor.rgb=ApplyFog(computeLighting(normal));gl_FragColor.a=1.0;if(brush_mask<=u_Cutoff){discard;}}"; // eslint-disable-line

var rainbowVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var rainbowFrag = "precision mediump float;\n#define GLSLIFY 1\nuniform sampler2D u_MainTex;uniform vec4 u_time;uniform float u_EmissionGain;varying vec4 v_color;varying vec2 v_texcoord0;vec4 GetRainbowColor(vec2 texcoord){vec4 _Time=u_time;texcoord=clamp(texcoord,0.0,1.0);vec2 uvs=texcoord;float row_id=floor(uvs.y*5.0);uvs.y*=5.0;vec4 tex=vec4(0.0,0.0,0.0,1.0);float row_y=mod(uvs.y,1.0);row_id=ceil(mod(row_id+_Time.z,5.0))-1.0;tex.rgb=row_id==0.0 ? vec3(1.0,0.0,0.0): tex.rgb;tex.rgb=row_id==1.0 ? vec3(.7,.3,0.0): tex.rgb;tex.rgb=row_id==2.0 ? vec3(0.0,1.0,.0): tex.rgb;tex.rgb=row_id==3.0 ? vec3(0.0,.2,1.0): tex.rgb;tex.rgb=row_id==4.0 ? vec3(.4,0.0,1.2): tex.rgb;tex.rgb*=pow((sin(row_id*1.0+_Time.z)+1.0)/2.0,5.0);tex.rgb*=clamp(pow(row_y*(1.0-row_y)*5.0,50.0),0.0,1.0);return tex;}void main(){vec4 color=v_color;color.a=1.;vec4 tex=GetRainbowColor(v_texcoord0.xy);tex=color*tex*exp(u_EmissionGain*3.0);gl_FragColor=tex*tex.a;}"; // eslint-disable-line

var smokeVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec4 a_texcoord0;attribute vec4 a_texcoord1;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;uniform mat4 viewMatrix;uniform mat4 modelMatrix;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;mat4 inverse(mat4 m){float a00=m[0][0],a01=m[0][1],a02=m[0][2],a03=m[0][3],a10=m[1][0],a11=m[1][1],a12=m[1][2],a13=m[1][3],a20=m[2][0],a21=m[2][1],a22=m[2][2],a23=m[2][3],a30=m[3][0],a31=m[3][1],a32=m[3][2],a33=m[3][3],b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32,det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;return mat4(a11*b11-a12*b10+a13*b09,a02*b10-a01*b11-a03*b09,a31*b05-a32*b04+a33*b03,a22*b04-a21*b05-a23*b03,a12*b08-a10*b11-a13*b07,a00*b11-a02*b08+a03*b07,a32*b02-a30*b05-a33*b01,a20*b05-a22*b02+a23*b01,a10*b10-a11*b08+a13*b06,a01*b08-a00*b10-a03*b06,a30*b04-a31*b02+a33*b00,a21*b02-a20*b04-a23*b00,a11*b07-a10*b09-a12*b06,a00*b09-a01*b07+a02*b06,a31*b01-a30*b03-a32*b00,a20*b03-a21*b01+a22*b00)/det;}const float kRecipSquareRootOfTwo=0.70710678;vec3 recreateCorner(vec3 center,float corner,float rotation,float size){float c=cos(rotation);float s=sin(rotation);vec3 up=vec3(s,c,0);vec3 right=vec3(c,-s,0);float fUp=float(corner==0.||corner==1.)*2.0-1.0;float fRight=float(corner==0.||corner==2.)*2.0-1.0;center=(modelViewMatrix*vec4(center,1.0)).xyz;center+=fRight*right*size;center+=fUp*up*size;return(inverse(modelViewMatrix)*vec4(center,1.0)).xyz;}vec4 PositionParticle(float vertexId,vec4 vertexPos,vec3 center,float rotation){float corner=mod(vertexId,4.0);float size=length(vertexPos.xyz-center)*kRecipSquareRootOfTwo;float scale=modelMatrix[1][1];vec3 newCorner=recreateCorner(center,corner,rotation,size*scale);return vec4(newCorner.x,newCorner.y,newCorner.z,1);}\n#define PARTICLE_CENTER (a_normal)\n#define PARTICLE_VERTEXID (a_texcoord1.w)\n#define PARTICLE_ROTATION (a_texcoord0.z)\nvec4 GetParticlePositionLS(){return PositionParticle(PARTICLE_VERTEXID,a_position,PARTICLE_CENTER,PARTICLE_ROTATION);}void main(){vec4 pos=GetParticlePositionLS();gl_Position=projectionMatrix*modelViewMatrix*pos;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*pos).xyz;v_light_dir_0=u_SceneLight_0_matrix[2].xyz;v_light_dir_1=u_SceneLight_1_matrix[2].xyz;v_color=a_color;v_texcoord0=a_texcoord0.xy;}"; // eslint-disable-line

var smokeFrag = "precision mediump float;\n#define GLSLIFY 1\nvarying vec4 v_color;varying vec2 v_texcoord0;uniform sampler2D u_MainTex;uniform vec4 u_TintColor;uniform float u_EmissionGain;void main(){vec4 color=v_color*u_TintColor*texture2D(u_MainTex,v_texcoord0);gl_FragColor=vec4(color.rgb*color.a,1.0);}"; // eslint-disable-line

var softHighlighterVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var softHighlighterFrag = "precision mediump float;\n#define GLSLIFY 1\nvarying vec4 v_color;varying vec3 v_position;varying vec2 v_texcoord0;uniform sampler2D u_MainTex;void main(){float brush_mask=texture2D(u_MainTex,v_texcoord0).w;gl_FragColor.rgb=brush_mask*v_color.rgb;gl_FragColor.a=1.0;}"; // eslint-disable-line

var splatterVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var splatterFrag = "precision mediump float;\n#define GLSLIFY 1\nuniform vec4 u_ambient_light_color;uniform vec4 u_SceneLight_0_color;uniform vec4 u_SceneLight_1_color;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying vec2 v_texcoord0;uniform sampler2D u_MainTex;uniform float u_Cutoff;uniform vec3 u_fogColor;uniform float u_fogDensity;varying float f_fog_coord;vec3 ApplyFog(vec3 color){float density=(u_fogDensity/.693147)*10.;float fogFactor=f_fog_coord*density;fogFactor=exp2(-fogFactor);fogFactor=clamp(fogFactor,0.0,1.0);return mix(u_fogColor,color.xyz,fogFactor);}const float PI=3.141592654;const float INV_PI=0.318309886;const vec3 GAMMA_DIELECTRIC_SPEC=vec3(0.220916301,0.220916301,0.220916301);const float GAMMA_ONE_MINUS_DIELECTRIC=(1.0-0.220916301);float Pow5(float x){return x*x*x*x*x;}float DisneyDiffuseTerm(float NdotV,float NdotL,float LdotH,float perceptualRoughness){float fd90=0.5+2.0*LdotH*LdotH*perceptualRoughness;float lightScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotL);float viewScatter=1.0+(fd90-1.0)*Pow5(1.0-NdotV);return lightScatter*viewScatter;}float SmithJointVisibilityTerm(float NdotL,float NdotV,float roughness){float lambdaV=NdotL*mix(NdotV,1.0,roughness);float lambdaL=NdotV*mix(NdotL,1.0,roughness);return 0.5/(lambdaV+lambdaL+1e-5);}float GgxDistributionTerm(float NdotH,float roughness){float a2=roughness*roughness;float d=(NdotH*a2-NdotH)*NdotH+1.0;return INV_PI*a2/(d*d+1e-7);}vec3 FresnelTerm(vec3 F0,float cosA){float t=Pow5(1.0-cosA);return F0+(vec3(1.0)-F0)*t;}vec3 SurfaceShaderInternal(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor,float perceptualRoughness){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float NdotV=abs(dot(normal,eyeDir));vec3 halfVector=normalize(lightDir+eyeDir);float NdotH=clamp(dot(normal,halfVector),0.0,1.0);float LdotH=clamp(dot(lightDir,halfVector),0.0,1.0);float diffuseTerm=NdotL*DisneyDiffuseTerm(NdotV,NdotL,LdotH,perceptualRoughness);if(length(specularColor)<1e-5){return diffuseColor*(lightColor*diffuseTerm);}float roughness=perceptualRoughness*perceptualRoughness;float V=GgxDistributionTerm(NdotH,roughness);float D=SmithJointVisibilityTerm(NdotL,NdotV,roughness);float specularTerm=V*D*PI;specularTerm=sqrt(max(1e-4,specularTerm));specularTerm*=NdotL;vec3 fresnelColor=FresnelTerm(specularColor,LdotH);return lightColor*(diffuseTerm*diffuseColor+specularTerm*fresnelColor);}vec3 SurfaceShaderSpecularGloss(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,vec3 specularColor,float gloss){float oneMinusSpecularIntensity=1.0-clamp(max(max(specularColor.r,specularColor.g),specularColor.b),0.,1.);vec3 diffuseColor=albedoColor*oneMinusSpecularIntensity;float perceptualRoughness=1.0-gloss;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 SurfaceShaderMetallicRoughness(vec3 normal,vec3 lightDir,vec3 eyeDir,vec3 lightColor,vec3 albedoColor,float metallic,float perceptualRoughness){vec3 specularColor=mix(GAMMA_DIELECTRIC_SPEC,albedoColor,metallic);float oneMinusReflectivity=GAMMA_ONE_MINUS_DIELECTRIC-metallic*GAMMA_ONE_MINUS_DIELECTRIC;vec3 diffuseColor=albedoColor*oneMinusReflectivity;return SurfaceShaderInternal(normal,lightDir,eyeDir,lightColor,diffuseColor,specularColor,perceptualRoughness);}vec3 ShShaderWithSpec(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor,vec3 specularColor){float specularGrayscale=dot(specularColor,vec3(0.3,0.59,0.11));float NdotL=clamp(dot(normal,lightDir),0.0,1.0);float shIntensityMultiplier=1.-specularGrayscale;shIntensityMultiplier*=shIntensityMultiplier;return diffuseColor*lightColor*NdotL*shIntensityMultiplier;}vec3 ShShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){return ShShaderWithSpec(normal,lightDir,lightColor,diffuseColor,vec3(0.,0.,0.));}vec3 LambertShader(vec3 normal,vec3 lightDir,vec3 lightColor,vec3 diffuseColor){float NdotL=clamp(dot(normal,lightDir),0.0,1.0);return diffuseColor*lightColor*NdotL;}vec3 computeLighting(){vec3 normal=normalize(v_normal);if(!gl_FrontFacing){normal*=-1.0;}vec3 lightDir0=normalize(v_light_dir_0);vec3 lightDir1=normalize(v_light_dir_1);vec3 lightOut0=LambertShader(normal,lightDir0,u_SceneLight_0_color.rgb,v_color.rgb);vec3 lightOut1=ShShader(normal,lightDir1,u_SceneLight_1_color.rgb,v_color.rgb);vec3 ambientOut=v_color.rgb*u_ambient_light_color.rgb;return(lightOut0+lightOut1+ambientOut);}void main(){float brush_mask=texture2D(u_MainTex,v_texcoord0).w;if(brush_mask>u_Cutoff){gl_FragColor.rgb=ApplyFog(computeLighting());gl_FragColor.a=1.0;}else{discard;}}"; // eslint-disable-line

var toonVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var toonFrag = "precision mediump float;\n#define GLSLIFY 1\nvarying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying vec2 v_texcoord0;uniform vec3 u_fogColor;uniform float u_fogDensity;varying float f_fog_coord;vec3 ApplyFog(vec3 color){float density=(u_fogDensity/.693147)*10.;float fogFactor=f_fog_coord*density;fogFactor=exp2(-fogFactor);fogFactor=clamp(fogFactor,0.0,1.0);return mix(u_fogColor,color.xyz,fogFactor);}void main(){vec4 color=v_color;color.xyz+=normalize(v_normal).y*.2;color.xyz=max(vec3(0.0,0.0,0.0),color.xyz);gl_FragColor.rgb=ApplyFog(color.xyz);gl_FragColor.a=1.0;}"; // eslint-disable-line

var unlitHullVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var unlitHullFrag = "precision mediump float;\n#define GLSLIFY 1\nvarying vec4 v_color;varying vec3 v_position;varying vec2 v_texcoord0;uniform sampler2D u_MainTex;uniform float u_Cutoff;uniform vec3 u_fogColor;uniform float u_fogDensity;varying float f_fog_coord;vec3 ApplyFog(vec3 color){float density=(u_fogDensity/.693147)*10.;float fogFactor=f_fog_coord*density;fogFactor=exp2(-fogFactor);fogFactor=clamp(fogFactor,0.0,1.0);return mix(u_fogColor,color.xyz,fogFactor);}void main(){gl_FragColor.rgb=ApplyFog(v_color.rgb);gl_FragColor.a=1.0;}"; // eslint-disable-line

var wireVert = "#define GLSLIFY 1\nattribute vec4 a_position;attribute vec3 a_normal;attribute vec4 a_color;attribute vec2 a_texcoord0;varying vec4 v_color;varying vec3 v_normal;varying vec3 v_position;varying vec2 v_texcoord0;varying vec3 v_light_dir_0;varying vec3 v_light_dir_1;varying float f_fog_coord;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;uniform mat4 u_SceneLight_0_matrix;uniform mat4 u_SceneLight_1_matrix;void main(){gl_Position=projectionMatrix*modelViewMatrix*a_position;f_fog_coord=gl_Position.z;v_normal=normalMatrix*a_normal;v_position=(modelViewMatrix*a_position).xyz;v_light_dir_0=mat3(u_SceneLight_0_matrix)*vec3(0,0,1);v_light_dir_1=mat3(u_SceneLight_1_matrix)*vec3(0,0,1);v_color=a_color;v_texcoord0=a_texcoord0;}"; // eslint-disable-line

var wireFrag = "precision mediump float;\n#define GLSLIFY 1\nvarying vec4 v_color;varying vec2 v_texcoord0;varying vec3 v_position;uniform vec3 u_fogColor;uniform float u_fogDensity;varying float f_fog_coord;vec3 ApplyFog(vec3 color){float density=(u_fogDensity/.693147)*10.;float fogFactor=f_fog_coord*density;fogFactor=exp2(-fogFactor);fogFactor=clamp(fogFactor,0.0,1.0);return mix(u_fogColor,color.xyz,fogFactor);}void main(){gl_FragColor.rgb=ApplyFog(v_color.rgb);gl_FragColor.a=1.0;}"; // eslint-disable-line

const TiltBrushShaders = {
    "BlocksBasic" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "BlocksGem" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "BlocksGlass" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Bubbles" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "CelVinyl" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "ChromaticWave" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "CoarseBristles" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Comet" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"DiamondHull" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_time: { value: new Vector4() },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			cameraPosition: { value: new Vector3() },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901/DiamondHull-c8313697-2563-47fc-832e-290f4c04b901-v10.0-MainTex.png',
			function (texture) {
				texture.name = "DiamondHull_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
		},
		vertexShader: diamondHullVert,
		fragmentShader: diamondHullFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
    "Disco" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "DotMarker" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Dots" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "DoubleTaperedFlat" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
	},
    "DoubleTaperedMarker" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "DuctTape" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Electricity" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Embers" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "EnvironmentDiffuse" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "EnvironmentDiffuseLightMap" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Fire" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Flat" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "FlatDeprecated" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Highlighter" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Hypercolor" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "HyperGrid" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Icing" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Ink" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Leaves" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Light" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62/Light-2241cd32-8ba2-48a5-9ee7-2caef7e9ed62-v10.0-MainTex.png',
			function (texture) {
				texture.name = "Light_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_EmissionGain: { value: 0.45 },
		},
		vertexShader: lightVert,
		fragmentShader: lightFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
    "LightWire" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Lofted" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Marker" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"MatteHull" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: matteHullVert,
		fragmentShader: matteHullFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
	"NeonPulse" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_time: { value: new Vector4() },
			u_EmissionGain: { value: 0.45 },
		},
		vertexShader: neonPulseVert,
		fragmentShader: neonPulseFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
	"OilPaint": {
		uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0020, 0.0020, 512, 512) },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-MainTex.png',
				function (texture) {
					texture.name = "OilPaint_MainTex";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				})
			},
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699/OilPaint-f72ec0e7-a844-4e38-82e3-140c44772699-v10.0-BumpMap.png',
				function (texture) {
					texture.name = "OilPaint_BumpMap";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				})
			}
		},
		vertexShader: oilPaintVert,
		fragmentShader: oilPaintFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0
	},
    "Paper" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "PbrTemplate" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "PbrTransparentTemplate" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Petal" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Plasma" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Rainbow" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_time: { value: new Vector4() },
			u_EmissionGain: { value: 0.45 },
		},
		vertexShader: rainbowVert,
		fragmentShader: rainbowFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
    "ShinyHull" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Smoke": {
		uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_TintColor: { value: new Vector4(1, 1, 1, 1) },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Smoke-70d79cca-b159-4f35-990c-f02193947fe8/Smoke-70d79cca-b159-4f35-990c-f02193947fe8-v10.0-MainTex.png',
				function (texture) {
					texture.name = "Smoke_MainTex";
					texture.wrapS = RepeatWrapping;
					texture.wrapT = RepeatWrapping;
					texture.flipY = false;
				})
			}
		},
		vertexShader: smokeVert,
		fragmentShader: smokeFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
	},
    "Snow" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"SoftHighlighter" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/SoftHighlighter-accb32f5-4509-454f-93f8-1df3fd31df1b/SoftHighlighter-accb32f5-4509-454f-93f8-1df3fd31df1b-v10.0-MainTex.png',
			function (texture) {
				texture.name = "SoftHighliter_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 },
		},
		vertexShader: softHighlighterVert,
		fragmentShader: softHighlighterFrag,
		side: 2,
		transparent: true,
		depthFunc: 2,
		depthWrite: false,
		depthTest: true,
		blending: 5,
		blendDstAlpha: 201,
		blendDst: 201,
		blendEquationAlpha: 100,
		blendEquation: 100,
		blendSrcAlpha: 201,
		blendSrc: 201,
    },
    "Spikes" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Splatter" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e/Splatter-7a1c8107-50c5-4b70-9a39-421576d6617e-v10.0-MainTex.png',
			function (texture) {
				texture.name = "Splatter_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 },
		},
		vertexShader: splatterVert,
		fragmentShader: splatterFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0
    },
    "Stars" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Streamers" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Taffy" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "TaperedFlat" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "TaperedMarker" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "TaperedMarker_Flat" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "ThickPaint" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Toon" : {
        uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: toonVert,
		fragmentShader: toonFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
	"UnlitHull" : {
        uniforms: {
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: unlitHullVert,
		fragmentShader: unlitHullFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
    "VelvetInk" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "Waveform" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "WetPaint" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
    "WigglyGraphite" : {
    	uniforms: {
			u_SceneLight_0_matrix: { value: [0.2931, 0.5524, -0.7803, 0, -0.8769, 0.4805, 0.0107, 0, 0.3809, 0.6811, 0.6253, 0, -4.9937, 8.1874, -46.2828, 1] },
			u_SceneLight_1_matrix: { value: [0.1816, -0.1369, -0.9738, 0, -0.7915, -0.6080, -0.0621, 0, -0.5835, 0.7821, -0.2188, 0, -5.6205, 8.2530, -46.8315, 1] },
			u_ambient_light_color: { value: new Vector4(0.3922, 0.3922, 0.3922, 1) },
			u_SceneLight_0_color: { value: new Vector4(0.7780, 0.8157, 0.9914, 1) },
			u_SceneLight_1_color: { value: new Vector4(0.4282, 0.4212, 0.3459, 1) },
			u_SpecColor: { value: new Vector3(0, 0, 0) },
			u_Shininess: { value: 0.1500 },
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 },
			u_BumpMap_TexelSize: { value: new Vector4(0.0010, 0.0078, 1024, 128) },
			u_BumpMap: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_BumpMap";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_MainTex: { value: new TextureLoader().load( 'https://www.tiltbrush.com/shaders/brushes/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37/Icing-2f212815-f4d3-c1a4-681a-feeaf9c6dc37-v10.0-BumpMap.png',
			function (texture) {
				texture.name = "Icing_MainTex";
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.flipY = false;
			    })
		    },
			u_Cutoff: { value: 0.2 }
		},
		vertexShader: icingVert,
		fragmentShader: icingFrag,
		side: 0,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
		extensions: { derivatives: true }
    },
	"Wire" : {
        uniforms: {
			u_fogColor: { value: new Vector3(0.0196, 0.0196, 0.0196) },
			u_fogDensity: { value: 0 }
		},
		vertexShader: wireVert,
		fragmentShader: wireFrag,
		side: 2,
		transparent: false,
		depthFunc: 2,
		depthWrite: true,
		depthTest: true,
		blending: 0,
    },
};

var Loader = (function () {
    function Loader(scene, sceneCamera, cameraControls) {
        this.loaded = false;
        this.updateableMeshes = [];
        this.tiltLoader = new TiltLoader();
        this.gltfLoader = new GLTFLoader();
        this.legacygltf = new LegacyGLTFLoader();
        this.scene = scene;
        this.sceneCamera = sceneCamera;
        this.cameraControls = cameraControls;
        new RawShaderMaterial();
    }
    Loader.prototype.update = function (deltaTime) {
        var _this = this;
        if (!this.loaded)
            return;
        var time = new Vector4(deltaTime / 20, deltaTime, deltaTime * 2, deltaTime * 3);
        this.updateableMeshes.forEach(function (mesh) {
            var material = mesh.material;
            switch (material.name) {
                case "material_DiamondHull":
                    material.uniforms["cameraPosition"].value = _this.sceneCamera.position;
                    material.uniforms["u_time"].value = time;
                    break;
                case "material_NeonPulse":
                    material.uniforms["u_time"].value = time;
                    break;
                case "material_Rainbow":
                    material.uniforms["u_time"].value = time;
                    break;
            }
        });
    };
    Loader.prototype.initGltf = function (url) {
        var _this = this;
        this.gltfLoader.load(url, function (gltf) {
            _this.loadedModel = gltf.scene;
            _this.loadedModel.traverse(function (object) {
                if (object.type === "Mesh") {
                    var mesh = object;
                    var material = mesh.material;
                    switch (material.name) {
                        case "brush_BlocksBasic":
                            mesh.geometry.name = "geometry_BlocksBasic";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["BlocksBasic"]);
                            mesh.material.name = "material_BlocksBasic";
                            break;
                        case "brush_BlocksGem":
                            mesh.geometry.name = "geometry_BlocksGem";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["BlocksGem"]);
                            mesh.material.name = "material_BlocksGem";
                            break;
                        case "brush_BlocksGlass":
                            mesh.geometry.name = "geometry_BlocksGlass";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["BlocksGlass"]);
                            mesh.material.name = "material_BlocksGlass";
                            break;
                        case "brush_Bubbles":
                            mesh.geometry.name = "geometry_Bubbles";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Bubbles"]);
                            mesh.material.name = "material_Bubbles";
                            break;
                        case "brush_CelVinyl":
                            mesh.geometry.name = "geometry_CelVinyl";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["CelVinyl"]);
                            mesh.material.name = "material_CelVinyl";
                            break;
                        case "brush_ChromaticWave":
                            mesh.geometry.name = "geometry_DiamondHull";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["ChromaticWave"]);
                            mesh.material.name = "material_ChromaticWave";
                            break;
                        case "brush_CoarseBristles":
                            mesh.geometry.name = "geometry_CoarseBristles";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["CoarseBristles"]);
                            mesh.material.name = "material_CoarseBristles";
                            break;
                        case "brush_Comet":
                            mesh.geometry.name = "geometry_Comet";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Comet"]);
                            mesh.material.name = "material_Comet";
                            break;
                        case "brush_DiamondHull":
                            mesh.geometry.name = "geometry_DiamondHull";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DiamondHull"]);
                            mesh.material.name = "material_DiamondHull";
                            _this.updateableMeshes.push(mesh);
                            break;
                        case "brush_Disco":
                            mesh.geometry.name = "geometry_Disco";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Disco"]);
                            mesh.material.name = "material_Disco";
                            break;
                        case "brush_DotMarker":
                            mesh.geometry.name = "geometry_DotMarker";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DotMarker"]);
                            mesh.material.name = "material_DotMarker";
                            break;
                        case "brush_Dots":
                            mesh.geometry.name = "geometry_Dots";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Dots"]);
                            mesh.material.name = "material_Dots";
                            break;
                        case "brush_DoubleTaperedFlat":
                            mesh.geometry.name = "geometry_DoubleTaperedFlat";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DoubleTaperedFlat"]);
                            mesh.material.name = "material_DoubleTaperedFlat";
                            break;
                        case "brush_DoubleTaperedMarker":
                            mesh.geometry.name = "geometry_DoubleTaperedMarker";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DoubleTaperedMarker"]);
                            mesh.material.name = "material_DoubleTaperedMarker";
                            break;
                        case "brush_DuctTape":
                            mesh.geometry.name = "geometry_DuctTape";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DuctTape"]);
                            mesh.material.name = "material_DuctTape";
                            break;
                        case "brush_Electricity":
                            mesh.geometry.name = "geometry_Electricity";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Electricity"]);
                            mesh.material.name = "material_Electricity";
                            break;
                        case "brush_Embers":
                            mesh.geometry.name = "geometry_Embers";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Embers"]);
                            mesh.material.name = "material_Embers";
                            break;
                        case "brush_EnvironmentDiffuse":
                            mesh.geometry.name = "geometry_EnvironmentDiffuse";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["EnvironmentDiffuse"]);
                            mesh.material.name = "material_EnvironmentDiffuse";
                            break;
                        case "brush_EnvironmentDiffuseLightMap":
                            mesh.geometry.name = "geometry_EnvironmentDiffuseLightMap";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["EnvironmentDiffuseLightMap"]);
                            mesh.material.name = "material_EnvironmentDiffuseLightMap";
                            break;
                        case "brush_Fire":
                            mesh.geometry.name = "geometry_Fire";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Fire"]);
                            mesh.material.name = "material_Fire";
                            break;
                        case "brush_Flat":
                            mesh.geometry.name = "geometry_Flat";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Flat"]);
                            mesh.material.name = "material_Flat";
                            break;
                        case "brush_FlatDeprecated":
                            mesh.geometry.name = "geometry_FlatDeprecated";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["FlatDeprecated"]);
                            mesh.material.name = "material_FlatDeprecated";
                            break;
                        case "brush_Highlighter":
                            mesh.geometry.name = "geometry_Highlighter";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Highlighter"]);
                            mesh.material.name = "material_Highlighter";
                            break;
                        case "brush_Hypercolor":
                            mesh.geometry.name = "geometry_Hypercolor";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Hypercolor"]);
                            mesh.material.name = "material_Hypercolor";
                            break;
                        case "brush_HyperGrid":
                            mesh.geometry.name = "geometry_HyperGrid";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["HyperGrid"]);
                            mesh.material.name = "material_HyperGrid";
                            break;
                        case "brush_Icing":
                            mesh.geometry.name = "geometry_Icing";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Icing"]);
                            mesh.material.name = "material_Icing";
                            break;
                        case "brush_Ink":
                            mesh.geometry.name = "geometry_Ink";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Ink"]);
                            mesh.material.name = "material_Ink";
                            break;
                        case "brush_Leaves":
                            mesh.geometry.name = "geometry_Leaves";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Leaves"]);
                            mesh.material.name = "material_Leaves";
                            break;
                        case "brush_Light":
                            mesh.geometry.name = "geometry_Light";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Light"]);
                            mesh.material.name = "material_Light";
                            break;
                        case "brush_LightWire":
                            mesh.geometry.name = "geometry_DiamondHull";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DiamondHull"]);
                            mesh.material.name = "material_DiamondHull";
                            break;
                        case "brush_Lofted":
                            mesh.geometry.name = "geometry_Lofted";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Lofted"]);
                            mesh.material.name = "material_Lofted";
                            break;
                        case "brush_Marker":
                            mesh.geometry.name = "geometry_Marker";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Marker"]);
                            mesh.material.name = "material_Marker";
                            break;
                        case "brush_MatteHull":
                            mesh.geometry.name = "geometry_MatteHull";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["MatteHull"]);
                            mesh.material.name = "material_MatteHull";
                            break;
                        case "brush_NeonPulse":
                            mesh.geometry.name = "geometry_NeonPulse";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["NeonPulse"]);
                            mesh.material.name = "material_NeonPulse";
                            _this.updateableMeshes.push(mesh);
                            break;
                        case "brush_OilPaint":
                            mesh.geometry.name = "geometry_OilPaint";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["OilPaint"]);
                            mesh.material.name = "material_OilPaint";
                            break;
                        case "brush_Paper":
                            mesh.geometry.name = "geometry_Paper";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Paper"]);
                            mesh.material.name = "material_Paper";
                            break;
                        case "brush_PbrTemplate":
                            mesh.geometry.name = "geometry_PbrTemplate";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["PbrTemplate"]);
                            mesh.material.name = "material_PbrTemplate";
                            break;
                        case "brush_PbrTransparentTemplate":
                            mesh.geometry.name = "geometry_PbrTransparentTemplate";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["PbrTransparentTemplate"]);
                            mesh.material.name = "material_PbrTransparentTemplate";
                            break;
                        case "brush_Petal":
                            mesh.geometry.name = "geometry_Petal";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Petal"]);
                            mesh.material.name = "material_Petal";
                            break;
                        case "brush_Plasma":
                            mesh.geometry.name = "geometry_Plasma";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Plasma"]);
                            mesh.material.name = "material_Plasma";
                            break;
                        case "brush_Rainbow":
                            mesh.geometry.name = "geometry_Rainbow";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Rainbow"]);
                            mesh.material.name = "material_Rainbow";
                            _this.updateableMeshes.push(mesh);
                            break;
                        case "brush_ShinyHull":
                            mesh.geometry.name = "geometry_ShinyHull";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["ShinyHull"]);
                            mesh.material.name = "material_ShinyHull";
                            break;
                        case "brush_Smoke":
                            mesh.geometry.name = "geometry_Smoke";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Smoke"]);
                            mesh.material.name = "material_Smoke";
                            break;
                        case "brush_Snow":
                            mesh.geometry.name = "geometry_Snow";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("_tb_unity_normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Snow"]);
                            mesh.material.name = "material_Snow";
                            break;
                        case "brush_SoftHighlighter":
                            mesh.geometry.name = "geometry_SoftHighlighter";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["SoftHighlighter"]);
                            mesh.material.name = "material_SoftHighlighter";
                            break;
                        case "brush_Spikes":
                            mesh.geometry.name = "geometry_Spikes";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Spikes"]);
                            mesh.material.name = "material_Spikes";
                            break;
                        case "brush_Splatter":
                            mesh.geometry.name = "geometry_Splatter";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Splatter"]);
                            mesh.material.name = "material_Splatter";
                            break;
                        case "brush_Stars":
                            mesh.geometry.name = "geometry_Stars";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Stars"]);
                            mesh.material.name = "material_Stars";
                            break;
                        case "brush_Streamers":
                            mesh.geometry.name = "geometry_Streamers";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Streamers"]);
                            mesh.material.name = "material_Streamers";
                            break;
                        case "brush_Taffy":
                            mesh.geometry.name = "geometry_DiamondHull";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DiamondHull"]);
                            mesh.material.name = "material_DiamondHull";
                            break;
                        case "brush_TaperedFlat":
                            mesh.geometry.name = "geometry_TaperedFlat";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["TaperedFlat"]);
                            mesh.material.name = "material_TaperedFlat";
                            break;
                        case "brush_TaperedMarker":
                            mesh.geometry.name = "geometry_TaperedMarker";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["TaperedMarker"]);
                            mesh.material.name = "material_TaperedMarker";
                            break;
                        case "brush_TaperedMarker_Flat":
                            mesh.geometry.name = "geometry_Flat";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Flat"]);
                            mesh.material.name = "material_Flat";
                            break;
                        case "brush_ThickPaint":
                            mesh.geometry.name = "geometry_ThickPaint";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["ThickPaint"]);
                            mesh.material.name = "material_ThickPaint";
                            break;
                        case "brush_Toon":
                            mesh.geometry.name = "geometry_Toon";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Toon"]);
                            mesh.material.name = "material_Toon";
                            break;
                        case "brush_UnlitHull":
                            mesh.geometry.name = "geometry_UnlitHull";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["UnlitHull"]);
                            mesh.material.name = "material_UnlitHull";
                            break;
                        case "brush_VelvetInk":
                            mesh.geometry.name = "geometry_VelvetInk";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["VelvetInk"]);
                            mesh.material.name = "material_VelvetInk";
                            break;
                        case "brush_Waveform":
                            mesh.geometry.name = "geometry_Waveform";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Waveform"]);
                            mesh.material.name = "material_Waveform";
                            break;
                        case "brush_WetPaint":
                            mesh.geometry.name = "geometry_WetPaint";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["WetPaint"]);
                            mesh.material.name = "material_WetPaint";
                            break;
                        case "brush_WigglyGraphite":
                            mesh.geometry.name = "geometry_WigglyGraphite";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["WigglyGraphite"]);
                            mesh.material.name = "material_WigglyGraphite";
                            break;
                        case "brush_Wire":
                            mesh.geometry.name = "geometry_Wire";
                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Wire"]);
                            mesh.material.name = "material_Wire";
                            break;
                        default:
                            mesh.material = new MeshStandardMaterial({ visible: false });
                    }
                }
            });
            _this.scene.clear();
            _this.scene.add(_this.loadedModel);
            var box = new Box3().setFromObject(_this.loadedModel);
            var boxSize = box.getSize(new Vector3()).length();
            var boxCenter = box.getCenter(new Vector3());
            _this.cameraControls.minDistance = boxSize * 0.01;
            _this.cameraControls.maxDistance = boxSize;
            var midDistance = _this.cameraControls.minDistance + (_this.cameraControls.maxDistance - _this.cameraControls.minDistance) / 2;
            _this.cameraControls.setTarget(boxCenter.x, boxCenter.y, boxCenter.z);
            _this.cameraControls.dollyTo(midDistance, true);
            _this.cameraControls.saveState();
            var keyLightNode = new DirectionalLight(0xFFEEDD, 0.325);
            keyLightNode.position.set(-19.021, 34.882, -19.134);
            keyLightNode.scale.set(0, 0, 16.828);
            _this.scene.add(keyLightNode);
            var headLightNode = new DirectionalLight(0xFFEEDD, 0.250);
            headLightNode.position.set(-16.661, 8.330, 8.330);
            headLightNode.scale.set(1, 1, 1);
            _this.scene.add(headLightNode);
            var __hemi__ = new HemisphereLight(0xEFEFFF, 0xB2B2B2, 0);
            __hemi__.position.set(0, 1, 0);
            _this.scene.add(__hemi__);
            _this.loaded = true;
        });
    };
    Loader.prototype.initTilt = function (url) {
        var _this = this;
        this.tiltLoader.load(url, function (tilt) {
            _this.scene.clear();
            _this.scene.add(tilt);
        });
    };
    Loader.prototype.initPolyGltf = function (url) {
        var _this = this;
        this.legacygltf.load(url, function (gltf) {
            _this.scene.clear();
            _this.scene.add(gltf.scene);
        });
    };
    Loader.prototype.loadGLTF = function (url) {
        this.initGltf(url);
    };
    Loader.prototype.loadPolyAsset = function (assetID, format) {
        var http = new XMLHttpRequest();
        var url = "https://api.icosa.gallery/poly/assets/" + assetID;
        var that = this;
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var polyAsset = Convert.toPoly(this.response);
                var types_1 = {};
                polyAsset.formats.forEach(function (format) {
                    types_1[format.formatType] = format;
                });
                if (format) {
                    switch (format) {
                        case "GLTF":
                            if (types_1.hasOwnProperty("GLTF")) {
                                that.initPolyGltf(types_1.GLTF.root.url);
                                return;
                            }
                            break;
                        case "TILT":
                            if (types_1.hasOwnProperty("TILT")) {
                                that.initTilt(types_1.TILT.root.url);
                                return;
                            }
                            break;
                    }
                }
                if (types_1.hasOwnProperty("GLTF")) {
                    that.initPolyGltf(types_1.GLTF.root.url);
                    return;
                }
                if (types_1.hasOwnProperty("TILT")) {
                    that.initTilt(types_1.TILT.root.url);
                    return;
                }
            }
        };
        http.open("GET", url, true);
        http.send();
    };
    Loader.prototype.loadPolyUrl = function (url, format) {
        var splitURL = url.split('/');
        if (splitURL[2] === "poly.google.com")
            this.loadPolyAsset(splitURL[4], format);
    };
    Loader.prototype.loadPolyTilt = function (url) {
        this.loadPolyUrl(url, "TILT");
    };
    Loader.prototype.loadPolyGltf = function (url) {
        this.loadPolyUrl(url, "GLTF");
    };
    return Loader;
}());

var Viewer = (function () {
    function Viewer(frame) {
        this.icosa_frame = frame;
        this.initViewer();
    }
    Viewer.prototype.setupNavigation = function (cameraControls) {
        var KEYCODE = {
            W: 87,
            A: 65,
            S: 83,
            D: 68,
            Q: 81,
            E: 69,
            ARROW_LEFT: 37,
            ARROW_UP: 38,
            ARROW_RIGHT: 39,
            ARROW_DOWN: 40,
        };
        var wKey = new KeyboardKeyHold(KEYCODE.W, 1);
        var aKey = new KeyboardKeyHold(KEYCODE.A, 1);
        var sKey = new KeyboardKeyHold(KEYCODE.S, 1);
        var dKey = new KeyboardKeyHold(KEYCODE.D, 1);
        var qKey = new KeyboardKeyHold(KEYCODE.Q, 1);
        var eKey = new KeyboardKeyHold(KEYCODE.E, 1);
        aKey.addEventListener('holding', function (event) { cameraControls.truck(-0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), 0, true); });
        dKey.addEventListener('holding', function (event) { cameraControls.truck(0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), 0, true); });
        wKey.addEventListener('holding', function (event) { cameraControls.forward(0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
        sKey.addEventListener('holding', function (event) { cameraControls.forward(-0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
        qKey.addEventListener('holding', function (event) { cameraControls.truck(0, 0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
        eKey.addEventListener('holding', function (event) { cameraControls.truck(0, -0.01 * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
        var leftKey = new KeyboardKeyHold(KEYCODE.ARROW_LEFT, 1);
        var rightKey = new KeyboardKeyHold(KEYCODE.ARROW_RIGHT, 1);
        var upKey = new KeyboardKeyHold(KEYCODE.ARROW_UP, 1);
        var downKey = new KeyboardKeyHold(KEYCODE.ARROW_DOWN, 1);
        leftKey.addEventListener('holding', function (event) { cameraControls.rotate(0.1 * MathUtils.DEG2RAD * (event === null || event === void 0 ? void 0 : event.deltaTime), 0, true); });
        rightKey.addEventListener('holding', function (event) { cameraControls.rotate(-0.1 * MathUtils.DEG2RAD * (event === null || event === void 0 ? void 0 : event.deltaTime), 0, true); });
        upKey.addEventListener('holding', function (event) { cameraControls.rotate(0, -0.05 * MathUtils.DEG2RAD * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
        downKey.addEventListener('holding', function (event) { cameraControls.rotate(0, 0.05 * MathUtils.DEG2RAD * (event === null || event === void 0 ? void 0 : event.deltaTime), true); });
    };
    Viewer.prototype.initViewer = function () {
        if (!this.icosa_frame)
            this.icosa_frame = document.getElementById('icosa-viewer');
        if (!this.icosa_frame) {
            this.icosa_frame = document.createElement('div');
            this.icosa_frame.id = 'icosa-viewer';
        }
        var canvas = document.createElement('canvas');
        canvas.id = 'c';
        this.icosa_frame.appendChild(canvas);
        var renderer = new WebGLRenderer({ canvas: canvas });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.xr.enabled = true;
        this.icosa_frame.appendChild(VRButton.createButton(renderer));
        CameraControls.install({ THREE: THREE });
        var clock = new Clock();
        var fov = 75;
        var aspect = 2;
        var near = 0.1;
        var far = 1000;
        var flatCamera = new PerspectiveCamera(fov, aspect, near, far);
        flatCamera.position.set(10, 10, 10);
        var cameraControls = new CameraControls(flatCamera, canvas);
        cameraControls.dampingFactor = 0.1;
        cameraControls.polarRotateSpeed = cameraControls.azimuthRotateSpeed = 0.5;
        cameraControls.setTarget(0, 0, 0);
        cameraControls.dollyTo(3, true);
        flatCamera.updateProjectionMatrix();
        var xrCamera = new PerspectiveCamera(fov, aspect, near, far);
        xrCamera.updateProjectionMatrix();
        this.setupNavigation(cameraControls);
        var scene = new Scene();
        this.icosa_viewer = new Loader(scene, flatCamera, cameraControls);
        var that = this;
        function animate() {
            renderer.setAnimationLoop(render);
        }
        function render() {
            var _a;
            var updated = false;
            var delta = clock.getDelta();
            var elapsed = clock.getElapsedTime();
            updated = cameraControls.update(delta) || renderer.xr.isPresenting;
            var needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
            if (needResize) {
                renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                flatCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                flatCamera.updateProjectionMatrix();
                updated = true;
            }
            if (updated) {
                (_a = that.icosa_viewer) === null || _a === void 0 ? void 0 : _a.update(elapsed);
                if (renderer.xr.isPresenting) {
                    renderer.render(scene, xrCamera);
                }
                else {
                    renderer.render(scene, flatCamera);
                }
            }
        }
        animate();
    };
    Viewer.prototype.loadGLTF = function (url) {
        var _a;
        (_a = this.icosa_viewer) === null || _a === void 0 ? void 0 : _a.loadGLTF(url);
    };
    Viewer.prototype.loadPolyUrl = function (url) {
        var _a;
        (_a = this.icosa_viewer) === null || _a === void 0 ? void 0 : _a.loadPolyUrl(url);
    };
    Viewer.prototype.loadPolyAsset = function (assetID) {
        var _a;
        (_a = this.icosa_viewer) === null || _a === void 0 ? void 0 : _a.loadPolyAsset(assetID);
    };
    Viewer.prototype.loadPolyTilt = function (url) {
        var _a;
        (_a = this.icosa_viewer) === null || _a === void 0 ? void 0 : _a.loadPolyTilt(url);
    };
    Viewer.prototype.loadPolyGLTF = function (url) {
        var _a;
        (_a = this.icosa_viewer) === null || _a === void 0 ? void 0 : _a.loadPolyGltf(url);
    };
    return Viewer;
}());

export { Convert, Loader, Viewer };
