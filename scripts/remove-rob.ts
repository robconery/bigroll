import "dotenv/config";
import { Order } from "../server/models";
import chalk from "chalk";

/**
 * 🗑️ Script to remove all orders for a specific email address
 */

const TARGET_EMAIL = "robconery+choke@gmail.com";

async function removeOrdersByEmail() {
  try {
    console.log(chalk.bold.yellow('🗑️  Order Removal Script'));
    console.log(chalk.gray(`Target email: ${TARGET_EMAIL}`));
    console.log('');

    // Find all orders for the target email
    console.log(chalk.cyan('Searching for orders...'));
    const orders = await Order.filter({ email: TARGET_EMAIL });
    
    if (orders.length === 0) {
      console.log(chalk.green('✅ No orders found for this email address'));
      return;
    }

    console.log(chalk.yellow(`📋 Found ${orders.length} orders to remove:`));
    console.log('');

    // Display orders before deletion
    for (const order of orders) {
      console.log(chalk.bold.white(`  Order #${order.number || order.id}`));
      console.log(chalk.gray(`    Slug: ${order.slug || 'N/A'}`));
      console.log(chalk.gray(`    Total: ${order.total ? `$${order.total}` : 'N/A'}`));
      console.log(chalk.gray(`    Date: ${order.date || 'N/A'}`));
      console.log('');
    }

    // Confirm deletion
    console.log(chalk.bold.red('⚠️  WARNING: This will permanently delete all these orders!'));
    console.log(chalk.gray('Press Ctrl+C to cancel, or continue to proceed...'));
    console.log('');

    // Delete each order
    let deletedCount = 0;
    for (const order of orders) {
      try {
        await order.delete();
        console.log(chalk.green(`✅ Deleted order #${order.number || order.id}`));
        deletedCount++;
      } catch (error) {
        console.log(chalk.red(`❌ Failed to delete order #${order.number || order.id}: ${error}`));
      }
    }

    console.log('');
    console.log(chalk.bold.green(`🎉 Successfully deleted ${deletedCount} out of ${orders.length} orders`));

    if (deletedCount < orders.length) {
      console.log(chalk.yellow(`⚠️  ${orders.length - deletedCount} orders failed to delete`));
    }

  } catch (error) {
    console.error(chalk.red('❌ Error removing orders:'), error);
  }
}

// Run the script
removeOrdersByEmail()
  .then(() => {
    console.log(chalk.gray('Script completed'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red('Script failed:'), error);
    process.exit(1);
  });
