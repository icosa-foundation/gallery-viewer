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
import { Material, Mesh, MeshStandardMaterial, RawShaderMaterial, Scene, Object3D, DirectionalLight, HemisphereLight } from "three";
import { TiltLoader } from "three/examples/jsm/loaders/TiltLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Convert, JSONPoly } from "./JSONSchema";
import { TiltBrushShaders } from "./tiltbrush/tiltbrushshaders"; 

export class Loader {
    private scene : Scene;
    //private tiltLoader : TiltLoader;
    private gltfLoader : GLTFLoader;

    constructor (scene : Scene, camercontrols : CameraControls) {
        //this.tiltLoader = new TiltLoader();
        this.gltfLoader = new GLTFLoader();
        this.scene = scene;
        new RawShaderMaterial()
    }

    public load(assetID : string) {
        this.gltfLoader.load(assetID, (gltf) => {
            var model = gltf.scene;
            model.traverse((object : Object3D) => {
                if(object.type === "Mesh") {
                    var mesh = object as Mesh;
                    var t = (mesh.material) as Material;
                    switch(t.name) {
                        case "brush_MatteHull":
                            mesh.geometry.name = "geometry_MatteHull";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["MatteHull"]);
                            mesh.material.name = "material_MatteHull";
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

                        case "brush_Light":
                            mesh.geometry.name = "geometry_Light";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Light"]);
                            mesh.material.name = "material_Light";
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

                        case "brush_Splatter":
                            mesh.geometry.name = "geometry_Splatter";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Splatter"]);
                            mesh.material.name = "material_Splatter";
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
            this.scene.add(gltf.scene);

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
        // this.tiltLoader.load(url, (tilt) => {
        //     this.scene.add(tilt);
        // });
    }
}