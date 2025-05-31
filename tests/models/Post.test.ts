import { Post } from "../../server/models/Post";
import { describe, beforeAll, it, expect } from "@jest/globals";

// The happy path, when everything works
describe("The Post model", () => {
  // arrange
  let testPost: Post;
  beforeAll(async () => {
    testPost = new Post({
      slug: "test-post",
      title: "Test Post",
      excerpt: "This is a test post",
      body: "This is the body of the test post",
    });
  });

  // act
  it("initializes with provided values", () => {
    // assert
    expect(testPost.slug).toEqual("test-post");
  });

  it("has a title", () => {
    // assert
    expect(testPost.title).toEqual("Test Post");
  });

  it("has an excerpt", () => {
    // assert
    expect(testPost.excerpt).toEqual("This is a test post");
  });

  it("has a body", () => {
    // assert
    expect(testPost.body).toEqual("This is the body of the test post");
  });

  it("is not published by default", () => {
    // assert
    expect(testPost.published).toEqual(false);
  });

  it("has a key generated", () => {
    // assert
    expect(testPost.key).toBeDefined();
  });

  it("converts to string representation", () => {
    // assert
    expect(testPost.toString()).toEqual("Post: Test Post (Draft)");
  });
});

// Test factory methods
describe("Post factory methods", () => {
  describe("Creating a published post", () => {
    // arrange
    let publishedPost: Post;
    beforeAll(async () => {
      publishedPost = Post.createPublished({
        slug: "published-post",
        title: "Published Post",
      });
    });

    // act
    it("creates a post marked as published", () => {
      // assert
      expect(publishedPost.published).toEqual(true);
    });

    it("sets the published_at date", () => {
      // assert
      expect(publishedPost.published_at).toBeDefined();
    });
  });

  describe("Creating a draft post", () => {
    // arrange
    let draftPost: Post;
    beforeAll(async () => {
      draftPost = Post.createDraft({
        slug: "draft-post",
        title: "Draft Post",
      });
    });

    // act
    it("creates a post marked as draft", () => {
      // assert
      expect(draftPost.published).toEqual(false);
    });

    it("has no published_at date", () => {
      // assert
      expect(draftPost.published_at).toBeUndefined();
    });
  });
});

// Test instance methods
describe("Post instance methods", () => {
  describe("Publishing a post", () => {
    // arrange
    let draftPost: Post;
    beforeAll(async () => {
      draftPost = new Post({
        slug: "to-publish",
        title: "Post to Publish",
      });
      draftPost.publish();
    });

    // act
    it("marks the post as published", () => {
      // assert
      expect(draftPost.published).toEqual(true);
    });

    it("sets the published_at date", () => {
      // assert
      expect(draftPost.published_at).toBeDefined();
    });
  });
});

// The sad path, with error conditions
describe("Post validation issues", () => {
  describe("Missing required fields", () => {
    // act
    it("creates a post with default values when fields are missing", () => {
      const emptyPost = new Post();
      expect(emptyPost.title).toEqual("");
    });
  });

  describe("Converting to JSON", () => {
    // arrange
    let testPost: Post;
    beforeAll(async () => {
      testPost = new Post({
        slug: "json-post",
        title: "JSON Post",
      });
    });

    // act
    it("converts to a plain object without methods", () => {
      const json = testPost.toJson();
      expect(json).not.toHaveProperty("publish");
    });
  });
});
