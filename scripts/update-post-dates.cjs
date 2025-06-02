#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * 📅 Updates markdown posts with missing date fields from posts.json
 */
async function updatePostDates() {
  try {
    // Read posts.json
    const postsJsonPath = path.join(__dirname, "..", "posts.json");
    const postsData = JSON.parse(fs.readFileSync(postsJsonPath, "utf8"));

    // Create a lookup map: title -> published_at
    const titleToDateMap = new Map();
    postsData.forEach((post) => {
      if (post.title && post.published_at) {
        titleToDateMap.set(post.title, post.published_at);
      }
    });

    console.log(
      `📚 Loaded ${titleToDateMap.size} posts with dates from posts.json`
    );

    // Process markdown files
    const postsDir = path.join(__dirname, "..", "content", "posts");
    const markdownFiles = fs
      .readdirSync(postsDir)
      .filter((file) => file.endsWith(".md"));

    let updatedCount = 0;
    let skippedCount = 0;

    for (const filename of markdownFiles) {
      const filePath = path.join(postsDir, filename);
      const content = fs.readFileSync(filePath, "utf8");

      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        console.log(`⚠️  No frontmatter found in ${filename}`);
        continue;
      }

      const frontmatter = frontmatterMatch[1];
      const bodyContent = content.substring(frontmatterMatch[0].length);

      // Check if date field already exists
      if (frontmatter.includes("date:")) {
        console.log(`✅ ${filename} already has date field`);
        skippedCount++;
        continue;
      }

      // Extract title from frontmatter
      const titleMatch = frontmatter.match(/title:\s*(.+)/);
      if (!titleMatch) {
        console.log(`⚠️  No title found in frontmatter of ${filename}`);
        continue;
      }

      const title = titleMatch[1].replace(/^["']|["']$/g, ""); // Remove quotes if present

      // Look up date in posts.json
      const publishedAt = titleToDateMap.get(title);
      if (!publishedAt) {
        console.log(`❌ No matching date found for "${title}" in ${filename}`);
        continue;
      }

      // Convert published_at to YYYY-MM-DD format
      const date = publishedAt.split(" ")[0]; // Extract date part from "2017-06-06 00:00:00"

      // Add date field to frontmatter (after title)
      const updatedFrontmatter = frontmatter.replace(
        /(title:\s*.+)/,
        `$1\ndate: '${date}'`
      );

      // Rebuild the file content
      const updatedContent = `---\n${updatedFrontmatter}\n---${bodyContent}`;

      // Write back to file
      fs.writeFileSync(filePath, updatedContent, "utf8");

      console.log(`🔄 Updated ${filename} with date: ${date}`);
      updatedCount++;
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Files updated: ${updatedCount}`);
    console.log(`⏭️  Files skipped (already had date): ${skippedCount}`);
    console.log(`📁 Total files processed: ${markdownFiles.length}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
updatePostDates();
