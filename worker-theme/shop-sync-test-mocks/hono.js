// Records handlers so a test can invoke a route directly.
export class Hono {
  constructor(){ this.handlers = {}; }
  use(){}
  get(p, h){ if (h) this.handlers['GET ' + p] = h; }
  post(p, h){ if (h) this.handlers['POST ' + p] = h; }
  route(){}
}
