import { describe, it, expect, beforeEach, afterEach, jest, beforeAll } from '@jest/globals';
import { Order, Authorization, Offer } from '../../server/models';
//import the thrive.json data file
import thriveOrder from '../support/thrive.json';

describe('Thrive Order Processing', () => {
  let order: Order;
  let authorizations: Authorization[];
  beforeAll(async () => {
    [order, authorizations] = await Order.saveThriveOrder(thriveOrder);
  });
  it('creates_an_order_with_correct_data', async () => {
    expect(order.number).toBe(`RED4-${thriveOrder.order.id.slice(-8)}`);
    expect(order.store).toBe('thrivecart');
    //expect(order.total).toBe(thriveOrder.order.total / 100); // Converting cents to dollars
  });
  it('creates_authorization_with_correct_data', async () => {
    expect(authorizations.length).toBe(2);
  });
})