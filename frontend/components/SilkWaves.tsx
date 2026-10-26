"use client";

import { useEffect, useRef } from "react";

interface SilkWavesProps {
  speed?: number;
  scale?: number;
  distortion?: number;
  curve?: number;
  contrast?: number;
  colors?: string[];
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
  brightness?: number;
  opacity?: number;
  complexity?: number;
  frequency?: number;
  className?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

const DEFAULT_COLORS = [
  "#0033ff", "#5500ff", "#0000dd", "#3300cc",
  "#0011ff", "#6600ee", "#0055ff", "#220066",
];

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Strategy: parametric ribbon defined by a smooth Bezier-like curve, 
// distance from pixel to the curve determines glow. Black everywhere else.
const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_speed;
uniform float u_scale;
uniform float u_distortion;
uniform float u_curve;
uniform float u_contrast;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_brightness;
uniform float u_opacity;
uniform float u_complexity;
uniform float u_frequency;
uniform vec3  u_c0;
uniform vec3  u_c1;
uniform vec3  u_c2;

#define PI 3.14159265358979

mat2 rot2(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

// Evaluates a smooth organic path at parameter s in [0,1]
// driven by time-animated sinusoids — gives natural S-curves
vec2 path(float s, float seed, float t) {
  float ts = t * u_speed;
  float x = sin(s * PI * u_frequency + ts * 0.7 + seed)
           + sin(s * PI * u_frequency * 1.7 + ts * 0.4 + seed * 1.3) * 0.4 * u_distortion;
  float y = cos(s * PI * u_frequency * 0.9 + ts * 0.5 + seed * 0.7)
           + cos(s * PI * u_frequency * 2.1 + ts * 0.3 + seed * 1.7) * 0.3 * u_distortion;
  // apply curve warp
  x += sin(y * u_curve + ts * 0.2 + seed) * 0.25;
  y += cos(x * u_curve * 0.8 + ts * 0.15 + seed) * 0.25;
  return vec2(x, y);
}

// Minimum distance from point p to the parametric ribbon
// Samples the path at N points and returns the closest distance
float ribbonDist(vec2 p, float seed, float t) {
  float minDist = 1e9;
  int steps = 48; // sample density
  vec2 prev = path(0.0, seed, t);
  for (int i = 1; i <= 48; i++) {
    float s = float(i) / 48.0;
    vec2 curr = path(s, seed, t);
    // closest point on segment prev->curr
    vec2 ab = curr - prev;
    float len2 = dot(ab, ab);
    float tt2 = len2 > 0.0 ? clamp(dot(p - prev, ab) / len2, 0.0, 1.0) : 0.0;
    vec2 closest = prev + tt2 * ab;
    minDist = min(minDist, length(p - closest));
    prev = curr;
  }
  return minDist;
}

void main() {
  // Map fragment to [-aspect, aspect] x [-1, 1]
  vec2 uv = (gl_FragCoord.xy / u_res) * 2.0 - 1.0;
  uv.x *= u_res.x / u_res.y;

  float ang = u_rotation * PI / 180.0;
  uv = rot2(ang) * uv;
  uv = uv / u_scale + vec2(u_offsetX, u_offsetY);

  float t = u_time;

  // Ribbon widths: core glow + soft outer halo
  // contrast controls tightness: higher = thinner ribbons
  float coreW = 0.012 / u_contrast;
  float glowW = 0.12  / u_contrast;

  vec3 col = vec3(0.0);

  // Three independently-seeded ribbons
  float seeds[3];
  seeds[0] = 0.0;
  seeds[1] = 2.618;
  seeds[2] = 5.236;

  vec3 rcolors[3];
  rcolors[0] = u_c0;
  rcolors[1] = u_c1;
  rcolors[2] = u_c2;

  for (int r = 0; r < 3; r++) {
    float d = ribbonDist(uv, seeds[r], t);

    // Sharp bright core
    float core = smoothstep(coreW, 0.0, d);
    // Soft wide glow (much dimmer)
    float glow = smoothstep(glowW, 0.0, d) * 0.35;

    vec3 rc = rcolors[r];
    col += rc * (core + glow) * u_brightness;
  }

  // Strictly clamp — black stays black, no ambient leakage
  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col, u_opacity);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function SilkWaves({
  speed = 1,
  scale = 2,
  distortion = 1,
  curve = 1,
  contrast = 1,
  colors = DEFAULT_COLORS,
  rotation = 0,
  offsetX = 0,
  offsetY = 0,
  brightness = 1,
  opacity = 1,
  complexity = 1,
  frequency = 1,
  className = "",
}: SilkWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({
    speed, scale, distortion, curve, contrast, colors,
    rotation, offsetX, offsetY, brightness, opacity, complexity, frequency,
  });
  propsRef.current = {
    speed, scale, distortion, curve, contrast, colors,
    rotation, offsetX, offsetY, brightness, opacity, complexity, frequency,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes=U("u_res"), uTime=U("u_time"), uSpeed=U("u_speed"), uScale=U("u_scale"),
          uDist=U("u_distortion"), uCurve=U("u_curve"), uContrast=U("u_contrast"),
          uRot=U("u_rotation"), uOX=U("u_offsetX"), uOY=U("u_offsetY"),
          uBright=U("u_brightness"), uOpacity=U("u_opacity"),
          uComplex=U("u_complexity"), uFreq=U("u_frequency"),
          uC0=U("u_c0"), uC1=U("u_c1"), uC2=U("u_c2");

    let frame = 0;
    const start = performance.now();

    const resize = () => {
      // Render at half res for performance (ribbons are smooth, no detail lost)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      resize();

      const p = propsRef.current;
      const t = (now - start) / 1000;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uSpeed, p.speed);
      gl.uniform1f(uScale, p.scale);
      gl.uniform1f(uDist, p.distortion);
      gl.uniform1f(uCurve, p.curve);
      gl.uniform1f(uContrast, p.contrast);
      gl.uniform1f(uRot, p.rotation);
      gl.uniform1f(uOX, p.offsetX);
      gl.uniform1f(uOY, p.offsetY);
      gl.uniform1f(uBright, p.brightness);
      gl.uniform1f(uOpacity, p.opacity);
      gl.uniform1f(uComplex, p.complexity);
      gl.uniform1f(uFreq, p.frequency);

      const pal = (p.colors.length >= 8 ? p.colors.slice(0, 8) : [
        ...p.colors, ...DEFAULT_COLORS.slice(p.colors.length),
      ]);
      const c = (i: number) => hexToRgb(pal[i]);
      gl.uniform3fv(uC0, c(0));
      gl.uniform3fv(uC1, c(2));
      gl.uniform3fv(uC2, c(4));

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
