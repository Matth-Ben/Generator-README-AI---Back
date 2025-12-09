/**
 * Firebase Admin Configuration
 * Server-side initialization with service account credentials
 * 
 * This module initializes the Firebase Admin SDK for:
 * - Token verification (authenticate API requests)
 * - Firestore access (read/write user data)
 * - User management (create users, delete users)
 */

import * as admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 * 
 * Requires FIREBASE_ADMIN_SDK_KEY environment variable containing
 * the complete service account JSON key from Firebase Console
 * 
 * Steps to get service account key:
 * 1. Go to Firebase Console > Project Settings
 * 2. Click "Service Accounts" tab
 * 3. Click "Generate New Private Key"
 * 4. Save the JSON file
 * 5. Convert to string and set as FIREBASE_ADMIN_SDK_KEY env var
 */
function initializeFirebaseAdmin() {
  const adminSdkKeyJson = process.env.FIREBASE_ADMIN_SDK_KEY;

  if (!adminSdkKeyJson) {
    throw new Error(
      'FIREBASE_ADMIN_SDK_KEY environment variable is not set. ' +
      'Please provide your Firebase service account key.'
    );
  }

  try {
    const serviceAccount = JSON.parse(adminSdkKeyJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });

    console.log(`✅ Firebase Admin initialized for project: ${serviceAccount.project_id}`);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Verify Firebase ID token and return decoded token
 * 
 * This function verifies that a token was issued by Firebase
 * and hasn't been tampered with
 * 
 * @param idToken - The Firebase ID token from client
 * @returns Decoded token with user info
 * @throws Error if token is invalid or expired
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired authentication token');
  }
}

/**
 * Get Firestore instance
 * Used to read/write user documents
 */
export function getFirestore() {
  return admin.firestore();
}

/**
 * Get Auth instance
 * Used for user management operations
 */
export function getAuth() {
  return admin.auth();
}

/**
 * Save or update a README markdown document for a user
 * 
 * @param userId - Firebase user ID
 * @param data - Document data (title, markdown, projectName, etc.)
 * @param docId - Document ID (auto-generated if not provided)
 * @param projectSpec - Optional ProjectSpec for editing (full project structure)
 * @returns Document reference with ID
 */
export async function saveMarkdownDocument(
  userId: string,
  data: {
    title: string;
    markdown: string;
    projectName: string;
    description?: string;
    content?: string;
    createdAt?: Date;
    updatedAt: Date;
  },
  docId?: string,
  projectSpec?: any
) {
  const db = getFirestore();
  const userDocsRef = db.collection('users').doc(userId).collection('markdowns');

  try {
    const documentData = {
      ...data,
      // Include ProjectSpec if provided (for editing)
      ...(projectSpec && { projectSpec }),
    };

    if (docId) {
      // Update existing document
      await userDocsRef.doc(docId).update({
        ...documentData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { id: docId, ...documentData };
    } else {
      // Create new document
      const newDocRef = await userDocsRef.add({
        ...documentData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { id: newDocRef.id, ...documentData };
    }
  } catch (error) {
    console.error('Failed to save markdown document:', error);
    throw error;
  }
}

/**
 * Get a specific markdown document
 * 
 * @param userId - Firebase user ID
 * @param docId - Document ID
 * @returns Document data or null
 */
export async function getMarkdownDocument(userId: string, docId: string) {
  const db = getFirestore();
  try {
    const doc = await db
      .collection('users')
      .doc(userId)
      .collection('markdowns')
      .doc(docId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Failed to get markdown document:', error);
    throw error;
  }
}

/**
 * List all markdown documents for a user
 * 
 * @param userId - Firebase user ID
 * @returns Array of documents
 */
export async function listMarkdownDocuments(userId: string) {
  const db = getFirestore();
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('markdowns')
      .orderBy('updatedAt', 'desc')
      .get();

    return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Failed to list markdown documents:', error);
    throw error;
  }
}

/**
 * Update a markdown document
 * 
 * @param userId - Firebase user ID
 * @param docId - Document ID
 * @param data - Data to update
 */
export async function updateMarkdownDocument(
  userId: string,
  docId: string,
  data: {
    projectName?: string;
    description?: string;
    markdown?: string;
    content?: string;
  }
) {
  const db = getFirestore();
  try {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db
      .collection('users')
      .doc(userId)
      .collection('markdowns')
      .doc(docId)
      .update(updateData);

    return { success: true, id: docId };
  } catch (error) {
    console.error('Failed to update markdown document:', error);
    throw error;
  }
}

/**
 * Delete a markdown document
 * 
 * @param userId - Firebase user ID
 * @param docId - Document ID
 */
export async function deleteMarkdownDocument(userId: string, docId: string) {
  const db = getFirestore();
  try {
    await db
      .collection('users')
      .doc(userId)
      .collection('markdowns')
      .doc(docId)
      .delete();
  } catch (error) {
    console.error('Failed to delete markdown document:', error);
    throw error;
  }
}

// Initialize on module load
initializeFirebaseAdmin();

export default admin;
