// Mock for firebase-admin/firestore module

const mockFirestore = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      get: async () => ({
        exists: true,
        data: () => ({
          id: docId,
          createdAt: new Date()
        })
      }),
      set: async (data) => {
        return;
      },
      update: async (data) => {
        return;
      },
      delete: async () => {
        return;
      }
    }),
    add: async (data) => {
      return {
        id: 'mock-doc-id'
      };
    },
    where: () => ({
      get: async () => ({
        empty: false,
        docs: []
      })
    })
  })
};

export const getFirestore = () => mockFirestore;
