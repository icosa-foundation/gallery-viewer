var $6d7Yh$cameracontrols = require("camera-controls");
var $6d7Yh$three = require("three");
var $6d7Yh$threeexamplesjsmloadersDRACOLoaderjs = require("three/examples/jsm/loaders/DRACOLoader.js");
var $6d7Yh$threeexamplesjsmloadersGLTFLoaderjs = require("three/examples/jsm/loaders/GLTFLoader.js");
var $6d7Yh$threeexamplesjsmwebxrVRButtonjs = require("three/examples/jsm/webxr/VRButton.js");
var $6d7Yh$threeicosa = require("three-icosa");
var $6d7Yh$holdevent = require("hold-event");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "Viewer", () => $3f2b6f59492f6c9b$export$2ec4afd9b3c16a85);
// Copyright 2021-2022 Icosa Gallery
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







// import { EffectComposer } from 'three/addons';
// import { RenderPass } from 'three/addons';
// import { GlitchPass } from 'three/addons';
// import { OutputPass } from 'three/addons';
class $3f2b6f59492f6c9b$var$SketchMetadata {
    constructor(userData){
        this.EnvironmentGuid = userData["TB_EnvironmentGuid"] ?? "";
        this.Environment = userData["TB_Environment"] ?? "";
        this.UseGradient = userData["TB_UseGradient"] ?? false;
        this.SkyColorA = this.parseTBColor(userData["TB_SkyColorA"]);
        this.SkyColorB = this.parseTBColor(userData["TB_SkyColorB"]);
        this.SkyGradientDirection = this.parseTBVector3(userData["TB_SkyGradientDirection"], new $6d7Yh$three.Vector3(0, 1, 0));
        this.FogColor = this.parseTBColor(userData["TB_FogColor"]);
        this.FogDensity = userData["TB_FogDensity"] ?? 0;
        this.PoseTranslation = this.parseTBVector3(userData["TB_PoseTranslation"]);
        this.PoseRotation = this.parseTBRotation(userData["TB_PoseRotation"]);
        this.PoseScale = userData["TB_PoseScale"] ?? 1;
    }
    parseTBRotation(vectorString) {
        if (!vectorString) return new $6d7Yh$three.Quaternion();
        let [x, y, z] = vectorString.split(",").map(parseFloat);
        return new $6d7Yh$three.Quaternion().setFromEuler(new $6d7Yh$three.Euler(x, y, z));
    }
    parseTBVector3(vectorString, defaultValue) {
        if (!vectorString) return defaultValue ?? new $6d7Yh$three.Vector3();
        let [x, y, z] = vectorString.split(",").map(parseFloat);
        return new $6d7Yh$three.Vector3(x, y, z);
    }
    parseTBColor(colorString) {
        if (!colorString) return new $6d7Yh$three.Color("#000");
        let [r, g, b] = colorString.split(",").map(parseFloat);
        return new $6d7Yh$three.Color(r, g, b);
    }
}
class $3f2b6f59492f6c9b$var$EnvironmentPreset {
    constructor(preset){
        this.Guid = preset?.guid ?? "";
        this.Name = preset?.name ?? "No preset";
        this.UseGradient = false;
        this.SkyColorA = preset?.skyboxColorA ?? new $6d7Yh$three.Color("#000");
        this.SkyColorB = preset?.skyboxColorB ?? new $6d7Yh$three.Color("#000");
        this.SkyGradientDirection = new $6d7Yh$three.Vector3(0, 1, 0);
        this.FogColor = preset?.renderSettings.fogColor ?? new $6d7Yh$three.Color("#000");
        this.FogDensity = preset?.renderSettings.fogDensity ?? 0;
    }
}
class $3f2b6f59492f6c9b$export$2ec4afd9b3c16a85 {
    setupNavigation(cameraControls) {
        const KEYCODE = {
            W: 87,
            A: 65,
            S: 83,
            D: 68,
            Q: 81,
            E: 69,
            ARROW_LEFT: 37,
            ARROW_UP: 38,
            ARROW_RIGHT: 39,
            ARROW_DOWN: 40
        };
        const wKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.W, 1);
        const aKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.A, 1);
        const sKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.S, 1);
        const dKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.D, 1);
        const qKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.Q, 1);
        const eKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.E, 1);
        aKey.addEventListener("holding", function(event) {
            cameraControls.truck(-0.01 * event?.deltaTime, 0, true);
        });
        dKey.addEventListener("holding", function(event) {
            cameraControls.truck(0.01 * event?.deltaTime, 0, true);
        });
        wKey.addEventListener("holding", function(event) {
            cameraControls.forward(0.01 * event?.deltaTime, true);
        });
        sKey.addEventListener("holding", function(event) {
            cameraControls.forward(-0.01 * event?.deltaTime, true);
        });
        qKey.addEventListener("holding", function(event) {
            cameraControls.truck(0, 0.01 * event?.deltaTime, true);
        });
        eKey.addEventListener("holding", function(event) {
            cameraControls.truck(0, -0.01 * event?.deltaTime, true);
        });
        // Leaving this here because I hope I can use it later somehow.
        // cameraControls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
        const leftKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.ARROW_LEFT, 1);
        const rightKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.ARROW_RIGHT, 1);
        const upKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.ARROW_UP, 1);
        const downKey = new $6d7Yh$holdevent.KeyboardKeyHold(KEYCODE.ARROW_DOWN, 1);
        leftKey.addEventListener("holding", function(event) {
            cameraControls.rotate(0.1 * (0, $6d7Yh$three.MathUtils).DEG2RAD * event?.deltaTime, 0, true);
        });
        rightKey.addEventListener("holding", function(event) {
            cameraControls.rotate(-0.1 * (0, $6d7Yh$three.MathUtils).DEG2RAD * event?.deltaTime, 0, true);
        });
        upKey.addEventListener("holding", function(event) {
            cameraControls.rotate(0, -0.05 * (0, $6d7Yh$three.MathUtils).DEG2RAD * event?.deltaTime, true);
        });
        downKey.addEventListener("holding", function(event) {
            cameraControls.rotate(0, 0.05 * (0, $6d7Yh$three.MathUtils).DEG2RAD * event?.deltaTime, true);
        });
    }
    constructor(assetBaseUrl, frame){
        this.sceneColor = new $6d7Yh$three.Color("#000000");
        this.icosa_frame = frame;
        // Attempt to find viewer frame if not assigned
        if (!this.icosa_frame) this.icosa_frame = document.getElementById("icosa-viewer");
        // Create if still not assigned
        if (!this.icosa_frame) {
            this.icosa_frame = document.createElement("div");
            this.icosa_frame.id = "icosa-viewer";
        }
        const controlPanel = document.createElement("div");
        controlPanel.classList.add("control-panel");
        const fullscreenButton = document.createElement("button");
        fullscreenButton.classList.add("panel-button", "fullscreen-button");
        fullscreenButton.onclick = ()=>{
            this.toggleFullscreen(fullscreenButton);
        };
        controlPanel.appendChild(fullscreenButton);
        this.icosa_frame.appendChild(controlPanel);
        //loadscreen
        const loadscreen = document.createElement("div");
        loadscreen.id = "loadscreen";
        const loadanim = document.createElement("div");
        loadanim.classList.add("loadlogo");
        loadscreen.appendChild(loadanim);
        this.icosa_frame.appendChild(loadscreen);
        loadscreen.addEventListener("transitionend", function() {
            const opacity = window.getComputedStyle(loadscreen).opacity;
            if (parseFloat(opacity) < 0.2) loadscreen.classList.add("loaded");
        });
        const canvas = document.createElement("canvas");
        canvas.id = "c";
        this.icosa_frame.appendChild(canvas);
        canvas.onmousedown = ()=>{
            canvas.classList.add("grabbed");
        };
        canvas.onmouseup = ()=>{
            canvas.classList.remove("grabbed");
        };
        const renderer = new $6d7Yh$three.WebGLRenderer({
            canvas: canvas
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputColorSpace = $6d7Yh$three.SRGBColorSpace;
        renderer.xr.enabled = true;
        this.icosa_frame.appendChild((0, $6d7Yh$threeexamplesjsmwebxrVRButtonjs.VRButton).createButton(renderer));
        const clock = new $6d7Yh$three.Clock();
        const fov = 75;
        const aspect = 2;
        const near = 0.1;
        const far = 1000;
        const flatCamera = new $6d7Yh$three.PerspectiveCamera(fov, aspect, near, far);
        flatCamera.position.set(10, 10, 10);
        (0, ($parcel$interopDefault($6d7Yh$cameracontrols))).install({
            THREE: $6d7Yh$three
        });
        this.cameraControls = new (0, ($parcel$interopDefault($6d7Yh$cameracontrols)))(flatCamera, canvas);
        this.cameraControls.dampingFactor = 0.1;
        this.cameraControls.polarRotateSpeed = this.cameraControls.azimuthRotateSpeed = 0.5;
        this.cameraControls.setTarget(0, 0, 0);
        this.cameraControls.dollyTo(3, true);
        flatCamera.updateProjectionMatrix();
        this.sceneCamera = flatCamera;
        const xrCamera = new $6d7Yh$three.PerspectiveCamera(fov, aspect, near, far);
        xrCamera.updateProjectionMatrix();
        this.setupNavigation(this.cameraControls);
        this.scene = new $6d7Yh$three.Scene();
        const viewer = this;
        const manager = new $6d7Yh$three.LoadingManager();
        manager.onStart = function() {
            document.getElementById("loadscreen")?.classList.remove("fade-out");
            document.getElementById("loadscreen")?.classList.remove("loaded");
        };
        manager.onLoad = function() {
            document.getElementById("loadscreen")?.classList.add("fade-out");
        };
        this.brushPath = new URL("brushes/", assetBaseUrl);
        this.environmentPath = new URL("environments/", assetBaseUrl);
        this.texturePath = new URL("textures/", assetBaseUrl);
        this.gltfLoader = new (0, $6d7Yh$threeexamplesjsmloadersGLTFLoaderjs.GLTFLoader)(manager);
        this.gltfLoader.register((parser)=>new (0, $6d7Yh$threeicosa.GLTFGoogleTiltBrushMaterialExtension)(parser, this.brushPath.toString()));
        const dracoLoader = new (0, $6d7Yh$threeexamplesjsmloadersDRACOLoaderjs.DRACOLoader)();
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
        this.gltfLoader.setDRACOLoader(dracoLoader);
        function animate() {
            renderer.setAnimationLoop(render);
        // requestAnimationFrame( animate );
        // composer.render();
        }
        function render() {
            const delta = clock.getDelta();
            if (renderer.xr.isPresenting) viewer.sceneCamera = xrCamera;
            else {
                viewer.sceneCamera = flatCamera;
                const needResize = canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight;
                if (needResize) {
                    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                    flatCamera.aspect = canvas.clientWidth / canvas.clientHeight;
                    flatCamera.updateProjectionMatrix();
                }
                viewer.cameraControls.update(delta);
            }
            renderer.render(viewer.scene, viewer.sceneCamera);
        }
        animate();
    }
    toggleFullscreen(controlButton) {
        if (this.icosa_frame?.requestFullscreen) this.icosa_frame?.requestFullscreen();
        document.onfullscreenchange = ()=>{
            if (document.fullscreenElement == null) {
                controlButton.onclick = ()=>{
                    if (this.icosa_frame?.requestFullscreen) this.icosa_frame?.requestFullscreen();
                };
                controlButton.classList.remove("fullscreen");
            } else {
                controlButton.onclick = ()=>{
                    if (document.exitFullscreen) document.exitFullscreen();
                };
                controlButton.classList.add("fullscreen");
            }
        };
    }
    initializeScene() {
        if (!this.loadedModel) return;
        this.scene.clear();
        this.initSceneBackground();
        this.initSceneLights();
        this.scene.add(this.loadedModel);
        // Setup camera to center model
        const box = this.sketchBoundingBox;
        if (box != undefined && box != null) {
            const boxSize = box.getSize(new $6d7Yh$three.Vector3()).length();
            const boxCenter = box.getCenter(new $6d7Yh$three.Vector3());
            this.cameraControls.minDistance = boxSize * 0.01;
            this.cameraControls.maxDistance = boxSize * 10;
            const midDistance = this.cameraControls.minDistance + (boxSize - this.cameraControls.minDistance) / 2;
            this.cameraControls.setTarget(boxCenter.x, boxCenter.y, boxCenter.z);
            this.cameraControls.dollyTo(midDistance, true);
            this.cameraControls.saveState();
        }
        const ambientLight = new $6d7Yh$three.AmbientLight();
        this.scene.add(ambientLight);
    }
    static lookupEnvironment(guid) {
        return ({
            "e38af599-4575-46ff-a040-459703dbcd36": {
                name: "Passthrough",
                guid: "e38af599-4575-46ff-a040-459703dbcd36",
                renderSettings: {
                    fogEnabled: false,
                    fogColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 0.0
                    },
                    fogDensity: 0.0,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.5,
                        g: 0.5,
                        b: 0.5,
                        a: 1.0
                    },
                    skyboxExposure: 0.0,
                    skyboxTint: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 0.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Passthrough",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: "",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 1.16949809,
                            g: 1.19485855,
                            b: 1.31320751,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.428235322,
                            g: 0.4211765,
                            b: 0.3458824,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 0.0
                },
                skyboxColorB: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 0.0
                }
            },
            "ab080599-e465-4a6d-8587-43bf495af68b": {
                name: "Standard",
                guid: "ab080599-e465-4a6d-8587-43bf495af68b",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.164705887,
                        g: 0.164705887,
                        b: 0.20784314,
                        a: 1.0
                    },
                    fogDensity: 0.0025,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.156862751,
                        g: 0.156862751,
                        b: 0.203921571,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.392156869,
                        g: 0.392156869,
                        b: 0.392156869,
                        a: 1.0
                    },
                    skyboxExposure: 0.9,
                    skyboxTint: {
                        r: 0.235294119,
                        g: 0.2509804,
                        b: 0.3529412,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Standard",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_CarpetedHallway",
                    skyboxCubemap: "",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 0.7780392,
                            g: 0.815686345,
                            b: 0.9913726,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.428235322,
                            g: 0.4211765,
                            b: 0.3458824,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.274509817,
                    g: 0.274509817,
                    b: 0.31764707,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.03529412,
                    g: 0.03529412,
                    b: 0.08627451,
                    a: 1.0
                }
            },
            "c504347a-c96d-4505-853b-87b484acff9a": {
                name: "NightSky",
                guid: "c504347a-c96d-4505-853b-87b484acff9a",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.0196078438,
                        g: 0.0117647061,
                        b: 0.0431372561,
                        a: 1.0
                    },
                    fogDensity: 0.006,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.3019608,
                        g: 0.3019608,
                        b: 0.6039216,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/NightSky",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Mountains",
                    skyboxCubemap: "nightsky",
                    reflectionCubemap: "milkyway_reflection",
                    reflectionIntensity: 3.0
                },
                lights: [
                    {
                        color: {
                            r: 1.02352941,
                            g: 0.7647059,
                            b: 0.929411769,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 65.0,
                            y: 0.0,
                            z: 25.9999981
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.08235294,
                    g: 0.0470588244,
                    b: 0.184313729,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 1.0
                }
            },
            "96cf6f36-47b6-44f4-bdbf-63be2ddac909": {
                name: "Space",
                guid: "96cf6f36-47b6-44f4-bdbf-63be2ddac909",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    fogDensity: 0.0,
                    fogStartDistance: 5.0,
                    fogEndDistance: 20.0,
                    clearColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.227450982,
                        g: 0.20784314,
                        b: 0.360784322,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Space",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Arena",
                    skyboxCubemap: "milkyway_PNG",
                    reflectionCubemap: "milkyway_reflection",
                    reflectionIntensity: 3.0
                },
                lights: [
                    {
                        color: {
                            r: 1.16000009,
                            g: 0.866666734,
                            b: 0.866666734,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 30.0000019,
                            y: 39.9999962,
                            z: 50.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 20.0,
                controllerXRayHeight: -1000000000,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.121568628,
                    g: 0.03529412,
                    b: 0.172549024,
                    a: 1.0
                }
            },
            "e2e72b76-d443-4721-97e6-f3d49fe98dda": {
                name: "DressForm",
                guid: "e2e72b76-d443-4721-97e6-f3d49fe98dda",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.172549024,
                        g: 0.180392161,
                        b: 0.243137255,
                        a: 1.0
                    },
                    fogDensity: 0.007,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.219607845,
                        g: 0.227450982,
                        b: 0.31764707,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.4117647,
                        g: 0.3529412,
                        b: 0.596078455,
                        a: 1.0
                    },
                    skyboxExposure: 0.61,
                    skyboxTint: {
                        r: 0.458823532,
                        g: 0.5137255,
                        b: 0.7882353,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/DressForm",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_LivingRoom",
                    skyboxCubemap: "",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 1.1152941,
                            g: 0.917647064,
                            b: 0.7764706,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 7.0
                        },
                        rotation: {
                            x: 50.0,
                            y: 41.9999962,
                            z: 25.9999924
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.356862754,
                            g: 0.3509804,
                            b: 0.2882353,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 227.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.34117648,
                    g: 0.345098048,
                    b: 0.4509804,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.09411765,
                    g: 0.105882354,
                    b: 0.1764706,
                    a: 1.0
                }
            },
            "ab080511-e465-4a6d-8587-53bf495af68b": {
                name: "Pedestal",
                guid: "ab080511-e465-4a6d-8587-53bf495af68b",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.172549024,
                        g: 0.180392161,
                        b: 0.243137255,
                        a: 1.0
                    },
                    fogDensity: 0.007,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.219607845,
                        g: 0.227450982,
                        b: 0.31764707,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.4117647,
                        g: 0.3529412,
                        b: 0.596078455,
                        a: 1.0
                    },
                    skyboxExposure: 0.61,
                    skyboxTint: {
                        r: 0.458823532,
                        g: 0.5137255,
                        b: 0.7882353,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Pedestal",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_LivingRoom",
                    skyboxCubemap: "",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 1.0
                },
                lights: [
                    {
                        color: {
                            r: 1.1152941,
                            g: 0.917647064,
                            b: 0.7764706,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 7.0
                        },
                        rotation: {
                            x: 50.0,
                            y: 41.9999962,
                            z: 25.9999924
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.356862754,
                            g: 0.3509804,
                            b: 0.2882353,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 227.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 9.675,
                    z: 5.0
                },
                skyboxColorA: {
                    r: 0.34117648,
                    g: 0.345098048,
                    b: 0.4509804,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.09411765,
                    g: 0.105882354,
                    b: 0.1764706,
                    a: 1.0
                }
            },
            "ab080511-e565-4a6d-8587-53bf495af68b": {
                name: "Snowman",
                guid: "ab080511-e565-4a6d-8587-53bf495af68b",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.6509804,
                        g: 0.7254902,
                        b: 0.8745098,
                        a: 1.0
                    },
                    fogDensity: 0.005,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.6509804,
                        g: 0.7019608,
                        b: 0.870588243,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.7294118,
                        g: 0.7294118,
                        b: 0.7294118,
                        a: 1.0
                    },
                    skyboxExposure: 0.95,
                    skyboxTint: {
                        r: 0.75686276,
                        g: 0.819607854,
                        b: 1.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/Snowman",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_PaddedCell",
                    skyboxCubemap: "snowysky",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 0.241451,
                            g: 0.234078437,
                            b: 0.3465098,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 58.0,
                            y: 315.999969,
                            z: 50.0000038
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.410980433,
                            g: 0.4956863,
                            b: 0.65882355,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 8.0
                        },
                        rotation: {
                            x: 40.0,
                            y: 143.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: 0.0,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.4627451,
                    g: 0.5647059,
                    b: 0.7058824,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.7607843,
                    g: 0.8156863,
                    b: 0.972549,
                    a: 1.0
                }
            },
            "36e65e4f-17d7-41ef-834a-e525db0b9888": {
                name: "PinkLemonade",
                guid: "36e65e4f-17d7-41ef-834a-e525db0b9888",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 1.0,
                        g: 0.5514706,
                        b: 0.9319472,
                        a: 1.0
                    },
                    fogDensity: 0.025,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.827451,
                        g: 0.368627459,
                        b: 0.34117648,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 1.0,
                        g: 0.9019608,
                        b: 0.854901969,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 0.827451,
                        g: 0.368627459,
                        b: 0.34117648,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientDustDim",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: "",
                    reflectionCubemap: "gradientblue",
                    reflectionIntensity: 0.0
                },
                lights: [
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 318.189667,
                            y: 116.565048,
                            z: 116.565048
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.5,
                            g: 0.28039217,
                            b: 0.3156863,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 80.0,
                controllerXRayHeight: -1000000000,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 1.0,
                    g: 0.882352948,
                    b: 0.65882355,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.858823538,
                    g: 0.294117659,
                    b: 0.3647059,
                    a: 1.0
                }
            },
            "a9bc2bc8-6d86-4cda-82a9-283e0f3977ac": {
                name: "Pistachio",
                guid: "a9bc2bc8-6d86-4cda-82a9-283e0f3977ac",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.2784314,
                        g: 0.5686275,
                        b: 0.458823532,
                        a: 1.0
                    },
                    fogDensity: 0.015,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.9558824,
                        g: 0.6708847,
                        b: 0.513083935,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.610186,
                        g: 0.838235259,
                        b: 0.75194633,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 0.797,
                        g: 0.616,
                        b: 0.755,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientDustDim",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: "",
                    reflectionCubemap: "gradientblue",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 0.209818333,
                            g: 0.242647052,
                            b: 0.171280265,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 41.810318,
                            y: 116.565048,
                            z: 243.434937
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.977941155,
                            g: 0.506417,
                            b: 0.438635379,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 50.0,
                controllerXRayHeight: -1000000000,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 1.0,
                    g: 0.5176471,
                    b: 0.3529412,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.458823532,
                    g: 0.78039217,
                    b: 0.5529412,
                    a: 1.0
                }
            },
            "e65cde1a-a177-4bfb-b93f-f673c99a32bc": {
                name: "Illustrative",
                guid: "e65cde1a-a177-4bfb-b93f-f673c99a32bc",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    fogDensity: 0.0125,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.7019608,
                        g: 0.7019608,
                        b: 0.7019608,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    skyboxExposure: 0.0,
                    skyboxTint: {
                        r: 0.625,
                        g: 0.625,
                        b: 0.625,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientDustDim",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: "",
                    reflectionCubemap: "",
                    reflectionIntensity: 0.0
                },
                lights: [
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 180.0,
                            z: 180.0
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        type: "Directional",
                        range: 0.0,
                        spotAngle: 0.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 100.0,
                controllerXRayHeight: -1000000000,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.7647059,
                    g: 0.7647059,
                    b: 0.7647059,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.623529434,
                    g: 0.623529434,
                    b: 0.623529434,
                    a: 1.0
                }
            },
            "580b4529-ac50-4fe9-b8d2-635765a14893": {
                name: "Black",
                guid: "580b4529-ac50-4fe9-b8d2-635765a14893",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.0196078438,
                        g: 0.0196078438,
                        b: 0.0196078438,
                        a: 1.0
                    },
                    fogDensity: 0.0,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.392156869,
                        g: 0.392156869,
                        b: 0.392156869,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientDust",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: "",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.3
                },
                lights: [
                    {
                        color: {
                            r: 0.7780392,
                            g: 0.815686345,
                            b: 0.9913726,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.428235322,
                            g: 0.4211765,
                            b: 0.3458824,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 100.0,
                controllerXRayHeight: -1000000000,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 1.0
                }
            },
            "9b89b0a4-c41e-4b78-82a1-22f10a238357": {
                name: "White",
                guid: "9b89b0a4-c41e-4b78-82a1-22f10a238357",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 1.0,
                        g: 1.0,
                        b: 1.0,
                        a: 1.0
                    },
                    fogDensity: 0.0,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.784313738,
                        g: 0.784313738,
                        b: 0.784313738,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.392156869,
                        g: 0.392156869,
                        b: 0.392156869,
                        a: 1.0
                    },
                    skyboxExposure: 1.0,
                    skyboxTint: {
                        r: 0.0,
                        g: 0.0,
                        b: 0.0,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientGrid",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: "",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.4
                },
                lights: [
                    {
                        color: {
                            r: 0.7780392,
                            g: 0.815686345,
                            b: 0.9913726,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.428235322,
                            g: 0.4211765,
                            b: 0.3458824,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 100.0,
                controllerXRayHeight: -1000000000,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.784313738,
                    g: 0.784313738,
                    b: 0.784313738,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.784313738,
                    g: 0.784313738,
                    b: 0.784313738,
                    a: 1.0
                }
            },
            "0ca88298-e5e8-4e94-aad8-4b4f6c80ae52": {
                name: "Blue",
                guid: "0ca88298-e5e8-4e94-aad8-4b4f6c80ae52",
                renderSettings: {
                    fogEnabled: true,
                    fogColor: {
                        r: 0.6313726,
                        g: 0.7137255,
                        b: 0.894117653,
                        a: 1.0
                    },
                    fogDensity: 0.005,
                    fogStartDistance: 0.0,
                    fogEndDistance: 0.0,
                    clearColor: {
                        r: 0.270588249,
                        g: 0.309803933,
                        b: 0.470588237,
                        a: 1.0
                    },
                    ambientColor: {
                        r: 0.203921571,
                        g: 0.294117659,
                        b: 0.368627459,
                        a: 1.0
                    },
                    skyboxExposure: 1.46,
                    skyboxTint: {
                        r: 0.4627451,
                        g: 0.5294118,
                        b: 0.698039234,
                        a: 1.0
                    },
                    environmentPrefab: "EnvironmentPrefabs/AmbientGrid_Blue",
                    environmentReverbZone: "EnvironmentAudio/ReverbZone_Room",
                    skyboxCubemap: "gradientblue",
                    reflectionCubemap: "threelight_reflection",
                    reflectionIntensity: 0.8
                },
                lights: [
                    {
                        color: {
                            r: 1.5533334,
                            g: 1.40666676,
                            b: 1.77333343,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 60.0000038,
                            y: 0.0,
                            z: 25.9999962
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: true
                    },
                    {
                        color: {
                            r: 0.271215677,
                            g: 0.2667451,
                            b: 0.219058827,
                            a: 1.0
                        },
                        position: {
                            x: 0.0,
                            y: 0.0,
                            z: 0.0
                        },
                        rotation: {
                            x: 40.0000038,
                            y: 180.0,
                            z: 220.0
                        },
                        type: "Directional",
                        range: 5.0,
                        spotAngle: 30.0,
                        shadowsEnabled: false
                    }
                ],
                teleportBoundsHalfWidth: 100.0,
                controllerXRayHeight: -1000000000,
                widgetHome: {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0
                },
                skyboxColorA: {
                    r: 0.180392161,
                    g: 0.235294119,
                    b: 0.4117647,
                    a: 1.0
                },
                skyboxColorB: {
                    r: 0.356862754,
                    g: 0.392156869,
                    b: 0.6,
                    a: 1.0
                }
            }
        })[guid];
    }
    async loadGltf(url, loadEnvironment) {
        const sceneGltf = await this.gltfLoader.loadAsync(url);
        this.setupSketchMetaData(sceneGltf.scene);
        if (loadEnvironment) {
            const guid = this.sketchMetadata?.EnvironmentGuid;
            if (guid) {
                const envUrl = new URL(`${guid}/${guid}.glb`, this.environmentPath);
                const envGltf = await this.gltfLoader.loadAsync(envUrl.toString());
                sceneGltf.scene.add(envGltf.scene);
            }
        }
        this.loadedModel = sceneGltf.scene;
        this.initializeScene();
    }
    generateGradientSky(colorA, colorB, direction) {
        const canvas = document.createElement("canvas");
        canvas.width = 2;
        canvas.height = 512;
        const context = canvas.getContext("2d");
        if (context == null) return null;
        const gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, colorA.getStyle());
        gradient.addColorStop(1, colorB.getStyle());
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2, 512);
        const texture = new $6d7Yh$three.CanvasTexture(canvas);
        texture.wrapS = $6d7Yh$three.RepeatWrapping;
        texture.wrapT = $6d7Yh$three.ClampToEdgeWrapping;
        const material = new $6d7Yh$three.MeshBasicMaterial({
            map: texture,
            side: $6d7Yh$three.BackSide
        });
        const geometry = new $6d7Yh$three.SphereGeometry(500, 64, 64);
        const skybox = new $6d7Yh$three.Mesh(geometry, material);
        const defaultUp = new $6d7Yh$three.Vector3(0, 1, 0);
        const quaternion = new $6d7Yh$three.Quaternion().setFromUnitVectors(defaultUp, direction);
        skybox.applyQuaternion(quaternion);
        return skybox;
    }
    setupSketchMetaData(model) {
        let sketchMetaData = new $3f2b6f59492f6c9b$var$SketchMetadata(model.userData);
        let envPreset = new $3f2b6f59492f6c9b$var$EnvironmentPreset($3f2b6f59492f6c9b$export$2ec4afd9b3c16a85.lookupEnvironment(sketchMetaData.EnvironmentGuid));
        this.sketchBoundingBox = new $6d7Yh$three.Box3().setFromObject(model);
        this.sketchMetadata = sketchMetaData;
    }
    initSceneLights() {
        if (this.sketchMetadata == undefined || this.sketchMetadata == null) return;
        var lights = new $6d7Yh$three.Group();
        //     lights.add(new THREE.DirectionalLight(this.sketchMetadata., 1.0));
        this.loadedModel?.add(lights);
    }
    initSceneBackground() {
        if (this.sketchMetadata == undefined || this.sketchMetadata == null) return;
        if (this.sketchMetadata.UseGradient) {
            var sky = this.generateGradientSky(this.sketchMetadata.SkyColorA, this.sketchMetadata.SkyColorB, this.sketchMetadata.SkyGradientDirection);
            if (sky !== null) this.loadedModel?.add(sky);
        } else this.scene.background = this.sceneColor;
    }
}


//# sourceMappingURL=icosa-viewer.js.map
