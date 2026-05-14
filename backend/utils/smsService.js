// Simulated SMS Service (Ready for Twilio/Nexmo integration)
const sendSMS = async (to, message) => {
  try {
    // In a real production environment, you would use:
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({ body: message, from: '+1234567890', to });

    console.log('--- SMS NOTIFICATION SENT ---');
    console.log(`TO: ${to}`);
    console.log(`MESSAGE: ${message}`);
    console.log('-----------------------------');
    
    return { success: true };
  } catch (error) {
    console.error('SMS Sending Failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };
