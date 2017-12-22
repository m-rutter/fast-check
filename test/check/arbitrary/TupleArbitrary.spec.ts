import * as assert from 'power-assert';
import { DummyRandomGenerator } from './TestRandomGenerator'
import MutableRandomGenerator from '../../../src/random/generator/MutableRandomGenerator';
import Arbitrary from '../../../src/check/arbitrary/Arbitrary';
import { tuple } from '../../../src/check/arbitrary/TupleArbitrary';
import { integer } from '../../../src/check/arbitrary/IntegerArbitrary';
import * as jsc from 'jsverify';

class DummyArbitrary extends Arbitrary<string> {
    constructor(public id: number) {
        super();
    }
    generate(mrng: MutableRandomGenerator) {
        return `key${this.id}_${integer().generate(mrng)}`;
    }
    shrink(v: string) {
        return integer().shrink(+(v.substr(`key${this.id}_`.length)))
            .map(v => `key${this.id}_${v}`);
    }
}
function dummy(id: number) {
    return new DummyArbitrary(id);
}

function propertySameTupleForSameSeed(...arbs: DummyArbitrary[]) {
    if (arbs.length === 0 || arbs.length > 9) {
        throw "Unexpected length should be between 1 and 9";
    }
    const arb = tuple(arbs[0], ...arbs.slice(1));
    return jsc.forall(jsc.integer, (seed) => {
        const mrng1 = new MutableRandomGenerator(new DummyRandomGenerator(seed));
        const mrng2 = new MutableRandomGenerator(new DummyRandomGenerator(seed));
        const g1 = arb.generate(mrng1);
        assert.ok(g1.every((v, idx) => v.startsWith(`key${arbs[idx].id}_`)));
        assert.deepEqual(arb.generate(mrng2), g1);
        return true;
    });
}

function propertyShrinkInRange(...arbs: DummyArbitrary[]) {
    if (arbs.length === 0 || arbs.length > 9) {
        throw "Unexpected length should be between 1 and 9";
    }
    const arb = tuple(arbs[0], ...arbs.slice(1));
    return jsc.forall(jsc.integer, (seed) => {
        const mrng = new MutableRandomGenerator(new DummyRandomGenerator(seed));
        const v = arb.generate(mrng);
        return arb.shrink(v).every(g => g.every((vv, idx) => vv.startsWith(`key${arbs[idx].id}_`)));
    });
}

function propertyNotSuggestInputInShrink(...arbs: DummyArbitrary[]) {
    if (arbs.length === 0 || arbs.length > 9) {
        throw "Unexpected length should be between 1 and 9";
    }
    const arb = tuple(arbs[0], ...arbs.slice(1));
    return jsc.forall(jsc.integer, (seed) => {
        const mrng = new MutableRandomGenerator(new DummyRandomGenerator(seed));
        const v = arb.generate(mrng);
        return arb.shrink(v).every(g => !g.every((vv, idx) => vv === v[idx]));
    });
}

describe('TupleArbitrary', () => {
    describe('tuple', () => {
        it('Should generate the same tuple1 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(dummy(1))
        ));
        it('Should generate the same tuple2 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(dummy(1), dummy(2))
        ));
        it('Should generate the same tuple3 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(dummy(1), dummy(2), dummy(3))
        ));
        it('Should generate the same tuple4 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12))
        ));
        it('Should generate the same tuple5 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12))
        ));
        it('Should generate the same tuple6 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13))
        ));
        it('Should generate the same tuple7 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21))
        ));
        it('Should generate the same tuple8 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21), dummy(22))
        ));
        it('Should generate the same tuple9 with the same random', () => jsc.assert(
            propertySameTupleForSameSeed(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21), dummy(22), dummy(23))
        ));
        it('Should shrink tuple1 within allowed values', () => jsc.assert(
            propertyShrinkInRange(dummy(1))
        ));
        it('Should shrink tuple2 within allowed values', () => jsc.assert(
            propertyShrinkInRange(dummy(1), dummy(2))
        ));
        it('Should shrink tuple3 within allowed values', () => jsc.assert(
            propertyShrinkInRange(dummy(1), dummy(2), dummy(3))
        ));
        it('Should shrink tuple4 within allowed values', () => jsc.assert(
            propertyShrinkInRange(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12))
        ));
        it('Should shrink tuple5 within allowed values', () => jsc.assert(
            propertyShrinkInRange(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12))
        ));
        it('Should shrink tuple6 within allowed values', () => jsc.assert(
            propertyShrinkInRange(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13))
        ));
        it('Should shrink tuple7 within allowed values', () => jsc.assert(
            propertyShrinkInRange(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21))
        ));
        it('Should shrink tuple8 within allowed values', () => jsc.assert(
            propertyShrinkInRange(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21), dummy(22))
        ));
        it('Should shrink tuple9 within allowed values', () => jsc.assert(
            propertyShrinkInRange(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21), dummy(22), dummy(23))
        ));
        it('Should not suggest input in tuple1 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(dummy(1))
        ));
        it('Should not suggest input in tuple2 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(dummy(1), dummy(2))
        ));
        it('Should not suggest input in tuple3 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(dummy(1), dummy(2), dummy(3))
        ));
        it('Should not suggest input in tuple4 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12))
        ));
        it('Should not suggest input in tuple5 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12))
        ));
        it('Should not suggest input in tuple6 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13))
        ));
        it('Should not suggest input in tuple7 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21))
        ));
        it('Should not suggest input in tuple8 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21), dummy(22))
        ));
        it('Should not suggest input in tuple9 shrinked values', () => jsc.assert(
            propertyNotSuggestInputInShrink(
                dummy(1), dummy(2), dummy(3),
                dummy(11), dummy(12), dummy(13),
                dummy(21), dummy(22), dummy(23))
        ));
    });
});