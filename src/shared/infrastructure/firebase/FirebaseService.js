import pino from 'pino';

const logger = pino({ name: 'firebase' });

let firebaseAdmin = null;

const getFirebaseAdmin = async () => {
  if (firebaseAdmin) return firebaseAdmin;

  try {
    const admin = await import('firebase-admin');
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      logger.warn(
        'Firebase not configured (missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY). Push notifications disabled.'
      );
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    });

    firebaseAdmin = admin;
    logger.info('Firebase initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    logger.error(error, 'Failed to initialize Firebase');
    return null;
  }
};

export class FirebaseService {
  /**
   * @param {string[]} tokens - Array of FCM device tokens
   * @param {{ title: string, body: string, data?: Object }} notification
   */
  async sendMulticast(tokens, { title, body, data = {} }) {
    try {
      const admin = await getFirebaseAdmin();
      if (!admin) return { success: false, reason: 'firebase-not-configured' };

      const validTokens = tokens.filter(Boolean);
      if (validTokens.length === 0) return { success: false, reason: 'no-tokens' };

      const message = {
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      };

      const response = await admin.messaging().sendEachForMulticast({
        tokens: validTokens,
        ...message
      });

      const results = {
        success: response.successCount,
        failure: response.failureCount,
        total: validTokens.length
      };

      if (response.failureCount > 0) {
        response.responses.forEach((resp, i) => {
          if (!resp.success) {
            logger.warn(
              { token: validTokens[i].slice(0, 10), error: resp.error?.message },
              'FCM send failed for token'
            );
          }
        });
      }

      return results;
    } catch (error) {
      logger.error(error, 'Error sending push notification');
      return { success: false, reason: 'error', error: error.message };
    }
  }

  /**
   * @param {string} token
   * @param {{ title: string, body: string, data?: Object }} notification
   */
  async sendToDevice(token, { title, body, data = {} }) {
    try {
      const admin = await getFirebaseAdmin();
      if (!admin || !token) return { success: false };

      await admin.messaging().send({
        token,
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      });

      return { success: true };
    } catch (error) {
      logger.warn({ error: error.message }, 'Error sending push to device');
      return { success: false, error: error.message };
    }
  }
}

export default new FirebaseService();
