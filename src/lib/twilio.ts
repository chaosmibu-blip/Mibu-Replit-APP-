import twilio from 'twilio';

interface TwilioCredentials {
  accountSid: string;
  apiKey: string;
  apiKeySecret: string;
  phoneNumber: string | null;
}

async function getCredentials(): Promise<TwilioCredentials> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  
  if (!hostname) {
    throw new Error('REPLIT_CONNECTORS_HOSTNAME not configured');
  }

  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Authentication token not found. Please ensure this is running in a Replit environment.');
  }

  let response: Response;
  try {
    response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
  } catch (error) {
    throw new Error(`Failed to connect to Replit connectors service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch Twilio credentials: HTTP ${response.status} ${response.statusText}`);
  }

  let data: any;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error('Failed to parse Twilio credentials response');
  }

  const connectionSettings = data.items?.[0];

  if (!connectionSettings) {
    throw new Error('Twilio connection not found. Please set up Twilio integration in Replit.');
  }

  const settings = connectionSettings.settings;

  if (!settings?.account_sid || !settings?.api_key || !settings?.api_key_secret) {
    throw new Error('Twilio credentials are incomplete. Please verify your Twilio integration setup.');
  }

  return {
    accountSid: settings.account_sid,
    apiKey: settings.api_key,
    apiKeySecret: settings.api_key_secret,
    phoneNumber: settings.phone_number || null
  };
}

export async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials();
  return twilio(apiKey, apiKeySecret, { accountSid });
}

export async function getTwilioFromPhoneNumber(): Promise<string | null> {
  const { phoneNumber } = await getCredentials();
  return phoneNumber;
}

export async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();

    if (!fromNumber) {
      return { success: false, error: 'No Twilio phone number configured' };
    }

    const result = await client.messages.create({
      body: message,
      to: to,
      from: fromNumber,
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send SMS' 
    };
  }
}
