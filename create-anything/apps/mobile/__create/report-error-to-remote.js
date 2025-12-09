const reportErrorToRemote = async ({ error }) => {
  if (
    !process.env.EXPO_PUBLIC_LOGS_ENDPOINT ||
    !process.env.EXPO_PUBLIC_PROJECT_GROUP_ID ||
    !process.env.EXPO_PUBLIC_CREATE_TEMP_API_KEY
  ) {
    console.debug(
      'reportErrorToRemote: Missing environment variables for logging endpoint, project group ID, or API key.',
      error
    );
    return { success: false };
  }
  
  let serializeError;
  try {
    const serializeErrorModule = await import('serialize-error');
    serializeError = serializeErrorModule.serializeError;
  } catch (importError) {
    // Fallback if serialize-error is not available
    serializeError = (err) => ({
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  }
  
  try {
    await fetch(process.env.EXPO_PUBLIC_LOGS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_CREATE_TEMP_API_KEY}`,
      },
      body: JSON.stringify({
        projectGroupId: process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
        logs: [
          {
            message: JSON.stringify(serializeError(error)),
            timestamp: new Date().toISOString(),
            level: 'error',
          },
        ],
      }),
    });
  } catch (fetchError) {
    return { success: false, error: fetchError };
  }
  return { success: true };
};

module.exports = { reportErrorToRemote };