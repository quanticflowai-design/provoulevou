/* Fundo animado do hero: shader WebGL2 adaptado do componente "AnimatedGradient" (preset Prism),
   em JavaScript puro e com as cores roxas da marca. Sem WebGL2, fica o degrade roxo do CSS. */
(function () {
  var canvas = document.getElementById('topoCanvas');
  if (!canvas) return;
  var gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: true });
  if (!gl) return;

  var P = {
    color1: '#120a24', color2: '#7c3aed', color3: '#e9ddff',
    rotation: -50, proportion: 1, scale: 0.25, speed: 22, distortion: 0,
    swirl: 50, swirlIterations: 16, softness: 47, offset: -299, shape: 0, shapeSize: 45
  };

  var VERT = '#version 300 es\nin vec4 a_position;\nvoid main(){ gl_Position = a_position; }';
  var FRAG = [
    '#version 300 es',
    'precision highp float;',
    'uniform float u_time; uniform float u_pixelRatio; uniform vec2 u_resolution;',
    'uniform float u_scale; uniform float u_rotation; uniform vec4 u_color1; uniform vec4 u_color2; uniform vec4 u_color3;',
    'uniform float u_proportion; uniform float u_softness; uniform float u_shape; uniform float u_shapeScale;',
    'uniform float u_distortion; uniform float u_swirl; uniform float u_swirlIterations;',
    'out vec4 fragColor;',
    '#define TWO_PI 6.28318530718',
    '#define PI 3.14159265358979323846',
    'vec2 rotate(vec2 uv, float th){ return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv; }',
    'float random(vec2 st){ return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }',
    'float noise(vec2 st){ vec2 i = floor(st); vec2 f = fract(st);',
    '  float a = random(i); float b = random(i + vec2(1.0, 0.0)); float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));',
    '  vec2 u = f * f * (3.0 - 2.0 * f); return mix(mix(a, b, u.x), mix(c, d, u.x), u.y); }',
    'vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur){',
    '  vec3 color1 = c1.rgb * c1.a; vec3 color2 = c2.rgb * c2.a; vec3 color3 = c3.rgb * c3.a;',
    '  float r1 = smoothstep(.0 + .35 * edgesWidth, .7 - .35 * edgesWidth + .5 * edge_blur, mixer);',
    '  float r2 = smoothstep(.3 + .35 * edgesWidth, 1. - .35 * edgesWidth + edge_blur, mixer);',
    '  vec3 b2 = mix(color1, color2, r1); float o2 = mix(c1.a, c2.a, r1);',
    '  return vec4(mix(b2, color3, r2), mix(o2, c3.a, r2)); }',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / u_resolution.xy; float t = .5 * u_time;',
    '  float noise_scale = .0005 + .006 * u_scale;',
    '  uv -= .5; uv *= (noise_scale * u_resolution); uv = rotate(uv, u_rotation * .5 * PI); uv /= u_pixelRatio; uv += .5;',
    '  float n1 = noise(uv * 1. + t); float n2 = noise(uv * 2. - t); float angle = n1 * TWO_PI;',
    '  uv.x += 4. * u_distortion * n2 * cos(angle); uv.y += 4. * u_distortion * n2 * sin(angle);',
    '  float it = ceil(clamp(u_swirlIterations, 1., 30.));',
    '  for (float i = 1.; i <= it; i++) { uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y); uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x); }',
    '  float proportion = clamp(u_proportion, 0., 1.); float shape = 0.; float mixer = 0.;',
    '  if (u_shape < .5) { vec2 s = uv * (.5 + 3.5 * u_shapeScale); shape = .5 + .5 * sin(s.x) * cos(s.y); mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5); }',
    '  else if (u_shape < 1.5) { vec2 s = uv * (.25 + 3. * u_shapeScale); float f = fract(s.y); shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f); mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5); }',
    '  else { float sh = 1. - uv.y; sh -= .5; sh /= (noise_scale * u_resolution.y); sh += .5; float ss = .2 * (1. - u_shapeScale); shape = smoothstep(.45 - ss, .55 + ss, sh + .3 * (proportion - .5)); mixer = shape; }',
    '  vec4 cm = blend_colors(u_color1, u_color2, u_color3, mixer, 1. - clamp(u_softness, 0., 1.), .01 + .01 * u_scale);',
    '  fragColor = vec4(cm.rgb, cm.a);',
    '}'
  ].join('\n');

  function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  var pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ['u_time', 'u_resolution', 'u_pixelRatio', 'u_scale', 'u_rotation', 'u_color1', 'u_color2', 'u_color3', 'u_proportion',
   'u_softness', 'u_shape', 'u_shapeScale', 'u_distortion', 'u_swirl', 'u_swirlIterations'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  function rgba(hex) { var c = hex.slice(1); return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255, 1]; }
  var c1 = rgba(P.color1), c2 = rgba(P.color2), c3 = rgba(P.color3);
  gl.uniform4f(U.u_color1, c1[0], c1[1], c1[2], c1[3]);
  gl.uniform4f(U.u_color2, c2[0], c2[1], c2[2], c2[3]);
  gl.uniform4f(U.u_color3, c3[0], c3[1], c3[2], c3[3]);
  gl.uniform1f(U.u_scale, P.scale);
  gl.uniform1f(U.u_rotation, P.rotation * Math.PI / 180);
  gl.uniform1f(U.u_proportion, P.proportion / 100);
  gl.uniform1f(U.u_softness, P.softness / 100);
  gl.uniform1f(U.u_shape, P.shape);
  gl.uniform1f(U.u_shapeScale, P.shapeSize / 100);
  gl.uniform1f(U.u_distortion, P.distortion / 50);
  gl.uniform1f(U.u_swirl, P.swirl / 100);
  gl.uniform1f(U.u_swirlIterations, P.swirl === 0 ? 0 : P.swirlIterations);

  // no celular a resolucao fica limitada a 1.5x para poupar bateria
  function ratio() { return Math.min(window.devicePixelRatio || 1, innerWidth <= 640 ? 1.5 : 2); }
  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight, r = ratio();
    canvas.width = Math.round(w * r); canvas.height = Math.round(h * r);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(U.u_pixelRatio, r);
  }
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

  var parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var inicio = performance.now(), visivel = true, id = 0;
  function frame(now) {
    var t = (now - inicio) / 1000;
    gl.uniform1f(U.u_time, t * (P.speed / 100) * 5 + P.offset * 0.01);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    canvas.classList.add('pronto');
    if (!parado && visivel) id = requestAnimationFrame(frame);
  }
  id = requestAnimationFrame(frame);
  // fora da tela, a animacao pausa
  if (window.IntersectionObserver && !parado) {
    new IntersectionObserver(function (e) {
      var v = e[0].isIntersecting;
      if (v && !visivel) { visivel = true; id = requestAnimationFrame(frame); }
      else if (!v) { visivel = false; cancelAnimationFrame(id); }
    }).observe(canvas);
  }
})();
