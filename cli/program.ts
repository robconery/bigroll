//set up the default program
import "dotenv/config";
import { Order, Authorization, User, Subscription } from "../server/models/";
import { formatDate, header, keyValue, divider, formatStatus } from "./util";
import { program } from "commander";
import chalk from "chalk";

const thriveAPI = "https://thrivecart.com/api/external/";

program.version("1.0.0");
program.description("A CLI for the project");

//create a routine that finds a customer based on email and orders
program
  .command("find [email]")
  .description("Get user information by email")
  .action(async (email) => {
    try {
      if (!email) {
        console.log(chalk.red.bold('Error: Email is required'));
        return;
      }

      
      // Get authorizations
      const authorizations = await Authorization.filter({ email });
      console.log(header(`Authorizations (${authorizations.length})`));
      if (authorizations.length > 0) {
        for (const auth of authorizations) {
          console.log(chalk.bold.green('➤ ') + chalk.bold.white(auth.sku));
          console.log(keyValue('  Date', formatDate(auth.date), 2));
          if (auth.order) console.log(keyValue('  Order', auth.order, 2));
          console.log(divider());
        }
      } else {
        console.log(chalk.italic('No authorizations found'));
      }
      
      // Get orders
      const orders = await Order.filter({ email });
      console.log(header(`Orders (${orders.length})`));
      if (orders.length > 0) {
        for (const order of orders) {
          console.log(chalk.bold.yellow('🛒 ') + chalk.bold.white(`${order.number}`));
          console.log(keyValue('  Date', formatDate(order.date), 2));
          console.log(keyValue('  Offer', order.offer || 'N/A', 2));
          if (order.status) console.log(keyValue('  Slug', order.slug, 2));
          if (order.total) console.log(keyValue('  Total', `$${order.total}`, 2));
          console.log(divider());
        }
      } else {
        console.log(chalk.italic('No orders found'));
      }
      
      // Get subscriptions
      const subscriptions = await Subscription.filter({ email });
      console.log(header(`Subscriptions (${subscriptions.length})`));
      if (subscriptions.length > 0) {
        for (const sub of subscriptions) {
          console.log(chalk.bold.magenta('💎 ') + chalk.bold.white(sub.plan));
          console.log(keyValue('  Status', formatStatus(sub.status || "active"), 2));
          console.log(keyValue('  Interval', sub.interval, 2));
          
          const endDate = sub.getEndDate();
          console.log(keyValue('  Current period ends', formatDate(endDate), 2));
          console.log(keyValue('  Is active', sub.isActive() ? chalk.green('Yes') : chalk.red('No'), 2));
          console.log(keyValue('  Stripe ID', sub.stripe_sub_id, 2));
          console.log(divider());
        }
      } else {
        console.log(chalk.italic('No subscriptions found'));
      }
      
    } catch (error) {
      console.error("Error fetching user information:", error);
    }
  });

program
  .command("thrive:latest (term)")
  .action(async (term) => {
    try {
      // Fetch the latest orders from ThriveCart
      let url = `${thriveAPI}transactions?page=1&perPage=25&query=&transactionType=any`;
      if (term) {
        url = `${thriveAPI}transactions?page=1&perPage=25&query=${term}&transactionType=any`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.THRIVECART_API_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching data from ThriveCart: ${response.statusText}`);
      }
      const res = await response.json();
      const orders = res.transactions || [];

      console.log(header(`ThriveCart Orders (${orders.length})`));
      if (orders.length > 0) {
        for (const order of orders) {
          console.log(chalk.bold.yellow('🛒 ') + chalk.bold.white(`${order.order_id}`));
          console.log(keyValue('  Name', order.customer.name, 2));
          console.log(keyValue('  Email', order.customer.email, 2));
          console.log(keyValue('  Date', formatDate(order.date), 2));
          console.log(keyValue('  Offer', order.item_name || 'N/A', 2));
          if (order.total) console.log(keyValue('  Total', `$${order.total}`, 2));
          console.log(divider());
        }
      }
      else {
        console.log(chalk.italic('No orders found'));
      }
    } catch (error) {
      console.error("Error fetching ThriveCart orders:", error);
    }
  });

// Parse command line arguments
program.parse(process.argv);

