#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * 📝 Script to rename blog posts based on their date field
 * Reads frontmatter from markdown files and renames them to YYYY-MM-DD-slug.md format
 */
async function renamePostsByDate() {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  
  if (!fs.existsSync(postsDir)) {
    console.error(`❌ Posts directory not found: ${postsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.md'))
    .filter(file => !file.match(/^\d{4}-\d{2}-\d{2}-/)); // Skip already formatted files

  console.log(`📁 Found ${files.length} posts to rename`);

  for (const filename of files) {
    const filePath = path.join(postsDir, filename);
    
    try {
      // Read and parse frontmatter
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      
      if (!data.date) {
        console.warn(`⚠️  No date found in ${filename}, skipping...`);
        continue;
      }

      // Parse the date
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        console.warn(`⚠️  Invalid date in ${filename}: ${data.date}, skipping...`);
        continue;
      }

      // Format date as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const datePrefix = `${year}-${month}-${day}`;

      // Extract slug from filename or frontmatter
      let slug = data.slug || filename.replace('.md', '');
      
      // Clean the slug to ensure it doesn't have date prefix already
      slug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
      
      const newFilename = `${datePrefix}-${slug}.md`;
      const newFilePath = path.join(postsDir, newFilename);

      // Check if target file already exists
      if (fs.existsSync(newFilePath)) {
        console.warn(`⚠️  Target file already exists: ${newFilename}, skipping...`);
        continue;
      }

      // Rename the file
      fs.renameSync(filePath, newFilePath);
      console.log(`✅ Renamed: ${filename} → ${newFilename}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error processing ${filename}:`, errorMessage);
    }
  }

  console.log('🎉 Renaming complete!');
}

// Run the script
renamePostsByDate().catch(console.error);

export { renamePostsByDate };
