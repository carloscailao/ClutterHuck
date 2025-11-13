describe('Sample Jest Unit Test', () => {
  it('adds two numbers correctly', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it('returns false for unequal values', () => {
    const isEqual = (x: any, y: any) => x === y;
    expect(isEqual('a', 'b')).toBe(false);
  });
});
