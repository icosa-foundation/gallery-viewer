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

    let baseTranslationSpeed = 0.0001;
    let rotSpeed = 1;
    let holdInterval = 0.1;
    let maxSpeedMultiplier = 50;
    let accelerationTime = 1500;

    const getSpeedMultiplier = (elapsedTime: number): number => {
        const t = Math.min(elapsedTime / accelerationTime, 1);
        return 1 + (maxSpeedMultiplier - 1) * t;
    };

    const wKey = new holdEvent.KeyboardKeyHold( KEYCODE.W, holdInterval);
    const aKey = new holdEvent.KeyboardKeyHold( KEYCODE.A, holdInterval);
    const sKey = new holdEvent.KeyboardKeyHold( KEYCODE.S, holdInterval);
    const dKey = new holdEvent.KeyboardKeyHold( KEYCODE.D, holdInterval);
    const qKey = new holdEvent.KeyboardKeyHold( KEYCODE.Q, holdInterval);
    const eKey = new holdEvent.KeyboardKeyHold( KEYCODE.E, holdInterval);

    aKey.addEventListener( 'holding', function( event ) {
        const speed = baseTranslationSpeed * getSpeedMultiplier(event?.elapsedTime) * event?.deltaTime;
        cameraControls.truck(-speed, 0, true );
    } );
    dKey.addEventListener( 'holding', function( event ) {
        const speed = baseTranslationSpeed * getSpeedMultiplier(event?.elapsedTime) * event?.deltaTime;
        cameraControls.truck(speed, 0, true );
    } );
    wKey.addEventListener( 'holding', function( event ) {
        const speed = baseTranslationSpeed * getSpeedMultiplier(event?.elapsedTime) * event?.deltaTime;
        cameraControls.forward(speed, true );
    } );
    sKey.addEventListener( 'holding', function( event ) {
        const speed = baseTranslationSpeed * getSpeedMultiplier(event?.elapsedTime) * event?.deltaTime;
        cameraControls.forward(-speed, true );
    } );
    qKey.addEventListener( 'holding', function( event ) {
        const speed = baseTranslationSpeed * getSpeedMultiplier(event?.elapsedTime) * event?.deltaTime;
        cameraControls.truck(0, speed, true );
    } );
    eKey.addEventListener( 'holding', function( event ) {
        const speed = baseTranslationSpeed * getSpeedMultiplier(event?.elapsedTime) * event?.deltaTime;
        cameraControls.truck(0, -speed, true );
    } );


    const leftKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_LEFT,  holdInterval);
    const rightKey = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_RIGHT, holdInterval);
    const upKey    = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_UP,    holdInterval);
    const downKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_DOWN,  holdInterval);

    leftKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate(rotSpeed * MathUtils.DEG2RAD * event?.deltaTime, 0, true ) } );
    rightKey.addEventListener( 'holding', function( event ) { cameraControls.rotate(-rotSpeed * MathUtils.DEG2RAD * event?.deltaTime, 0, true ) } );
    upKey.addEventListener   ( 'holding', function( event ) { cameraControls.rotate(0, -rotSpeed * MathUtils.DEG2RAD * event?.deltaTime, true ) } );
    downKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate(0, rotSpeed * MathUtils.DEG2RAD * event?.deltaTime, true ) } );
}