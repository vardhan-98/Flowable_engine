import React, { useEffect, useRef, useState, type ChangeEvent } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import './bpmnView.css'
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import CamundaBpmnModdle from './camunda.json';
import { processBpmnForUpload, generateFlowableBpmn } from './bpmn-converter';
import type Canvas from 'diagram-js/lib/core/Canvas';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';

const initialDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd"
  id="sample-diagram"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1" name="Start Process">
      <bpmn2:outgoing>Flow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:serviceTask id="ServiceTask_1" name="Sample Service Task" camunda:type="external" camunda:topic="sampleTopic">
      <bpmn2:incoming>Flow_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:endEvent id="EndEvent_1" name="End Process">
      <bpmn2:incoming>Flow_2</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="ServiceTask_1" />
    <bpmn2:sequenceFlow id="Flow_2" sourceRef="ServiceTask_1" targetRef="EndEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ServiceTask_1_di" bpmnElement="ServiceTask_1">
        <dc:Bounds x="270" y="77" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="215" y="117"/>
        <di:waypoint x="270" y="117"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="117"/>
        <di:waypoint x="432" y="117"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

const BpmnView: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const propertiesPanelRef = useRef<HTMLDivElement | null>(null);
    const modelerRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [diagramName, setDiagramName] = useState<string>('New Process');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [showPropertiesPanel, setShowPropertiesPanel] = useState<boolean>(true);

    useEffect(() => {
        const modeler = new BpmnModeler({
            container: containerRef.current!,
            propertiesPanel: {
                parent: propertiesPanelRef.current!,
            },
            additionalModules: [
                BpmnPropertiesPanelModule,
                BpmnPropertiesProviderModule,
                CamundaPlatformPropertiesProviderModule,
            ],
            moddleExtensions: {
                camunda: CamundaBpmnModdle,
            },
            keyboard: {
                bindTo: window,
            },
        });

        modelerRef.current = modeler;

        // modeler
        //   .importXML(initialDiagram)
        //   .then(() => {
        //     const canvas = modeler.get('canvas');
        //     canvas.zoom('fit-viewport');
        //   })
        modeler.importXML(initialDiagram).then(() => {
            const canvas = modeler.get('canvas') as Canvas;
            canvas.zoom('fit-viewport');
        }).catch((err: any) => {
            console.error('Error importing initial diagram:', err);
            setError('Failed to load initial diagram');
        });

        return () => {
            modeler.destroy();
        };
    }, []);

    const downloadSVG = async () => {
        try {
            setIsLoading(true);
            const { svg } = await modelerRef.current.saveSVG();
            const element = document.createElement('a');
            const file = new Blob([svg], { type: 'image/svg+xml' });
            element.href = URL.createObjectURL(file);
            element.download = `${diagramName}.svg`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (err) {
            console.error('Error downloading SVG:', err);
            setError('Failed to download SVG file');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFlowableBPMN = async () => {
        try {
            setIsLoading(true);
            const { xml } = await modelerRef.current.saveXML({ format: true });
            const flowableXml = generateFlowableBpmn(xml);
            const element = document.createElement('a');
            const file = new Blob([flowableXml], { type: 'application/xml' });
            element.href = URL.createObjectURL(file);
            element.download = `${diagramName}-flowable.bpmn20.xml`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (err) {
            console.error('Error downloading Flowable BPMN:', err);
            setError('Failed to download Flowable BPMN file');
        } finally {
            setIsLoading(false);
        }
    };

    const loadBPMN = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                let xml = e.target?.result as string;
                xml = processBpmnForUpload(xml);
                await modelerRef.current.importXML(xml);

                const canvas = modelerRef.current.get('canvas');
                canvas.zoom('fit-viewport');

                setDiagramName(file.name.replace('.bpmn20.xml', '').replace('.bpmn', ''));
                setError('');
            } catch (err) {
                console.error('Error loading BPMN:', err);
                setError('Failed to load BPMN file. Please check if the file is valid.');
            } finally {
                setIsLoading(false);
            }
        };

        reader.readAsText(file);
        event.target.value = '';
    };

    const newDiagram = async () => {
        try {
            setIsLoading(true);
            await modelerRef.current.importXML(initialDiagram);
            const canvas = modelerRef.current.get('canvas');
            canvas.zoom('fit-viewport');
            setDiagramName('New Process');
        } catch (err) {
            console.error('Error creating new diagram:', err);
            setError('Failed to create new diagram');
        } finally {
            setIsLoading(false);
        }
    };

    const zoomIn = () => modelerRef.current.get('canvas').zoom(modelerRef.current.get('canvas').zoom() + 0.1);
    const zoomOut = () => modelerRef.current.get('canvas').zoom(modelerRef.current.get('canvas').zoom() - 0.1);
    const zoomToFit = () => modelerRef.current.get('canvas').zoom('fit-viewport');
    const resetZoom = () => modelerRef.current.get('canvas').zoom(1);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            {/* <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">Camunda BPMN Modeller</h1>
                            <input
                                type="text"
                                value={diagramName}
                                onChange={(e) => setDiagramName(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Diagram name"
                            />
                        </div>
                        <span className="text-sm text-gray-600">{isLoading ? 'Processing...' : 'Ready'}</span>
                    </div>
                </div>
            </header> */}

            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
                    {/* File Controls */}
                    <div className="flex items-center space-x-2 border-r border-gray-300 pr-4">
                        <button onClick={newDiagram} disabled={isLoading} className="btn-primary">
                            New
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="btn-secondary">
                            Open
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".bpmn,.bpmn20.xml,.xml"
                            onChange={loadBPMN}
                            className="hidden"
                        />
                    </div>

                    {/* Export */}
                    <div className="flex items-center space-x-2 border-r border-gray-300 pr-4">
                        <button onClick={downloadFlowableBPMN} disabled={isLoading} className="btn-success">
                            Download BPMN20.xml
                        </button>
                        <button onClick={downloadSVG} disabled={isLoading} className="btn-secondary">
                            Export SVG
                        </button>
                    </div>

                    {/* Zoom */}
                    <div className="flex items-center space-x-2">
                        <button onClick={zoomIn} className="btn-secondary">+</button>
                        <button onClick={zoomOut} className="btn-secondary">-</button>
                        <button onClick={zoomToFit} className="btn-secondary">Fit</button>
                        <button onClick={resetZoom} className="btn-secondary">100%</button>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm flex">
                    <div className={`${showPropertiesPanel ? 'flex-1' : 'w-full'} transition-all duration-300`}>
                        <div ref={containerRef} className="bpmn-container" style={{ height: 'calc(100vh - 150px)', width: '100%' }} />
                    </div>
                    {showPropertiesPanel && (
                        <div className="w-80 border-l border-gray-200 bg-gray-50 transition-all duration-300" style={{width: '30%'}}>
                            <div ref={propertiesPanelRef} className="overflow-y-auto" style={{ height: 'calc(100vh - 150px)' }} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BpmnView;
