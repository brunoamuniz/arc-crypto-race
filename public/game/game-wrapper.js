/**
 * Game Wrapper - Complete racing game implementation
 * Extracted and adapted from game.html to work with React
 */

(function() {
  'use strict';

  // Game state that will be exposed to React
  window.gameState = {
    position: 0,
    speed: 0,
    maxSpeed: 0,
    crashes: 0,
    totalGameTime: 0,
    playerX: 0,
    trackLength: 0,
    segmentLength: 200,
    isInitialized: false,
    isRunning: false,
  };

  // Game instance API
  window.gameInstance = {
    canvas: null,
    ctx: null,
    gameLoop: null,
    stats: null,
    frameId: null,
    
    // Game variables (scoped to instance)
    fps: 60,
    step: 1/60,
    width: 1024,
    height: 768,
    segments: [],
    cars: [],
    position: 0,
    speed: 0,
    maxSpeed: 0,
    totalGameTime: 0,
    playerX: 0,
    trackLength: null,
    segmentLength: 200,
    playerZ: null,
    cameraHeight: 1000,
    cameraDepth: null,
    fieldOfView: 100,
    roadWidth: 2000,
    lanes: 3,
    drawDistance: 300,
    fogDensity: 5,
    resolution: null,
    background: null,
    sprites: null,
    keyLeft: false,
    keyRight: false,
    keyFaster: false,
    keySlower: false,
    difficultyLevel: 1,
    baseTotalCars: 200,
    totalCars: 200,
    currentLapTime: 0,
    lastLapTime: null,
    skyOffset: 0,
    hillOffset: 0,
    treeOffset: 0,
    centrifugal: 0.3,
    skySpeed: 0.001,
    hillSpeed: 0.002,
    treeSpeed: 0.003,
    rumbleLength: 3,
    accel: 0,
    breaking: 0,
    decel: 0,
    offRoadDecel: 0,
    offRoadLimit: 0,
    
    init: function(canvasElement) {
      // Check if already initialized
      if (window.gameState && window.gameState.isInitialized) {
        // Silently return if already initialized (no warning needed)
        return;
      }

      if (!window.Game || !window.Dom || !window.Util || !window.Render || !window.SPRITES || !window.COLORS || !window.BACKGROUND) {
        console.error('Game scripts not loaded. Required: Game, Dom, Util, Render, SPRITES, COLORS, BACKGROUND');
        return;
      }

      this.canvas = canvasElement;
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        console.error('Failed to get canvas context');
        return;
      }

      // Set canvas size
      this.canvas.width = this.width = 1024;
      this.canvas.height = this.height = 768;

      // Initialize game variables
      this.step = 1/this.fps;
      this.maxSpeed = this.segmentLength/this.step;
      this.accel = this.maxSpeed/5;
      this.breaking = -this.maxSpeed;
      this.decel = -this.maxSpeed/5;
      this.offRoadDecel = -this.maxSpeed/2;
      this.offRoadLimit = this.maxSpeed/4;

      // Create stats instance (without DOM element for now)
      this.stats = {
        update: function() {},
        current: function() { return 60; }
      };

      // Set up key listeners
      this.setupKeys();

      // Load images and initialize
      var self = this;
      window.Game.loadImages(['background', 'sprites'], function(images) {
        self.background = images[0];
        self.sprites = images[1];
        self.resetGame();
        window.gameState.isInitialized = true;
      });
    },

    setupKeys: function() {
      var self = this;
      var KEY = window.KEY || { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, A: 65, D: 68, S: 83, W: 87 };
      
      var onkey = function(keyCode, mode) {
        if (keyCode == KEY.LEFT || keyCode == KEY.A) {
          self.keyLeft = (mode == 'down');
        }
        if (keyCode == KEY.RIGHT || keyCode == KEY.D) {
          self.keyRight = (mode == 'down');
        }
        if (keyCode == KEY.UP || keyCode == KEY.W) {
          self.keyFaster = (mode == 'down');
        }
        if (keyCode == KEY.DOWN || keyCode == KEY.S) {
          self.keySlower = (mode == 'down');
        }
      };

      window.Dom.on(document, 'keydown', function(ev) { onkey(ev.keyCode, 'down'); });
      window.Dom.on(document, 'keyup', function(ev) { onkey(ev.keyCode, 'up'); });
    },

    update: function(dt) {
      var n, car, carW, sprite, spriteW;
      var playerSegment = this.findSegment(this.position + this.playerZ);
      var playerW = window.SPRITES.PLAYER_STRAIGHT.w * window.SPRITES.SCALE;
      var speedPercent = this.speed / this.maxSpeed;
      var dx = dt * 2 * speedPercent;
      var startPosition = this.position;

      this.updateCars(dt, playerSegment, playerW);

      this.position = window.Util.increase(this.position, dt * this.speed, this.trackLength);

      if (this.keyLeft)
        this.playerX = this.playerX - dx;
      else if (this.keyRight)
        this.playerX = this.playerX + dx;

      this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.centrifugal);

      if (this.keyFaster)
        this.speed = window.Util.accelerate(this.speed, this.accel, dt);
      else if (this.keySlower)
        this.speed = window.Util.accelerate(this.speed, this.breaking, dt);
      else
        this.speed = window.Util.accelerate(this.speed, this.decel, dt);

      // Collision detection
      if ((this.playerX < -1) || (this.playerX > 1)) {
        if (this.speed > this.offRoadLimit)
          this.speed = window.Util.accelerate(this.speed, this.offRoadDecel, dt);

        for(n = 0 ; n < playerSegment.sprites.length ; n++) {
          sprite = playerSegment.sprites[n];
          spriteW = sprite.source.w * window.SPRITES.SCALE;
          if (window.Util.overlap(this.playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
            this.speed = this.maxSpeed/5;
            this.position = window.Util.increase(playerSegment.p1.world.z, -this.playerZ, this.trackLength);
            window.gameState.crashes = (window.gameState.crashes || 0) + 1;
            break;
          }
        }
      }

      for(n = 0 ; n < playerSegment.cars.length ; n++) {
        car = playerSegment.cars[n];
        carW = car.sprite.w * window.SPRITES.SCALE;
        if (this.speed > car.speed) {
          if (window.Util.overlap(this.playerX, playerW, car.offset, carW, 0.8)) {
            this.speed = car.speed * (car.speed/this.speed);
            this.position = window.Util.increase(car.z, -this.playerZ, this.trackLength);
            window.gameState.crashes = (window.gameState.crashes || 0) + 1;
            break;
          }
        }
      }

      this.playerX = window.Util.limit(this.playerX, -3, 3);
      this.speed = window.Util.limit(this.speed, 0, this.maxSpeed);

      this.skyOffset = window.Util.increase(this.skyOffset, this.skySpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
      this.hillOffset = window.Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
      this.treeOffset = window.Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);

      // Progressive difficulty
      this.totalGameTime += dt;
      var newDifficultyLevel = Math.floor(this.totalGameTime / 60) + 1;
      if (newDifficultyLevel > this.difficultyLevel) {
        this.difficultyLevel = newDifficultyLevel;
        var oldTotalCars = this.totalCars;
        this.totalCars = Math.min(500, Math.floor(this.baseTotalCars * (1 + (this.difficultyLevel - 1) * 0.2)));
        if (this.totalCars != oldTotalCars) {
          this.resetCars();
        }
      }

      // Update exposed state
      window.gameState.position = this.position;
      window.gameState.speed = this.speed;
      // CRITICAL: Only update maxSpeed if it's increasing, never reset it during gameplay
      // This prevents score drops from maxSpeed being reset
      var previousMaxSpeed = window.gameState.maxSpeed || 0;
      window.gameState.maxSpeed = Math.max(previousMaxSpeed, this.speed);
      
      // Log if maxSpeed was incorrectly reset
      if (previousMaxSpeed > 0 && window.gameState.maxSpeed < previousMaxSpeed * 0.5) {
        console.error('[game-wrapper] ⚠️ maxSpeed drop detected!', {
          previous: previousMaxSpeed.toFixed(2),
          current: window.gameState.maxSpeed.toFixed(2),
          speed: this.speed.toFixed(2)
        });
        // Restore previous maxSpeed if it was incorrectly reset
        window.gameState.maxSpeed = previousMaxSpeed;
      }
      
      window.gameState.totalGameTime = this.totalGameTime;
      window.gameState.playerX = this.playerX;
      window.gameState.trackLength = this.trackLength || 0;
      window.gameState.segmentLength = this.segmentLength;
    },

    render: function() {
      if (!this.ctx || !this.background || !this.sprites) return;

      var baseSegment = this.findSegment(this.position);
      var basePercent = window.Util.percentRemaining(this.position, this.segmentLength);
      var playerSegment = this.findSegment(this.position + this.playerZ);
      var playerPercent = window.Util.percentRemaining(this.position + this.playerZ, this.segmentLength);
      var playerY = window.Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
      var maxy = this.height;

      var x = 0;
      var dx = -(baseSegment.curve * basePercent);

      this.ctx.clearRect(0, 0, this.width, this.height);

      window.Render.background(this.ctx, this.background, this.width, this.height, window.BACKGROUND.SKY, this.skyOffset, this.resolution * this.skySpeed * playerY);
      window.Render.background(this.ctx, this.background, this.width, this.height, window.BACKGROUND.HILLS, this.hillOffset, this.resolution * this.hillSpeed * playerY);
      window.Render.background(this.ctx, this.background, this.width, this.height, window.BACKGROUND.TREES, this.treeOffset, this.resolution * this.treeSpeed * playerY);

      var n, i, segment, car, sprite, spriteScale, spriteX, spriteY;

      for(n = 0 ; n < this.drawDistance ; n++) {
        segment = this.segments[(baseSegment.index + n) % this.segments.length];
        segment.looped = segment.index < baseSegment.index;
        segment.fog = window.Util.exponentialFog(n/this.drawDistance, this.fogDensity);
        segment.clip = maxy;

        window.Util.project(segment.p1, (this.playerX * this.roadWidth) - x, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, this.roadWidth);
        window.Util.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, this.roadWidth);

        x = x + dx;
        dx = dx + segment.curve;

        if ((segment.p1.camera.z <= this.cameraDepth) || (segment.p2.screen.y >= segment.p1.screen.y) || (segment.p2.screen.y >= maxy))
          continue;

        window.Render.segment(this.ctx, this.width, this.lanes,
          segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w,
          segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w,
          segment.fog, segment.color);

        maxy = segment.p1.screen.y;
      }

      for(n = (this.drawDistance-1) ; n > 0 ; n--) {
        segment = this.segments[(baseSegment.index + n) % this.segments.length];

        for(i = 0 ; i < segment.cars.length ; i++) {
          car = segment.cars[i];
          sprite = car.sprite;
          spriteScale = window.Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
          spriteX = window.Util.interpolate(segment.p1.screen.x, segment.p2.screen.x, car.percent) + (spriteScale * car.offset * this.roadWidth * this.width/2);
          spriteY = window.Util.interpolate(segment.p1.screen.y, segment.p2.screen.y, car.percent);
          window.Render.sprite(this.ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
        }

        for(i = 0 ; i < segment.sprites.length ; i++) {
          sprite = segment.sprites[i];
          spriteScale = segment.p1.screen.scale;
          spriteX = segment.p1.screen.x + (spriteScale * sprite.offset * this.roadWidth * this.width/2);
          spriteY = segment.p1.screen.y;
          window.Render.sprite(this.ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
        }

        if (segment == playerSegment) {
          window.Render.player(this.ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, this.speed/this.maxSpeed,
            this.cameraDepth/this.playerZ,
            this.width/2,
            (this.height/2) - (this.cameraDepth/this.playerZ * window.Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * this.height/2),
            this.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0),
            playerSegment.p2.world.y - playerSegment.p1.world.y);
        }
      }
    },

    findSegment: function(z) {
      return this.segments[Math.floor(z/this.segmentLength) % this.segments.length];
    },

    updateCars: function(dt, playerSegment, playerW) {
      var n, car, oldSegment, newSegment;
      for(n = 0 ; n < this.cars.length ; n++) {
        car = this.cars[n];
        oldSegment = this.findSegment(car.z);
        car.offset = car.offset + this.updateCarOffset(car, oldSegment, playerSegment, playerW);
        car.z = window.Util.increase(car.z, dt * car.speed, this.trackLength);
        car.percent = window.Util.percentRemaining(car.z, this.segmentLength);
        newSegment = this.findSegment(car.z);
        if (oldSegment != newSegment) {
          var index = oldSegment.cars.indexOf(car);
          oldSegment.cars.splice(index, 1);
          newSegment.cars.push(car);
        }
      }
    },

    updateCarOffset: function(car, carSegment, playerSegment, playerW) {
      var i, j, dir, segment, otherCar, otherCarW, lookahead = 20 + (this.difficultyLevel - 1) * 5, carW = car.sprite.w * window.SPRITES.SCALE;

      if ((carSegment.index - playerSegment.index) > this.drawDistance)
        return 0;

      for(i = 1 ; i < lookahead ; i++) {
        segment = this.segments[(carSegment.index+i) % this.segments.length];

        if ((segment === playerSegment) && (car.speed > this.speed) && (window.Util.overlap(this.playerX, playerW, car.offset, carW, 1.2))) {
          if (this.playerX > 0.5) dir = -1;
          else if (this.playerX < -0.5) dir = 1;
          else dir = (car.offset > this.playerX) ? 1 : -1;
          return dir * 1/i * (car.speed-this.speed)/this.maxSpeed;
        }

        for(j = 0 ; j < segment.cars.length ; j++) {
          otherCar = segment.cars[j];
          otherCarW = otherCar.sprite.w * window.SPRITES.SCALE;
          if ((car.speed > otherCar.speed) && window.Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
            if (otherCar.offset > 0.5) dir = -1;
            else if (otherCar.offset < -0.5) dir = 1;
            else dir = (car.offset > otherCar.offset) ? 1 : -1;
            return dir * 1/i * (car.speed-otherCar.speed)/this.maxSpeed;
          }
        }
      }

      if (car.offset < -0.9) return 0.1;
      else if (car.offset > 0.9) return -0.1;
      else return 0;
    },

    lastY: function() {
      return (this.segments.length == 0) ? 0 : this.segments[this.segments.length-1].p2.world.y;
    },

    addSegment: function(curve, y) {
      var n = this.segments.length;
      this.segments.push({
        index: n,
        p1: { world: { y: this.lastY(), z: n * this.segmentLength }, camera: {}, screen: {} },
        p2: { world: { y: y, z: (n+1) * this.segmentLength }, camera: {}, screen: {} },
        curve: curve,
        sprites: [],
        cars: [],
        color: Math.floor(n/this.rumbleLength)%2 ? window.COLORS.DARK : window.COLORS.LIGHT
      });
    },

    addSprite: function(n, sprite, offset) {
      this.segments[n].sprites.push({ source: sprite, offset: offset });
    },

    addRoad: function(enter, hold, leave, curve, y) {
      var startY = this.lastY();
      var endY = startY + (window.Util.toInt(y, 0) * this.segmentLength);
      var n, total = enter + hold + leave;
      for(n = 0 ; n < enter ; n++)
        this.addSegment(window.Util.easeIn(0, curve, n/enter), window.Util.easeInOut(startY, endY, n/total));
      for(n = 0 ; n < hold ; n++)
        this.addSegment(curve, window.Util.easeInOut(startY, endY, (enter+n)/total));
      for(n = 0 ; n < leave ; n++)
        this.addSegment(window.Util.easeInOut(curve, 0, n/leave), window.Util.easeInOut(startY, endY, (enter+hold+n)/total));
    },

    resetRoad: function() {
      this.segments = [];
      var ROAD = {
        LENGTH: { NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100 },
        HILL: { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60 },
        CURVE: { NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6 }
      };

      this.addRoad(ROAD.LENGTH.SHORT, ROAD.LENGTH.SHORT, ROAD.LENGTH.SHORT, 0, 0);
      this.addLowRollingHills(ROAD);
      this.addSCurves(ROAD);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
      this.addBumps(ROAD);
      this.addLowRollingHills(ROAD);
      this.addRoad(ROAD.LENGTH.LONG*2, ROAD.LENGTH.LONG*2, ROAD.LENGTH.LONG*2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, 0, ROAD.HILL.HIGH);
      this.addSCurves(ROAD);
      this.addRoad(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
      this.addRoad(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, 0, ROAD.HILL.HIGH);
      this.addRoad(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
      this.addBumps(ROAD);
      this.addRoad(ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, ROAD.LENGTH.LONG, 0, -ROAD.HILL.MEDIUM);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, 0, 0);
      this.addSCurves(ROAD);
      this.addDownhillToEnd(ROAD);

      this.resetSprites();
      this.resetCars();

      var startSegment = this.findSegment(this.playerZ);
      this.segments[startSegment.index + 2].color = window.COLORS.START;
      this.segments[startSegment.index + 3].color = window.COLORS.START;
      for(var n = 0 ; n < this.rumbleLength ; n++)
        this.segments[this.segments.length-1-n].color = window.COLORS.FINISH;

      this.trackLength = this.segments.length * this.segmentLength;
    },

    addLowRollingHills: function(ROAD) {
      var num = ROAD.LENGTH.SHORT;
      var height = ROAD.HILL.LOW;
      this.addRoad(num, num, num, 0, height/2);
      this.addRoad(num, num, num, 0, -height);
      this.addRoad(num, num, num, ROAD.CURVE.EASY, height);
      this.addRoad(num, num, num, 0, 0);
      this.addRoad(num, num, num, -ROAD.CURVE.EASY, height/2);
      this.addRoad(num, num, num, 0, 0);
    },

    addSCurves: function(ROAD) {
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.NONE);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.EASY, -ROAD.HILL.LOW);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.MEDIUM);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
    },

    addBumps: function(ROAD) {
      this.addRoad(10, 10, 10, 0, 5);
      this.addRoad(10, 10, 10, 0, -2);
      this.addRoad(10, 10, 10, 0, -5);
      this.addRoad(10, 10, 10, 0, 8);
      this.addRoad(10, 10, 10, 0, 5);
      this.addRoad(10, 10, 10, 0, -7);
      this.addRoad(10, 10, 10, 0, 5);
      this.addRoad(10, 10, 10, 0, -2);
    },

    addDownhillToEnd: function(ROAD) {
      var num = 200;
      this.addRoad(num, num, num, -ROAD.CURVE.EASY, -this.lastY()/this.segmentLength);
    },

    resetSprites: function() {
      var n, i;
      this.addSprite(20, window.SPRITES.BILLBOARD07, -1);
      this.addSprite(40, window.SPRITES.BILLBOARD06, -1);
      this.addSprite(60, window.SPRITES.BILLBOARD08, -1);
      this.addSprite(80, window.SPRITES.BILLBOARD09, -1);
      this.addSprite(100, window.SPRITES.BILLBOARD01, -1);
      this.addSprite(120, window.SPRITES.BILLBOARD02, -1);
      this.addSprite(140, window.SPRITES.BILLBOARD03, -1);
      this.addSprite(160, window.SPRITES.BILLBOARD04, -1);
      this.addSprite(180, window.SPRITES.BILLBOARD05, -1);

      this.addSprite(240, window.SPRITES.BILLBOARD07, -1.2);
      this.addSprite(240, window.SPRITES.BILLBOARD06, 1.2);
      this.addSprite(this.segments.length - 25, window.SPRITES.BILLBOARD07, -1.2);
      this.addSprite(this.segments.length - 25, window.SPRITES.BILLBOARD06, 1.2);

      for(n = 10 ; n < 200 ; n += 4 + Math.floor(n/100)) {
        this.addSprite(n, window.SPRITES.PALM_TREE, 0.5 + Math.random()*0.5);
        this.addSprite(n, window.SPRITES.PALM_TREE, 1 + Math.random()*2);
      }

      for(n = 250 ; n < 1000 ; n += 5) {
        this.addSprite(n, window.SPRITES.COLUMN, 1.1);
        this.addSprite(n + window.Util.randomInt(0,5), window.SPRITES.TREE1, -1 - (Math.random() * 2));
        this.addSprite(n + window.Util.randomInt(0,5), window.SPRITES.TREE2, -1 - (Math.random() * 2));
      }

      for(n = 200 ; n < this.segments.length ; n += 3) {
        this.addSprite(n, window.Util.randomChoice(window.SPRITES.PLANTS), window.Util.randomChoice([1,-1]) * (2 + Math.random() * 5));
      }

      var side, sprite, offset;
      for(n = 1000 ; n < (this.segments.length-50) ; n += 100) {
        side = window.Util.randomChoice([1, -1]);
        this.addSprite(n + window.Util.randomInt(0, 50), window.Util.randomChoice(window.SPRITES.BILLBOARDS), -side);
        for(i = 0 ; i < 20 ; i++) {
          sprite = window.Util.randomChoice(window.SPRITES.PLANTS);
          offset = side * (1.5 + Math.random());
          this.addSprite(n + window.Util.randomInt(0, 50), sprite, offset);
        }
      }
    },

    resetCars: function() {
      this.cars = [];
      var n, car, segment, offset, z, sprite, speed, speedMultiplier = 1 + (this.difficultyLevel - 1) * 0.15;
      for (n = 0 ; n < this.totalCars ; n++) {
        offset = Math.random() * window.Util.randomChoice([-0.8, 0.8]);
        z = Math.floor(Math.random() * this.segments.length) * this.segmentLength;
        sprite = window.Util.randomChoice(window.SPRITES.CARS);
        var baseSpeed = this.maxSpeed/4 + Math.random() * this.maxSpeed/(sprite == window.SPRITES.SEMI ? 4 : 2);
        speed = baseSpeed * speedMultiplier;
        speed = Math.min(speed, this.maxSpeed * 0.9);
        car = { offset: offset, z: z, sprite: sprite, speed: speed };
        segment = this.findSegment(car.z);
        segment.cars.push(car);
        this.cars.push(car);
      }
    },

    resetGame: function(options) {
      options = options || {};
      this.canvas.width = this.width = window.Util.toInt(options.width, this.width);
      this.canvas.height = this.height = window.Util.toInt(options.height, this.height);
      this.lanes = window.Util.toInt(options.lanes, this.lanes);
      this.roadWidth = window.Util.toInt(options.roadWidth, this.roadWidth);
      this.cameraHeight = window.Util.toInt(options.cameraHeight, this.cameraHeight);
      this.drawDistance = window.Util.toInt(options.drawDistance, this.drawDistance);
      this.fogDensity = window.Util.toInt(options.fogDensity, this.fogDensity);
      this.fieldOfView = window.Util.toInt(options.fieldOfView, this.fieldOfView);
      this.segmentLength = window.Util.toInt(options.segmentLength, this.segmentLength);
      this.rumbleLength = window.Util.toInt(options.rumbleLength, this.rumbleLength);
      this.cameraDepth = 1 / Math.tan((this.fieldOfView/2) * Math.PI/180);
      this.playerZ = (this.cameraHeight * this.cameraDepth);
      this.resolution = this.height/480;
      
      if (!options.keepDifficulty) {
        this.totalGameTime = 0;
        this.difficultyLevel = 1;
        this.totalCars = this.baseTotalCars;
        window.gameState.totalGameTime = 0;
        window.gameState.crashes = 0;
        // CRITICAL FIX: Only reset maxSpeed if game is not running
        // This prevents score drops during active gameplay
        if (!window.gameState.isRunning) {
          window.gameState.maxSpeed = 0;
        } else {
          console.warn('[game-wrapper] ⚠️ Attempted to reset maxSpeed during gameplay - preserving value');
        }
      }

      if ((this.segments.length == 0) || options.segmentLength || options.rumbleLength) {
        this.resetRoad();
      }
    },

    start: function() {
      if (window.gameState.isRunning) return;
      if (!window.gameState.isInitialized) {
        console.error('Game not initialized');
        return;
      }

      window.gameState.isRunning = true;
      var self = this;
      var last = window.Util.timestamp();
      var dt = 0;
      var gdt = 0;

      function frame() {
        if (!window.gameState.isRunning) return;

        var now = window.Util.timestamp();
        dt = Math.min(1, (now - last) / 1000);
        gdt = gdt + dt;
        while (gdt > self.step) {
          gdt = gdt - self.step;
          self.update(self.step);
        }
        self.render();
        self.stats.update();
        last = now;
        self.frameId = requestAnimationFrame(frame);
      }

      this.frameId = requestAnimationFrame(frame);
    },

    stop: function() {
      window.gameState.isRunning = false;
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
    },

    reset: function() {
      this.stop();
      this.position = 0;
      this.speed = 0;
      this.playerX = 0;
      this.totalGameTime = 0;
      this.currentLapTime = 0;
      this.skyOffset = 0;
      this.hillOffset = 0;
      this.treeOffset = 0;
      this.difficultyLevel = 1;
      this.totalCars = this.baseTotalCars;
      
      window.gameState.position = 0;
      window.gameState.speed = 0;
      // Only reset maxSpeed when explicitly resetting (game stopped)
      window.gameState.maxSpeed = 0;
      window.gameState.crashes = 0;
      window.gameState.totalGameTime = 0;
      window.gameState.playerX = 0;
      
      this.resetGame({ keepDifficulty: false });
    }
  };

  console.log('Game wrapper loaded');
})();
