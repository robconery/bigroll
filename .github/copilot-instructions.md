# Instructions for Copilot

## Code Style

Every method should have a simple comment that explains what it does. Don't do this for private methods, only public. Add emoji.

## Models

All models should extend `Firefly<T>` and live in the `server/models` directory. They should follow this pattern:

```ts
import { Firefly } from '../lib/firefly';

export class Model extends Firefly<Model> {
  //properties
  constructor(data: Partial<Model> = {}) {
    super(data);
    //set the properties

    toString(){
      //sensible toString
    }
    toJson(){
      return this._toFirestore();
    }
  }
  //sensible factory methods
}
```

## Tests

All tests will be run with Jest. In addition:

- One assertion per test, _no_ exceptions
- Tests should arrange the test data in `beforeAll` blocks
- `describe` blocks should have long descriptive names.
- Tests should have long, descriptive names: `this is a test name`.
- The word "should" will be avoided in test names. A test either passes or fail, it `is`, `is not`, `does`, or `does not`. There is no try.
- Tests will be nested, with the outer `describe` block indicating the main test feature, and the first inner `describe` block being the "happy path" - which is what happens when everything works as expected. The rest of the nested blocks will be devoted to "sad path" tests, with bad data, null values, and any other unexpected settings we can think of.

Use this exact pattern:

```ts
import { someMethod } from "./some_service.ts";

//The happy path, when everything works
describe("The thing I'm trying to test", () => {
  //arrange
  let testThing;
  beforeAll(async () => {
    testThing = await someMethod();
  });

  //act
  it("will initialize", async () => {
    //make sure the testThing initializes properly
    //assert
    expect(testThing).toBeDefined();
  });

  //rest of tests go down here
});

//The sad path, with error conditions
describe("The things I'm trying to avoid", () => {
  describe("Error conditions with initialization", () => {
    //act
    it("will throw an X type error with message Y", async () => {
      expect(someMethod(badData)).toThrowError("Some message");
    });
  });
  describe("Another set of error conditions", () => {
    //act
    it("will throw an X type error with message Y", async () => {
      expect(someMethod(badData)).toThrowError("Some message");
    });
  });
  //rest of tests go down here
});
```
