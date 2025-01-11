// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockFn<TReturn, TArgs extends any[]>(
  implementation?: (...args: TArgs) => TReturn
): jest.Mock<TReturn, TArgs> {
  const fn = jest.fn(implementation);
  // This patches https://github.com/facebook/jest/issues/6329
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fn as any).__proto__ = Function.prototype;
  return fn;
}
