/*global State */

function Grid(w, h, s) {
    this.w = w; this.h = h; this.s = s || 8;
    this.done = false;
    this.fore = new Uint32Array(w * h);
    this.back = new Uint32Array(w * h);
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (y === 0 || x === 0 || y === h - 1 || x === w - 1) {
                this.set(x, y, State.WALL);
            } else {
                this.set(x, y, Math.random() < 0.2 ? State.WALL : State.OPEN);
            }
        }
    }
    this.set(1, 1, State.BEGIN);
    this.set(w - 2, h - 2, State.END);
    this.swap();
}

Grid.prototype.swap = function() {
    var tmp = this.fore;
    this.fore = this.back;
    this.back = tmp;
    return this;
};

Grid.prototype.get = function(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y > this.h) {
        return State.WALL;
    } else {
        return this.fore[y * this.w + x];
    }
};

Grid.prototype.set = function(x, y, value) {
    this.back[y * this.w + x] = value;
    return value;
};

Grid.prototype.step = function(count) {
    count = count || 1;
    var states = [null, null, null, null];
    while (count-- > 0 && !this.done) {
        var changes = 0;
        for (var y = 0; y < this.h; y++) {
            for (var x = 0; x < this.w; x++) {
                states[0] = this.get(x + 0, y + -1); // N
                states[1] = this.get(x + 1, y +  0); // E
                states[2] = this.get(x + 0, y +  1); // S
                states[3] = this.get(x +-1, y +  0); // W
                var current = this.get(x, y),
                    next = State.next(current, states);
                if (current !== next) changes++;
                this.set(x, y, next);
            }
        }
        this.swap();
        if (changes === 0) this.done = true;
    }
    return this;
};

Grid.prototype.draw = function(canvas) {
    var w = this.w, h = this.h, s = this.s;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, w * s, h * s); // debug
    for (var y = 0; y < this.h; y++) {
        for (var x = 0; x < this.w; x++) {
            ctx.fillStyle = State.color(this.get(x, y));
            ctx.fillRect(s * x, s * y, s, s);
        }
    }
    return this;
};

Grid.prototype.animate = function(canvas) {
    var _this = this;
    window.setTimeout(function() {
        if (!_this.done) {
            _this.step().draw(canvas);
        }
        _this.animate(canvas);
    }, 50);
    return this;
};
