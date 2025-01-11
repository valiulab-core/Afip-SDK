export const expectThrowIfRootHasErrors = (obj: Record<string, any>) => {
  // Check if Errors.Err property exists
  expect(obj).toHaveProperty("Errors.Err");

  // Check if Errors.Err property is an instance of Array
  expect(obj.Errors.Err).toBeInstanceOf(Array);

  // Check if the array contains objects
  expect(obj.Errors.Err).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        Code: expect.any(Number),
        Msg: expect.any(String),
      }),
    ])
  );
};
