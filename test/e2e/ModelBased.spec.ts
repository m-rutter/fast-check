import * as assert from 'assert';
import * as prand from 'pure-rand';
import * as fc from '../../src/fast-check';

interface IList<T> {
  push(v: T): void;
  pop(): T;
  size(): number;
}

type Model = { num: number };

class PushCommand implements fc.Command<Model, IList<number>> {
  constructor(readonly value: number) {
    this.name = `push(${value})`;
  }
  check = (m: Readonly<Model>) => true;
  run(m: Model, r: IList<number>): void {
    r.push(this.value);
    ++m.num;
  }
  name: string;
}
class PopCommand implements fc.Command<Model, IList<number>> {
  check(m: Readonly<Model>): boolean {
    // should not call pop on empty list
    return m.num > 0;
  }
  run(m: Model, r: IList<number>): void {
    assert.equal(typeof r.pop(), 'number');
    --m.num;
  }
  name = 'pop';
}
class SizeCommand implements fc.Command<Model, IList<number>> {
  check = (m: Readonly<Model>) => true;
  run(m: Model, r: IList<number>): void {
    assert.equal(r.size(), m.num);
  }
  name = 'size';
}
const allCommands = [
  fc.integer().map(v => new PushCommand(v)),
  fc.constant(new PopCommand()),
  fc.constant(new SizeCommand())
];

const seed = Date.now();
describe(`Model Based (seed: ${seed})`, () => {
  it('should not detect any issue on built-in list', () => {
    fc.assert(
      fc.property(fc.commands(allCommands, 100), cmds => {
        class BuiltinList implements IList<number> {
          data: number[] = [];
          push = (v: number) => this.data.push(v);
          pop = () => this.data.pop()!;
          size = () => this.data.length;
        }
        const s = () => ({ model: { num: 0 }, real: new BuiltinList() });
        fc.modelRun(s, cmds);
      })
    );
  });
  it('should detect an issue on fixed size circular list', () => {
    const out = fc.check(
      fc.property(fc.integer(1, 1000), fc.commands(allCommands, 100), (size, cmds) => {
        class CircularList implements IList<number> {
          start: number = 0;
          end: number = 0;
          data: number[];
          constructor(size: number) {
            this.data = [...Array(size)].fill(null);
          }
          push = (v: number) => {
            this.data[this.end] = v;
            this.end = (this.end + 1) % this.data.length;
          };
          pop = () => {
            this.end = (this.end - 1 + this.data.length) % this.data.length;
            return this.data[this.end];
          };
          size = () => (this.end - this.start + this.data.length) % this.data.length;
        }
        const s = () => ({ model: { num: 0 }, real: new CircularList(size) });
        fc.modelRun(s, cmds);
      })
    );
    assert.ok(out.failed);
  });
});
