const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDirectory = path.join(process.cwd(), "content/posts");

// Function to process a markdown file
const processMarkdownFile = (filePath) => {
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Parse frontmatter
    const { data, content } = matter(fileContent);

    // Check if categories exists
    if (data.categories) {
      let needsUpdate = false;

      // If categories is a string
      if (typeof data.categories === "string") {
        const lowerCaseCategory = data.categories.toLowerCase();
        if (data.categories !== lowerCaseCategory) {
          data.categories = lowerCaseCategory;
          needsUpdate = true;
        }
      }
      // If categories is an array
      else if (Array.isArray(data.categories)) {
        const lowerCaseCategories = data.categories.map((category) =>
          typeof category === "string" ? category.toLowerCase() : category
        );

        if (
          JSON.stringify(data.categories) !==
          JSON.stringify(lowerCaseCategories)
        ) {
          data.categories = lowerCaseCategories;
          needsUpdate = true;
        }
      }

      // Update the file if needed
      if (needsUpdate) {
        const updatedFileContent = matter.stringify(content, data);
        fs.writeFileSync(filePath, updatedFileContent);
        console.log(
          `Updated categories in: ${path.relative(postsDirectory, filePath)}`
        );
      }
    } else {
      console.warn(
        `No 'categories' field found in: ${path.relative(
          postsDirectory,
          filePath
        )}`
      );
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
};

// Function to recursively process all markdown files in a directory
const processDirectory = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith(".md") || file.endsWith(".mdx")) {
      processMarkdownFile(filePath);
    }
  });
};

// Check if the directory exists
if (fs.existsSync(postsDirectory)) {
  console.log("Starting to process markdown files...");
  processDirectory(postsDirectory);
  console.log("Finished processing markdown files.");
} else {
  console.error(`Directory not found: ${postsDirectory}`);
  console.log(
    "Make sure you are running this script from the project root directory."
  );
}
