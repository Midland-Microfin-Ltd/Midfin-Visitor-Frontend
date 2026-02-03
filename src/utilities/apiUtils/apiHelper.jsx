import apiClient from '../axiosConfig';

/**
 * Login user
 * @param {Object} credentials
 * @returns {Promise}
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Submit visitor request
 * @param {Object} visitorData
 * @returns {Promise}
 */
export const submitVisitorRequest = async (visitorId, visitorData) => {
  try {
    const response = await apiClient.post(
      `/api/v1/visitor/visitor-request/${visitorId}`, 
      visitorData
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Send OTP
 * @param {Object} data
 * @param {string} data.phoneNo
 * @returns {Promise}
 */
export const sendOtp = async (data) => {
  try {
    const response = await apiClient.post('/api/v1/auth/sendOtp', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP
 * @param {Object} params
 * @param {string} params.txnId
 * @param {string|number} params.otp
 * @returns {Promise}
 */
export const verifyOtp = async ({ txnId, otp }) => {
  try {
    const response = await apiClient.get(
      `/api/v1/auth/verifyOtp?txnId=${txnId}&otp=${otp}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.pageSize
 * @returns {Promise}
 */
export const getVisitorRequests = async ({ page, pageSize }) => {
  try {
    const response = await apiClient.get(
      `/api/v1/visitor/visitor-requests/${page}/${pageSize}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};


/**
 * @returns {Promise}
 */
export const getDepartments = async () => {
  try {
    const response = await apiClient.get(
      '/api/v1/admin/department'
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * @returns {Promise}
 */
export const getBuildings = async () => {
  try {
    const response = await apiClient.get(
      '/api/v1/admin/buildings'
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * @param {Object} buildingData
 * @param {string} buildingData.buildingType  
 * @param {string} buildingData.name
 * @param {string} buildingData.address
 * @returns {Promise}
 */
export const updateBuilding = async (buildingData) => {
  try {
    const response = await apiClient.post(
      '/api/v1/admin/buidling',
      buildingData
    );
    return response;
  } catch (error) {
    throw error;
  }
};


/**
 * @param {Object} visitorActionData
 * @param {string} visitorActionData.visitorId
 * @param {string} visitorActionData.status   
 * @param {string} visitorActionData.comment
 * @param {number} [visitorActionData.guestHouseId]
 * @returns {Promise}
 */
export const takeVisitorAction = async (visitorActionData) => {
  try {
    const response = await apiClient.post(
      '/api/v1/visitor/visitor-request-action',
      visitorActionData
    );
    return response;
  } catch (error) {
    throw error;
  }
};


/**
 * @param {Object} params
 * @param {string} params.visitorId
 * @returns {Promise}
 */
export const generateVisitorPass = async ({ visitorId }) => {
  try {
    const response = await apiClient.get(
      `/api/v1/visitor/visitor-pass/${visitorId}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Submit visitor selfie
 * @param {File} selfieFile
 * @returns {Promise}
 */
export const submitVisitorSelfie = async (selfieFile) => {
  try {
    const formData = new FormData();
    formData.append('selfie', selfieFile);

    const response = await apiClient.post(
      '/api/v1/visitor/visitor-selfie',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get visitor status by ID
 * @param {string} visitorId
 * @returns {Promise}
 */
export const getVisitorStatus = async (visitorId) => {
  try {
    const response = await apiClient.get(
      `/api/v1/visitor/visitor-pass/${visitorId}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};
