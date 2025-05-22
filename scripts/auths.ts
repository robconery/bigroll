import { Order, Authorization } from "../server/models/";

const email = "edgarmonarrez@gmail.com";

const go = async () => {
  //find orders for the above email
  const orders = await Order.filter({ email: email.toLowerCase() });

  //now find authorizations for each order
  const authorizations = [];
  for (let order of orders) {
    const auths = await order.getAuthorizations();
    for (let auth of auths) {
      authorizations.push({
        id: auth.id,
        sku: auth.sku,
        date: auth.date,
      });
    }
  }
  console.log(orders.map((o) => o.number));
  console.log(authorizations);
};

go().then((res) => {
  console.log(res);
});
