import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const workspaceDir = 'C:/Users/hardi/Coding All Programs/mahakumbh';
const sourcePath = 'D:/Downloads/KumbhRakshak_PBL_Presentation_2026-10-03.pptx';
const workDir = path.join(workspaceDir, '.codex-ppt-work', 'faculty-final');
const screenshotDir = path.join(workspaceDir, '.codex-ppt-work', 'screenshots');
const outputPath = path.join(workspaceDir, 'output', 'pptx', 'KumbhRakshak_Faculty_Final_v2_2026-10-03.pptx');
const skillDir = 'C:/Users/hardi/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations';
const runtimePython = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const modulePath = 'C:/Users/hardi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const { FileBlob, PresentationFile } = await import(pathToFileURL(modulePath).href);
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);

await fs.mkdir(workDir, { recursive: true });
await fs.mkdir(path.dirname(outputPath), { recursive: true });
const deck = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
if (deck.slides.items.length !== 16) throw new Error('The attached source is not the expected 16-slide deck.');

const resultTemplate = deck.slides.getItem(12);
const palette = { ink:'#1E3340', red:'#B54D20', gray:'#566771' };
function addText(slide, value, x, y, w, h, size=20, color=palette.ink, bold=false, alignment='left') {
  const shape=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  shape.text=value;
  shape.text.style={typeface:'Times New Roman',fontSize:size,color,bold,alignment,verticalAlignment:'middle',autoFit:'shrinkText'};
  return shape;
}
function heading(slide,value,x,y,w){addText(slide,value,x,y,w,36,23,palette.red,true);}
function line(slide,value,x,y,w,h=38,size=20){addText(slide,value,x,y,w,h,size,palette.ink);}
function featureSlide(title,notes){
  const slide=resultTemplate.duplicate();
  const titleShape=slide.shapes.items.find(shape=>String(shape.text).trim().startsWith('Results'));
  const bodyShape=slide.shapes.items.find(shape=>String(shape.text).includes('Demonstrated Outcomes'));
  if(!titleShape||!bodyShape) throw new Error('Result template text shapes were not found.');
  titleShape.text.replace('Results',title);
  bodyShape.text='';
  slide.speakerNotes.textFrame.setText(notes);
  return slide;
}
async function screenshot(slide,file,x,y,w,h,alt){
  const bytes=await fs.readFile(path.join(screenshotDir,file));
  slide.images.add({blob:new Uint8Array(bytes),contentType:'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});
}

// The original outline keeps its font and placement. Only its one outdated label changes.
const outline=deck.slides.getItem(1).shapes.items.find(shape=>String(shape.text).includes('Prototype Screenshots'));
if(!outline) throw new Error('Outline text was not found.');
for(const [oldText,token] of [
  ['Prototype Screenshots','__OUTLINE6__'],
  ['Software /Hardware requirement','__OUTLINE7__'],
  ['System design','__OUTLINE8__'],
  ['System implementation','__OUTLINE9__'],
]) outline.text.replace(oldText,token);
for(const [token,newText] of [
  ['__OUTLINE6__','Software / Hardware Requirements'],
  ['__OUTLINE7__','System Design'],
  ['__OUTLINE8__','System Implementation'],
  ['__OUTLINE9__','Feature Tour & Screenshots'],
]) outline.text.replace(token,newText);

// 1. Full feature inventory, grouped exactly as the website's feature guide.
{
  const s=featureSlide('Complete Feature Map',
    'Feature inventory checked against frontend/components/ui.tsx NAV_GROUPS and the frontend/app routes on 3 October 2026. The additional tools appear on the dashboard and simulation page.');
  heading(s,'Explore',155,239,460);
  line(s,'Overview dashboard',160,280,475);
  line(s,'3D Nashik-Trimbakeshwar place guide',160,319,475);
  line(s,'Area map with camera and incident markers',160,358,475);
  line(s,'Shelters and holding capacity',160,397,475);
  heading(s,'Monitor',155,450,460);
  line(s,'Camera vision and crowd forecasts',160,491,475);
  line(s,'Public reports and claim verification',160,530,475);
  line(s,'Sentiment pulse',160,569,475);

  heading(s,'Respond',690,239,440);
  line(s,'Incident list, detail and evidence graph',695,280,460);
  line(s,'Response resources and dispatch review',695,319,460);
  line(s,'Multilingual broadcast studio',695,358,460);
  heading(s,'Understand and assist',690,416,480);
  line(s,'AI model registry and executive brief',695,457,460);
  line(s,'Lost-person assistance demo',695,496,460);
  line(s,'Command copilot',695,535,460);
  line(s,'16-step simulation and scenario lab',695,574,460);
  s.moveTo(12);
}

// 2. Physical context and observation features.
{
  const s=featureSlide('Place & Monitoring Portals',
    'Portal behavior checked against frontend/app/simulation, map, shelters, cameras and crowd. Camera and forecast outputs are demo or model-dependent; the 3D geometry and facility pins are illustrative.');
  heading(s,'3D place guide and map',155,241,495);
  line(s,'Two scenes explain Nashik and Trimbakeshwar.',160,282,500,42);
  line(s,'Click a place to open its linked feature portal.',160,322,500,42);
  line(s,'Area map shows camera and incident context.',160,362,500,42);
  heading(s,'Shelter and camera views',155,436,495);
  line(s,'Shelters show listed capacity and occupancy.',160,477,500,42);
  line(s,'Camera grid opens observation and event views.',160,517,500,42);

  heading(s,'Crowd portal',690,241,450);
  line(s,'15, 30 and 60-minute forecast cards',695,282,445,42);
  line(s,'Holding-area buffer and surge indicators',695,322,445,42);
  line(s,'Values are simulated for the current demo.',695,362,445,42);
  heading(s,'Operator overview',690,436,450);
  line(s,'KPIs, place signals and incident alerts',695,477,445,42);
  line(s,'Feature guide explains every portal.',695,517,445,42);
  addText(s,'3D landmarks are explanatory. Approved 2027 GIS is needed before operational use.',155,622,1010,52,18,palette.gray);
  s.moveTo(13);
}

// 3. Social media outcome parameters and a real scanner screenshot.
{
  const s=featureSlide('Social Intelligence',
    'The screenshot is the local claim-scanner UI, captured 3 October 2026. See frontend/app/social, verify, sentiment and broadcast, and backend/app/api/social_sim_routes.py. The feed is mocked and publishing buttons are preview-only.');
  await screenshot(s,'claim-verification.png',145,242,610,390,'KumbhRakshak claim verification interface');
  heading(s,'Public reports',772,242,435);
  line(s,'Mock social feed with status filters and triage',776,280,430,47,18);
  heading(s,'Claim verification',772,340,435);
  line(s,'Review location, camera evidence and uncertainty',776,378,430,58,18);
  heading(s,'Sentiment pulse',772,454,435);
  line(s,'Public-concern trends and emerging issues',776,492,430,47,18);
  heading(s,'Broadcast studio',772,556,435);
  line(s,'Draft Hindi, Marathi, Gujarati and English advisories',776,594,430,52,18);
  addText(s,'Actual portal screenshot. Feed and verification cases are demo data; no external advisory is published.',145,650,1050,38,17,palette.gray);
  s.moveTo(14);
}

// 4. Response workflow including lesser-known dashboard features.
{
  const s=featureSlide('Incident Response Features',
    'Checked against frontend/app/incidents, resources, shelters, broadcast, frontend/components/LostPersonRadar.tsx, and backend/app/api/routes.py plus v1_routes.py. Dispatch remains human-authorized.');
  heading(s,'Incident review',155,242,475);
  line(s,'List and detail pages show severity, risk and evidence.',160,282,475,57,19);
  line(s,'Evidence graph links reports, cameras and actions.',160,338,475,57,19);
  heading(s,'Resources and shelters',155,427,475);
  line(s,'Review available teams and nearest-unit suggestions.',160,467,475,57,19);
  line(s,'Check shelter capacity and overflow pressure.',160,523,475,57,19);

  heading(s,'Human-controlled response',690,242,470);
  line(s,'Recommendation and confirmation are separate steps.',695,282,465,57,19);
  line(s,'Dispatch decisions can be recorded in an audit trail.',695,338,465,57,19);
  heading(s,'Additional assistance',690,427,470);
  line(s,'Lost-person demo uses clothing and sighting attributes.',695,467,465,57,19);
  line(s,'Alerts, advisories and copilot support operator review.',695,523,465,57,19);
  addText(s,'The platform does not autonomously send field teams or publish a public alert.',155,626,1030,50,18,palette.gray);
  s.moveTo(15);
}

// 5. Scenario lab screenshot from the working local website.
{
  const s=featureSlide('Simulation & Scenario Lab',
    'Actual local website screenshot captured 3 October 2026. See frontend/app/simulation/page.tsx and backend/app/simulation/engine.py. Event injections require the demo backend.');
  await screenshot(s,'simulation-controls.png',145,243,615,420,'KumbhRakshak 16-step simulation and event injections');
  heading(s,'16-step timeline',775,242,420);
  line(s,'Start, pause, resume, reset and speed controls',780,281,420,58,18);
  heading(s,'Seven demo injections',775,366,420);
  line(s,'Fire, crowd surge, rumor and recycled video',780,404,420,57,18);
  line(s,'Bottleneck, shelter overflow and geotag claim',780,461,420,57,18);
  heading(s,'Event telemetry',775,548,420);
  line(s,'Scenario updates appear in the live demo log.',780,586,420,57,18);
  addText(s,'All scenario events are simulated. The 3D place guide remains separate from the event timeline.',145,661,1055,34,17,palette.gray);
  s.moveTo(16);
}

// 6. Technical capabilities and honest field-use boundary.
{
  const s=featureSlide('AI Modules & Prototype Status',
    'Checked against backend/app/ai, backend/app/api/v1_routes.py, frontend/app/models and executive, and README.md. Heuristic, mock and simulated components are identified on the slide.');
  heading(s,'Processing modules',155,239,480);
  line(s,'Camera-event and fire/smoke heuristics',160,280,475,40,19);
  line(s,'Crowd forecasting and explainable risk scoring',160,320,475,40,19);
  line(s,'Social triage, clustering and recycled-media checks',160,360,475,48,19);
  line(s,'Claim-evidence comparison for human review',160,410,475,42,19);
  heading(s,'Platform engineering',155,480,480);
  line(s,'FastAPI, Next.js and WebSocket updates',160,521,475,40,19);
  line(s,'Firestore adapter with in-memory demo fallback',160,561,475,45,19);

  heading(s,'Operator tools',690,239,480);
  line(s,'AI model registry and status view',695,280,465,40,19);
  line(s,'Executive brief and readiness summary',695,320,465,40,19);
  line(s,'Command copilot with guided demo prompts',695,360,465,48,19);
  heading(s,'Field-use boundary',690,480,480);
  line(s,'No live Kumbh CCTV or official 2027 site plan',695,521,465,45,19);
  line(s,'Mock social feed; no automatic dispatch or posting',695,566,465,48,19);
  s.moveTo(17);
}

// Keep the prototype results grounded in the modules verified in the repository.
const resultBody=resultTemplate.shapes.items.find(shape=>String(shape.text).includes('Demonstrated Outcomes'));
if(!resultBody) throw new Error('Original Results body was not found.');
resultBody.text.replace(
  'The overview explains how to explore, monitor and respond across the available portals.',
  'The feature tour covers camera, social, incident, resource and broadcast portals.');
resultBody.text.replace(
  'Six core backend tests passed in the local demo environment.',
  'FastAPI routes and WebSocket channels back the prototype workflows.');

const draftPath=path.join(workDir,'candidate.pptx');
await (await PresentationFile.exportPptx(deck)).save(draftPath);
for(let i=0;i<deck.slides.items.length;i++){
  const preview=await deck.slides.getItem(i).export({format:'png',scale:1});
  await fs.writeFile(path.join(workDir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await preview.arrayBuffer()));
}
const sourceHash=crypto.createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex');
const result=await finalizePresentation({
  workspaceDir,candidatePath:draftPath,finalPath:outputPath,pythonExecutable:runtimePython,
  integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
  explicitTotalSlideCount:22,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
  fontPolicy:{basis:'reference',families:['Times New Roman'],referencePath:sourcePath,referenceSha256:sourceHash},
  verifyArtifactToolImport:true,receiptPath:path.join(workDir,'validation-v2.json'),
});
console.log(JSON.stringify({outputPath,slides:deck.slides.items.length,integrity:result.packageIntegrity.status,layoutFindings:result.presentationLayout.finding_count},null,2));
