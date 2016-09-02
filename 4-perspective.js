// HW7: WebGL Renderer
// Comp 630 W'16 - Computer Graphics
// Phillips Academy
// 2015-2-19
//
// By Jenny Huang

var canvas;
var gl;

// Base color for the shape before shading.
var baseColor = vec4( 0.7, 0.7, 0.95, 1.0);

// First instance transform:
// Rotate by roll, pitch, yaw angles(0.2, -0.3, 0.3).
var xform1 = mat4(
  0.95364359, -0.18979606,  0.23354091,  0.        ,
  0.1042047 ,  0.93629336,  0.33540441,  0.        ,
  -0.28232124, -0.29552021,  0.91266781,  0.        ,
  0.        ,  0.        ,  0.        ,  1.
);

// Second instance transform:
// Rotate by roll, pitch, yaw angles(-0.2, 0.3, -0.3).
// Translate by ()-0.5, 0.1, 0.2, 1).
//
var xform2 = mat4(
  0.91894314,  0.18979606, -0.34571805, -0.5       ,
  -0.27538742,  0.93629336, -0.21798281,  0.1      ,
  0.28232124,  0.29552021,  0.91266781,  0.2       ,
  0.        ,  0.        ,  0.        ,  1.
);

// Octahedron data.
var o = octahedron();
var oct = faceToVertProperties(o.verts, o.tris, o.norms);

// Set up camera.
// up vector: [0,1,0]
// aspect: 1
// fovy: 45
// near: 0.01
// far: 100

var eye = vec3(0,0,3);
var at = vec3(0,0,0);
// Look vector.
var vLook = normalize(subtract(vec4(eye,0), vec4(at,0)));

// World to canonical view transform. Generated by Camera.py
var worldToCanonicalViewXform = mat4(
  2.41421356,  0.        ,  0.        ,  0.        ,
  0.        ,  2.41421356,  0.        ,  0.        ,
  0.        ,  0.        ,  1.00020002, -2.98059806,
  0.        ,  0.        , -1.        ,  3.
);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.9, 1, 1 );
    gl.clearDepth(-1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.GEQUAL);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(oct.verts), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var vertexIndexBuffer =  gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(oct.tris)), gl.STATIC_DRAW);

    // Normal vectors buffer.
    var normsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(oct.norms), gl.STATIC_DRAW);

    // Normal vector attribute.
    var vNorm = gl.getAttribLocation( program, "vNorm" );
    gl.vertexAttribPointer( vNorm, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNorm );

    // Render.
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Instance transform.
    var xformLoc = gl.getUniformLocation(program, "xform");
    // World to canonical view transform.
    var cXformLoc = gl.getUniformLocation(program, "cXform");
    // Look vector.
    var vLookLoc = gl.getUniformLocation(program, "vLook");
    // Base color.
    var baseColorLoc = gl.getUniformLocation(program, "baseColor");

    // Draw shape 1.
    gl.uniformMatrix4fv(xformLoc, gl.FALSE, flatten(xform1));
    gl.uniformMatrix4fv(cXformLoc, gl.FALSE, flatten(worldToCanonicalViewXform));
    gl.uniform4fv(vLookLoc, flatten(vLook));
    gl.uniform4fv(baseColorLoc, flatten(baseColor));

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(oct.verts), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, oct.verts.length, gl.UNSIGNED_SHORT,0);

    // Draw shape 2.
    gl.uniformMatrix4fv(xformLoc, gl.FALSE, flatten(xform2));

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(oct.verts), gl.STATIC_DRAW);
    gl.drawElements(gl.TRIANGLES, oct.verts.length, gl.UNSIGNED_SHORT,0);
}

// Produces three arrays with no redundant information: one for your
// vertex positions, one for your triangle indices, and one for the face colors
// (one color per triangle). There should be six vertices, eight faces, and eight colors.
function octahedron()
{
  // First, initialize the vertices of the octahedron.
  var vertices = [
      vec4(    0,    0,  0.5, 1.0 ), // top
      vec4(    0,  0.5,    0, 1.0 ), // middle top
      vec4( -0.5,    0,    0, 1.0 ), // middle left
      vec4(    0, -0.5,    0, 1.0 ), // middle bottom
      vec4(  0.5,    0,    0, 1.0 ), // middle right
      vec4(    0,    0, -0.5, 1.0 )  // bottom
  ];

  // Next, initialize the indices for each triangle in the triangle mesh.
  var indices = [ 0, 1, 2,
                  0, 2, 3,
                  0, 3, 4,
                  0, 4, 1,
                  5, 4, 3,
                  5, 3, 2,
                  5, 2, 1,
                  5, 1, 4
  ];
  // Initiaize the normal vectors for each tiangle.
  var norms = []
  for ( var i = 0; i < indices.length; i +=3) {
    var vec1 = subtract(vertices[indices[i+1]],vertices[indices[i]]);
    var vec2 = subtract(vertices[indices[i+2]],vertices[indices[i]]);
    norm = normalize(vec4(cross(vec1, vec2), 0));
    norms.push(norm);
  }

  return {
    verts: vertices,
    tris: indices,
    norms: norms
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
// and returns a transformed vertex array (a new array of 24 vec4s)
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
