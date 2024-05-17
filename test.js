const axios = require('axios');

// Function to update external API
const updateExternalAPI = async () => {
  try {
    // Make a request to the external API
    const response = await axios.post('http://erp.test/api/timieline_store', {
      // Add any data to be sent in the request body
    });

    // Handle the response from the external API
    console.log('API Updated:', response.data);
  } catch (error) {
    // Handle errors if the request fails
    console.error('Error updating API:', error.message);
  }
};

// Set up a timer to update the external API every minute
const interval = 60000; // 1 minute in milliseconds

// Function to update the API at regular intervals
const updateAPIInterval = () => {
  // Call the updateExternalAPI function immediately
  updateExternalAPI();

  // Set up an interval to call the updateExternalAPI function every minute
  setInterval(updateExternalAPI, interval);
};

// Start the update process
updateAPIInterval();
