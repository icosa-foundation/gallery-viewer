// Copyright 2018 Google Inc.
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute vec2 a_texcoord0;
attribute vec3 a_texcoord1;
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_texcoord0;
varying vec3 v_light_dir_0;
varying vec3 v_light_dir_1;
varying float f_fog_coord;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 u_SceneLight_0_matrix;
uniform mat4 u_SceneLight_1_matrix;
void main() {
float envelope = sin(a_texcoord0.x * 3.14159);
float widthMultiplier = 1.0 - envelope;
vec4 pos = a_position - vec4(a_texcoord1.xyz * widthMultiplier, 0.0);
gl_Position = projectionMatrix * modelViewMatrix * pos;
f_fog_coord = gl_Position.z;
v_normal = normalMatrix * a_normal;
v_position = (modelViewMatrix * a_position).xyz;
v_light_dir_0 = mat3(u_SceneLight_0_matrix) * vec3(0, 0, 1);
v_light_dir_1 = mat3(u_SceneLight_1_matrix) * vec3(0, 0, 1);
v_color = a_color;
v_texcoord0 = a_texcoord0.xy;
}
