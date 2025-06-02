//set up the default program
import "dotenv/config";
import { Order, Authorization, User, Subscription, Offer } from "../server/models/";
import { formatDate, header, keyValue, divider, formatStatus } from "./util";
import { program } from "commander";
import chalk from "chalk";
import { sendEmailWithDownloads } from "~/server/lib/email";

const thriveAPI = "https://thrivecart.com/api/external/";
 
program.version("1.0.0");
program.description("A CLI for the project");

program.command("offers")
  .description("List all offers")
  .action(async () => {
    try {
      const offers = await Offer.all();
      console.log(header(`Offers (${offers.length})`));
      if (offers.length > 0) {
        for (const offer of offers) {
          console.log(chalk.bold.blue('📦 ') + chalk.bold.white(offer.name));
          console.log(keyValue('  Slug', offer.slug, 2));
          console.log(keyValue('  Price', `$${offer.price}`, 2));
          console.log(keyValue('  Deliverables', offer.deliverables.join(', '), 2));
          console.log(divider());
        }
      } else {
        console.log(chalk.italic('No offers found'));
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  });

program.command("order [number]")
  .description("Get order information by order number")
  .action(async (number) => {
    try {
      if (!number) {
        console.log(chalk.red.bold('Error: Order number is required'));
        return;
      }
      // Fetch order by number
      const order = await Order.find({number: number});
      if (!order) {
        console.log(chalk.red.bold(`Error: Order with number ${number} not found`));
        return;
      }
      console.log('Order Information:');
      console.log(order._toFirestore());
    } catch (error) {
      console.error("Error fetching order information:", error);
    }
  });

program.command("order:create [email] [number] [slug] [total]")
  .description("Create a new order")
  .action(async (email, number, slug, total) => {
    try {
      if (!email || !number || !slug || !total) {
        console.log(chalk.red.bold('Error: email, number, slug, total are required'));
        return;
      }

      const [order, authorizations] = await Order.createNewOrder({
        email: email.toLowerCase(),
        number: number,
        slug: slug,
        total: parseFloat(total),
        date: new Date().toISOString(),
        store: "rob",
      });
      //authorize
      console.log(chalk.bold.green('➤ ') + chalk.bold.white(`Order created: ${order.number}`));
      console.log(chalk.cyan.bold('Authorizations:'));
      if (authorizations.length > 0) {
        for (const auth of authorizations) {
          console.log(chalk.bold.green('➤ ') + chalk.bold.white(auth.sku));
          console.log(keyValue('  Date', formatDate(auth.date), 2));
          if (auth.order) console.log(keyValue('  Order', auth.order, 2));
          console.log(divider());
        }
      }
      else {
        console.log(chalk.italic('No authorizations created for this order'));
      }
      // Send download links to the user

    } catch (error) {
      console.error("Error creating order:", error);
    }
  });

program.command("grant [email] [slug]")
  .description("Grant a user an authorization for an offer")
  .action(async (email, slug) => {
    try {
      if (!email || !slug) {
        console.log(chalk.red.bold('Error: email and slug are required'));
        return;
      }
      // Fetch the offer by slug
      const offer = await Offer.find({ slug: slug });
      if (!offer) {
        console.log(chalk.red.bold(`Error: Offer with slug ${slug} not found`));
        return;
      }
      // Create a new authorization
      for (let sku of offer.deliverables) {
        const id = `${email.toLowerCase()}-${sku}`;
        const authorization = await Authorization.create({
          id,
          email: email.toLowerCase(),
          sku: sku,
          date: new Date().toISOString(),
          order: null, // No order associated yet
          store: "rob",
        });
        console.log(chalk.bold.green('➤ ') + chalk.bold.white(`Authorization granted for ${id}`));
      }

      
      console.log(divider());
    } catch (error) {
      console.error("Error granting authorization:", error);
    }
  });

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


program.command("change-email [emails] [newEmail]")
  .description("Change the email of a user")
  .action(async (emails, newEmail) => {
    try {
      if (!newEmail) {
        console.log(chalk.red.bold('Error: New email and at least one old email are required'));
        return;
      }
      const oldEmails = emails.split(",");
      if (oldEmails.length === 0) {
        console.log(chalk.red.bold('Error: At least one old email is required'));
        return;
      }
      for (let email of oldEmails) {
        email = email.trim().toLowerCase();
        if (!email) {
          console.log(chalk.red.bold(`Error: Invalid email provided: ${email}`));
          return;
        }

        //     // Find the user by their original email
        const user = await User.find({ email: email });
        if (user) {
          // Update user email
          user.email = newEmail;
          await user.save();
          console.log('User email updated:', email, newEmail);
        }
        // Update all authorizations with the new email
        const authorizations = await Authorization.filter({ email: email });
        for (const auth of authorizations) {
          auth.email = newEmail;
          // Since the ID is based on email-sku, we need to update that too
          auth.id = `${newEmail}-${auth.sku}`;
          auth.date = new Date().toISOString(); // Update date to current time
          await auth.save();
          console.log('Authorization updated:', email, newEmail, auth.id);
        }
        const orders = await Order.filter({ email: email });
        for (const order of orders) {
          order.email = newEmail;

          await order.save();
          console.log('Order updated:', email, newEmail, order.number);
        }

        // Update subscription if exists
        const subscription = await Subscription.find({ email: email });
        if (subscription) {
          subscription.email = newEmail;
          await subscription.save();
          console.log('Subscription updated:', email, newEmail);
        }
      }
    } catch (error) {
      console.error("Error changing email:", error);
    }
  });

program.command("send-downloads [email]")
  .description("Send download links to a user's email")
  .action(async (email) => {
    try {
      if (!email) {
        console.log(chalk.red.bold('Error: Email is required'));
        return;
      }
      await sendEmailWithDownloads(email);
      console.log(chalk.bold.green('➤ ') + chalk.bold.white(`Download links sent to ${email}`));

    } catch (error) {
      console.error("Error sending downloads:", error);
    }
  });

// Parse command line arguments
program.parse(process.argv);

