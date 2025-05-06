import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { User, Authorization } from '../../server/models';

describe('User', () => {
  describe('initialization', () => {
    let user: User;
    
    beforeEach(() => {
      user = new User({
        email: 'test@example.com',
        name: 'Test User',
        uid: '12345',
        authorizations: []
      });
    });

    it('initializes_with_the_correct_properties', () => {
      expect(user.email).toBe('test@example.com');
    });

    it('initializes_name_correctly', () => {
      expect(user.name).toBe('Test User');
    });

    it('initializes_uid_correctly', () => {
      expect(user.uid).toBe('12345');
    });

    it('initializes_empty_authorizations_array', () => {
      expect(user.authorizations).toEqual([]);
    });

    it('initializes_email_as_lowercase', () => {
      const upperCaseUser = new User({
        email: 'TEST@EXAMPLE.COM',
      });
      
      expect(upperCaseUser.email).toBe('test@example.com');
    });

    it('defaults_empty_email_to_empty_string', () => {
      const noEmailUser = new User({});
      
      expect(noEmailUser.email).toBe('');
    });

    it('defaults_uid_to_empty_string', () => {
      const noUidUser = new User({});
      
      expect(noUidUser.uid).toBe('');
    });

    it('defaults_authorizations_to_empty_array', () => {
      const noAuthUser = new User({});
      
      expect(noAuthUser.authorizations).toEqual([]);
    });
  });

  describe('addAuthorization', () => {
    let user: User;
    let auth: Authorization;
    
    beforeEach(() => {
      user = new User({
        email: 'test@example.com'
      });
      
      auth = new Authorization({
        sku: 'test-sku',
        email: 'test@example.com'
      });
    });

    it('adds_authorization_to_empty_array', () => {
      user.addAuthorization(auth);
      
      expect(user.authorizations?.length).toBe(1);
    });

    it('adds_authorization_to_existing_array', () => {
      // First add one authorization
      user.addAuthorization(auth);
      
      // Then add another
      const secondAuth = new Authorization({
        sku: 'second-sku',
        email: 'test@example.com'
      });
      
      user.addAuthorization(secondAuth);
      
      expect(user.authorizations?.length).toBe(2);
    });
  });

  describe('isAuthorizedFor', () => {
    let user: User;
    
    beforeEach(() => {
      user = new User({
        email: 'test@example.com',
        authorizations: [
          new Authorization({
            sku: 'test-sku',
            email: 'test@example.com'
          }),
          new Authorization({
            sku: 'another-sku',
            email: 'test@example.com'
          })
        ]
      });
    });

    it('returns_true_for_authorized_sku', () => {
      expect(user.isAuthorizedFor('test-sku')).toBe(true);
    });

    it('returns_false_for_unauthorized_sku', () => {
      expect(user.isAuthorizedFor('unknown-sku')).toBe(false);
    });

    it('returns_false_when_authorizations_is_empty', () => {
      const noAuthUser = new User({
        email: 'test@example.com',
        authorizations: []
      });
      
      expect(noAuthUser.isAuthorizedFor('test-sku')).toBe(false);
    });

    it('returns_false_when_authorizations_is_undefined', () => {
      const noAuthUser = new User({
        email: 'test@example.com',
        authorizations: undefined
      });
      
      expect(noAuthUser.isAuthorizedFor('test-sku')).toBe(false);
    });
  });

  describe('getDownloads', () => {
    beforeEach(() => {
      // Mock the Authorization.filter static method
      jest.spyOn(Authorization, 'filter').mockImplementation(async ({ email }) => {
        if (email === 'test@example.com') {
          return [
            new Authorization({
              sku: 'test-sku',
              email: 'test@example.com',
              download: 'test-download.pdf'
            }),
            new Authorization({
              sku: 'another-sku',
              email: 'test@example.com',
              download: 'another-download.pdf'
            }),
            new Authorization({
              sku: 'no-download-sku',
              email: 'test@example.com',
              download: ''
            })
          ];
        }
        return [];
      });

      // Mock the getDownloadUrl method on Authorization
      jest.spyOn(Authorization.prototype, 'getDownloadUrl').mockImplementation(async function(this: Authorization) {
        return this.download ? `https://example.com/downloads/${this.download}` : '';
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns_downloads_for_email', async () => {
      const downloads = await User.getDownloads('test@example.com');
      
      expect(downloads.length).toBe(2);
    });

    it('returns_empty_array_for_unknown_email', async () => {
      const downloads = await User.getDownloads('unknown@example.com');
      
      expect(downloads.length).toBe(0);
    });

    it('converts_email_to_lowercase', async () => {
      const downloads = await User.getDownloads('TEST@EXAMPLE.COM');
      
      expect(downloads.length).toBe(2);
    });

    it('filters_out_items_with_empty_download_urls', async () => {
      const downloads = await User.getDownloads('test@example.com');
      
      // Should only include items that have a download URL
      const hasEmptyDownload = downloads.some(auth => !auth.download);
      expect(hasEmptyDownload).toBe(false);
    });
  });
});