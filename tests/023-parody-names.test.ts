import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { CUSTOMERS, SYSTEMS } from '../src/content/registry';
import { nodeTip } from '../src/ui/network';

/** Normalise before hashing: case-insensitive, punctuation and spaces ignored. */
const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/[^a-z0-9åäöéü]/g, '');
const sha = (s: string) => createHash('sha256').update(norm(s)).digest('hex');

/**
 * SHA-256 of normalised names of real brands, organisations and places that our parodies allude to.
 * Only hashes live in the repo; the originals are never written out (see decisions/, D-023).
 */
const FORBIDDEN = new Set([
  'aae409c324b5a2d6fc020087f7bb593f6a33ca5be63681eadcfee43269dda39c',
  '9fbf261b62c1d7c00db73afb81dd97fdf20b3442e36e338cb9359b856a03bdc8',
  '304db88cc92969947c8bec7deec655698a94820a8934d9aaf13a8608c83a4cde',
  '41baaba97d0dfa5dea9195d4c60cd3b9de847d40fcec92a1f28c510d5c8c2fcb',
  '9211da2bdb79a1bf369af43968fb152c553345fe409cd7e4bc5c43f9003d6ded',
  'bbdefa2950f49882f295b1285d4fa9dec45fc4144bfb07ee6acc68762d12c2e3',
  'cb088e1e91718a71b4f36380f0764cc473ef592b39c4acb79f27a2abe90e02dc',
  '5302cedc56833433902244bd3a752d1bc10398e7fd764c981dfd92c6fc2057ae',
  '21a3230e03772a58aff1b3709a9e232850916337e1fba95c434076b6668c6e08',
  '83d82a74a67aebdecd3846a42bc5235254fb77f8da9a189bf49c321f450dcccd',
  '13d172f2b1214199aa4807afdff7048d2c3366781ab2da4c13723aeae117f26d',
  '6a39cec2fa52f182b8fb2a21c726e434922fe09f8b6b69e27691ff6eb4a2ea2c',
  '8ace5a64458fad1162612c9fed150ba9f47f088dacdd7b57b01a4d557d64fd6e',
  '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b',
  '5baf6dcbe930ec0ba7aea9cdd4daf5aa5804b5a84d155684d3f6d449759d5fd3',
  'de0ba1b7666973438066d83dce02558521ac10a49586223031112f8f0f82e772',
  'ebb148f5be89a8496aa731102a11292193b1a74b12397295087b0bf1a272a914',
  'f17d83c39a9b891877308161cb1213d4b8810e360d946f10f0a904ad84090a1f',
  'faba1e00af8e6c89837f711eeb6f67c0d1bdb573c63abcdcdb2fbf7ab5ad2295',
  'b9b1c8a4ce1abc21426e3f3caefce82c6e06abe5c4c8ee04998719e94fe19118',
  '85072d126bc17d5e8784100622db2bff98cc1c5ece365bd4e3096c3ba273c248',
  '97630923eeedd85ff9feb6945ed6f1d9b9c9d66f3d1da9507567056a6308df0e',
  'b094c926eb7c40fd077090df4e8dce579fbddfd0a13fc5f326dd967074f81ba4',
  '36c0780f5f8ba6cd0162f286f926266c4fee86308aa19efb0ee99f76f98163ed',
  '1a203518c544d07b8b771c1418d36865326c3e9e4da5bbd7c750fb2634a34728',
  '63980f0accbc6b82a0b83a5a809ee641220641c41a1ccc561ae282bc74b47eec',
  '3b91872fa7a8666d1fed1ed644aae2cd88f87a1a377f320ebafb8a8646297d07',
  'a8710378fca4997effebf51f2dab4c9c85dd36075127e46c09b8baa75d8c8210',
  '494bfc81bc7485420aca62eaf6537094d9a7b1ee90b5e29fc7cf32f4b3f5f721',
  '30ea8b405b63469c270af07cf9e8433ccc4cf7ebb3f8b2a4d57585a393bc2a52',
  'a94179b03521479ca2a3b69bfe544acebc80346c3485179ebe7fdf2770194a3e',
  '24c9a116e1268b06cd8dd54b5e1a27a689875fbe60325ebbc7d4470cdd4eb5f8',
  '8866aa9b506c7a075cc85639b2d9e3b95a2d0ae1c27828d826b734f16a260030',
  '7a4ceae99a5ef2d07a94031d07c2b4a70952897665fe856a392e32a7d1fef759',
  '350f2350e942a220c501532897376914bb93e0416ee51f9449e0008b321c130b',
  '408c91d88bf06ff17e97c98efc39f61ecc206721aa18d7e9e09cb9a118b1d25c',
  '4cda1e1d72bd270885008e64aeee3b480bddb147d1535c05a5eb0c3b87339cbc',
  '6ac353cfa0b8f5b02c4150827ba4d6955e33c4ba135beae13b75f70aa5ee1449',
  '1372c63b35ea72a55bc5afac621482ea61a41dea630ba19583412545d4197641',
  '4f164a7a34ecc3d68c5b157762824b37e2ea51e74b8a7e632c95999aaaf2d651',
  '2ad8e01dae3cdca57c9ccfc2bc588255104827d76aa21cfa405a86b211c4ce6a',
  '297f42c11a2f6bcfb2e3fd8fe7772e3131083381d52af9650c838f816d334d89',
  '54d9e023f01000124d6e59eee72eaabb6ac6605a302963b50e0e3da37c21f454',
  'a1afe4bb0b90ee69109a748ba7bdd2437179b0af7b097071392f9fae1e77674b',
  'ecf5a728cc219cb5b65d1b5813c417ca9b23703ec956118ecc1b4428958ab56a',
  'bfc4fbcbbca6589aa05e0bc1730014b533c9529c87f60bcba698ae0db05fe70c',
  '0e39dfdd284522f760af71ad4de4f4e723bef931df35d669eb4d45104077d91b',
  '6c5ee70f3646c7f6e5a2ce534f9c7c19f5e40b860170b173bb5137d57ddaf5b1',
  '5d534aa0fa5ddb33ac14047ee5199f9f67c0d8999b6fa50866ac87ab4e73277b',
  '79bcd1bfe335231852c5823305d32134d0b014a73162bcf8d6d97739b42f805e',
  '754f73f8c8e256f1214546d7c33672d6f1be8df4424e7dd62268c7893c2cb742',
  '881c2ee63a0759691e972c6d2a50e5ca921e8190272f353226a800e0db6c7e01',
  '452690d3fddb25925889ce519ace22bd3b69cdc401c23adce0ee9ff1784a6287',
  'a8f69db0aebb670304d7a3e13421fc0541fe073e2c46587528c41af492ecbb1d',
  '586edaee967924bf1268d8dc6387025b013dd5a61a520184d859340a103e4b10',
  '388f91ea04d6eaeb65084976447777b5f11177ab1995c89b19cccbf93e97265d',
  '604538cec665f3ed83c9b231f2b4a5f4d657b0290d304c57766c3402e544e85f',
  'df0b82039a53e0cdabfed50febaa89bc2ccc75b00c0b04fe53c63f85a1bccb3d',
  '8c3bc97b36d17f130bd5dfef659955c2ac02148e5ac4bbea87cddaa8f76405ee',
  '0bb719b98f600f95d9f6757fb1baf390da18cc3ff330713528b3d090747b0b86',
  'b0eb4d20e636fa812f7c8a2d0e85de2205399bdc02031b9f0ec3d90a1381d263',
  'd79fb33265e1481ac0558735d598351f6f8ad4de0031f8736a879d1f13c67347',
  '0c5cc6f1955199d9fb83137fa3765b79c722ab25fb6ad0f84bbeb3f4e6bfc4b5',
  'cb58e4600bf0142cbe4ad513de98b73c5c9da7f4023a393d13b395375fccaea6',
  '8abe2436d3ea669b6ecc471c7b477b2d72432fa9aa6d8b37e2bc4395fec3a2a2',
]);

/** The full text plus every single word and every pair of adjacent words. */
function fragments(text: string): string[] {
  const words = text.split(/[\s\-–/]+/).filter(Boolean);
  const pairs = words.slice(1).map((w, i) => `${words[i]} ${w}`);
  return [text, ...words, ...pairs];
}

describe('parody names (task 023)', () => {
  it('the forbidden list only holds SHA-256 hashes', () => {
    for (const h of FORBIDDEN) expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(FORBIDDEN.size).toBeGreaterThan(20);
  });

  it('fragments() catches a forbidden word inside a longer name', () => {
    // A hash of a made-up word, so the check itself is tested without naming anything real.
    const fake = sha('Påhittia');
    const hit = (t: string) => fragments(t).some((f) => sha(f) === fake);
    expect(hit('Påhittia kommun')).toBe(true);
    expect(hit('Stora PÅHITTIA-regionen')).toBe(true);
    expect(hit('Påhittiska kommun')).toBe(false);
  });

  it('no system name, customer name or tagline is a real original name', () => {
    const texts = [
      ...SYSTEMS.flatMap((s) => [s.name, s.tagline ?? '']),
      ...CUSTOMERS.map((c) => c.name),
    ].filter(Boolean);
    for (const t of texts) for (const f of fragments(t)) expect(FORBIDDEN.has(sha(f)), `${t} (${f})`).toBe(false);
  });

  it('system names and customer names are unique', () => {
    const sys = SYSTEMS.map((s) => norm(s.name));
    const cust = CUSTOMERS.map((c) => norm(c.name));
    expect(new Set(sys).size).toBe(sys.length);
    expect(new Set(cust).size).toBe(cust.length);
    expect(new Set([...sys, ...cust]).size).toBe(sys.length + cust.length);
  });

  it('taglines are short and non-empty when present', () => {
    for (const s of SYSTEMS) {
      if (s.tagline === undefined) continue;
      expect(s.tagline.trim().length, s.id).toBeGreaterThan(0);
      expect(s.tagline.length, s.id).toBeLessThanOrEqual(40);
    }
  });

  it('most systems have a tagline, and the map tip shows it (or the kind)', () => {
    const withTag = SYSTEMS.filter((s) => s.tagline);
    expect(withTag.length).toBeGreaterThanOrEqual(SYSTEMS.length / 2);
    const s = withTag[0]!;
    expect(nodeTip(s.id)).toBe(`${s.name}: ”${s.tagline}”`);
    const plain = { ...s, tagline: undefined };
    expect(nodeTip(plain.id, [plain])).toBe(`${s.name} · ${s.kind}`);
    expect(nodeTip('does-not-exist')).toBe('does-not-exist');
  });

  it('has the new supplier kinds (absence, exams, learning material, transport, meals)', () => {
    const kinds = SYSTEMS.map((s) => s.kind);
    for (const k of ['Frånvaro', 'Provverktyg', 'Digitala läromedel', 'Skolskjuts', 'Skolmåltider']) {
      expect(kinds, k).toContain(k);
    }
    expect(SYSTEMS.length).toBeGreaterThanOrEqual(31 + 6);
  });

  it('customer ids are unchanged so saves keep working', () => {
    expect(CUSTOMERS.map((c) => c.id).sort()).toEqual([
      'byskolan-i-odmarden',
      'framtidsgymnasiet-framat-ab',
      'friskolan-larandets-lustgard',
      'glesbyggda-kommun',
      'hela-mellansverige-nastan',
      'mellanby-kommun',
      'regionstadens-utbildningsforvaltning',
      'riksskolor-holding',
      'skolkoncernen-expansiva',
      'storkopings-stad',
    ]);
  });
});
