import * as core from '@actions/core';
import { FirehoseClient } from '@aws-sdk/client-firehose';
import {
  sendRecord,
  RecordConfig
} from './firehose';

async function run(): Promise<void> {
  try {
    // Get inputs
    const streamName = core.getInput('stream-name', { required: true });
    const data = core.getInput('data', { required: true });

    core.info('AWS Firehose Send Message');
    core.info(`Stream Name: ${streamName}`);

    // Create Firehose client (uses AWS credentials from environment)
    const client = new FirehoseClient({});

    // Build configuration
    const config: RecordConfig = {
      streamName,
      data
    };

    // Send record
    const result = await sendRecord(client, config);

    // Handle result
    if (!result.success) {
      throw new Error(result.error || 'Failed to send record');
    }

    // Set outputs
    if (result.recordId) {
      core.setOutput('record-id', result.recordId);
    }

    // Summary
    core.info('');
    core.info('='.repeat(50));
    core.info('Record sent successfully');
    if (result.recordId) {
      core.info(`Record ID: ${result.recordId}`);
    }
    core.info('='.repeat(50));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(errorMessage);
  }
}

run();
