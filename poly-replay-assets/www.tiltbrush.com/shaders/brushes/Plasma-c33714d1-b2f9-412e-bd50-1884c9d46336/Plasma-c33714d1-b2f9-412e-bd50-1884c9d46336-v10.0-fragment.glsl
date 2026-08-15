// Copyright 2018 Google Inc.
precision mediump float;
uniform sampler2D u_MainTex;
uniform vec4 u_time;
varying vec4 v_color;
varying vec2 v_texcoord0;
void main() {
vec3 A = vec3(0.55, 0.3, 0.7 );
vec3 aRate = vec3(1.2 , 1.0, 1.33);
vec3 M = vec3(1.0 , 2.2, 1.5);
vec3 bRate = vec3(1.5 , 3.0, 2.25) + M * aRate;
vec3 LINE_POS = vec3(0.5,0.5,0.5);
vec3 LINE_WIDTH = vec3(.012,.012,.012);
vec3 us, vs;
{
us = A * v_texcoord0.x - aRate * u_time.y;
vec3 tmp = M*A * v_texcoord0.x - bRate * u_time.y;
tmp = abs(fract(tmp) - 0.5);
vs = v_texcoord0.y + .4 * v_color.a * vec3(1.,-1.,1.) * tmp;
vs = clamp(mix((vs - .5) * 4., vs, sin( (3.14159/2.) * v_color.a)),0.,1.);
}
vec4 tex = texture2D(u_MainTex, vec2( abs(us[0]), vs[0]));
tex += texture2D(u_MainTex, vec2(us[1], vs[1]));
tex += texture2D(u_MainTex, vec2(us[2], vs[2]));
vec3 procline = vec3(1.,1.,1.) - clamp(pow((vs - LINE_POS)/LINE_WIDTH, vec3(2.,2,.2)),0.,1.);
tex += dot(procline, vec3(1,1,1)) * .5;
tex.rgb *= .8 * (1. + 30. * pow((vec3(1.,1,.1) - vec3(v_color.a,v_color.a,v_color.a)), vec3(5.,5.,5.)));
tex *= v_color;
gl_FragColor = vec4(tex.rgb * tex.a, 1.0);
}
