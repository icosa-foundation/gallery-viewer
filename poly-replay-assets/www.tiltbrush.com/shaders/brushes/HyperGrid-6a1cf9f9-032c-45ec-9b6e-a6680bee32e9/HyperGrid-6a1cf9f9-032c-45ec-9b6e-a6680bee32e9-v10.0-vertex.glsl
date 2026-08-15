// Copyright 2018 Google Inc.
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;
attribute vec2 a_texcoord0;
attribute vec4 a_texcoord1;
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
varying vec2 v_texcoord0;
varying vec3 v_light_dir_0;
varying vec3 v_light_dir_1;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform mat4 u_SceneLight_0_matrix;
uniform mat4 u_SceneLight_1_matrix;
uniform vec4 u_time;
void main() {
vec4 _Time = u_time;
vec4 worldPos = modelMatrix * a_position;
float size = length(a_texcoord1.xyz);
float q = (1. / size) * .5;
worldPos.xyz = ceil(worldPos.xyz * q) / q;
gl_Position = projectionMatrix * viewMatrix * worldPos;
v_normal = normalMatrix * a_normal;
v_position = gl_Position.xyz;
v_light_dir_0 = u_SceneLight_0_matrix[2].xyz;
v_light_dir_1 = u_SceneLight_1_matrix[2].xyz;
v_color = 2. * a_color;
v_texcoord0 = a_texcoord0;
}
