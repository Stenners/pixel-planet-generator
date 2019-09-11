class RNG {
  constructor(seed) {
    this.seed = this.getSeed(seed) * 394875498754986; //394875498754986 could be any big number
    this.a = 16807;
    this.c = 0;
    this.m = Math.pow(2, 31) - 1;
  }
  getSeed(seed) {
    var s = 34737;
    for (var i = 0; i < seed.length; i++) {
      s += (i + 1) * seed.charCodeAt(i);
    }
    return s;
  }
  unit() {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / (this.m - 1);
  }
}

export default RNG;
