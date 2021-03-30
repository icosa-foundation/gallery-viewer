// Copyright 2021 Icosa Gallery
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import CameraControls from "camera-controls";
import { Material, Mesh, MeshStandardMaterial, RawShaderMaterial, Scene, Object3D, DirectionalLight, HemisphereLight, Vector3, IUniform, Camera, Vector4 } from "three";
import { TiltLoader } from "three/examples/jsm/loaders/TiltLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Convert, JSONPoly } from "./JSONSchema";
import { TiltBrushShaders } from "./tiltbrush/tiltbrushshaders"; 

export class Loader {
    private scene : Scene;
    private tiltLoader : TiltLoader;
    private gltfLoader : GLTFLoader;

    private sceneCamera : Camera;

    private loadedModel? : Object3D;

    private loaded : boolean = false;

    private updateableMeshes : Mesh[] = [];

    constructor (scene : Scene, sceneCamera : Camera) {
        this.tiltLoader = new TiltLoader();
        this.gltfLoader = new GLTFLoader();
        this.scene = scene;
        this.sceneCamera = sceneCamera;
        new RawShaderMaterial()
    }

    public update(deltaTime : number) {
        if(!this.loaded)
            return;

        // _Time from https://docs.unity3d.com/Manual/SL-UnityShaderVariables.html
        var time = new Vector4(deltaTime/20, deltaTime, deltaTime*2, deltaTime*3);

        // Update uniforms of meshes that need it.
        this.updateableMeshes.forEach((mesh) => {
            var material = mesh.material as Material;
            switch (material.name) {
                case "material_DiamondHull":
                    (material as RawShaderMaterial).uniforms!["cameraPosition"].value = this.sceneCamera.position;
                    (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                    break;
                case "material_NeonPulse":
                    (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                    break;
                case "material_Rainbow":
                    (material as RawShaderMaterial).uniforms!["u_time"].value = time;
                    break;
            }
        });
    }

    public load(assetID : string) {
        this.gltfLoader.load(assetID, (gltf) => {
            this.loadedModel = gltf.scene;
            this.loadedModel.traverse((object : Object3D) => {
                if(object.type === "Mesh") {
                    var mesh = object as Mesh;
                    var material = mesh.material as Material;
                    switch(material.name) {

                            case "brush_BlocksBasic":
                            break;


                            case "brush_BlocksGem":
                            break;


                            case "brush_BlocksGlass":
                            break;


                            case "brush_Bubbles":
                            break;


                            case "brush_CelVinyl":
                            break;


                            case "brush_ChromaticWave":
                            break;


                            case "brush_CoarseBristles":
                            break;


                            case "brush_Comet":
                            break;


                        case "brush_DiamondHull":
                            mesh.geometry.name = "geometry_DiamondHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["DiamondHull"]);
                            mesh.material.name = "material_DiamondHull";
                            this.updateableMeshes.push(mesh);
                            break;

                            case "brush_Disco":
                            break;


                            case "brush_DotMarker":
                            break;


                            case "brush_Dots":
                            break;


                            case "brush_DoubleTaperedFlat":
                            break;


                            case "brush_DoubleTaperedMarker":
                            break;


                            case "brush_DuctTape":
                            break;


                            case "brush_Electricity":
                            break;


                            case "brush_Embers":
                            break;


                            case "brush_EnvironmentDiffuse":
                            break;


                            case "brush_EnvironmentDiffuseLightMap":
                            break;


                            case "brush_Fire":
                            break;


                            case "brush_Flat":
                            break;


                            case "brush_FlatDeprecated":
                            break;


                            case "brush_Highlighter":
                            break;


                            case "brush_Hypercolor":
                            break;


                            case "brush_HyperGrid":
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
                            break;


                            case "brush_Leaves":
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
                            break;


                            case "brush_Lofted":
                            break;


                            case "brush_Marker":
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
                            this.updateableMeshes.push(mesh);
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
                            break;


                            case "brush_PbrTemplate":
                            break;


                            case "brush_PbrTransparentTemplate":
                            break;


                            case "brush_Petal":
                            break;


                            case "brush_Plasma":
                            break;


                        case "brush_Rainbow":
                            mesh.geometry.name = "geometry_Rainbow";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));

                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Rainbow"]);
                            mesh.material.name = "material_Rainbow";
                            this.updateableMeshes.push(mesh);
                            break;

                            case "brush_ShinyHull":
                            break;


                        case "brush_Smoke":
                            mesh.geometry.name = "geometry_Smoke";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("position")); //in theory this should be "_tb_unity_normal" but I can't see anything with that.
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Smoke"]);
                            mesh.material.name = "material_Smoke";
                            break;

                            case "brush_Snow":
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
                            break;


                            case "brush_Streamers":
                            break;


                            case "brush_Taffy":
                            break;


                            case "brush_TaperedFlat":
                            break;


                            case "brush_TaperedMarker":
                            break;


                            case "brush_TaperedMarker_Flat":
                            break;


                            case "brush_ThickPaint":
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
                            break;


                            case "brush_Waveform":
                            break;


                            case "brush_WetPaint":
                            break;


                            case "brush_WigglyGraphite":
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
                            mesh.material = new MeshStandardMaterial( { visible: false } );
                    }
                }
            });
            this.scene.add(this.loadedModel);


            //DEBUG LIGHTING
            var keyLightNode = new DirectionalLight(0xFFEEDD, 0.325);
            keyLightNode.position.set(-19.021, 34.882, -19.134);
            keyLightNode.scale.set(0, 0, 16.828);
            this.scene.add(keyLightNode);

            var headLightNode = new DirectionalLight(0xFFEEDD, 0.250);
            headLightNode.position.set(-16.661, 8.330, 8.330);
            headLightNode.scale.set(1, 1, 1);
            this.scene.add(headLightNode);

            var __hemi__ = new HemisphereLight(0xEFEFFF, 0xB2B2B2, 0);
            __hemi__.position.set(0, 1, 0);
            this.scene.add(__hemi__);

            this.loaded = true;
        });
    }

    public loadPoly(assetID : string) {
        const http = new XMLHttpRequest();
        const url = `https://api.icosa.gallery/poly/assets/${assetID}`;

        const that = this;
        http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const polyAsset = Convert.toPoly(this.response);
                polyAsset.formats.forEach(format => {
                    if(format.formatType === "TILT") {
                        that.initTilt(format.root.url);
                        return;
                    }
                })
            }
        }

        http.open("GET", url, true);
        http.send();
    }

    public loadPolyURL(url : string) {
        var splitURL = url.split('/');
        if(splitURL[2] === "poly.google.com")
            this.loadPoly(splitURL[4]);
    }

    private initTilt(url : string) {
        this.scene.clear();
        this.tiltLoader.load(url, (tilt) => {
            this.scene.add(tilt);
        });
    }
}