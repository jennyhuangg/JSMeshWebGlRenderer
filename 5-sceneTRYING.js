// HW7: WebGL Renderer
// Comp 630 W'16 - Computer Graphics
// Phillips Academy
// 2015-2-19
//
// By Jenny Huang

var canvas;
var gl;

var c1BaseColor = vec4( 1, 0.7, 0.4, 1.0 );
var c2BaseColor = vec4( 0.6, 0.85, 0.4, 1.0 );
var c3BaseColor = vec4( 0.35, 0.6, 0.8, 1.0 );
var c4BaseColor = vec4( 0.7, 0.5, 0.7, 1.0 );
var c5BaseColor = vec4( 0,0,0,0 );


// Composite transforms for each object in the scene. Generated by
// robot_scene.py

var t1 = mat4(
  7.5,  0.0,   0.0,   0.0,
  0.0,   7.5,  0.0,   0.0,
  0.0,   0.0,   0.5, -0.5,
  0.0,   0.0,   0.0,   1.0
);

var t2 = mat4(
  1.55508783e-01,   9.73012095e-01,   7.59520689e-02,   3.38715217e+00,
    -5.65181173e-03,   1.05104674e-01,  -7.45824459e-01,  -1.55196320e+00,
    -7.33679137e-01,   2.05427533e-01,   2.18439812e-02,   5.72140920e+00
);

var t3 = mat4(
  0.05625509,  2.28862952, -0.2965318,   0.12551056,
    0.5233811,  -0.82853394, -0.4762248,  -0.82853394,
   -0.53423552, -0.57070697, -0.49777387,  6.08668864,
    0.,          0.,          0.,          1.
);

var t4 = mat4(
  6.58996237e-01,  -1.08155948e+00,  -2.72965179e-01,  -1.08155948e+00,
  -2.87012574e-01,   2.03823956e-16,  -6.92909649e-01,   2.03823956e-16,
  2.14120857e-01,   3.32869781e+00,  -8.86917630e-02,   3.32869781e+00,
  0.00000000e+00,   0.00000000e+00,   0.00000000e+00,   1.00000000e+00
);

var t5 = mat4(
  2.5,  0.0,   0.0,   8.0,
  0.0,   2.5,  0.0,   13.0,
  0.0,   0.0,   2.5,  3.5,
  0.0,   0.0,   0.0,   2.0
);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var c = cube();

    // Attach information to verts instead of faces.
    var cu = faceToVertProperties(c.verts, c.tris, c.norms, c.face_colors);

    var e = ell();
    var el = faceToVertProperties(e.verts, e.tris, e.norms, e.face_colors);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.9, 1, 1 );
    gl.clearDepth(-1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.GEQUAL);
    console.log()

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cu.verts), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var vertexIndexBuffer =  gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(cu.tris)), gl.STATIC_DRAW);

    var normsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cu.norms), gl.STATIC_DRAW);

    var vNorm = gl.getAttribLocation( program, "vNorm" );
    gl.vertexAttribPointer( vNorm, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNorm );

    // Multiple colors for the L-shape.
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    console.log(cu.vert_colors);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cu.vert_colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // Render.
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up camera.
    // up vector: [0,0,1]
    // aspect: 1
    // fovy: 45
    // near: 0.01
    // far: 100

    var eye = vec3(20, 20, 10);
    var at = vec3(0,0,0);
    var vLook = normalize(subtract( vec4(eye,0), vec4(at,0)));

    var worldToCanonicalViewXform = mat4(
      -1.70710678,   1.70710678,   0.        ,   0.        ,
       -0.56903559,  -0.56903559,   2.27614237,   0.        ,
        0.66680001,   0.66680001,   0.33340001, -29.9859986 ,
       -0.66666667,  -0.66666667,  -0.33333333,  30.
    );

    var cXformLoc = gl.getUniformLocation(program, "cXform");
    gl.uniformMatrix4fv(cXformLoc, gl.FALSE, flatten(worldToCanonicalViewXform));
    var vLookLoc = gl.getUniformLocation(program, "vLook");
    gl.uniform4fv(vLookLoc, flatten(vLook));

    var xformLoc = gl.getUniformLocation(program, "xform");
    gl.uniformMatrix4fv(xformLoc, gl.FALSE, flatten(t1));

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cu.verts), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, cu.verts.length, gl.UNSIGNED_SHORT,0);

    gl.uniformMatrix4fv(xformLoc, gl.FALSE, flatten(t2));
    gl.uniform4fv(baseColorLoc, flatten(c2BaseColor));

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cu.verts), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, cu.verts.length, gl.UNSIGNED_SHORT,0);

    gl.uniformMatrix4fv(xformLoc, gl.FALSE, flatten(t3));
    gl.uniform4fv(baseColorLoc, flatten(c3BaseColor));

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cu.verts), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, cu.verts.length, gl.UNSIGNED_SHORT,0);

    gl.uniformMatrix4fv(xformLoc, gl.FALSE, flatten(t4));
    gl.uniform4fv(baseColorLoc, flatten(c4BaseColor));

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cu.verts), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, cu.verts.length, gl.UNSIGNED_SHORT,0);

    gl.uniformMatrix4fv(xformLoc, gl.FALSE, flatten(t5));
    gl.uniform4fv(baseColorLoc, flatten(c5BaseColor));

    // MAKE DIFF COLORS

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(el.verts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(el.tris)), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, normsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(el.norms), gl.STATIC_DRAW);
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(el.vert_colors), gl.STATIC_DRAW );
    gl.drawElements(gl.TRIANGLES, el.verts.length, gl.UNSIGNED_SHORT,0);
}

function cube()
{
  // First, initialize the vertices of the octahedron.
  var vertices = [
      vec4(    1,    1,    1, 1.0 ),
      vec4(   -1,    1,    1, 1.0 ),
      vec4(   -1,   -1,    1, 1.0 ),
      vec4(    1,   -1,    1, 1.0 ),
      vec4(    1,    1,   -1, 1.0 ),
      vec4(   -1,    1,   -1, 1.0 ),
      vec4(   -1,   -1,   -1, 1.0 ),
      vec4(    1,   -1,   -1, 1.0 )
  ];

  // Next, initialize the indices for each triangle in the triangle mesh.
  var indices = [0, 1, 2,
                 0, 2, 3,
                 1, 0, 4,
                 2, 1, 5,
                 3, 2, 6,
                 0, 3, 7,
                 4, 5, 1,
                 5, 6, 2,
                 6, 7, 3,
                 7, 4, 0,
                 4, 6, 5,
                 4, 7, 6
  ];

  var norms = []
  for ( var i = 0; i < indices.length; i +=3) {
    var vec1 = subtract(vertices[indices[i+1]],vertices[indices[i]]);
    var vec2 = subtract(vertices[indices[i+2]],vertices[indices[i]]);
    norm = normalize(vec4(cross(vec1, vec2), 0));
    norms.push(norm);
  }

  var faceColors = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ];

  return {
    verts: vertices,
    tris: indices,
    norms: norms,
    face_colors: faceColors
  };
}

function ell()
{
  // First, initialize the vertices of the ell.
  var vertices = [
      vec4(    0,    0,    0.5, 1.0 ),
      vec4(   0,    1,    0.5, 1.0 ),
      vec4(   -1,   1,    0.5, 1.0 ),
      vec4(    -1,   -1,    0.5, 1.0 ),
      vec4(    1,    -1,   0.5, 1.0 ),
      vec4(   1,    0,   0.5, 1.0 ),
      vec4(   0,   0,   -0.5, 1.0 ),
      vec4(    0,   1,   -0.5, 1.0 ),
      vec4(    -1,   1,   -0.5, 1.0 ),
      vec4(    -1,   -1,   -0.5, 1.0 ),
      vec4(    1,   -1,   -0.5, 1.0 ),
      vec4(    1,   0,   -0.5, 1.0 ),
  ];

  // Next, initialize the indices for each triangle in the triangle mesh.
  var indices = [ 0,  1,  2,
                  0,  2,  3,
                  0,  3,  4,
                  0,  4,  5,
                  1,  0,  6,
                  2,  1,  7,
                  3,  2,  8,
                  4,  3,  9,
                  5,  4, 10,
                  0,  5, 11,
                  6,  7,  1,
                  7,  8,  2,
                  8,  9,  3,
                  9, 10,  4,
                 10, 11,  5,
                 11,  6,  0,
                  6,  8,  7,
                  6,  9,  8,
                  6, 10,  9,
                  6, 11, 10
  ];

  var norms = []
  for ( var i = 0; i < indices.length; i +=3) {
    var vec1 = subtract(vertices[indices[i+1]],vertices[indices[i]]);
    var vec2 = subtract(vertices[indices[i+2]],vertices[indices[i]]);
    norm = normalize(vec4(cross(vec1, vec2), 0));
    norms.push(norm);
  }

  // Then, intitialize the colors for each triangle, or face, of the octahedron.
  var faceColors = [
      [ 1, 0.7, 0.4, 1.0 ],  // orange
      [ 0.9, 0.3, 0.3, 1.0 ],  // red
      [ 1, 0.95, 0.35, 1.0 ],  // yellow
      [ 0.6, 0.85, 0.4, 1.0],  // green
      [ 0.35, 0.6, 0.8, 1.0 ],  // blue
      [ 0.7, 0.5, 0.7, 1.0 ],  // magenta
      [ 0.3, 0.8, 0.8, 1.0 ],  // cyan
      [ 1, 0.7, 0.85, 1.0 ]   // pink
  ];

  return {
    verts: vertices,
    tris: indices,
    norms: norms,
    face_colors: faceColors
  };
}

// Creates duplicate vertices to attach information to the vertices instead of
// faces. Takes as input the three arrays (verts, tris, and
// face colors) and return an object with new arrays: a vertex array with
// each vertex repeated for each face it is part of, a triangle array that
// uses indices in the new vertex array, and a new vert_colors array that
// has a color for each duplicate vertex.
// function faceToVertProperties(vertices, indices, norms1)
// {
//     var vNew = [];
//     var iNew = [];
//     var vert_colors = [];
//     var norms = [];
//     for ( var i = 0; i < indices.length; ++i) {
//       vNew.push(vertices[indices[i]]);
//       iNew.push(i);
//     }
//     for ( var i = 0; i < norms1.length; ++i) {
//       norms.push(norms1[i], norms1[i], norms1[i]);
//     }
//
//     return {
//       verts: vNew,
//       tris: iNew,
//       norms: norms
//     };
// }

function faceToVertProperties(vertices, indices, norms1, faceColors)
{
    var vNew = [];
    var iNew = [];
    var vert_colors = [];
    var norms = [];
    for ( var i = 0; i < indices.length; ++i) {
      vNew.push(vertices[indices[i]]);
      iNew.push(i);
    }
    for ( var i = 0; i < norms1.length; ++i) {
      norms.push(norms1[i], norms1[i], norms1[i]);
    }
    for ( var i = 0; i < faceColors.length; ++i) {
      vert_colors.push(faceColors[i], faceColors[i],faceColors[i]);
    }

    return {
      verts: vNew,
      tris: iNew,
      norms: norms,
      vert_colors: vert_colors
    };
}


// Creates duplicate vertices to attach information to the vertices instead of
// faces. Takes as input the three arrays (verts, tris, and
// face colors) and return an object with new arrays: a vertex array with
// each vertex repeated for each face it is part of, a triangle array that
// uses indices in the new vertex array, and a new vert_colors array that
// has a color for each duplicate vertex.
function faceToVertProperties(vertices, indices, norms1)
{
    var vNew = [];
    var iNew = [];
    var vert_colors = [];
    var norms = [];
    for ( var i = 0; i < indices.length; ++i) {
      vNew.push(vertices[indices[i]]);
      iNew.push(i);
    }
    for ( var i = 0; i < norms1.length; ++i) {
      norms.push(norms1[i], norms1[i], norms1[i]);
    }

    return {
      verts: vNew,
      tris: iNew,
      norms: norms
    };
}

// Takes a transform matrix (a mat4) and a vertex array (an array of vec4s),
// and returns a transformed vertex array (a new array of new vec4s)
// returns a 24x4
function applyXform(xform, v)
{
    var result = [];
    for ( var i = 0; i < v.length; ++i ) { //row o f whole thing
        result.push( [] );

        for ( var j = 0; j < xform.length; ++j ) { //row of abcd
            var sum = 0.0;
            for ( var k = 0; k < xform.length; ++k ) { //col of v
                sum += xform[j][k] * v[i][k];
            }
            result[i].push( sum );
        }
    }
    return result;
}
