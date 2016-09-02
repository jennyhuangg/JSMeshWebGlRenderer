// HW7: WebGL Renderer
// Comp 630 W'16 - Computer Graphics
// Phillips Academy
// 2015-2-19
//
// By Jenny Huang

var canvas;
var gl;

o = octahedron();
oct = faceToVertProperties(o.verts, o.tris, o.face_colors);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(oct.verts)), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var vertexIndexBuffer =  gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(oct.tris), gl.STATIC_DRAW);

    // Color buffer.
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(oct.vert_colors)), gl.STATIC_DRAW );

    // Color attribute.
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();
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

  // Then, intitialize the colors for each triangle, or face, of the octahedron.
  var face_colors = [
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
    face_colors: face_colors
  };
}

// Creates duplicate vertices to attach information to the vertices instead of
// faces. Takes as input the three arrays (verts, tris, and
// face colors) and return an object with new arrays: a vertex array with
// each vertex repeated for each face it is part of, a triangle array that
// uses indices in the new vertex array, and a new vert_colors array that
// has a color for each duplicate vertex.
function faceToVertProperties(vertices, indices, face_colors)
{
    var verts = [];
    var tris = [];
    var vert_colors = [];
    for ( var i = 0; i < indices.length; ++i) {
      verts.push(vertices[indices[i]]);
      tris.push(i);
    }
    for ( var i = 0; i < face_colors.length; ++i) {
      vert_colors.push(face_colors[i], face_colors[i],face_colors[i]);
    }
    return {
      verts: verts,
      tris: tris,
      vert_colors: vert_colors
    };
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, o.tris.length, gl.UNSIGNED_SHORT,0);
}
