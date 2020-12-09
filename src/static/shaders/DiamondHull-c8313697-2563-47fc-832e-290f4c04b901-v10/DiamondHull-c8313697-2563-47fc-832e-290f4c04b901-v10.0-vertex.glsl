// Copyright 2018 Google Inc.
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute vec2 a_texcoord0;
varying vec4 v_color;
varying vec3 v_worldNormal;
varying vec3 v_normal;
varying vec3 v_position;
varying vec3 v_worldPosition;
varying vec2 v_texcoord0;
varying vec3 v_light_dir_0;
varying vec3 v_light_dir_1;
varying float f_fog_coord;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 u_SceneLight_0_matrix;
uniform mat4 u_SceneLight_1_matrix;
void main() {
gl_Position = projectionMatrix * modelViewMatrix * a_position;
f_fog_coord = gl_Position.z;
v_normal = normalMatrix * a_normal;
v_worldNormal = (modelMatrix * vec4(a_normal, 1)).xyz;
v_position = (modelViewMatrix * a_position).xyz;
v_worldPosition = (modelMatrix * a_position).xyz;
v_light_dir_0 = mat3(u_SceneLight_0_matrix) * vec3(0, 0, 1);
v_light_dir_1 = mat3(u_SceneLight_1_matrix) * vec3(0, 0, 1);
v_color = a_color;
v_texcoord0 = a_texcoord0;
}
