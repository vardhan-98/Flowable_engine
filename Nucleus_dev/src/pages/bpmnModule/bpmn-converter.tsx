/**
 * BPMN Converter for Camunda ↔ Flowable format conversions (TypeScript version)
 */

const CAMUNDA_URI = 'http://camunda.org/schema/1.0/bpmn';
const FLOWABLE_URI = 'http://flowable.org/bpmn';
const CAMUNDA_PREFIX = 'camunda';
const FLOWABLE_PREFIX = 'flowable';

/**
 * Detects if an XML string contains Camunda namespaces
 */
export function isCamundaBpmn(xmlString: string): boolean {
  return xmlString.includes(CAMUNDA_URI) || xmlString.includes('xmlns:camunda=');
}

/**
 * Detects if an XML string contains Flowable namespaces
 */
export function isFlowableBpmn(xmlString: string): boolean {
  return xmlString.includes(FLOWABLE_URI) || xmlString.includes('xmlns:flowable=');
}

/**
 * Converts a Flowable BPMN XML to Camunda format
 */
export function convertFlowableToCamunda(xmlString: string): string {
  let converted = xmlString;

  // Replace xmlns declarations
  converted = converted.replace(
    new RegExp(`xmlns:${FLOWABLE_PREFIX}="${FLOWABLE_URI}"`, 'g'),
    `xmlns:${CAMUNDA_PREFIX}="${CAMUNDA_URI}"`
  );

  // Replace attribute prefixes (e.g., flowable:class -> camunda:class)
  converted = converted.replace(
    new RegExp(`\\b${FLOWABLE_PREFIX}:`, 'g'),
    `${CAMUNDA_PREFIX}:`
  );

  // Update exporter information if present
  converted = converted.replace(
    /exporter="[^"]*"/g,
    'exporter="Camunda Modeler"'
  );

  converted = converted.replace(
    /exporterVersion="[^"]*"/g,
    'exporterVersion="5.0.0"'
  );

  return converted;
}

/**
 * Converts a Camunda BPMN XML to Flowable format
 */
export function convertCamundaToFlowable(xmlString: string): string {
  let converted = xmlString;

  // Replace xmlns declarations
  converted = converted.replace(
    new RegExp(`xmlns:${CAMUNDA_PREFIX}="${CAMUNDA_URI}"`, 'g'),
    `xmlns:${FLOWABLE_PREFIX}="${FLOWABLE_URI}"`
  );

  // Replace attribute prefixes (e.g., camunda:class -> flowable:class)
  converted = converted.replace(
    new RegExp(`\\b${CAMUNDA_PREFIX}:`, 'g'),
    `${FLOWABLE_PREFIX}:`
  );

  // Update exporter information
  converted = converted.replace(
    /exporter="[^"]*"/g,
    'exporter="Flowable Modeler"'
  );

  converted = converted.replace(
    /exporterVersion="[^"]*"/g,
    'exporterVersion="1.0.0"'
  );

  // Namespace and exporter changes should suffice for basic conversion
  return converted;
}

/**
 * Processes XML for uploading - converts Flowable to Camunda if needed
 */
export function processBpmnForUpload(xmlString: string): string {
  if (isFlowableBpmn(xmlString)) {
    console.log('Detected Flowable BPMN, converting to Camunda format for editing...');
    return convertFlowableToCamunda(xmlString);
  }
  return xmlString; // Already Camunda or standard BPMN
}

/**
 * Generates Flowable-format BPMN from current Camunda XML
 */
export function generateFlowableBpmn(xmlString: string): string {
  return convertCamundaToFlowable(xmlString);
}
