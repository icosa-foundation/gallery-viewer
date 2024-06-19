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

import { MathUtils } from 'three'
import CameraControls from "camera-controls";
import * as holdEvent from 'hold-event';

export function setupNavigation(cameraControls : CameraControls): void {
    const KEYCODE = {
        W: 87,
        A: 65,
        S: 83,
        D: 68,
        Q: 81,
        E: 69,
        ARROW_LEFT : 37,
        ARROW_UP   : 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN : 40,
    };
    
    const wKey = new holdEvent.KeyboardKeyHold( KEYCODE.W, 1);
    const aKey = new holdEvent.KeyboardKeyHold( KEYCODE.A, 1);
    const sKey = new holdEvent.KeyboardKeyHold( KEYCODE.S, 1);
    const dKey = new holdEvent.KeyboardKeyHold( KEYCODE.D, 1);
    const qKey = new holdEvent.KeyboardKeyHold( KEYCODE.Q, 1);
    const eKey = new holdEvent.KeyboardKeyHold( KEYCODE.E, 1);
    aKey.addEventListener( 'holding', function( event ) { cameraControls.truck(- 0.01 * event?.deltaTime, 0, true ) } );
    dKey.addEventListener( 'holding', function( event ) { cameraControls.truck(  0.01 * event?.deltaTime, 0, true ) } );
    wKey.addEventListener( 'holding', function( event ) { cameraControls.forward(   0.01 * event?.deltaTime, true ) } );
    sKey.addEventListener( 'holding', function( event ) { cameraControls.forward( - 0.01 * event?.deltaTime, true ) } );
    qKey.addEventListener( 'holding', function( event ) { cameraControls.truck( 0,  0.01 * event?.deltaTime, true ) } );
    eKey.addEventListener( 'holding', function( event ) { cameraControls.truck( 0,- 0.01 * event?.deltaTime, true ) } );
    // Leaving this here because I hope I can use it later somehow.
    // cameraControls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
    
    const leftKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_LEFT,  1);
    const rightKey = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_RIGHT, 1);
    const upKey    = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_UP,    1);
    const downKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_DOWN,  1);
    leftKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate(   0.1 * MathUtils.DEG2RAD * event?.deltaTime, 0, true ) } );
    rightKey.addEventListener( 'holding', function( event ) { cameraControls.rotate( - 0.1 * MathUtils.DEG2RAD * event?.deltaTime, 0, true ) } );
    upKey.addEventListener   ( 'holding', function( event ) { cameraControls.rotate( 0, - 0.05 * MathUtils.DEG2RAD * event?.deltaTime, true ) } );
    downKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( 0,   0.05 * MathUtils.DEG2RAD * event?.deltaTime, true ) } );
}