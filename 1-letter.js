// HW7: WebGL Renderer
// Comp 630 W'16 - Computer Graphics
// Phillips Academy
// 2015-2-19
//
// By Jenny Huang

var canvas;
var gl;

//
//  Initialize our data for the letter J.
//

// First, initialize the vertices of the letter J.
var vertices = [
    vec3( 0.5, 1.0 ),
    vec3( 0.5, -0.5 ),
    vec3( -0.3, -0.5 ),
    vec3( -0.3, -1.0 ),
    vec3( 0.6, -1.0 ),
    vec3( 1.0, -0.6 ),
    vec3( 1.0, 1.0 )
];

// Next, initialize the indices for each triangle.
var indices = [ 0, 1, 6,
                6, 1, 5,
                1, 2, 3,
                1, 3, 4,
                1, 4, 5
];

// Register call back that's called once the window loads.
window.onload = function init()
{
    // Access the canvas.
    canvas = document.getElementById( "gl-canvas" );

    //  Initialize the WebGL context.
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //

    // Set the OpenGL viewport to the canvas dimensions.
    gl.viewport( 0, 0, canvas.width, canvas.height );

    // Specify the background clear color in R, G, B, A.
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers.
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );// TODO: Create vertices buffer.

    // Load the data into the GPU

    // Create buffers, or memory that temporarily stores data as it is being
    // moved from one place to another.
    var verticesBuffer = gl.createBuffer();
    var vertexIndexBuffer =  gl.createBuffer();

    // Bind buffer to specify destination for data to be sent to OpenGL
    // state machine.
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    // Create a new data store for the currently bound buffer.
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Associate shader attribute with buffer.

    // Get location of atribute.
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    // Specify the location and data format of the vertex array.
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    // Turns on vertex attribute for this position.
    gl.enableVertexAttribArray( vPosition );

    render();
};

function render()
{
    // Set background to color previously selected by clearing the buffer
    // enabled for color writing.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw triangles.
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
}
