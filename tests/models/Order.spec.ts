import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Order, Authorization, Offer } from '../../server/models';

describe('Order', () => {
  describe('initialization', () => {
    let order: Order;
    
    beforeEach(() => {
      order = new Order({
        number: 'TEST-12345',
        date: '2023-06-07T18:22:01+00:00',
        name: 'Joy Bubble',
        email: 'test@example.com',
        slug: 'accelerator',
        offer: 'The Imposter\'s Frontend Accelerator',
        store: 'thrivecart',
        total: 2800,
      });
    });

    it('initializes_with_the_correct_properties', () => {
      expect(order.number).toBe('TEST-12345');
    });

    it('initializes_email_as_lowercase', () => {
      const upperCaseOrder = new Order({
        email: 'TEST@EXAMPLE.COM',
      });
      expect(upperCaseOrder.email).toBe('test@example.com');
    });

    it('defaults_status_to_pending', () => {
      expect(order.status).toBe('pending');
    });

    it('uses_current_date_if_none_provided', () => {
      const noDateOrder = new Order({});
      expect(noDateOrder.date).toBeTruthy();
      expect(new Date(noDateOrder.date).getTime()).toBeLessThanOrEqual(new Date().getTime());
    });
  });

});