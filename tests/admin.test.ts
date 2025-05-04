import { saveOrder } from '../server/lib/admin';
import fixtureData from './support/thrive.json';
import * as firefly from '../server/lib/firefly.cjs';
import { jest, describe, it, expect, afterAll } from '@jest/globals';

// Set up a unique identifier for our test runs to avoid conflicts
const TEST_PREFIX = `TEST-${Date.now()}`;

describe('saveOrder function', () => {


  it('should save order data to Firestore and create authorizations', async () => {
    // Arrange
    const orderData = structuredClone(fixtureData);
    // Modify the test data to use our test prefix
    orderData.order.id = `9999999999999`;
    
    // Act
    const result = await saveOrder(orderData);
    const orderNumber = `RED4-${orderData.order.id.slice(-8)}`;
    
    // Assert
    // Verify the order was saved correctly
    const savedOrder = await firefly.get('orders', orderNumber);
    expect(savedOrder).toBeTruthy();
    if (savedOrder) {
      expect(savedOrder.email).toBe(orderData.customer.email.toLowerCase());
      expect(savedOrder.slug).toBe(orderData.base_product_label);
    }
    
    // Verify authorization was created
    const auth = await firefly.get('authorizations', `${orderData.customer.email}-acclerator-book`);
    expect(auth).toBeTruthy();
    if (auth) {
      expect(auth.email).toBe(orderData.customer.email);
      expect(auth.sku).toBe('acclerator-book');
    }
    
  });

  it('should handle error when offer is not found', async () => {
    // Arrange
    const orderData = structuredClone(fixtureData);
    // Use a non-existent order ID
    orderData.order.id = `1010101010101`;
    
    // Act
    const result = await saveOrder(orderData);
    const orderNumber = `RED4-${orderData.order.id.slice(-8)}`;

    // Assert
    expect(result).toBe('Offer not found');
    
    // Verify the order was still saved
    const savedOrder = await firefly.get('offers', orderNumber);
    expect(savedOrder).toBeTruthy();
  });

  it('should handle exceptions properly', async () => {
    // Arrange
    const originalUpdateOne = firefly.updateOne;
    
    // Create a spy that will throw an error
    jest.spyOn(firefly, 'updateOne').mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });
    
    const orderData = structuredClone(fixtureData);
    orderData.order.id = `${TEST_PREFIX}-error`;
    
    // Act & Assert
    await expect(saveOrder(orderData)).rejects.toThrow('Database connection failed');
    
    // Restore the original function
    jest.spyOn(firefly, 'updateOne').mockRestore();
  });
});