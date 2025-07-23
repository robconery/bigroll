//set up the default program
import "dotenv/config";
import { Order, Authorization, User, Subscription, Offer } from "../server/models/";
import { DB } from "../server/lib/firefly";
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

//create a command to grant a subscription to a user
program.command("subscription:yearly [email] [end]")
  .description("Subscribe a user to a yearly plan")
  .action(async (email, end) => {
    try {
      if (!email) {
        console.log(chalk.red.bold('Error: email is required'));
        return;
      }
      if(end){
        
        end = new Date(end); // Convert to seconds
      }else{
        //parse the end date from a string
        //const endDate = Date.parse(end);
        end = new Date(Date.now() + 31536000000);
      }
      const plan = "yearly";
      const interval = "year";
      // Check if the user already has an active subscription
      const existingSubscription = await Subscription.find({ email: email.toLowerCase()});
      if (existingSubscription) {
        //bump the sub a year
        DB.updateOne("subscriptions", email, {
          current_period_start: new Date(),
          current_period_end: end,
          status: 'active',
        });
        
        // existingSubscription.current_period_start = {seconds: Math.floor(Date.now() / 1000)};
        // existingSubscription.current_period_end = end; // 1 year in seconds
        // existingSubscription.status = 'active';
        // await existingSubscription.save();
        console.log(chalk.bold.green('➤ ') + chalk.bold.white(`Subscription updated for ${email}`));
        console.log(keyValue('  Start Date', formatDate(existingSubscription.current_period_start), 2));
        console.log(keyValue('  End Date', formatDate(existingSubscription.current_period_end), 2));
        return;
      }
      // Create a new subscription// 1 year in milliseconds
      const subscription = await DB.updateOne("subscriptions", email,{
        id: email.toLowerCase(),
        email: email.toLowerCase(),
        plan: plan,
        date: new Date(),
        interval: interval,
        status: 'active',
        current_period_start: new Date(),
        current_period_end: end, // 1 year in milliseconds
        stripe_sub_id: null, // Set if using Stripe
        stripe_customer_id: null, // Set if using Stripe
        store: "rob",
      });
      console.log(chalk.bold.green('➤ ') + chalk.bold.white(`Subscription created for ${email}`));
      console.log(keyValue('  Plan', plan, 2));
      console.log(keyValue('  Interval', interval, 2));
      console.log(keyValue('  Start Date', formatDate(new Date()), 2));
      console.log(keyValue('  End Date', formatDate(end), 2));
      console.log(divider());
    } catch (error) {
      console.error("Error subscribing user:", error);
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

program.command("order:authorize [number]")
  .description("Create a new order")
  .action(async (number) => {
    try {
      if (!number) {
        console.log(chalk.red.bold('Error:  are required'));
        return;
      }
      // Fetch the order by number
      const order = await Order.find({ number: number });
      if (!order) {
        console.log(chalk.red.bold(`Error: Order with number ${number} not found`));
        return;
      }
      // Fetch the offer by slug
      const offer = await Offer.find({ slug: order.slug });
      if (!offer) {
        console.log(chalk.red.bold(`Error: Offer with slug ${order.slug} not found`));
        return;
      }
      // Create a new authorization for each deliverable
      for (let sku of offer.deliverables) {
        const id = `${order.email.toLowerCase()}-${sku}`;
        const authorization = await Authorization.create({
          id,
          email: order.email.toLowerCase(),
          sku: sku,
          date: new Date().toISOString(),
          order: order.number, // Associate with the order
          store: "rob",
        });
        console.log(chalk.bold.green('➤ ') + chalk.bold.white(`Authorization granted for ${id}`));
      }
      console.log(divider());
    } catch (error) {
      console.error("Error authorizing order:", error);
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

program.command("reports:monthly [month] [year]")
  .description("📊 Show monthly sales report with offer rollup and totals")
  .action(async (month, year) => {
    try {
      const now = new Date();
      const targetMonth = month ? parseInt(month) : (now.getMonth() + 1); // 1-based month
      const targetYear = year ? parseInt(year) : now.getFullYear();
      
      if (targetMonth < 1 || targetMonth > 12) {
        console.log(chalk.red.bold('Error: Month must be between 1 and 12'));
        return;
      }
      
      // Create date range for the month
      const startDate = new Date(targetYear, targetMonth - 1, 1); // Start of month
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999); // End of month
      
      console.log(header(`Monthly Sales Report - ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`));
      console.log(keyValue('Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 0));
      console.log(divider());
      
      // Fetch only orders within the date range using Firestore queries
      const monthlyOrders = await DB.whereAnd("orders", [
        { key: "date", op: ">=", val: startDate.toISOString() },
        { key: "date", op: "<=", val: endDate.toISOString() }
      ]);
      
      if (monthlyOrders.length === 0) {
        console.log(chalk.italic('No orders found for this month'));
        return;
      }
      
      // Create offer rollup
      const offerRollup = new Map();
      let grandTotal = 0;
      
      for (const order of monthlyOrders) {
        const slug = order.slug || 'Unknown Offer';
        const total = order.total || 0;
        
        if (offerRollup.has(slug)) {
          const existing = offerRollup.get(slug);
          existing.count += 1;
          existing.total += total;
        } else {
          offerRollup.set(slug, {
            count: 1,
            total: total
          });
        }
        
        grandTotal += total;
      }
      
      // Display rollup
      console.log(chalk.bold.cyan('📈 Offer Summary:'));
      console.log('');
      
      // Sort by total revenue (highest first)
      const sortedOffers = Array.from(offerRollup.entries()).sort((a, b) => b[1].total - a[1].total);
      
      for (const [slug, data] of sortedOffers) {
        console.log(chalk.bold.blue(`${data.count} x 💰: ${chalk.bold.white(slug)} - $${data.total.toFixed(2)} `));
      }
      
      console.log(divider());
      console.log(chalk.bold.green('📊 Monthly Totals:'));
      console.log(keyValue('  Total Orders', monthlyOrders.length.toString(), 2));
      console.log(keyValue('  Total Revenue', `$${grandTotal.toFixed(2)}`, 2));
      console.log(keyValue('  Unique Offers', offerRollup.size.toString(), 2));
      console.log(divider());
      
    } catch (error) {
      console.error("Error generating monthly report:", error);
    }
  });

program.command("reports:orders [month] [year]")
  .description("📋 List all orders for a specific month with details")
  .action(async (month, year) => {
    try {
      const now = new Date();
      const targetMonth = month ? parseInt(month) : (now.getMonth() + 1); // 1-based month
      const targetYear = year ? parseInt(year) : now.getFullYear();
      
      if (targetMonth < 1 || targetMonth > 12) {
        console.log(chalk.red.bold('Error: Month must be between 1 and 12'));
        return;
      }
      
      // Create date range for the month
      const startDate = new Date(targetYear, targetMonth - 1, 1); // Start of month
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999); // End of month
      
      console.log(header(`Orders List - ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`));
      console.log(keyValue('Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 0));
      console.log(divider());
      
      // Fetch only orders within the date range using Firestore queries
      const monthlyOrders = await DB.whereAnd("orders", [
        { key: "date", op: ">=", val: startDate.toISOString() },
        { key: "date", op: "<=", val: endDate.toISOString() }
      ]);
      
      if (monthlyOrders.length === 0) {
        console.log(chalk.italic('No orders found for this month'));
        return;
      }
      
      // Sort orders by date (newest first)
      monthlyOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log(chalk.bold.cyan(`📋 Found ${monthlyOrders.length} orders:`));
      console.log('');
      
      // Display table header
      console.log(chalk.bold.white('Order #'.padEnd(12)) + 
                  chalk.bold.white('Email'.padEnd(30)) + 
                  chalk.bold.white('Offer'.padEnd(20)) + 
                  chalk.bold.white('Amount'.padEnd(12)) + 
                  chalk.bold.white('Date'));
      console.log('─'.repeat(12) + '─'.repeat(30) + '─'.repeat(20) + '─'.repeat(12) + '─'.repeat(12));
      
      // Display orders in table format
      for (const order of monthlyOrders) {
        const orderNum = (order.number || order.id || 'N/A').toString().substring(0, 11).padEnd(12);
        const email = (order.email || 'N/A').substring(0, 29).padEnd(30);
        const slug = (order.slug || 'N/A').substring(0, 19).padEnd(20);
        const amount = order.total ? `$${order.total.toFixed(2)}`.padEnd(12) : 'N/A'.padEnd(12);
        const date = formatDate(order.date).substring(0, 11);
        
        console.log(chalk.yellow(orderNum) + 
                    chalk.white(email) + 
                    chalk.cyan(slug) + 
                    chalk.green(amount) + 
                    chalk.gray(date));
      }
      
      console.log('');
      console.log(divider());
      
    } catch (error) {
      console.error("Error listing orders:", error);
    }
  });

// Parse command line arguments
program.parse(process.argv);

