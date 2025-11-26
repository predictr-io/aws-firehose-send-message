import {
  FirehoseClient,
  PutRecordCommand,
  PutRecordCommandInput
} from '@aws-sdk/client-firehose';
import * as core from '@actions/core';

export interface RecordConfig {
  streamName: string;
  data: string;
}

export interface RecordResult {
  success: boolean;
  recordId?: string;
  error?: string;
}

/**
 * Validate stream name
 */
export function validateStreamName(streamName: string): void {
  if (!streamName || streamName.trim().length === 0) {
    throw new Error('Stream name cannot be empty');
  }

  if (streamName.length > 64) {
    throw new Error(`Stream name exceeds maximum length of 64 characters (got ${streamName.length})`);
  }

  const validPattern = /^[a-zA-Z0-9_.-]+$/;
  if (!validPattern.test(streamName)) {
    throw new Error(
      `Stream name "${streamName}" contains invalid characters. Only alphanumeric characters, hyphens, underscores, and periods are allowed.`
    );
  }
}

/**
 * Validate data size (max 1000 KB)
 */
export function validateData(data: string): void {
  const sizeInBytes = Buffer.byteLength(data, 'utf8');
  const maxSizeBytes = 1000 * 1024; // 1000 KB

  if (sizeInBytes > maxSizeBytes) {
    throw new Error(
      `Data size (${sizeInBytes} bytes) exceeds maximum allowed size (${maxSizeBytes} bytes / 1000 KB)`
    );
  }
}

/**
 * Send a record to a Firehose delivery stream
 */
export async function sendRecord(
  client: FirehoseClient,
  config: RecordConfig
): Promise<RecordResult> {
  try {
    // Validate inputs
    validateStreamName(config.streamName);
    validateData(config.data);

    core.info(`Sending record to stream: ${config.streamName}`);
    core.info(`Data size: ${Buffer.byteLength(config.data, 'utf8')} bytes`);

    // Build command input
    const input: PutRecordCommandInput = {
      DeliveryStreamName: config.streamName,
      Record: {
        Data: Buffer.from(config.data, 'utf8')
      }
    };

    // Send record
    const command = new PutRecordCommand(input);
    const response = await client.send(command);

    core.info('✓ Record sent successfully');
    if (response.RecordId) {
      core.info(`Record ID: ${response.RecordId}`);
    }

    return {
      success: true,
      recordId: response.RecordId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(`Failed to send record: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
}
