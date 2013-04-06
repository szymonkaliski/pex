define([
  'pex/geom/Vec2', 'pex/gl/Context',
  'pex/gl/Program', 'pex/materials/Material', 'pex/geom/Face3', 'pex/geom/Geometry', 'pex/gl/Mesh',
  'lib/text!pex/gl/ScreenImage.glsl'],
  function(Vec2, Context, Program, Material, Face3, Geometry, Mesh, ScreenImageGLSL) {
  function ScreenImage(image, x, y, w, h, screenWidth, screenHeight) {
    x = (x !== undefined) ? x : 0;
    y = (y !== undefined) ? y : 0;
    w = (w !== undefined) ? w : 1;
    h = (h !== undefined) ? h : 1;

    screenWidth = (screenWidth !== undefined) ? screenWidth : 1;
    screenHeight = (screenHeight !== undefined) ? screenHeight : 1;

    this.image = image;

    var program = new Program(ScreenImageGLSL);

    var uniforms = {
      screenSize : Vec2.fromValues(screenWidth, screenHeight),
      pixelPosition : Vec2.fromValues(x, y),
      pixelSize : Vec2.fromValues(w, h),
      alpha : 1.0
    };

    if (image) uniforms.image = image;

    var material = new Material(program, uniforms);

    var geometry = new Geometry({
      position : {
        type : 'Vec2',
        length : 4
      },
      texCoord : {
        type : 'Vec2',
        length : 4
      }
    });

    geometry.attribs.position.data.buf.set([
      -1,  1,
       1,  1,
       1, -1,
      -1, -1
    ]);

    geometry.attribs.texCoord.data.buf.set([
       0, 1,
       1, 1,
       1, 0,
       0, 0
    ]);

    // 0----1
    // | \  |
    // |  \ |
    // 3----2
    geometry.faces.push(new Face3(0, 2, 1));
    geometry.faces.push(new Face3(0, 3, 2));

    this.mesh = new Mesh(geometry, material);
  }

  ScreenImage.prototype.setAlpha = function(alpha) {
    this.mesh.material.uniforms.alpha = alpha;
  }

  ScreenImage.prototype.setPosition = function(position) {
  this.mesh.material.uniforms.pixelPosition = position;
  }

  ScreenImage.prototype.setSize = function(size) {
    this.mesh.material.uniforms.pixelSize = size;
  }

  ScreenImage.prototype.setWindowSize = function(size) {
    this.mesh.material.uniforms.windowSize = size;
  }

  ScreenImage.prototype.setBounds = function(bounds) {
    throw "Unimplemented";
  }

  ScreenImage.prototype.setImage = function(image) {
    this.image = image;
    this.mesh.material.uniforms.image = image;
  }

  ScreenImage.prototype.draw = function(image, program) {
    var oldImage = this.mesh.material.uniforms.image;
    if (image) {
      oldImage = this.mesh.material.uniforms.image;
      this.mesh.material.uniforms.image = image;
    }

    var oldProgram = null;
    if (program) {
      oldProgram = this.mesh.getProgram();
      this.mesh.setProgram(program);
    }
    this.mesh.draw();

    if (oldProgram) {
      this.mesh.setProgram(oldProgram);
    }
    if (oldImage) {
      this.mesh.material.uniforms.image = oldImage;
    }
  }

  return ScreenImage;
});